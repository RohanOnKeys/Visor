import { describe, expect, it } from 'vitest';
import { isPendingAgentExportFresh, resolveAgentProvider } from './agentExport';
import { PendingAgentExport } from '../shared/types';

function pending(createdAt: string): PendingAgentExport {
  return {
    provider: 'chatgpt',
    text: 'agent context',
    createdAt
  };
}

describe('agent export injection helpers', () => {
  it('matches supported agent provider hosts', () => {
    expect(resolveAgentProvider('chatgpt.com')).toBe('chatgpt');
    expect(resolveAgentProvider('chat.openai.com')).toBe('chatgpt');
    expect(resolveAgentProvider('gemini.google.com')).toBe('gemini');
    expect(resolveAgentProvider('claude.ai')).toBe('claude');
    expect(resolveAgentProvider('grok.com')).toBe('grok');
    expect(resolveAgentProvider('example.com')).toBeUndefined();
  });

  it('expires pending exports after the short handoff window', () => {
    const now = Date.parse('2026-06-14T10:00:00.000Z');

    expect(isPendingAgentExportFresh(pending('2026-06-14T09:56:00.000Z'), now)).toBe(true);
    expect(isPendingAgentExportFresh(pending('2026-06-14T09:54:59.000Z'), now)).toBe(false);
    expect(isPendingAgentExportFresh(pending('not-a-date'), now)).toBe(false);
  });
});
