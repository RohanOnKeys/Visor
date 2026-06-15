import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AgentProvider, AuthSession, CompileRequest, CompileResponse, PendingAgentExport } from '../shared/types';
import { loadSettings } from '../storage/settings';
import { getAuthSession, signInWithGoogleFromClient, signOutFromClient } from '../auth/client';
import '../index.css';

function Popup() {
  const [activeTabInfo, setActiveTabInfo] = useState<{ title: string; url: string }>({ title: '', url: '' });
  const [mode, setMode] = useState<CompileRequest['mode']>('compact');
  const [privacyLevel, setPrivacyLevel] = useState<CompileRequest['privacyLevel']>('medium');
  const [tokenBudget, setTokenBudget] = useState<number>(4000);
  
  const [status, setStatus] = useState<'idle' | 'compiling' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [compileResult, setCompileResult] = useState<CompileResponse | null>(null);
  const [lastAutoCompiledAt, setLastAutoCompiledAt] = useState<string>('');
  const [authSession, setAuthSession] = useState<AuthSession | undefined>();
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'error'>('loading');
  const [authError, setAuthError] = useState<string>('');

  // Initialize popup states from storage settings and tab info
  useEffect(() => {
    async function init() {
      let currentUrl = '';
      // 1. Get current active tab
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
          currentUrl = tab.url || '';
          setActiveTabInfo({
            title: tab.title || 'Untitled Page',
            url: currentUrl
          });
        }
      } else {
        // Fallback for tests or local rendering
        currentUrl = 'https://example.com/mock-article';
        setActiveTabInfo({ title: 'Mock Test Article Page', url: currentUrl });
      }

      // 2. Load settings defaults
      const settings = await loadSettings();
      setMode(settings.defaultMode);
      setPrivacyLevel(settings.privacyLevel);
      setTokenBudget(settings.tokenBudget);

      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.get(['lastCompileResult', 'lastAutoCompiledAt'], (result) => {
          const saved = result.lastCompileResult as Omit<Extract<CompileResponse, { ok: true }>, 'ok'> | undefined;
          if (saved?.context?.source?.url && saved.context.source.url === currentUrl) {
            setCompileResult({ ok: true, ...saved });
            setStatus('success');
          }
          if (typeof result.lastAutoCompiledAt === 'string') {
            setLastAutoCompiledAt(result.lastAutoCompiledAt);
          }
        });
      }

      const session = await getAuthSession();
      setAuthSession(session);
      setAuthStatus('idle');
    }
    init();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setAuthStatus('loading');
      setAuthError('');
      const session = await signInWithGoogleFromClient();
      setAuthSession(session);
      setAuthStatus('idle');
    } catch (error: any) {
      setAuthStatus('error');
      setAuthError(error.message || 'Google sign-in failed.');
    }
  };

  const handleSignOut = async () => {
    try {
      setAuthStatus('loading');
      setAuthError('');
      await signOutFromClient();
      setAuthSession(undefined);
      setAuthStatus('idle');
    } catch (error: any) {
      setAuthStatus('error');
      setAuthError(error.message || 'Sign out failed.');
    }
  };

  const handleCompile = () => {
    setStatus('compiling');
    setErrorMessage('');
    setCompileResult(null);

    const requestPayload: CompileRequest = {
      mode,
      privacyLevel,
      tokenBudget
    };

    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage(
        { type: 'VISOR_COMPILE_ACTIVE_TAB', payload: requestPayload },
        (response: CompileResponse) => {
          if (chrome.runtime.lastError) {
            setStatus('error');
            setErrorMessage(chrome.runtime.lastError.message || 'Failed to communicate with service worker.');
            return;
          }

          if (response && response.ok) {
            setStatus('success');
            setCompileResult(response);
          } else {
            setStatus('error');
            setErrorMessage(response ? (response as any).userMessage : 'Unknown error during compile.');
          }
        }
      );
    } else {
      // Mock result for local/test preview environments
      setTimeout(() => {
        setStatus('error');
        setErrorMessage('Chrome API not found in this environment.');
      }, 500);
    }
  };

  const handleCopy = async (text: string, notify = true) => {
    try {
      await navigator.clipboard.writeText(text);
      if (notify) {
        alert('Copied to clipboard!');
      }
    } catch (err) {
      alert('Failed to copy to clipboard.');
    }
  };

  const handleOpenPreview = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('preview.html') });
    }
  };

  const providerUrls: Record<AgentProvider, string> = {
    chatgpt: 'https://chatgpt.com/',
    grok: 'https://grok.com/',
    gemini: 'https://gemini.google.com/app',
    claude: 'https://claude.ai/new'
  };

  const handleProviderExport = async (provider: AgentProvider, promptBlock: string) => {
    const pendingExport: PendingAgentExport = {
      provider,
      text: promptBlock,
      createdAt: new Date().toISOString(),
      sourceTitle: compileResult && compileResult.ok ? compileResult.context.source.title : activeTabInfo.title,
      sourceUrl: compileResult && compileResult.ok ? compileResult.context.source.url : activeTabInfo.url
    };

    await handleCopy(promptBlock, false);
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ pendingAgentExport: pendingExport });
    }

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: providerUrls[provider] });
    } else {
      window.open(providerUrls[provider], '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenSettings = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.openOptionsPage();
    }
  };

  // Truncate long URLs helper
  const truncateUrl = (u: string) => {
    if (!u) return '';
    return u.length > 42 ? u.slice(0, 40) + '...' : u;
  };

  return (
    <div style={{ width: '420px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }} className="glass-panel">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="title-gradient" style={{ fontSize: '20px', letterSpacing: '-0.02em' }}>VISOR</h1>
        <button 
          onClick={handleOpenSettings} 
          className="btn-secondary" 
          style={{ padding: '6px 10px', fontSize: '12px' }}
          aria-label="Open Settings"
        >
          Settings
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-card)' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Account</div>
          <div style={{ fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '230px' }}>
            {authSession ? authSession.user.email : 'Not signed in'}
          </div>
          {authError && <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '2px' }}>{authError}</div>}
        </div>
        {authSession ? (
          <button onClick={handleSignOut} disabled={authStatus === 'loading'} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }}>
            Sign out
          </button>
        ) : (
          <button onClick={handleGoogleSignIn} disabled={authStatus === 'loading'} className="btn-primary" style={{ padding: '6px 10px', fontSize: '12px' }}>
            Google sign in
          </button>
        )}
      </div>

      {/* Target Page Info */}
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Current Tab</div>
        <div style={{ fontWeight: 500, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {activeTabInfo.title}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          {truncateUrl(activeTabInfo.url)}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--secondary)', marginTop: '6px', fontWeight: 700 }}>
          Auto-read is active{lastAutoCompiledAt ? ` · updated ${new Date(lastAutoCompiledAt).toLocaleTimeString()}` : ''}
        </div>
      </div>

      {/* Compiler Configurations Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value as any)}>
            <option value="compact">Compact Context</option>
            <option value="detailed">Detailed Context</option>
            <option value="agent_action">Agent Mode</option>
            <option value="rag">RAG Chunks</option>
            <option value="debug">Compiler Debug</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Privacy Level</label>
          <select value={privacyLevel} onChange={(e) => setPrivacyLevel(e.target.value as any)}>
            <option value="low">Low Redaction</option>
            <option value="medium">Medium Redaction</option>
            <option value="strict">Strict Redaction</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Token Budget</label>
        <input 
          type="number" 
          value={tokenBudget} 
          onChange={(e) => setTokenBudget(parseInt(e.target.value) || 4000)}
          style={{ width: '100%' }}
        />
      </div>

      {/* Actions */}
      <button 
        onClick={handleCompile} 
        className="btn-primary" 
        style={{ width: '100%', height: '40px' }}
        disabled={status === 'compiling'}
      >
        {status === 'compiling' ? 'Compiling Page...' : 'Refresh Page Context'}
      </button>

      {/* Feedback Panels */}
      {status === 'error' && (
        <div style={{ padding: '10px', backgroundColor: 'hsla(346, 84%, 55%, 0.12)', border: '1px solid var(--danger)', borderRadius: '8px', color: '#ffb3ba', fontSize: '13px' }}>
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {status === 'success' && compileResult && compileResult.ok && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
          {/* Metadata counts */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 8px', background: 'var(--bg-input)', borderRadius: '6px' }}>
            <span>Tokens: <strong>{compileResult.context.tokenProfile.compiledEstimatedTokens}</strong></span>
            <span>Risk Level: 
              <span className={`risk-tag ${compileResult.context.privacyReport.riskLevel}`} style={{ marginLeft: '4px', fontSize: '10px' }}>
                {compileResult.context.privacyReport.riskLevel}
              </span>
            </span>
          </div>

          {/* Quick Preview Output snippet */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Output Preview (JSON)</div>
            <pre style={{ height: '90px', padding: '6px', overflow: 'auto', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              {compileResult.exports.json.slice(0, 400) + '...'}
            </pre>
          </div>

          {/* Copy actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button onClick={() => handleCopy(compileResult.exports.json)} className="btn-secondary" style={{ fontSize: '12px' }}>
              Copy JSON
            </button>
            <button onClick={() => handleCopy(compileResult.exports.markdown)} className="btn-secondary" style={{ fontSize: '12px' }}>
              Copy Markdown
            </button>
          </div>
          
          <button onClick={() => handleCopy(compileResult.exports.promptBlock)} className="btn-secondary" style={{ width: '100%', fontSize: '12px' }}>
            Copy Delimited Prompt Block
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Export to agent
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Opens the selected agent and fills its prompt box. Clipboard is kept as fallback.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
            <button onClick={() => handleProviderExport('chatgpt', compileResult.exports.promptBlock)} className="btn-secondary" style={{ fontSize: '11px', padding: '8px 10px' }}>
              GPT
            </button>
            <button onClick={() => handleProviderExport('grok', compileResult.exports.promptBlock)} className="btn-secondary" style={{ fontSize: '11px', padding: '8px 10px' }}>
              Grok
            </button>
            <button onClick={() => handleProviderExport('gemini', compileResult.exports.promptBlock)} className="btn-secondary" style={{ fontSize: '11px', padding: '8px 10px' }}>
              Gemini
            </button>
            <button onClick={() => handleProviderExport('claude', compileResult.exports.promptBlock)} className="btn-secondary" style={{ fontSize: '11px', padding: '8px 10px' }}>
              Claude
            </button>
          </div>

          <button onClick={handleOpenPreview} className="btn-primary" style={{ width: '100%', background: 'var(--secondary)' }}>
            Open Full Preview Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(<Popup />);
}
