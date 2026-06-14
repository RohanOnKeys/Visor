import { TextBlock, HeadingBlock, ActionBlock } from '../shared/types';
import { isNoiseElement } from './noiseFilter';

export function scoreTextBlock(block: TextBlock, parentHeadingLevel?: number): number {
  let score = 5.0; // Base score

  const selector = block.selectorHint.toLowerCase();

  // 1. Tag-based promotions
  if (selector.includes('article') || selector.includes('main') || selector.includes('[role="main"]')) {
    score += 8.0; // High probability of main body content
  }

  // 2. Class/Id promotions
  if (selector.includes('content') || selector.includes('body') || selector.includes('post-text')) {
    score += 4.0;
  }

  // 3. Parent heading level adjustments
  if (parentHeadingLevel) {
    if (parentHeadingLevel <= 3) {
      score += 3.0; // Under high-level heading
    } else {
      score += 1.0;
    }
  }

  // 4. Demotions for navigation/header/footer content
  if (
    selector.includes('nav') || 
    selector.includes('header') || 
    selector.includes('footer') || 
    selector.includes('menu') || 
    selector.includes('sidebar') ||
    selector.includes('aside')
  ) {
    score -= 6.0;
  }

  // 5. Demotions for ad/newsletter/cookie banners
  if (isNoiseElement(selector)) {
    score -= 10.0;
  }

  // 6. Length heuristics
  if (block.text.length < 15) {
    score -= 3.0; // Very short texts are likely metadata/labels
  } else if (block.text.length > 200) {
    score += 2.0; // Long paragraph is likely descriptive/informative
  }

  return score;
}

export function scoreActionBlock(block: ActionBlock): number {
  let score = 7.0; // Standalone actions start high since they are actionable

  const selector = block.selectorHint.toLowerCase();

  if (block.disabled) {
    score -= 3.0;
  }

  if (block.required) {
    score += 2.0;
  }

  // Demote navigation links/buttons in headers/footers
  if (selector.includes('nav') || selector.includes('footer') || selector.includes('header') || selector.includes('menu')) {
    score -= 4.0;
  }

  return score;
}

export function scoreHeadingBlock(block: HeadingBlock): number {
  // Headings get scored based on level
  // H1 = 10, H2 = 9, H3 = 8, H4 = 7, H5 = 6, H6 = 5
  return Math.max(5.0, 11.0 - block.level);
}
