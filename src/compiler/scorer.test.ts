import { describe, it, expect } from 'vitest';
import { scoreTextBlock, scoreActionBlock } from './scorer';
import { TextBlock, ActionBlock } from '../shared/types';

describe('Importance Scoring Engine', () => {
  it('should rank main body and article content higher than headers or menus', () => {
    const mainBlock: TextBlock = {
      id: 'tb-1',
      text: 'This is a long body paragraph explaining content inside main article layout.',
      selectorHint: 'div.app-container > main#main-content > article.post-body',
      sourceOrder: 1
    };

    const navBlock: TextBlock = {
      id: 'tb-2',
      text: 'Privacy Policy Home Contact Menu',
      selectorHint: 'div.app-container > header.nav-header > ul.menu-items > li',
      sourceOrder: 2
    };

    const mainScore = scoreTextBlock(mainBlock);
    const navScore = scoreTextBlock(navBlock);

    expect(mainScore).toBeGreaterThan(navScore);
    expect(mainScore).toBeGreaterThan(5.0); // Above base
    expect(navScore).toBeLessThan(5.0); // Demoted below base
  });

  it('should heavily demote ad or cookie elements', () => {
    const adBlock: TextBlock = {
      id: 'tb-3',
      text: 'Click here to win a million dollars in our cookie ad banner',
      selectorHint: 'div.cookie-consent-banner > p.advertisement-text',
      sourceOrder: 3
    };

    const score = scoreTextBlock(adBlock);
    expect(score).toBeLessThan(-2.0); // Major demotion
  });

  it('should score action buttons higher than generic disabled actions', () => {
    const submitBtn: ActionBlock = {
      id: 'act-1',
      type: 'button',
      label: 'Submit Application',
      selectorHint: 'form#user-form > button.submit-btn',
      textContext: 'Submit',
      sourceOrder: 1
    };

    const disabledBtn: ActionBlock = {
      id: 'act-2',
      type: 'button',
      label: 'Cancel Option',
      selectorHint: 'form#user-form > button.cancel-btn',
      textContext: 'Cancel',
      disabled: true,
      sourceOrder: 2
    };

    const submitScore = scoreActionBlock(submitBtn);
    const disabledScore = scoreActionBlock(disabledBtn);

    expect(submitScore).toBeGreaterThan(disabledScore);
  });
});
