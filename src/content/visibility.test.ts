import { describe, it, expect, vi } from 'vitest';
import { isProbablyVisible, isSemanticInputOrAction } from './visibility';

describe('Visibility Heuristics', () => {
  it('should identify semantic input and action tags', () => {
    const mockInput = { tagName: 'INPUT', getAttribute: () => null } as unknown as Element;
    const mockButton = { tagName: 'BUTTON', getAttribute: () => 'button' } as unknown as Element;
    const mockDiv = { tagName: 'DIV', getAttribute: () => null } as unknown as Element;

    expect(isSemanticInputOrAction(mockInput)).toBe(true);
    expect(isSemanticInputOrAction(mockButton)).toBe(true);
    expect(isSemanticInputOrAction(mockDiv)).toBe(false);
  });

  it('should identify invisible elements based on HTML attributes', () => {
    const hiddenEl = {
      tagName: 'DIV',
      hasAttribute: (attr: string) => attr === 'hidden',
      getAttribute: () => null
    } as unknown as Element;

    const ariaHiddenEl = {
      tagName: 'SPAN',
      hasAttribute: () => false,
      getAttribute: (attr: string) => attr === 'aria-hidden' ? 'true' : null
    } as unknown as Element;

    expect(isProbablyVisible(hiddenEl)).toBe(false);
    expect(isProbablyVisible(ariaHiddenEl)).toBe(false);
  });

  it('should mock style lookups and return false for display none', () => {
    const mockEl = {
      tagName: 'DIV',
      hasAttribute: () => false,
      getAttribute: () => null,
      getBoundingClientRect: () => ({ width: 100, height: 100 })
    } as unknown as Element;

    // Mock window computed style
    vi.stubGlobal('window', {
      getComputedStyle: () => ({
        display: 'none',
        visibility: 'visible',
        opacity: '1'
      })
    });

    expect(isProbablyVisible(mockEl)).toBe(false);
  });
});
