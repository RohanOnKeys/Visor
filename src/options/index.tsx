import { useState, useEffect, type ChangeEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthSession, UserSettings, SiteProfile } from '../shared/types';
import { loadSettings, saveSettings, loadSiteProfiles, saveSiteProfiles, clearAllData } from '../storage/settings';
import { getAuthSession, signInWithGoogleFromClient, signOutFromClient } from '../auth/client';
import '../index.css';

function Options() {
  // Config states
  const [defaultMode, setDefaultMode] = useState<UserSettings['defaultMode']>('compact');
  const [privacyLevel, setPrivacyLevel] = useState<UserSettings['privacyLevel']>('medium');
  const [tokenBudget, setTokenBudget] = useState<number>(4000);
  const [defaultExport, setDefaultExport] = useState<UserSettings['defaultExport']>('json');
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [autoCompile, setAutoCompile] = useState<boolean>(true);
  const [blockedDomainsText, setBlockedDomainsText] = useState<string>('');
  
  // Site Profiles states
  const [siteProfiles, setSiteProfiles] = useState<SiteProfile[]>([]);
  const [editingProfile, setEditingProfile] = useState<Partial<SiteProfile> | null>(null);

  // Local string form states for array fields
  const [preserveText, setPreserveText] = useState<string>('');
  const [ignoreText, setIgnoreText] = useState<string>('');
  const [authSession, setAuthSession] = useState<AuthSession | undefined>();
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'error'>('loading');
  const [authError, setAuthError] = useState<string>('');

  // Load configuration on mount
  useEffect(() => {
    async function loadData() {
      const settings = await loadSettings();
      setDefaultMode(settings.defaultMode);
      setPrivacyLevel(settings.privacyLevel);
      setTokenBudget(settings.tokenBudget);
      setDefaultExport(settings.defaultExport);
      setDebugMode(settings.debugMode);
      setAutoCompile(settings.autoCompile);
      setBlockedDomainsText(settings.blockedDomains.join('\n'));

      const profiles = await loadSiteProfiles();
      setSiteProfiles(profiles);

      const session = await getAuthSession();
      setAuthSession(session);
      setAuthStatus('idle');
    }
    loadData();
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

  const handleSaveSettings = async () => {
    try {
      const blockedDomains = blockedDomainsText
        .split('\n')
        .map((d) => d.trim())
        .filter((d) => d.length > 0);

      const updatedSettings: UserSettings = {
        defaultMode,
        privacyLevel,
        tokenBudget,
        defaultExport,
        debugMode,
        autoCompile,
        blockedDomains
      };

      await saveSettings(updatedSettings);
      alert('Settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings.');
    }
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all storage? This will delete all custom settings and site profiles.')) {
      await clearAllData();
      alert('Local storage cleared successfully.');
      window.location.reload();
    }
  };

  // Profile actions
  const handleEditProfile = (profile: SiteProfile) => {
    setEditingProfile({ ...profile });
    setPreserveText(profile.preserveSelectors.join(', '));
    setIgnoreText(profile.ignoreSelectors.join(', '));
  };

  const handleCreateNewProfile = () => {
    setEditingProfile({
      id: `profile-${Date.now()}`,
      domain: '',
      mainContentSelector: '',
      privacyLevelOverride: undefined
    });
    setPreserveText('');
    setIgnoreText('');
  };

  const handleSaveProfile = async () => {
    if (!editingProfile || !editingProfile.domain) {
      alert('Please specify a valid target domain.');
      return;
    }

    const domain = editingProfile.domain.trim().toLowerCase();
    
    const updatedProfile: SiteProfile = {
      id: editingProfile.id || `profile-${Date.now()}`,
      domain,
      preserveSelectors: preserveText.split(',').map((s) => s.trim()).filter((s) => s.length > 0),
      ignoreSelectors: ignoreText.split(',').map((s) => s.trim()).filter((s) => s.length > 0),
      mainContentSelector: editingProfile.mainContentSelector?.trim() || undefined,
      privacyLevelOverride: editingProfile.privacyLevelOverride,
      createdAt: editingProfile.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const index = siteProfiles.findIndex((p) => p.id === updatedProfile.id || p.domain === updatedProfile.domain);
    const updatedList = [...siteProfiles];

    if (index >= 0) {
      updatedList[index] = updatedProfile;
    } else {
      updatedList.push(updatedProfile);
    }

    setSiteProfiles(updatedList);
    await saveSiteProfiles(updatedList);
    setEditingProfile(null);
    alert('Site Profile saved successfully!');
  };

  const handleDeleteProfile = async (id: string) => {
    if (confirm('Delete this site profile?')) {
      const filtered = siteProfiles.filter((p) => p.id !== id);
      setSiteProfiles(filtered);
      await saveSiteProfiles(filtered);
    }
  };

  const handleExportProfiles = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(siteProfiles, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'visor_site_profiles.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportProfiles = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          const merged = [...siteProfiles];
          imported.forEach((impProfile) => {
            const idx = merged.findIndex((p) => p.domain === impProfile.domain);
            if (idx >= 0) {
              merged[idx] = impProfile;
            } else {
              merged.push(impProfile);
            }
          });
          setSiteProfiles(merged);
          await saveSiteProfiles(merged);
          alert('Site profiles imported successfully!');
        } else {
          alert('Invalid format. Must be an array of Site Profiles.');
        }
      } catch (err) {
        alert('Failed to parse profiles file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-container" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', gap: '24px' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <h1 className="title-gradient" style={{ fontSize: '28px' }}>Visor Control Panel</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Configure compiler heuristics, defaults, site selectors, and privacy redactions.
          </p>
        </div>
        <button onClick={handleExportProfiles} className="btn-secondary" style={{ fontSize: '13px' }}>
          Export Site Profiles
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
        
        {/* LEFT COLUMN: Compiler Defaults & Blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Account</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {authSession ? `${authSession.user.name || 'Google account'} · ${authSession.user.email}` : 'Sign in with Google to attach Visor to a user account.'}
              </p>
              {authError && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '6px' }}>{authError}</p>}
            </div>
            {authSession ? (
              <button onClick={handleSignOut} disabled={authStatus === 'loading'} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }}>
                Sign out
              </button>
            ) : (
              <button onClick={handleGoogleSignIn} disabled={authStatus === 'loading'} className="btn-primary" style={{ padding: '8px 14px', fontSize: '13px', minWidth: '140px' }}>
                Google sign in
              </button>
            )}
          </div>
          
          {/* Default configurations */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Compiler Options</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Default Compilation Mode</label>
              <select value={defaultMode} onChange={(e) => setDefaultMode(e.target.value as any)}>
                <option value="compact">Compact (Highly summarized)</option>
                <option value="detailed">Detailed (Preserves full page structure)</option>
                <option value="agent_action">Agent Mode (Actions, forms, labels)</option>
                <option value="rag">RAG Chunks (Formatted for vector ingestion)</option>
                <option value="debug">Compiler Debug (Includes removed elements)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Default Privacy Level</label>
              <select value={privacyLevel} onChange={(e) => setPrivacyLevel(e.target.value as any)}>
                <option value="low">Low (Credentials only)</option>
                <option value="medium">Medium (Credentials + Emails)</option>
                <option value="strict">Strict (Credentials + Emails + Phone numbers)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Default Token Limit</label>
              <input type="number" value={tokenBudget} onChange={(e) => setTokenBudget(parseInt(e.target.value) || 4000)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Default Export Style</label>
              <select value={defaultExport} onChange={(e) => setDefaultExport(e.target.value as any)}>
                <option value="json">JSON format</option>
                <option value="markdown">Markdown format</option>
                <option value="prompt_block">Delimited Prompt Block</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                id="debugToggle"
                checked={debugMode} 
                onChange={(e) => setDebugMode(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <label htmlFor="debugToggle" style={{ fontSize: '14px', cursor: 'pointer' }}>Enable compiler debug logs in context output</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="autoCompileToggle"
                checked={autoCompile}
                onChange={(e) => setAutoCompile(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <label htmlFor="autoCompileToggle" style={{ fontSize: '14px', cursor: 'pointer' }}>Keep Visor active and auto-read the active tab while browsing</label>
            </div>

            <button onClick={handleSaveSettings} className="btn-primary" style={{ width: '100%', height: '38px', marginTop: '6px' }}>
              Save Configurations
            </button>
          </div>

          {/* Blocked Domains list */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Blocked Domains</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
              Enter domains (one per line) where Visor should block compiler executions (e.g. `internal-wiki.com`).
            </p>
            <textarea 
              rows={4} 
              value={blockedDomainsText} 
              onChange={(e) => setBlockedDomainsText(e.target.value)}
              placeholder="secretsite.com&#10;internal.org"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', resize: 'vertical' }}
            />
            <button onClick={handleSaveSettings} className="btn-secondary" style={{ width: '100%' }}>
              Update Blocked List
            </button>
          </div>

          {/* Danger zone resetting */}
          <div className="glass-panel" style={{ padding: '16px', border: '1px solid hsla(346, 84%, 55%, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--danger)' }}>Reset Storage</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Permanently erase all local configs.</div>
            </div>
            <button onClick={handleClearData} className="btn-danger" style={{ padding: '8px 14px', fontSize: '13px' }}>
              Clear Local Data
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Site Profiles & Overrides */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Site profiles list */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Site Extraction Profiles</h2>
              <button onClick={handleCreateNewProfile} className="btn-primary" style={{ padding: '8px 14px', fontSize: '13px' }}>
                + Add Profile
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
              Site profiles allow you to override target DOM selectors (e.g., skip ad sidebars or preserve specific text bodies) on a domain basis.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <span>Import Profiles:</span>
              <input type="file" accept=".json" onChange={handleImportProfiles} style={{ padding: '4px', fontSize: '12px' }} />
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
              {siteProfiles.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                  No custom domain profiles created yet.
                </div>
              ) : (
                siteProfiles.map((profile) => (
                  <div key={profile.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--secondary)' }}>{profile.domain}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Ignore selectors: {profile.ignoreSelectors.length} | Preserve: {profile.preserveSelectors.length}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleEditProfile(profile)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteProfile(profile.id)} className="btn-danger" style={{ padding: '4px 8px', fontSize: '12px', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Editor sub-form panel */}
          {editingProfile && (
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid var(--secondary)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--secondary)' }}>
                {editingProfile.createdAt ? 'Edit Site Profile' : 'New Site Profile'}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Target Domain</label>
                <input 
                  type="text" 
                  value={editingProfile.domain || ''} 
                  onChange={(e) => setEditingProfile({ ...editingProfile, domain: e.target.value })}
                  placeholder="wikipedia.org"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Preserve Selectors (Comma separated)</label>
                <input 
                  type="text" 
                  value={preserveText} 
                  onChange={(e) => setPreserveText(e.target.value)}
                  placeholder=".main-article, #content"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ignore Selectors (Comma separated)</label>
                <input 
                  type="text" 
                  value={ignoreText} 
                  onChange={(e) => setIgnoreText(e.target.value)}
                  placeholder=".ads-panel, #sidebar"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Main Content Selector (Optional)</label>
                <input 
                  type="text" 
                  value={editingProfile.mainContentSelector || ''} 
                  onChange={(e) => setEditingProfile({ ...editingProfile, mainContentSelector: e.target.value })}
                  placeholder="div.article-content"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Privacy Level Override (Optional)</label>
                <select 
                  value={editingProfile.privacyLevelOverride || ''} 
                  onChange={(e) => setEditingProfile({ ...editingProfile, privacyLevelOverride: e.target.value ? (e.target.value as any) : undefined })}
                >
                  <option value="">No Override (Use Default)</option>
                  <option value="low">Low Redaction</option>
                  <option value="medium">Medium Redaction</option>
                  <option value="strict">Strict Redaction</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button onClick={handleSaveProfile} className="btn-primary" style={{ flex: 1 }}>
                  Save Profile
                </button>
                <button onClick={() => setEditingProfile(null)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
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
  root.render(<Options />);
}
