import { describe, it, expect } from 'vitest';
import { applyRedaction } from './redactor';
import { ContentBlock } from '../shared/types';

describe('Privacy Redactor Engine', () => {
  const createMockBlocks = (text: string): ContentBlock[] => [
    {
      id: 'block-1',
      kind: 'paragraph',
      text,
      headingPath: [],
      importanceScore: 5.0,
      tokenEstimate: 20,
      sourceOrder: 1
    }
  ];

  it('should redact JWT-like tokens and API keys at all privacy levels', () => {
    const rawText = 'Admin key sk-proj-123456789012345678901234567890123456789012345678 and token eyJhbGciOiJIUzI1NiJ9.x.y';
    const blocks = createMockBlocks(rawText);

    // Test Low Privacy
    const resultLow = applyRedaction(blocks, 'low');
    expect(resultLow.redactedBlocks[0].text).not.toContain('sk-proj-123456789012345678901234567890123456789012345678');
    expect(resultLow.redactedBlocks[0].text).not.toContain('eyJhbGciOiJIUzI1NiJ9.x.y');
    expect(resultLow.redactedBlocks[0].text).toContain('[REDACTED_API_KEY]');
    expect(resultLow.redactedBlocks[0].text).toContain('[REDACTED_JWT]');

    // Validate RedactedItem report metadata
    expect(resultLow.privacyReport.redactedItems).toContainEqual(
      expect.objectContaining({ type: 'api_key' })
    );
    expect(resultLow.privacyReport.redactedItems).toContainEqual(
      expect.objectContaining({ type: 'jwt' })
    );
  });

  it('should redact emails at medium privacy level but NOT at low level', () => {
    const rawText = 'Contact rohan@example.com';
    const blocks = createMockBlocks(rawText);

    // Low Level - email should remain untouched
    const resultLow = applyRedaction(blocks, 'low');
    expect(resultLow.redactedBlocks[0].text).toContain('rohan@example.com');

    // Medium Level - email should be redacted
    const resultMed = applyRedaction(blocks, 'medium');
    expect(resultMed.redactedBlocks[0].text).not.toContain('rohan@example.com');
    expect(resultMed.redactedBlocks[0].text).toContain('[REDACTED_EMAIL]');
  });

  it('should redact phone numbers at strict privacy level but NOT at medium level', () => {
    const rawText = 'Call me at 555-123-4567';
    const blocks = createMockBlocks(rawText);

    // Medium Level - phone should remain untouched
    const resultMed = applyRedaction(blocks, 'medium');
    expect(resultMed.redactedBlocks[0].text).toContain('555-123-4567');

    // Strict Level - phone should be redacted
    const resultStrict = applyRedaction(blocks, 'strict');
    expect(resultStrict.redactedBlocks[0].text).not.toContain('555-123-4567');
    expect(resultStrict.redactedBlocks[0].text).toContain('[REDACTED_PHONE]');
  });

  it('should use source URL and title for page risk warnings', () => {
    const result = applyRedaction(createMockBlocks('Welcome back to your account.'), 'medium', {
      url: 'https://bank.example.com/dashboard',
      title: 'Account Dashboard'
    });

    expect(result.privacyReport.riskLevel).toBe('high');
    expect(result.privacyReport.externalSharingAllowed).toBe(false);
    expect(result.privacyReport.warnings.some((warning) => warning.includes('Financial'))).toBe(true);
  });
});
