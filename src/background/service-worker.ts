import { CompileRequest, CompileResponse, PageSnapshot } from '../shared/types';
import { compileSnapshot } from '../compiler/compiler';
import { loadSettings, loadSiteProfiles, saveRecentCompile } from '../storage/settings';
import { PageSnapshotSchema } from '../shared/schema';
import { getStoredAuthSession, signInWithGoogle, signOutGoogle } from '../auth/googleAuth';

type CompileTabOptions = {
  saveRecent: boolean;
  updateBadge: boolean;
};

const autoCompileTimers = new Map<number, number>();
const autoCompileInFlight = new Set<number>();
const autoCompileDelayMs = 900;

// Listen for messages from the Popup or Options page
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'VISOR_COMPILE_ACTIVE_TAB') {
    handleCompileActiveTab(message.payload, sendResponse);
    return true; // Keep message channel open for async response
  }
  if (message.type === 'VISOR_AUTH_GET_SESSION') {
    getStoredAuthSession()
      .then((session) => sendResponse({ ok: true, session }))
      .catch((error: Error) => sendResponse({ ok: false, userMessage: error.message }));
    return true;
  }
  if (message.type === 'VISOR_AUTH_SIGN_IN_GOOGLE') {
    signInWithGoogle()
      .then((session) => sendResponse({ ok: true, session }))
      .catch((error: Error) => sendResponse({ ok: false, userMessage: error.message }));
    return true;
  }
  if (message.type === 'VISOR_AUTH_SIGN_OUT') {
    signOutGoogle()
      .then(() => sendResponse({ ok: true }))
      .catch((error: Error) => sendResponse({ ok: false, userMessage: error.message }));
    return true;
  }
  return false;
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  scheduleAutoCompile(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    scheduleAutoCompile(tabId);
  }
});

chrome.runtime.onInstalled.addListener(() => {
  void compileCurrentActiveTabAutomatically();
});

chrome.runtime.onStartup.addListener(() => {
  void compileCurrentActiveTabAutomatically();
});

async function handleCompileActiveTab(
  request: CompileRequest,
  sendResponse: (response: CompileResponse) => void
) {
  try {
    // 1. Get the active tab in the current window
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!activeTab || !activeTab.id || !activeTab.url) {
      sendResponse({
        ok: false,
        errorCode: 'NO_ACTIVE_TAB',
        userMessage: 'No active tab found. Please select a valid web page.'
      });
      return;
    }

    sendResponse(await compileTab(activeTab.id, activeTab.url, request, {
      saveRecent: true,
      updateBadge: true
    }));

  } catch (error: any) {
    console.error('Compilation worker error:', error);
    sendResponse({
      ok: false,
      errorCode: 'COMPILER_UNEXPECTED_ERROR',
      userMessage: 'An unexpected compiler error occurred. Please try again.',
      debug: error.message || error
    });
  }
}

function scheduleAutoCompile(tabId: number): void {
  const existingTimer = autoCompileTimers.get(tabId);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = self.setTimeout(() => {
    autoCompileTimers.delete(tabId);
    void autoCompileTab(tabId);
  }, autoCompileDelayMs);

  autoCompileTimers.set(tabId, timer);
}

async function compileCurrentActiveTabAutomatically(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    scheduleAutoCompile(tab.id);
  }
}

async function autoCompileTab(tabId: number): Promise<void> {
  if (autoCompileInFlight.has(tabId)) return;
  autoCompileInFlight.add(tabId);

  try {
    const settings = await loadSettings();
    if (!settings.autoCompile) {
      await updateBadge(tabId, '');
      return;
    }

    const tab = await chrome.tabs.get(tabId);
    if (!tab.active || !tab.url) return;

    const request: CompileRequest = {
      mode: settings.defaultMode,
      privacyLevel: settings.privacyLevel,
      tokenBudget: settings.tokenBudget
    };

    const response = await compileTab(tabId, tab.url, request, {
      saveRecent: false,
      updateBadge: true
    });

    if (!response.ok && response.errorCode !== 'RESTRICTED_PAGE' && response.errorCode !== 'BLOCKED_DOMAIN') {
      console.debug('Visor auto compile skipped:', response.errorCode, response.userMessage);
    }
  } catch (error) {
    console.debug('Visor auto compile failed:', error);
  } finally {
    autoCompileInFlight.delete(tabId);
  }
}

