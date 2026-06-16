import { AgentProvider, CompileRequest, UserSettings } from '../shared/types';
import { resolveAgentProvider } from './agentExport';

const providerLabels: Record<AgentProvider, string> = {
  chatgpt: 'GPT',
  grok: 'Grok',
  gemini: 'Gemini',
  claude: 'Claude'
};

const providerLogoFiles: Record<AgentProvider, string> = {
  chatgpt: 'llm-chatgpt.png',
  grok: 'llm-grok.png',
  gemini: 'llm-gemini.png',
  claude: 'llm-claude.png'
};

type WidgetState = {
  open: boolean;
  exporting?: AgentProvider;
  mode: CompileRequest['mode'];
  privacyLevel: CompileRequest['privacyLevel'];
  tokenBudget: number;
};

let mountedHost: HTMLDivElement | undefined;

function getSessionStorageArea(): chrome.storage.StorageArea | undefined {
  return (chrome.storage as any).session as chrome.storage.StorageArea | undefined;
}

async function getSessionValue<T>(key: string): Promise<T | undefined> {
  const session = getSessionStorageArea();
  if (!session) return undefined;

  return new Promise((resolve) => {
    session.get([key], (result) => {
      if (chrome.runtime.lastError) {
        resolve(undefined);
        return;
      }
      resolve(result[key] as T | undefined);
    });
  });
}

async function setSessionValue(key: string, value: unknown): Promise<void> {
  const session = getSessionStorageArea();
  if (!session) return;

  return new Promise((resolve) => {
    session.set({ [key]: value }, () => resolve());
  });
}

function shouldMountWidget(): boolean {
  if (window.top !== window.self) return false;
  if (resolveAgentProvider(window.location.hostname)) return false;
  if (document.documentElement.dataset.visorWidgetMounted === 'true') return false;
  return !/^chrome:|^chrome-extension:|^about:|^devtools:/i.test(window.location.href);
}

function sendExport(provider: AgentProvider, request: CompileRequest): Promise<{ ok: boolean; userMessage?: string }> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        type: 'VISOR_EXPORT_ACTIVE_TAB_TO_AGENT',
        payload: {
          provider,
          request
        }
      },
      (response) => {
        if (chrome.runtime.lastError) {
          resolve({ ok: false, userMessage: chrome.runtime.lastError.message || 'Export failed.' });
          return;
        }

        resolve(response || { ok: false, userMessage: 'Export failed.' });
      }
    );
  });
}

function createStyle(): HTMLStyleElement {
  const style = document.createElement('style');
  style.textContent = `
    :host {
      all: initial;
      color-scheme: dark;
      --visor-green: #1ed760;
      --visor-border: rgba(30, 215, 96, 0.38);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .visor-widget {
      position: fixed;
      right: 18px;
      bottom: 18px;
      width: 46px;
      height: 46px;
      z-index: 2147483647;
      pointer-events: auto;
    }

    .visor-main,
    .visor-action,
    .visor-close {
      position: absolute;
      border: 1px solid var(--visor-border);
      border-radius: 999px;
      padding: 0;
      overflow: hidden;
      cursor: pointer;
      display: grid;
      place-items: center;
      line-height: 0;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.32), 0 0 18px rgba(30, 215, 96, 0.14);
      transition: transform 180ms ease, border-color 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
      transform-origin: center;
    }

    .visor-main {
      inset: 0;
      border-color: transparent;
      background: transparent;
      box-shadow: none;
      touch-action: none;
    }

    .visor-main:hover,
    .visor-action:hover,
    .visor-close:hover {
      border-color: rgba(30, 215, 96, 0.88);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.36), 0 0 22px rgba(30, 215, 96, 0.22);
    }

    .visor-main img {
      width: 42px;
      height: 42px;
      border-radius: 999px;
      object-fit: cover;
      object-position: center;
      filter: saturate(1.18) contrast(1.06);
      pointer-events: none;
    }

    .visor-actions {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0;
      transition: opacity 140ms ease;
    }

    .visor-widget.open .visor-actions {
      opacity: 1;
      pointer-events: auto;
    }

    .visor-action {
      width: 34px;
      height: 34px;
      left: 6px;
      top: 6px;
      background: rgba(4, 10, 8, 0.56);
      backdrop-filter: blur(8px);
      transform: translate(0, 0) scale(0.72);
    }

    .visor-widget.open .visor-action {
      transform: translate(var(--x), var(--y)) scale(0.92);
    }

    .visor-close {
      width: 34px;
      height: 34px;
      left: 6px;
      top: 6px;
      background: rgba(30, 215, 96, 0.82);
      backdrop-filter: blur(8px);
      opacity: 0;
      pointer-events: none;
      transform: translate(var(--close-x, -48px), var(--close-y, 0)) scale(0.72);
    }

    .visor-close::before,
    .visor-close::after {
      content: "";
      position: absolute;
      left: 50%;
      top: 50%;
      width: 13px;
      height: 2.5px;
      border-radius: 999px;
      background: #001409;
      transform-origin: center;
    }

    .visor-close::before {
      transform: translate(-50%, -50%) rotate(45deg);
    }

    .visor-close::after {
      transform: translate(-50%, -50%) rotate(-45deg);
    }

    .visor-widget.open .visor-close {
      opacity: 1;
      pointer-events: auto;
      transform: translate(var(--close-x, -48px), var(--close-y, 0)) scale(0.92);
    }

    .visor-widget.open .visor-close:hover {
      transform: translate(var(--close-x, -48px), var(--close-y, 0)) scale(1.18);
      z-index: 3;
    }

    .visor-widget.open .visor-actions:hover .visor-action {
      transform: translate(calc(var(--x) * 0.94), calc(var(--y) * 0.94)) scale(0.82);
      opacity: 0.82;
    }

    .visor-widget.open .visor-actions:hover .visor-action:hover {
      transform: translate(var(--x), var(--y)) scale(1.14);
      opacity: 1;
      z-index: 2;
    }

    .visor-action img {
      width: 100%;
      height: 100%;
      display: block;
      border-radius: 999px;
      object-fit: cover;
      object-position: center;
      pointer-events: none;
    }

    .visor-action[disabled] {
      cursor: wait;
      opacity: 0.62;
    }

    .visor-widget.dragging .visor-main {
      cursor: grabbing;
    }
  `;
  return style;
}

