import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compileSnapshot } from '../compiler/compiler';
import { AgentContextSchema, PageSnapshotSchema } from '../shared/schema';
import { fixtureSnapshots } from './fixtureSnapshots';
import { CompileRequest } from '../shared/types';

const defaultRequest: CompileRequest = {
  mode: 'detailed',
  privacyLevel: 'medium',
  tokenBudget: 4000
};

function compileFixture(name: keyof typeof fixtureSnapshots, request: Partial<CompileRequest> = {}) {
  return compileSnapshot(fixtureSnapshots[name], {
    ...defaultRequest,
    ...request
  });
}

describe('Acceptance fixtures', () => {
  it('validates every PageSnapshot fixture and compiled AgentContext output', () => {
    Object.values(fixtureSnapshots).forEach((snapshot) => {
      expect(PageSnapshotSchema.safeParse(snapshot).success).toBe(true);

      const result = compileSnapshot(snapshot, defaultRequest);
      expect(AgentContextSchema.safeParse(result.context).success).toBe(true);
      expect(() => JSON.parse(result.exports.json)).not.toThrow();
      expect(result.exports.markdown.length).toBeGreaterThan(0);
      expect(result.exports.promptBlock).toContain('Source URL:');
      expect(result.context.tokenProfile.compiledEstimatedTokens).toBeGreaterThanOrEqual(0);
    });
  });

  it('captures core semantic structures across representative fixtures', () => {
    expect(compileFixture('article').context.links.length).toBeGreaterThan(0);
    expect(compileFixture('docs').context.mainContent.some((block) => block.kind === 'code')).toBe(true);
    expect(compileFixture('product').context.actionableElements.some((action) => action.label === 'Buy Now')).toBe(true);
    expect(compileFixture('formHeavy').context.forms[0].fields.length).toBeGreaterThanOrEqual(3);
    expect(compileFixture('tableHeavy').context.tables[0].rows.length).toBeGreaterThan(10);
  });

  it('preserves Wikipedia semantic regions as article-ready context', () => {
    const result = compileFixture('wikipediaArticle');

    expect(result.context.pageClassification.type).toBe('article');
    expect(result.context.layoutGroups.some((group) => group.role === 'lead')).toBe(true);
    expect(result.context.layoutGroups.some((group) => group.role === 'toc')).toBe(true);
    expect(result.context.layoutGroups.some((group) => group.role === 'infobox')).toBe(true);
    expect(result.context.layoutGroups.some((group) => group.role === 'references')).toBe(true);
    expect(result.context.dataElements.some((element) => element.label.startsWith('infobox.'))).toBe(true);
    expect(result.context.media.length).toBeGreaterThan(0);
    expect(result.exports.markdown).toContain('Semantic Regions');
  });

  it('redacts secret fixture values in strict mode', () => {
    const result = compileFixture('secrets', {
      privacyLevel: 'strict'
    });

    expect(result.exports.json).not.toContain('rohan@example.com');
    expect(result.exports.json).not.toContain('555-123-4567');
    expect(result.exports.json).not.toContain('eyJhbGciOiJIUzI1NiJ9.x.y');
    expect(result.exports.json).not.toContain('sk-proj-123456789012345678901234567890123456789012345678');
    expect(result.context.privacyReport.riskLevel).toBe('high');
    expect(result.context.privacyReport.externalSharingAllowed).toBe(false);
  });

  it('omits password values from form-heavy fixture output', () => {
    const result = compileFixture('formHeavy', {
      privacyLevel: 'strict'
    });

    expect(result.exports.json).not.toContain('fixture-password-value');
    expect(result.context.forms[0].fields.find((field) => field.type === 'password')?.value).toBeUndefined();
  });

  it('keeps noisy blocks only in debug mode', () => {
    const detailed = compileFixture('noisyBlog', { mode: 'detailed' });
    const debug = compileFixture('noisyBlog', { mode: 'debug' });

    expect(detailed.context.mainContent.map((block) => block.id)).not.toContain('noisy-cookie');
    expect(debug.context.mainContent.map((block) => block.id)).toContain('noisy-cookie');
    expect(debug.context.compilerNotes.some((note) => note.message.includes('Debug mode retained'))).toBe(true);
  });

  it('trims large fixture output under compact token pressure', () => {
    const result = compileFixture('largePage', {
      mode: 'compact',
      tokenBudget: 500
    });

    expect(result.context.tokenProfile.budgetStatus).toBe('over_budget_trimmed');
    expect(result.context.tokenProfile.compiledEstimatedTokens).toBeLessThanOrEqual(500);
    expect(fixtureSnapshots.largePage.warnings.some((warning) => warning.type === 'node_limit')).toBe(true);
  });

  it('is deterministic for the same snapshot and settings', () => {
    const first = compileFixture('article');
    const second = compileFixture('article');

    expect(first.exports.json).toEqual(second.exports.json);
  });
});

describe('Acceptance guardrails', () => {
  it('keeps extension permissions minimal', () => {
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), 'manifest.json'), 'utf8'));

    expect(manifest.manifest_version).toBe(3);
    expect(manifest.permissions).toEqual(['activeTab', 'scripting', 'storage', 'identity', 'tabs']);
    expect(manifest.host_permissions).toEqual(['https://www.googleapis.com/*']);
    expect(manifest.oauth2.scopes).toEqual(['openid', 'email', 'profile']);
  });

  it('does not import external CSS assets in the extension UI', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');

    expect(css).not.toContain('@import url(');
    expect(css).not.toContain('http://');
    expect(css).not.toContain('https://');
  });

  it('uses React text rendering rather than raw HTML injection in UI files', () => {
    const uiFiles = ['src/popup/index.tsx', 'src/options/index.tsx', 'src/preview/index.tsx'];

    uiFiles.forEach((file) => {
      const source = readFileSync(resolve(process.cwd(), file), 'utf8');
      expect(source).not.toContain('dangerouslySetInnerHTML');
      expect(source).not.toContain('innerHTML');
    });
  });
});
