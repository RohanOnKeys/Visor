import { AuthSession } from '../shared/types';

type AuthResponse =
  | { ok: true; session?: AuthSession }
  | { ok: false; userMessage: string };

function sendAuthMessage(type: string): Promise<AuthResponse> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      resolve({ ok: false, userMessage: 'Chrome extension runtime is not available.' });
      return;
    }

    chrome.runtime.sendMessage({ type }, (response: AuthResponse | undefined) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, userMessage: chrome.runtime.lastError.message || 'Auth request failed.' });
        return;
      }

      resolve(response || { ok: false, userMessage: 'Auth request returned no response.' });
    });
  });
}

export async function getAuthSession(): Promise<AuthSession | undefined> {
  const response = await sendAuthMessage('VISOR_AUTH_GET_SESSION');
  if (!response.ok) return undefined;
  return response.session;
}

export async function signInWithGoogleFromClient(): Promise<AuthSession> {
  const response = await sendAuthMessage('VISOR_AUTH_SIGN_IN_GOOGLE');
  if (!response.ok || !response.session) {
    throw new Error(response.ok ? 'Google sign-in did not return a session.' : response.userMessage);
  }

  return response.session;
}

export async function signOutFromClient(): Promise<void> {
  const response = await sendAuthMessage('VISOR_AUTH_SIGN_OUT');
  if (!response.ok) {
    throw new Error(response.userMessage);
  }
}