export async function unmountVisorWidget(): Promise<void> {
  mountedHost?.remove();
  mountedHost = undefined;
  delete document.documentElement.dataset.visorWidgetMounted;
}

export async function mountVisorWidget(): Promise<void> {
  if (!shouldMountWidget()) return;
  const savedSettings = (await getSessionValue<Partial<UserSettings>>('settings')) || {};
  if (savedSettings.widgetEnabled === false) return;

  document.documentElement.dataset.visorWidgetMounted = 'true';
  const state: WidgetState = {
    open: false,
    mode: savedSettings.defaultMode || 'agent_action',
    privacyLevel: savedSettings.privacyLevel || 'medium',
    tokenBudget: savedSettings.tokenBudget || 4000
  };

  const host = document.createElement('div');
  host.id = 'visor-floating-widget-root';
  mountedHost = host;
  const shadow = host.attachShadow({ mode: 'open' });
  const wrapper = document.createElement('div');
  wrapper.className = 'visor-widget';

  const mainButton = document.createElement('button');
  mainButton.className = 'visor-main';
  mainButton.type = 'button';
  mainButton.title = 'Open Visor agent export widget';
  mainButton.setAttribute('aria-label', 'Open Visor agent export widget');

  const logo = document.createElement('img');
  logo.src = chrome.runtime.getURL('visor-logo.png');
  logo.alt = '';
  mainButton.appendChild(logo);

  const actions = document.createElement('div');
  actions.className = 'visor-actions';

  const closeButton = document.createElement('button');
  closeButton.className = 'visor-close';
  closeButton.type = 'button';
  closeButton.title = 'Hide Visor widget';
  closeButton.setAttribute('aria-label', 'Hide Visor widget');
  closeButton.addEventListener('click', async (event) => {
    event.stopPropagation();
    const currentSettings = (await getSessionValue<Partial<UserSettings>>('settings')) || {};
    await setSessionValue('settings', {
      ...currentSettings,
      widgetEnabled: false
    });
    await unmountVisorWidget();
  });

  const closePosition: [number, number] = [70, 0];
  const radialPositions: Record<AgentProvider, [number, number]> = {
    chatgpt: [63, 39],
    grok: [39, 63],
    gemini: [0, 72],
    claude: [-39, 63]
  };
  const actionButtons = new Map<AgentProvider, HTMLButtonElement>();

  const updateRadialPositions = () => {
    const rect = wrapper.getBoundingClientRect();
    const horizontalSign = rect.left < 76 ? 1 : -1;
    const verticalSign = rect.top < 76 ? 1 : -1;

    closeButton.style.setProperty('--close-x', `${closePosition[0] * horizontalSign}px`);
    closeButton.style.setProperty('--close-y', `${closePosition[1] * verticalSign}px`);

    actionButtons.forEach((button, provider) => {
      const [baseX, baseY] = radialPositions[provider];
      button.style.setProperty('--x', `${baseX * horizontalSign}px`);
      button.style.setProperty('--y', `${baseY * verticalSign}px`);
    });
  };

  (Object.keys(providerLabels) as AgentProvider[]).forEach((provider) => {
    const button = document.createElement('button');
    button.className = 'visor-action';
    button.type = 'button';
    button.title = `Dump current page context to ${providerLabels[provider]}`;
    button.setAttribute('aria-label', `Dump current page context to ${providerLabels[provider]}`);
    button.style.setProperty('--x', `${radialPositions[provider][0]}px`);
    button.style.setProperty('--y', `${radialPositions[provider][1]}px`);
    actionButtons.set(provider, button);

    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL(providerLogoFiles[provider]);
    icon.alt = '';
    button.appendChild(icon);

    button.addEventListener('click', async (event) => {
      event.stopPropagation();
      state.exporting = provider;
      render();

      const response = await sendExport(provider, {
        mode: state.mode,
        privacyLevel: state.privacyLevel,
        tokenBudget: state.tokenBudget
      });

      state.exporting = undefined;
      button.title = response.ok ? `Opened ${providerLabels[provider]}` : response.userMessage || 'Export failed';
      render();
    });
    actions.appendChild(button);
  });

  function render() {
    updateRadialPositions();
    wrapper.classList.toggle('open', state.open);
    actions.querySelectorAll<HTMLButtonElement>('.visor-action').forEach((button) => {
      button.disabled = Boolean(state.exporting);
    });
  }

  const applySavedPosition = async () => {
    const position = await getSessionValue<{ left?: number; top?: number }>('visorWidgetPosition');
    if (typeof position?.left !== 'number' || typeof position?.top !== 'number') return;

    const left = Math.min(Math.max(8, position.left), Math.max(8, window.innerWidth - 54));
    const top = Math.min(Math.max(8, position.top), Math.max(8, window.innerHeight - 54));
    wrapper.style.left = `${left}px`;
    wrapper.style.top = `${top}px`;
    wrapper.style.right = 'auto';
    wrapper.style.bottom = 'auto';
    updateRadialPositions();
  };

  let dragTimer: number | undefined;
  let dragging = false;
  let suppressClick = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  const stopDrag = async () => {
    if (dragTimer) {
      window.clearTimeout(dragTimer);
      dragTimer = undefined;
    }

    if (!dragging) return;
    dragging = false;
    wrapper.classList.remove('dragging');
    const rect = wrapper.getBoundingClientRect();
    await setSessionValue('visorWidgetPosition', { left: rect.left, top: rect.top });
  };

  mainButton.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    const rect = wrapper.getBoundingClientRect();
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;
    dragTimer = window.setTimeout(() => {
      dragging = true;
      suppressClick = true;
      state.open = false;
      wrapper.classList.add('dragging');
      render();
      mainButton.setPointerCapture(event.pointerId);
    }, 260);
  });

  mainButton.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const nextLeft = Math.min(Math.max(8, event.clientX - dragOffsetX), Math.max(8, window.innerWidth - wrapper.offsetWidth - 8));
    const nextTop = Math.min(Math.max(8, event.clientY - dragOffsetY), Math.max(8, window.innerHeight - wrapper.offsetHeight - 8));
    wrapper.style.left = `${nextLeft}px`;
    wrapper.style.top = `${nextTop}px`;
    wrapper.style.right = 'auto';
    wrapper.style.bottom = 'auto';
    updateRadialPositions();
  });

  mainButton.addEventListener('pointerup', () => {
    void stopDrag();
  });

  mainButton.addEventListener('pointercancel', () => {
    void stopDrag();
  });

  mainButton.addEventListener('click', (event) => {
    event.stopPropagation();
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    state.open = !state.open;
    render();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.open) {
      state.open = false;
      render();
    }
  });

  shadow.append(createStyle(), wrapper);
  wrapper.append(actions, closeButton, mainButton);
  render();
  void applySavedPosition();

  const appendWidget = () => {
    if (!document.body.contains(host)) {
      document.body.appendChild(host);
    }
  };

  if (document.body) {
    appendWidget();
  } else {
    window.addEventListener('DOMContentLoaded', appendWidget, { once: true });
  }
}
