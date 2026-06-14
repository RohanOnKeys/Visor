import { AuthSession } from '../shared/types';
import { clearAuthSession, loadAuthSession, saveAuthSession } from '../storage/settings';

const googleUserInfoEndpoint = 'https://www.googleapis.com/oauth2/v3/userinfo';

type GoogleUserInfo = {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
};

function getGoogleToken(interactive: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (tokenResult) => {
      const token = typeof tokenResult === 'string' ? tokenResult : tokenResult?.token;

      if (chrome.runtime.lastError || !token) {
        reject(new Error(chrome.runtime.lastError?.message || 'Google sign-in did not return a token.'));
        return;
      }

      resolve(token);
    });
  });
}

async function fetchGoogleUserInfo(token: string): Promise<GoogleUserInfo> {
  const response = await fetch(googleUserInfoEndpoint, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Google profile request failed with status ${response.status}.`);
  }

  return response.json() as Promise<GoogleUserInfo>;
}

export async function getStoredAuthSession(): Promise<AuthSession | undefined> {
  return loadAuthSession();
}

export async function signInWithGoogle(): Promise<AuthSession> {
  const accessToken = await getGoogleToken(true);
  const profile = await fetchGoogleUserInfo(accessToken);

  const session: AuthSession = {
    accessToken,
    signedInAt: new Date().toISOString(),
    user: {
      id: profile.sub,
      email: profile.email,
      name: profile.name,
      pictureUrl: profile.picture,
      provider: 'google'
    }
  };

  await saveAuthSession(session);
  return session;
}

export async function signOutGoogle(): Promise<void> {
  const session = await loadAuthSession();
  if (session?.accessToken) {
    await new Promise<void>((resolve) => {
      chrome.identity.removeCachedAuthToken({ token: session.accessToken }, () => {
        resolve();
      });
    });
  }

  await clearAuthSession();
}
