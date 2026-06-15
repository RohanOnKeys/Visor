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

  it('shapes structured arrays differently for RAG and Agent Mode', () => {
    const structuredSnapshot = createSnapshot({
      actions: [
        {
          id: 'action-submit',
          type: 'button',
          label: 'Continue checkout',
          selectorHint: 'button.checkout',
          textContext: 'Continue checkout',
          sourceOrder: 5
        }
      ],
      forms: [
        {
          id: 'form-checkout',
          selectorHint: 'form.checkout',
          purpose: 'checkout',
          fields: [],
          submitControls: [],
          sourceOrder: 6
        }
      ],
      links: Array.from({ length: 3 }, (_, index) => ({
        id: `link-${index}`,
        text: `Reference ${index}`,
        href: `https://example.com/${index}`,
        selectorHint: `main a:nth-child(${index + 1})`,
        sourceOrder: 7 + index
      })),
      layoutGroups: [
        {
          id: 'group-lead',
          label: 'Lead',
          role: 'lead',
          text: 'Important overview with no controls.',
          selectorHint: 'main',
          sourceOrder: 10,
          childActionIds: [],
          childMediaIds: []
        },
        {
          id: 'group-action',
          label: 'Checkout',
          role: 'card',
          text: 'Continue checkout and submit payment.',
          selectorHint: '.checkout-card',
          sourceOrder: 11,
          childActionIds: ['action-submit'],
          childMediaIds: []
        }
      ],
      media: [
        {
          id: 'media-hero',
          type: 'image',
          alt: 'Product hero',
          src: 'https://example.com/hero.png',
          selectorHint: 'img.hero',
          sourceOrder: 12
        }
      ]
    });

    const rag = compileSnapshot(structuredSnapshot, {
      mode: 'rag',
      privacyLevel: 'medium',
      tokenBudget: 4000
    });
    const agent = compileSnapshot(structuredSnapshot, {
      mode: 'agent_action',
      privacyLevel: 'medium',
      tokenBudget: 4000
    });

    expect(rag.context.actionableElements).toHaveLength(0);
    expect(rag.context.forms).toHaveLength(0);
    expect(rag.context.layoutGroups.map((group) => group.id)).toContain('group-lead');
    expect(rag.context.layoutGroups.map((group) => group.id)).not.toContain('group-action');
    expect(agent.context.actionableElements).toHaveLength(1);
    expect(agent.context.forms).toHaveLength(1);
    expect(agent.context.layoutGroups.map((group) => group.id)).toContain('group-action');
    expect(agent.context.compilerNotes.some((note) => note.message.includes('Agent Mode prioritized controls'))).toBe(true);
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