async function compileTab(
  tabId: number,
  url: string,
  request: CompileRequest,
  options: CompileTabOptions
): Promise<CompileResponse> {
  if (isRestrictedUrl(url)) {
    if (options.updateBadge) await updateBadge(tabId, '');
    return {
      ok: false,
      errorCode: 'RESTRICTED_PAGE',
      userMessage: 'Visor cannot compile Chrome system screens, Web Store pages, or internal extension pages due to browser security restrictions.'
    };
  }

  const storedSettings = await loadSettings();
  const activeHostname = getHostname(url);

  if (activeHostname && isBlockedDomain(activeHostname, storedSettings.blockedDomains)) {
    if (options.updateBadge) await updateBadge(tabId, 'off');
    return {
      ok: false,
      errorCode: 'BLOCKED_DOMAIN',
      userMessage: 'Visor is blocked on this domain by your local settings.'
    };
  }

  const siteProfiles = await loadSiteProfiles();
  const siteProfile = activeHostname
    ? siteProfiles.find((profile) => domainMatches(activeHostname, profile.domain))
    : undefined;
  const effectiveRequest: CompileRequest = {
    ...request,
    privacyLevel: siteProfile?.privacyLevelOverride || request.privacyLevel,
    siteProfile
  };

  let snapshot: PageSnapshot;
  try {
    snapshot = await sendExtractMessage(tabId, effectiveRequest);
  } catch (err: any) {
    console.log('Content script not detected. Injecting programmatically...', err);

    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content-script.js']
      });

      await new Promise((resolve) => setTimeout(resolve, 150));
      snapshot = await sendExtractMessage(tabId, effectiveRequest);
    } catch (injectionErr: any) {
      console.error('Dynamic injection failed:', injectionErr);
      if (options.updateBadge) await updateBadge(tabId, 'err');
      return {
        ok: false,
        errorCode: 'EXTRACTION_INJECTION_FAILED',
        userMessage: 'Failed to access the page content. If this is a local file, ensure "Allow access to file URLs" is checked in extension settings.',
        debug: injectionErr.message || injectionErr
      };
    }
  }

  const snapshotValidation = PageSnapshotSchema.safeParse(snapshot);
  if (!snapshotValidation.success) {
    if (options.updateBadge) await updateBadge(tabId, 'err');
    return {
      ok: false,
      errorCode: 'INVALID_PAGE_SNAPSHOT',
      userMessage: 'The page was extracted, but the snapshot did not match the expected schema.',
      debug: snapshotValidation.error.flatten()
    };
  }

  const result = compileSnapshot(snapshotValidation.data, effectiveRequest);

  await chrome.storage.local.set({
    lastCompileResult: {
      snapshot,
      context: result.context,
      exports: result.exports
    },
    lastAutoCompiledAt: new Date().toISOString()
  });

  if (options.saveRecent) {
    await saveRecentCompile({
      id: `compile-${Date.now()}`,
      url: result.context.source.url,
      title: result.context.source.title,
      createdAt: result.context.source.capturedAt,
      mode: effectiveRequest.mode,
      tokenCount: result.context.tokenProfile.compiledEstimatedTokens,
      riskLevel: result.context.privacyReport.riskLevel
    });
  }

  if (options.updateBadge) {
    await updateBadge(tabId, 'on');
  }

  return {
    ok: true,
    snapshot,
    context: result.context,
    exports: result.exports
  };
}

function isRestrictedUrl(url: string): boolean {
  return (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('devtools://') ||
    url.startsWith('view-source:') ||
    url.startsWith('about:') ||
    url.startsWith('chrome.google.com/webstore') ||
    url.startsWith('chromewebstore.google.com')
  );
}

async function updateBadge(tabId: number, text: string): Promise<void> {
  await chrome.action.setBadgeText({ tabId, text });
  await chrome.action.setBadgeBackgroundColor({ tabId, color: text === 'err' ? '#ef4444' : '#1ed760' });
}

function getHostname(rawUrl: string): string | undefined {
  try {
    return new URL(rawUrl).hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

function normalizeDomain(domain: string): string {
  return domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
}

function domainMatches(hostname: string, domain: string): boolean {
  const normalized = normalizeDomain(domain);
  const host = hostname.replace(/^www\./, '');
  return host === normalized || host.endsWith(`.${normalized}`);
}

function isBlockedDomain(hostname: string, blockedDomains: string[]): boolean {
  return blockedDomains.some((domain) => domainMatches(hostname, domain));
}

function sendExtractMessage(tabId: number, request: CompileRequest): Promise<PageSnapshot> {
  return new Promise((resolve, reject) => {
    // Set a timeout to prevent hanging forever
    const timeout = setTimeout(() => {
      reject(new Error('TIMEOUT'));
    }, 4000);

    chrome.tabs.sendMessage(
      tabId,
      { type: 'VISOR_EXTRACT_DOM', payload: { settings: request } },
      (response) => {
        clearTimeout(timeout);
        
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (response && response.ok) {
          resolve(response.snapshot);
        } else {
          reject(new Error(response?.error || 'Unknown extraction failure'));
        }
      }
    );
  });
}
