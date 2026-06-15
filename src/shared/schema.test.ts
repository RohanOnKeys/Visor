import { describe, it, expect } from 'vitest';
import { AuthSessionSchema, PageSnapshotSchema, UserSettingsSchema } from './schema';

describe('Zod Schema Validation', () => {
  it('should validate a valid UserSettings structure', () => {
    const validSettings = {
      defaultMode: 'compact',
      privacyLevel: 'medium',
      tokenBudget: 4000,
      defaultExport: 'json',
      debugMode: false,
      autoCompile: true,
      blockedDomains: ['test.com']
    };

    const parsed = UserSettingsSchema.safeParse(validSettings);
    expect(parsed.success).toBe(true);
  });

  it('should reject invalid UserSettings structure', () => {
    const invalidSettings = {
      defaultMode: 'non_existent_mode',
      privacyLevel: 'medium',
      tokenBudget: 50 // below min 100
    };

    const parsed = UserSettingsSchema.safeParse(invalidSettings);
    expect(parsed.success).toBe(false);
  });

  it('should validate a mock PageSnapshot', () => {
    const mockSnapshot = {
      schemaVersion: 'page_snapshot.v1',
      source: {
        url: 'https://example.com/test',
        title: 'Test Title',
        capturedAt: new Date().toISOString()
      },
      metadata: { key: 'value' },
      headings: [],
      textBlocks: [],
      links: [],
      actions: [],
      layoutGroups: [],
      forms: [],
      tables: [],
      media: [],
      stats: {
        totalNodes: 10,
        extractedNodes: 1,
        ignoredNodes: 9,
        timeElapsedMs: 1.5
      },
      warnings: []
    };

    const parsed = PageSnapshotSchema.safeParse(mockSnapshot);
    expect(parsed.success).toBe(true);
  });

  it('should validate a Google auth session', () => {
    const parsed = AuthSessionSchema.safeParse({
      user: {
        id: 'google-subject-id',
        email: 'user@example.com',
        name: 'Visor User',
        pictureUrl: 'https://example.com/avatar.png',
        provider: 'google'
      },
      accessToken: 'token',
      signedInAt: new Date().toISOString()
    });

    expect(parsed.success).toBe(true);
  });
});
