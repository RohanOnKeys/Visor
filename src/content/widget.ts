import { AgentProvider, CompileRequest, UserSettings } from '../shared/types';
import { resolveAgentProvider } from './agentExport';

const providerLabels: Record<AgentProvider, string> = {
  chatgpt: 'GPT',
  grok: 'Grok',
  gemini: 'Gemini',
  claude: 'Claude'
};

const modes: CompileRequest['mode'][] = ['compact', 'detailed', 'agent_action', 'rag', 'debug'];
const privacyLevels: CompileRequest['privacyLevel'][] = ['low', 'medium', 'strict'];
const tokenBudgets = [2000, 4000, 8000, 12000];

type WidgetState = {
  open: boolean;
  exporting?: AgentProvider;
  mode: CompileRequest['mode'];
  privacyLevel: CompileRequest['privacyLevel'];
  tokenBudget: number;
  status: string;
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

function getNext<T>(items: T[], current: T): T {
  const index = items.indexOf(current);
  return items[(index + 1) % items.length];
}

function createStyle(): HTMLStyleElement {
  const style = document.createElement('style');
  style.textContent = `
    :host {
      all: initial;
      color-scheme: dark;
      --visor-green: #1ed760;
      --visor-green-deep: #0e7a3a;
      --visor-black: #030706;
      --visor-panel: rgba(5, 12, 10, 0.92);
      --visor-border: rgba(30, 215, 96, 0.38);
      --visor-text: #ecfff4;
      --visor-muted: #8fb59e;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .visor-widget {
      position: fixed;
      right: 22px;
      bottom: 24px;
      width: 64px;
      height: 64px;
      z-index: 2147483647;
      pointer-events: auto;
    }

    .visor-main {
      position: absolute;
      inset: 0;
      border: 1px solid var(--visor-border);
      border-radius: 999px;
      background: radial-gradient(circle at 35% 28%, rgba(30, 215, 96, 0.24), rgba(0, 0, 0, 0.95) 62%);
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.52), 0 0 0 1px rgba(30, 215, 96, 0.16), 0 0 28px rgba(30, 215, 96, 0.22);
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
    }

    .visor-main:hover {
      transform: translateY(-2px) scale(1.03);
      border-color: rgba(30, 215, 96, 0.78);
      box-shadow: 0 20px 52px rgba(0, 0, 0, 0.56), 0 0 34px rgba(30, 215, 96, 0.32);
    }

    .visor-main img {
      width: 48px;
      height: 48px;
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
      position: absolute;
      width: 54px;
      height: 54px;
      left: 5px;
      top: 5px;
      border: 1px solid var(--visor-border);
      border-radius: 999px;
      background: linear-gradient(145deg, rgba(7, 20, 15, 0.98), rgba(0, 0, 0, 0.94));
      color: var(--visor-text);
      font: 700 11px/1 Inter, ui-sans-serif, system-ui, sans-serif;
      cursor: pointer;
      box-shadow: 0 12px 34px rgba(0, 0, 0, 0.48), 0 0 18px rgba(30, 215, 96, 0.16);
      transform: translate(0, 0) scale(0.72);
      transition: transform 180ms ease, border-color 160ms ease, background 160ms ease;
    }

    .visor-widget.open .visor-action {
      transform: translate(var(--x), var(--y)) scale(1);
    }

    .visor-action:hover {
      border-color: rgba(30, 215, 96, 0.95);
      background: linear-gradient(145deg, rgba(30, 215, 96, 0.24), rgba(0, 0, 0, 0.95));
    }

    .visor-action[disabled] {
      cursor: wait;
      opacity: 0.72;
    }

    .visor-settings {
      position: absolute;
      right: 0;
      bottom: 78px;
      width: 188px;
      padding: 10px;
      border: 1px solid var(--visor-border);
      border-radius: 14px;
      background: var(--visor-panel);
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55);
      opacity: 0;
      transform: translateY(8px);
      pointer-events: none;
      transition: opacity 140ms ease, transform 140ms ease;
    }

    .visor-widget.open .visor-settings {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .visor-title {
      color: var(--visor-green);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 7px;
    }

    .visor-row {
      display: grid;
      grid-template-columns: 52px 1fr;
      gap: 6px;
      align-items: center;
      margin-top: 6px;
    }

    .visor-label {
      color: var(--visor-muted);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .visor-chip {
      min-width: 0;
      border: 1px solid rgba(30, 215, 96, 0.26);
      border-radius: 999px;
      background: rgba(30, 215, 96, 0.08);
      color: var(--visor-text);
      padding: 6px 8px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .visor-status {
      margin-top: 8px;
      min-height: 14px;
      color: var(--visor-muted);
      font-size: 10px;
      line-height: 1.35;
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
    tokenBudget: savedSettings.tokenBudget || 4000,
    status: 'Ready'
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
    chatgpt: [-66, -12],
    grok: [-52, -76],
    gemini: [12, -108],
    claude: [76, -76]
  };

  (Object.keys(providerLabels) as AgentProvider[]).forEach((provider) => {
    const button = document.createElement('button');
    button.className = 'visor-action';
    button.type = 'button';
    button.textContent = providerLabels[provider];
    button.title = `Dump current page context to ${providerLabels[provider]}`;
    button.setAttribute('aria-label', `Dump current page context to ${providerLabels[provider]}`);
    button.style.setProperty('--x', `${radialPositions[provider][0]}px`);
    button.style.setProperty('--y', `${radialPositions[provider][1]}px`);
    button.addEventListener('click', async (event) => {
      event.stopPropagation();
      state.exporting = provider;
      state.status = `Exporting to ${providerLabels[provider]}...`;
      render();

      const response = await sendExport(provider, {
        mode: state.mode,
        privacyLevel: state.privacyLevel,
        tokenBudget: state.tokenBudget
      });

      state.exporting = undefined;
      state.status = response.ok ? `Opened ${providerLabels[provider]}` : response.userMessage || 'Export failed';
      render();
    });
    actions.appendChild(button);
  });

  const panel = document.createElement('div');
  panel.className = 'visor-settings';

  function renderPanel() {
    panel.innerHTML = '';

    const title = document.createElement('div');
    title.className = 'visor-title';
    title.textContent = 'Direct dump settings';
    panel.appendChild(title);

    const rows: Array<[string, string, () => void]> = [
      ['Mode', state.mode.replace('_', ' '), () => { state.mode = getNext(modes, state.mode); }],
      ['Privacy', state.privacyLevel, () => { state.privacyLevel = getNext(privacyLevels, state.privacyLevel); }],
      ['Budget', `${state.tokenBudget}`, () => { state.tokenBudget = getNext(tokenBudgets, state.tokenBudget); }]
    ];

    rows.forEach(([label, value, onClick]) => {
      const row = document.createElement('div');
      row.className = 'visor-row';
      const rowLabel = document.createElement('div');
      rowLabel.className = 'visor-label';
      rowLabel.textContent = label;
      const chip = document.createElement('button');
      chip.className = 'visor-chip';
      chip.type = 'button';
      chip.textContent = value;
      chip.addEventListener('click', () => {
        onClick();
        render();
      });
      row.append(rowLabel, chip);
      panel.appendChild(row);
    });

    const status = document.createElement('div');
    status.className = 'visor-status';
    status.textContent = state.status;
    panel.appendChild(status);
  }

  function render() {
    wrapper.classList.toggle('open', state.open);
    actions.querySelectorAll<HTMLButtonElement>('.visor-action').forEach((button) => {
      button.disabled = Boolean(state.exporting);
    });
    renderPanel();
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
  wrapper.append(actions, panel, mainButton);
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
