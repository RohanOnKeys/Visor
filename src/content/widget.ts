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
    .visor-action {
      position: absolute;
      border: 1px solid var(--visor-border);
      border-radius: 999px;
      padding: 0;
      overflow: hidden;
      cursor: pointer;
      display: grid;
      place-items: center;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.32), 0 0 18px rgba(30, 215, 96, 0.14);
      transition: transform 180ms ease, border-color 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
    }

    .visor-main {
      inset: 0;
      border-color: transparent;
      background: transparent;
      box-shadow: none;
    }

    .visor-main:hover,
    .visor-action:hover {
      border-color: rgba(30, 215, 96, 0.88);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.36), 0 0 22px rgba(30, 215, 96, 0.22);
    }

    .visor-main img {
      width: 42px;
      height: 42px;
      border-radius: 999px;
      object-fit: cover;
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
      width: 38px;
      height: 38px;
      left: 4px;
      top: 4px;
      background: rgba(4, 10, 8, 0.56);
      backdrop-filter: blur(8px);
      transform: translate(0, 0) scale(0.72);
    }

    .visor-widget.open .visor-action {
      transform: translate(var(--x), var(--y)) scale(1);
    }

    .visor-action img {
      width: 100%;
      height: 100%;
      display: block;
      border-radius: 999px;
      object-fit: cover;
      pointer-events: none;
    }

    .visor-action[disabled] {
      cursor: wait;
      opacity: 0.62;
    }
  `;
  return style;
}

export async function mountVisorWidget(): Promise<void> {
  if (!shouldMountWidget()) return;
  document.documentElement.dataset.visorWidgetMounted = 'true';

  const settings = await chrome.storage.local.get(['settings']);
  const savedSettings = (settings.settings || {}) as Partial<UserSettings>;
  const state: WidgetState = {
    open: false,
    mode: savedSettings.defaultMode || 'agent_action',
    privacyLevel: savedSettings.privacyLevel || 'medium',
    tokenBudget: savedSettings.tokenBudget || 4000
  };

  const host = document.createElement('div');
  host.id = 'visor-floating-widget-root';
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

  const radialPositions: Record<AgentProvider, [number, number]> = {
    chatgpt: [-46, -4],
    grok: [-38, -46],
    gemini: [2, -66],
    claude: [42, -46]
  };

  (Object.keys(providerLabels) as AgentProvider[]).forEach((provider) => {
    const button = document.createElement('button');
    button.className = 'visor-action';
    button.type = 'button';
    button.title = `Dump current page context to ${providerLabels[provider]}`;
    button.setAttribute('aria-label', `Dump current page context to ${providerLabels[provider]}`);
    button.style.setProperty('--x', `${radialPositions[provider][0]}px`);
    button.style.setProperty('--y', `${radialPositions[provider][1]}px`);

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
    wrapper.classList.toggle('open', state.open);
    actions.querySelectorAll<HTMLButtonElement>('.visor-action').forEach((button) => {
      button.disabled = Boolean(state.exporting);
    });
  }

  mainButton.addEventListener('click', (event) => {
    event.stopPropagation();
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
  wrapper.append(actions, mainButton);
  render();

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
