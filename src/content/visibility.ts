// Visibility heuristics for DOM elements

export function isSemanticInputOrAction(el: Element): boolean {
  const tagName = el.tagName.toLowerCase();
  if (['input', 'select', 'textarea', 'button'].includes(tagName)) {
    return true;
  }
  const role = el.getAttribute('role');
  if (role && ['button', 'checkbox', 'radio', 'combobox', 'textbox', 'link'].includes(role)) {
    return true;
  }
  return false;
}

export function isProbablyVisible(el: Element): boolean {
  // Check standard HTML hidden attributes
  if (el.hasAttribute('hidden') || el.getAttribute('aria-hidden') === 'true') {
    return false;
  }

  // Check display and visibility via computed styles
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }

  // Opacity check - ignore invisible elements unless they are form inputs
  if (parseFloat(style.opacity || '1') === 0 && !isSemanticInputOrAction(el)) {
    return false;
  }

  // Bounding box checks
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    // If it's a semantic input/action element, it might be styled off-screen/zero-sized
    // (like custom checkboxes/radios), so keep it. Otherwise, discard.
    if (!isSemanticInputOrAction(el)) {
      return false;
    }
  }

  // Check if it is collapsed due to parent sizing (though parent display check usually handles this)
  return true;
}
