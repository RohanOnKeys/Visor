import { describe, expect, it } from 'vitest';
import { compileSnapshot } from './compiler';
import { PageSnapshot } from '../shared/types';

function createSnapshot(overrides: Partial<PageSnapshot> = {}): PageSnapshot {
  const longText = Array.from({ length: 80 }, (_, index) => `RAG paragraph sentence ${index} with useful article context.`).join(' ');

  return {
    schemaVersion: 'page_snapshot.v1',
    source: {
      url: 'https://example.com/docs',
      title: 'Compiler Fixture',
      capturedAt: '2026-06-14T10:00:00.000Z',
      language: 'en'
    },
    metadata: {},
    headings: [
      {
        id: 'heading-1',
        text: 'Main Documentation',
        level: 1,
        selectorHint: 'main > h1',
        sourceOrder: 1
      }
    ],
    textBlocks: [
      {
        id: 'text-1',
        text: longText,
        selectorHint: 'main > article > p',
        sourceOrder: 2,
        parentHeadingId: 'heading-1'
      },
      {
        id: 'text-duplicate',
        text: longText,
        selectorHint: 'main > article > p:nth-child(2)',
        sourceOrder: 3,
        parentHeadingId: 'heading-1'
      },
      {
        id: 'noise-1',
        text: 'Subscribe to our newsletter and accept this cookie banner.',
        selectorHint: 'div.cookie-consent-banner > p',
        sourceOrder: 4
      }
    ],
    links: [],
    actions: [],
    layoutGroups: [],
    forms: [],
    tables: [],
    media: [],
    stats: {
      totalNodes: 10,
      extractedNodes: 4,
      ignoredNodes: 6,
      timeElapsedMs: 4
    },
    warnings: [],
    ...overrides
  };
}

describe('Compiler modes', () => {
  it('emits stable chunked content in RAG mode', () => {
    const result = compileSnapshot(createSnapshot(), {
      mode: 'rag',
      privacyLevel: 'medium',
      tokenBudget: 4000
    });

    expect(result.context.mainContent.length).toBeGreaterThan(1);
    expect(result.context.mainContent.every((block) => block.id.includes('-chunk-'))).toBe(true);
    expect(result.context.mainContent[0].headingPath).toEqual(['Main Documentation']);
    expect(result.context.compilerNotes.some((note) => note.message.includes('RAG mode emitted'))).toBe(true);
  });

  it('retains duplicate and noisy blocks in debug mode', () => {
    const result = compileSnapshot(createSnapshot(), {
      mode: 'debug',
      privacyLevel: 'medium',
      tokenBudget: 1
    });

    const blockIds = result.context.mainContent.map((block) => block.id);

    expect(blockIds).toContain('text-duplicate');
    expect(blockIds).toContain('noise-1');
    expect(result.context.compilerNotes.some((note) => note.message.includes('Debug mode retained duplicate blocks'))).toBe(true);
    expect(result.context.compilerNotes.some((note) => note.message.includes('expanded the effective budget'))).toBe(true);
  });

  it('redacts and reports sensitive values in structured fields', () => {
    const result = compileSnapshot(createSnapshot({
      links: [
        {
          id: 'link-secret',
          text: 'Email rohan@example.com',
          href: 'https://example.com/contact?email=rohan@example.com',
          selectorHint: 'main > a',
          sourceOrder: 5
        }
      ],
      forms: [
        {
          id: 'form-secret',
          selectorHint: 'form#signup',
          fields: [
            {
              id: 'field-email',
              name: 'email',
              type: 'email',
              label: 'Email',
              value: 'rohan@example.com'
            },
            {
              id: 'field-password',
              name: 'password',
              type: 'password',
              label: 'Password',
              value: 'never-output-this'
            }
          ],
          submitControls: [],
          sourceOrder: 6
        }
      ],
      tables: [
        {
          id: 'table-secret',
          headers: ['Owner', 'Phone'],
          rows: [['Rohan', '555-123-4567']],
          selectorHint: 'table',
          sourceOrder: 7
        }
      ]
    }), {
      mode: 'detailed',
      privacyLevel: 'strict',
      tokenBudget: 4000
    });

    const output = result.exports.json;

    expect(output).not.toContain('rohan@example.com');
    expect(output).not.toContain('555-123-4567');
    expect(output).not.toContain('never-output-this');
    expect(result.context.privacyReport.redactedItems).toContainEqual(
      expect.objectContaining({ type: 'email' })
    );
    expect(result.context.privacyReport.redactedItems).toContainEqual(
      expect.objectContaining({ type: 'phone' })
    );
    expect(result.context.privacyReport.warnings.some((warning) => warning.includes('Structured fields'))).toBe(true);
  });
});
