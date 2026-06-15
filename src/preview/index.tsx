import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AgentContext, AgentProvider, PageSnapshot, PendingAgentExport } from '../shared/types';
import '../index.css';

function Preview() {
  const [data, setData] = useState<{
    snapshot: PageSnapshot;
    context: AgentContext;
    exports: { json: string; markdown: string; promptBlock: string };
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'summary' | 'json' | 'markdown' | 'actions' | 'data' | 'debug'>('summary');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function loadCompileResult() {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['lastCompileResult'], (result) => {
          const compileResult = result.lastCompileResult as {
            snapshot: PageSnapshot;
            context: AgentContext;
            exports: { json: string; markdown: string; promptBlock: string };
          } | undefined;

          if (compileResult) {
            setData(compileResult);
          }
        });
      } else {
        // Mock data for test preview
        console.warn('Chrome storage not available. Visual mock only.');
      }
    }
    loadCompileResult();
  }, []);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy to clipboard.');
    }
  };

  const handleDownloadJson = () => {
    if (!data) return;
    const blob = new Blob([data.exports.json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `visor_${data.context.source.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_context.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
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

  const handleProviderExport = async (provider: AgentProvider) => {
    if (!data) return;

    const pendingExport: PendingAgentExport = {
      provider,
      text: data.exports.promptBlock,
      createdAt: new Date().toISOString(),
      sourceTitle: data.context.source.title,
      sourceUrl: data.context.source.url
    };

    await handleCopy(data.exports.promptBlock);
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ pendingAgentExport: pendingExport });
    }

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: providerUrls[provider] });
    } else {
      window.open(providerUrls[provider], '_blank', 'noopener,noreferrer');
    }
  };

  if (!data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <img
          src={chrome.runtime.getURL('visor-logo.png')}
          alt="Visor"
          style={{ width: '72px', height: '72px', borderRadius: '999px', objectFit: 'cover', display: 'block' }}
        />
        <h1 className="title-gradient" style={{ fontSize: '32px' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>No compiled page snapshot found in local memory.</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Open the extension popup on a web page and click "Compile Page" to inspect context.</p>
      </div>
    );
  }

  const { snapshot, context, exports } = data;

  return (
    <div className="app-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', gap: '20px' }}>
      
      {/* Header Info Panel */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <img
            src={chrome.runtime.getURL('visor-logo.png')}
            alt="Visor"
            style={{ width: '42px', height: '42px', borderRadius: '999px', objectFit: 'cover', display: 'block', marginBottom: '8px' }}
          />
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>{context.source.title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginTop: '2px' }}>
            {context.source.url}
          </p>
        </div>

        {/* Badges block */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Page Type</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
              {context.pageClassification.type} ({(context.pageClassification.confidence * 100).toFixed(0)}%)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Privacy Risk</span>
            <span className={`risk-tag ${context.privacyReport.riskLevel}`}>{context.privacyReport.riskLevel}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Context Size</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {context.tokenProfile.compiledEstimatedTokens} / {context.tokenProfile.budget} tokens
            </span>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700 }}>Export to agent</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Opens your selected agent and fills its prompt box. Clipboard is kept as fallback.</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['chatgpt', 'grok', 'gemini', 'claude'] as AgentProvider[]).map((provider) => (
            <button
              key={provider}
              onClick={() => handleProviderExport(provider)}
              className="btn-secondary"
              title={`Export to ${providerLabels[provider]}`}
              aria-label={`Export to ${providerLabels[provider]}`}
              style={{ width: '42px', height: '42px', padding: '0', borderRadius: '999px', overflow: 'hidden' }}
            >
              <img
                src={chrome.runtime.getURL(providerLogoFiles[provider])}
                alt=""
                style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Warnings Banner */}
      {context.privacyReport.warnings.length > 0 && (
        <div style={{ padding: '16px', background: 'hsla(38, 92%, 50%, 0.12)', border: '1px solid var(--warning)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <strong style={{ color: 'var(--warning)', fontSize: '15px' }}>Privacy & Threat Warnings:</strong>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            {context.privacyReport.warnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Tabbed Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Navigation Sidebar */}
        <div className="glass-panel" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button 
            onClick={() => setActiveTab('summary')}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start', background: activeTab === 'summary' ? 'var(--active-tab-bg)' : 'transparent', borderColor: activeTab === 'summary' ? 'var(--primary)' : 'transparent' }}
          >
            Extracted Summary
          </button>
          
          <button 
            onClick={() => setActiveTab('json')}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start', background: activeTab === 'json' ? 'var(--active-tab-bg)' : 'transparent', borderColor: activeTab === 'json' ? 'var(--primary)' : 'transparent' }}
          >
            {} Output JSON
          </button>

          <button 
            onClick={() => setActiveTab('markdown')}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start', background: activeTab === 'markdown' ? 'var(--active-tab-bg)' : 'transparent', borderColor: activeTab === 'markdown' ? 'var(--primary)' : 'transparent' }}
          >
            Output Markdown
          </button>

          <button 
            onClick={() => setActiveTab('actions')}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start', background: activeTab === 'actions' ? 'var(--active-tab-bg)' : 'transparent', borderColor: activeTab === 'actions' ? 'var(--primary)' : 'transparent' }}
          >
            Action Elements ({context.actionableElements.length})
          </button>

          <button 
            onClick={() => setActiveTab('data')}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start', background: activeTab === 'data' ? 'var(--active-tab-bg)' : 'transparent', borderColor: activeTab === 'data' ? 'var(--primary)' : 'transparent' }}
          >
            Raw DOM Blocks ({snapshot.textBlocks.length})
          </button>

          <button 
            onClick={() => setActiveTab('debug')}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start', background: activeTab === 'debug' ? 'var(--active-tab-bg)' : 'transparent', borderColor: activeTab === 'debug' ? 'var(--primary)' : 'transparent' }}
          >
            Compiler Debug
          </button>
        </div>

        {/* Tab content panel */}
        <div className="glass-panel" style={{ padding: '24px', minHeight: '600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Page Summary</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{context.summary.short}</p>
              
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px' }}>Heading Structure Hierarchy</h3>
                {context.hierarchy.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No heading tags found in page snapshot.</p>
                ) : (
                  <ul style={{ listStyleType: 'none', paddingLeft: '10px' }}>
                    {context.hierarchy.map((node, idx) => (
                      <li key={idx} style={{ padding: '4px 0', fontSize: '14px' }}>
                        <strong>{'#'.repeat(node.level)}</strong> {node.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: JSON OUTPUT */}
          {activeTab === 'json' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}>JSON Agent Context</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleCopy(exports.json)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                    {copied ? 'Copied!' : 'Copy JSON'}
                  </button>
                  <button onClick={handleDownloadJson} className="btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                    Download file
                  </button>
                </div>
              </div>
              <pre style={{ flex: 1, padding: '16px', overflow: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                {exports.json}
              </pre>
            </div>
          )}

          {/* TAB 3: MARKDOWN OUTPUT */}
          {activeTab === 'markdown' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Markdown Agent Context</h2>
                <button onClick={() => handleCopy(exports.markdown)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                  {copied ? 'Copied!' : 'Copy Markdown'}
                </button>
              </div>
              <pre style={{ flex: 1, padding: '16px', overflow: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                {exports.markdown}
              </pre>
            </div>
          )}

          {/* TAB 4: ACTIONS ELEMENT LIST */}
          {activeTab === 'actions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Actionable Elements</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <th style={{ padding: '8px' }}>Label / Text</th>
                    <th style={{ padding: '8px' }}>Type</th>
                    <th style={{ padding: '8px' }}>Selector Hint</th>
                    <th style={{ padding: '8px' }}>Purpose</th>
                    <th style={{ padding: '8px' }}>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {context.actionableElements.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No actionable buttons or forms detected.
                      </td>
                    </tr>
                  ) : (
                    context.actionableElements.map((el) => (
                      <tr key={el.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 600 }}>{el.label || el.textContext || '(no label)'}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--bg-input)', borderRadius: '4px', textTransform: 'uppercase' }}>
                            {el.type}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--secondary)' }}>
                          {el.selectorHint}
                        </td>
                        <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{el.actionPurpose}</td>
                        <td style={{ padding: '10px 8px' }}>
                          {el.privacySensitive ? <span className="risk-tag high">Sensitive</span> : <span className="risk-tag low">Safe</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: RAW BLOCKS */}
          {activeTab === 'data' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Raw DOM Snapshot Blocks</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                This is the raw, intermediate PageSnapshot content compiled by the content script before scoring, noise filtering, and budget trimming occurred.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {snapshot.textBlocks.map((b) => (
                  <div key={b.id} style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span>Block ID: {b.id} | Order: {b.sourceOrder}</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{b.selectorHint.slice(0, 50)}</span>
                    </div>
                    <p style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{b.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: DEBUG DETAILS */}
          {activeTab === 'debug' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Compiler Performance & Decisions</h2>
              
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Traversal Time</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--secondary)' }}>
                    {snapshot.stats.timeElapsedMs.toFixed(1)} ms
                  </div>
                </div>
                
                <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Raw Page Nodes</div>
                  <div style={{ fontSize: '20px', fontWeight: 700 }}>
                    {snapshot.stats.totalNodes}
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Redacted Objects</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--danger)' }}>
                    {context.privacyReport.redactedItems.reduce((acc, i) => acc + i.count, 0)}
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Trim Compression Ratio</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success)' }}>
                    {((1.0 - context.tokenProfile.compressionRatio) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Logs */}
              <div style={{ marginTop: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Compiler Pipeline Steps</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {context.compilerNotes.map((note, idx) => (
                    <div key={idx} style={{ padding: '10px', background: 'var(--bg-card)', borderLeft: `3px solid ${note.level === 'warning' ? 'var(--warning)' : 'var(--primary)'}`, fontSize: '13px', borderRadius: '4px' }}>
                      <span style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '10px', color: 'var(--text-muted)', marginRight: '8px' }}>
                        [{note.category}]
                      </span>
                      {note.message}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(<Preview />);
}
