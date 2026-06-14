import { PrivacyReport, ContentBlock, RedactedItem } from '../shared/types';
import { analyzePageRisk } from './threatRules';

// Define regular expressions for sensitive patterns
const PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(?:\b\+?[1-9]\d{0,2}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  jwt: /\beyJ[a-zA-Z0-9-_=]+\.[a-zA-Z0-9-_=]+\.[a-zA-Z0-9-_=]+\b/g,
  apiKey: /\b(sk-[a-zA-Z0-9]{48}|sk-proj-[a-zA-Z0-9_-]{32,}|AIzaSy[a-zA-Z0-9_-]{33})\b/g
};

type PrivacyLevel = 'low' | 'medium' | 'strict';

export function redactPlainText(text: string | undefined, privacyLevel: 'low' | 'medium' | 'strict'): string | undefined {
  return redactPlainTextWithReport(text, privacyLevel, 'unknown').text;
}

export function redactPlainTextWithReport(
  text: string | undefined,
  privacyLevel: PrivacyLevel,
  location: string
): {
  text: string | undefined;
  redactedItems: RedactedItem[];
} {
  if (text === undefined) {
    return { text: undefined, redactedItems: [] };
  }

  const redactedItemMap = new Map<RedactedItem['type'], number>();

  function record(type: RedactedItem['type'], count: number) {
    redactedItemMap.set(type, (redactedItemMap.get(type) || 0) + count);
  }

  function replacePattern(value: string, pattern: RegExp, replacement: string, type: RedactedItem['type']): string {
    const matches = value.match(pattern);
    if (!matches) return value;

    record(type, matches.length);
    return value.replace(pattern, replacement);
  }

  let redacted = replacePattern(text, PATTERNS.jwt, '[REDACTED_JWT]', 'jwt');
  redacted = replacePattern(redacted, PATTERNS.apiKey, '[REDACTED_API_KEY]', 'api_key');

  if (privacyLevel === 'medium' || privacyLevel === 'strict') {
    redacted = replacePattern(redacted, PATTERNS.email, '[REDACTED_EMAIL]', 'email');
  }

  if (privacyLevel === 'strict') {
    redacted = replacePattern(redacted, PATTERNS.phone, '[REDACTED_PHONE]', 'phone');
  }

  return {
    text: redacted,
    redactedItems: Array.from(redactedItemMap.entries()).map(([type, count]) => ({
      type,
      count,
      locations: [location]
    }))
  };
}

export function applyRedaction(
  blocks: ContentBlock[],
  privacyLevel: PrivacyLevel,
  source?: { url?: string; title?: string }
): {
  redactedBlocks: ContentBlock[];
  privacyReport: PrivacyReport;
} {
  const redactedBlocks: ContentBlock[] = [];
  const redactedItemMap = new Map<RedactedItem['type'], { count: number; locations: Set<string> }>();

  // Helper to record a redaction event
  function recordRedaction(type: RedactedItem['type'], blockId: string, count: number = 1) {
    if (!redactedItemMap.has(type)) {
      redactedItemMap.set(type, { count: 0, locations: new Set() });
    }
    const item = redactedItemMap.get(type)!;
    item.count += count;
    item.locations.add(blockId);
  }

  // Iterate over all content blocks and redact text matching the chosen level
  for (const block of blocks) {
    const result = redactPlainTextWithReport(block.text, privacyLevel, block.id);
    result.redactedItems.forEach((item) => recordRedaction(item.type, block.id, item.count));

    redactedBlocks.push({
      ...block,
      text: result.text || ''
    });
  }

  // Convert map to final output array
  const redactedItems: RedactedItem[] = [];
  redactedItemMap.forEach((val, key) => {
    redactedItems.push({
      type: key,
      count: val.count,
      locations: Array.from(val.locations)
    });
  });

  // Calculate high-level warning indicators using threat heuristics
  // Sample snippet of first 2000 characters for page analysis
  const pageSnippet = blocks
    .filter((b) => b.kind !== 'heading')
    .slice(0, 10)
    .map((b) => b.text)
    .join(' ')
    .slice(0, 2000);

  // Take source details from first block heading path or default
  const title = source?.title || blocks.find((b) => b.kind === 'heading')?.text || 'Active Page';

  const textThreat = analyzePageRisk(source?.url || '', title, pageSnippet);

  // Set final risk level. If there are redacted items, elevate risk level automatically
  let riskLevel = textThreat.riskLevel;
  if (redactedItems.length > 0) {
    riskLevel = 'high';
    textThreat.warnings.push(`Extracted text contained sensitive credentials or personal records which were redacted (level: ${privacyLevel}).`);
  }

  const privacyReport: PrivacyReport = {
    riskLevel,
    redactionLevel: privacyLevel,
    redactedItems,
    warnings: textThreat.warnings,
    externalSharingAllowed: riskLevel !== 'high' // Disallow automated sharing on high risk pages
  };

  return {
    redactedBlocks,
    privacyReport
  };
}
