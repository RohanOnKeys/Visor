import { extractPageSnapshot } from './extractor';
import { injectPendingAgentExport } from './agentExport';
import { mountVisorWidget } from './widget';

void injectPendingAgentExport();
void mountVisorWidget();

// Listen for the extraction message from the service worker
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'VISOR_EXTRACT_DOM') {
    try {
      const settings = message.payload.settings;
      const snapshot = extractPageSnapshot(settings);
      
      sendResponse({ ok: true, snapshot });
    } catch (error: any) {
      console.error('Visor content script extraction failed:', error);
      sendResponse({ ok: false, error: error.message || error });
    }
  }
  return true; // Return true for asynchronous response support
});

console.log('Visor Content Script Active');
