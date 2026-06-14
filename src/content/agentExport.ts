import { AgentProvider, PendingAgentExport } from '../shared/types';

const pendingExportStorageKey = 'pendingAgentExport';
const pendingExportTtlMs = 5 * 60 * 1000;
const injectionTimeoutMs = 25 * 1000;
const injectionPollMs = 500;

const providerHosts: Record<AgentProvider, string[]> = {
  chatgpt: ['chatgpt.com', 'chat.openai.com'],
  grok: ['grok.com'],
  gemini: ['gemini.google.com'],
  claude: ['claude.ai']
};

const composerSelectors = [
  'textarea:not([disabled])',
  '[contenteditable="true"]',
  '[role="textbox"]',
  '.ProseMirror'
];

export function resolveAgentProvider(hostname: string): AgentProvider | undefined {
  const normalizedHost = hostname.toLowerCase();

  return (Object.keys(providerHosts) as AgentProvider[]).find((provider) =>
    providerHosts[provider].some((host) => normalizedHost === host || normalizedHost.endsWith(`.${host}`))
  );
}

export function isPendingAgentExportFresh(pending: PendingAgentExport, now = Date.now()): boolean {
  const createdAtMs = Date.parse(pending.createdAt);

  return Number.isFinite(createdAtMs) && now - createdAtMs <= pendingExportTtlMs;
}

function isVisibleElement(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);

  return rect.width > 0 && rect.height > 0 && styles.display !== 'none' && styles.visibility !== 'hidden';
}

export function findAgentComposer(root: ParentNode = document): HTMLElement | HTMLTextAreaElement | null {
  for (const selector of composerSelectors) {
    const candidates = Array.from(root.querySelectorAll<HTMLElement | HTMLTextAreaElement>(selector));
    const visibleCandidate = candidates.find((candidate) => {
      if (!isVisibleElement(candidate)) return false;
      if (candidate instanceof HTMLTextAreaElement) return !candidate.disabled && !candidate.readOnly;
      return candidate.isContentEditable || candidate.getAttribute('role') === 'textbox';
    });

    if (visibleCandidate) {
      return visibleCandidate;
    }
  }

  return null;
}

function dispatchComposerEvents(element: Element): void {
  element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

export function injectPromptIntoElement(element: HTMLElement | HTMLTextAreaElement, text: string): boolean {
  element.focus();

  if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
    element.value = text;
    dispatchComposerEvents(element);
    return element.value === text;
  }

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection?.removeAllRanges();
  selection?.addRange(range);

  const inserted = document.execCommand('insertText', false, text);
  if (!inserted || element.textContent?.trim() !== text.trim()) {
    element.textContent = text;
  }

  dispatchComposerEvents(element);
  return (element.textContent || '').trim() === text.trim();
}

function readPendingExport(): Promise<PendingAgentExport | undefined> {
  return new Promise((resolve) => {
    chrome.storage.local.get([pendingExportStorageKey], (result) => {
      resolve(result[pendingExportStorageKey] as PendingAgentExport | undefined);
    });
  });
}

function clearPendingExport(): Promise<void> {
  return chrome.storage.local.remove(pendingExportStorageKey);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function injectPendingAgentExport(): Promise<void> {
  const currentProvider = resolveAgentProvider(window.location.hostname);
  if (!currentProvider) return;

  const pending = await readPendingExport();
  if (!pending || pending.provider !== currentProvider || !isPendingAgentExportFresh(pending)) return;

  const startedAt = Date.now();
  while (Date.now() - startedAt <= injectionTimeoutMs) {
    const composer = findAgentComposer();
    if (composer && injectPromptIntoElement(composer, pending.text)) {
      await clearPendingExport();
      console.info(`Visor inserted context into ${currentProvider}. Review it before sending.`);
      return;
    }

    await delay(injectionPollMs);
  }
}
