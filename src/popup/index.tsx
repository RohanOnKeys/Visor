import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AgentProvider, CompileRequest, CompileResponse, PendingAgentExport } from '../shared/types';
import { loadSettings, saveSettings } from '../storage/settings';
import '../index.css';

type SelectOption<T extends string> = {
  value: T;
  label: string;
};

function GearIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="visor-gear-icon">
      <path d="M12 15.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z" />
      <path d="M19.4 13.4a7.8 7.8 0 0 0 0-2.8l2-1.5-2-3.5-2.4 1a8.7 8.7 0 0 0-2.4-1.4L14.2 2h-4.4l-.4 3.2A8.7 8.7 0 0 0 7 6.6l-2.4-1-2 3.5 2 1.5a7.8 7.8 0 0 0 0 2.8l-2 1.5 2 3.5 2.4-1a8.7 8.7 0 0 0 2.4 1.4l.4 3.2h4.4l.4-3.2a8.7 8.7 0 0 0 2.4-1.4l2.4 1 2-3.5-2-1.5Z" />
    </svg>
  );
}

function GreenSelect<T extends string>({
  value,
  options,
  onChange,
  ariaLabel
}: {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) || options[0];

  return (
    <div
      style={{ position: 'relative' }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="visor-green-select-trigger"
      >
        <span>{selected.label}</span>
        <span aria-hidden="true" className="visor-green-select-chevron" />
      </button>
      {open && (
        <div className="visor-green-select-menu" role="listbox" tabIndex={-1}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className="visor-green-select-option"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NumberStepper({
  value,
  onChange,
  min = 100,
  step = 500,
  ariaLabel
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  ariaLabel: string;
}) {
  const applyValue = (nextValue: number) => {
    onChange(Math.max(min, nextValue || min));
  };

  return (
    <div className="visor-number-stepper">
      <input
        type="number"
        aria-label={ariaLabel}
        value={value}
        min={min}
        step={step}
        onChange={(event) => applyValue(parseInt(event.target.value, 10))}
      />
      <div className="visor-number-stepper-buttons" aria-hidden="true">
        <button type="button" tabIndex={-1} onClick={() => applyValue(value + step)}>+</button>
        <button type="button" tabIndex={-1} onClick={() => applyValue(value - step)}>-</button>
      </div>
    </div>
  );
}

function Popup() {
  const [activeTabInfo, setActiveTabInfo] = useState<{ title: string; url: string }>({ title: '', url: '' });
  const [mode, setMode] = useState<CompileRequest['mode']>('compact');
  const [privacyLevel, setPrivacyLevel] = useState<CompileRequest['privacyLevel']>('medium');
  const [tokenBudget, setTokenBudget] = useState<number>(4000);
  
  const [status, setStatus] = useState<'idle' | 'compiling' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [compileResult, setCompileResult] = useState<CompileResponse | null>(null);
  const [lastAutoCompiledAt, setLastAutoCompiledAt] = useState<string>('');
  const [widgetEnabled, setWidgetEnabled] = useState<boolean>(true);

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
      setWidgetEnabled(settings.widgetEnabled);

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

    }
    init();
  }, []);

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
  const providerLogoFiles: Record<AgentProvider, string> = {
    chatgpt: 'llm-chatgpt.png',
    grok: 'llm-grok.png',
    gemini: 'llm-gemini.png',
    claude: 'llm-claude.png'
  };
  const providerLabels: Record<AgentProvider, string> = {
    chatgpt: 'GPT',
    grok: 'Grok',
    gemini: 'Gemini',
    claude: 'Claude'
  };
  const modeOptions: SelectOption<CompileRequest['mode']>[] = [
    { value: 'compact', label: 'Compact Context' },
    { value: 'detailed', label: 'Detailed Context' },
    { value: 'agent_action', label: 'Agent Mode' },
    { value: 'rag', label: 'RAG Chunks' },
    { value: 'debug', label: 'Compiler Debug' }
  ];
  const privacyOptions: SelectOption<CompileRequest['privacyLevel']>[] = [
    { value: 'low', label: 'Low Redaction' },
    { value: 'medium', label: 'Medium Redaction' },
    { value: 'strict', label: 'Strict Redaction' }
  ];

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

  const updateCurrentTabWidget = async (enabled: boolean) => {
    if (typeof chrome === 'undefined' || !chrome.tabs) return;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    chrome.tabs.sendMessage(tab.id, { type: 'VISOR_WIDGET_SET_ENABLED', payload: { enabled } }, () => {
      void chrome.runtime.lastError;
    });
  };

  const handleWidgetToggle = async (enabled: boolean) => {
    setWidgetEnabled(enabled);
    const settings = await loadSettings();
    await saveSettings({ ...settings, widgetEnabled: enabled });
    await updateCurrentTabWidget(enabled);
  };

  // Truncate long URLs helper
  const truncateUrl = (u: string) => {
    if (!u) return '';
    return u.length > 42 ? u.slice(0, 40) + '...' : u;
  };

  return (
    <div className="popup-shell">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img
          src={chrome.runtime.getURL('visor-logo.png')}
          alt="Visor"
          style={{ width: '44px', height: '44px', borderRadius: '999px', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
        />
        <button 
          onClick={handleOpenSettings} 
          className="visor-settings-icon-button" 
          aria-label="Open Settings"
          title="Open Settings"
        >
          <GearIcon />
        </button>
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

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '10px 12px',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          background: 'var(--bg-card)'
        }}
      >
        <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700 }}>Floating widget</span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {widgetEnabled ? 'Visible on this page' : 'Hidden until relaunched'}
          </span>
        </span>
        <button
          id="visorWidgetToggle"
          type="button"
          role="switch"
          aria-checked={widgetEnabled}
          aria-label="Toggle floating widget"
          onClick={() => handleWidgetToggle(!widgetEnabled)}
          style={{
            width: '46px',
            height: '26px',
            padding: '3px',
            borderRadius: '999px',
            border: `1px solid ${widgetEnabled ? 'rgba(30, 215, 96, 0.82)' : 'var(--border-color)'}`,
            background: widgetEnabled ? 'var(--primary)' : 'var(--bg-elevated)',
            justifyContent: widgetEnabled ? 'flex-end' : 'flex-start',
            boxShadow: widgetEnabled ? '0 0 16px rgba(30, 215, 96, 0.24)' : 'none'
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '999px',
              background: widgetEnabled ? '#001409' : 'var(--text-muted)',
              display: 'block'
            }}
          />
        </button>
      </div>

      {/* Compiler Configurations Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mode</label>
          <GreenSelect
            value={mode}
            options={modeOptions}
            onChange={setMode}
            ariaLabel="Select compiler mode"
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Privacy Level</label>
          <GreenSelect
            value={privacyLevel}
            options={privacyOptions}
            onChange={setPrivacyLevel}
            ariaLabel="Select privacy level"
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Token Budget</label>
        <NumberStepper
          value={tokenBudget}
          onChange={setTokenBudget}
          ariaLabel="Token budget"
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
            {(['chatgpt', 'grok', 'gemini', 'claude'] as AgentProvider[]).map((provider) => (
              <button
                key={provider}
                onClick={() => handleProviderExport(provider, compileResult.exports.promptBlock)}
                className="btn-secondary"
                title={`Export to ${providerLabels[provider]}`}
                aria-label={`Export to ${providerLabels[provider]}`}
                style={{ width: '42px', height: '42px', padding: '0', borderRadius: '999px', overflow: 'hidden', justifySelf: 'center', display: 'grid', placeItems: 'center', lineHeight: 0 }}
              >
                <img
                  src={chrome.runtime.getURL(providerLogoFiles[provider])}
                  alt=""
                  style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', objectPosition: 'center' }}
                />
              </button>
            ))}
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
