import { UserSettings, SiteProfile, RecentCompileMetadata, AuthSession } from '../shared/types';

const DEFAULT_SETTINGS: UserSettings = {
  defaultMode: 'compact',
  privacyLevel: 'medium',
  tokenBudget: 4000,
  defaultExport: 'json',
  debugMode: false,
  blockedDomains: []
};

// In-memory fallback for testing environments (Vitest/Node)
let memoryStorage: Record<string, any> = {};

function isExtensionEnvironment(): boolean {
  return typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined' && typeof chrome.storage.local !== 'undefined';
}

export async function loadSettings(): Promise<UserSettings> {
  if (isExtensionEnvironment()) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['settings'], (result) => {
        if (result.settings) {
          resolve({ ...DEFAULT_SETTINGS, ...result.settings });
        } else {
          resolve(DEFAULT_SETTINGS);
        }
      });
    });
  } else {
    return memoryStorage['settings'] || DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  if (isExtensionEnvironment()) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ settings }, () => {
        resolve();
      });
    });
  } else {
    memoryStorage['settings'] = settings;
  }
}

export async function loadSiteProfiles(): Promise<SiteProfile[]> {
  if (isExtensionEnvironment()) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['siteProfiles'], (result) => {
        const profiles = result.siteProfiles;
        resolve(Array.isArray(profiles) ? profiles : []);
      });
    });
  } else {
    const profiles = memoryStorage['siteProfiles'];
    return Array.isArray(profiles) ? profiles : [];
  }
}

export async function saveSiteProfiles(profiles: SiteProfile[]): Promise<void> {
  if (isExtensionEnvironment()) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ siteProfiles: profiles }, () => {
        resolve();
      });
    });
  } else {
    memoryStorage['siteProfiles'] = profiles;
  }
}

export async function saveSiteProfile(profile: SiteProfile): Promise<void> {
  const profiles = await loadSiteProfiles();
  const index = profiles.findIndex((p) => p.id === profile.id || p.domain === profile.domain);
  
  if (index >= 0) {
    profiles[index] = { ...profile, updatedAt: new Date().toISOString() };
  } else {
    profiles.push({ ...profile, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  
  await saveSiteProfiles(profiles);
}

export async function deleteSiteProfile(profileId: string): Promise<void> {
  const profiles = await loadSiteProfiles();
  const filtered = profiles.filter((p) => p.id !== profileId);
  await saveSiteProfiles(filtered);
}

export async function clearAllData(): Promise<void> {
  if (isExtensionEnvironment()) {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        resolve();
      });
    });
  } else {
    memoryStorage = {};
  }
}

export async function loadRecentCompiles(): Promise<RecentCompileMetadata[]> {
  if (isExtensionEnvironment()) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['recentCompiles'], (result) => {
        const recent = result.recentCompiles;
        resolve(Array.isArray(recent) ? recent : []);
      });
    });
  }

  const recent = memoryStorage['recentCompiles'];
  return Array.isArray(recent) ? recent : [];
}

export async function saveRecentCompile(metadata: RecentCompileMetadata): Promise<void> {
  const recent = await loadRecentCompiles();
  const updated = [metadata, ...recent.filter((item) => item.id !== metadata.id)].slice(0, 20);

  if (isExtensionEnvironment()) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ recentCompiles: updated }, () => {
        resolve();
      });
    });
  }

  memoryStorage['recentCompiles'] = updated;
}

export async function loadAuthSession(): Promise<AuthSession | undefined> {
  if (isExtensionEnvironment()) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['authSession'], (result) => {
        resolve(result.authSession as AuthSession | undefined);
      });
    });
  }

  return memoryStorage['authSession'] as AuthSession | undefined;
}

export async function saveAuthSession(session: AuthSession): Promise<void> {
  if (isExtensionEnvironment()) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ authSession: session }, () => {
        resolve();
      });
    });
  }

  memoryStorage['authSession'] = session;
}

export async function clearAuthSession(): Promise<void> {
  if (isExtensionEnvironment()) {
    return chrome.storage.local.remove('authSession');
  }

  delete memoryStorage['authSession'];
}
