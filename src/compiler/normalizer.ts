// Normalization utilities for text content and URLs

export function normalizeText(text: string): string {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}

export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove common tracking parameters (like UTM parameters)
    const paramsToClean = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    paramsToClean.forEach((param) => {
      parsed.searchParams.delete(param);
    });
    return parsed.toString();
  } catch (e) {
    return url;
  }
}

export function cleanLabel(label: string): string {
  if (!label) return '';
  // Remove trailing colons, question marks, asterisk required indicators
  return label
    .trim()
    .replace(/[:?*]+$/, '')
    .trim();
}
