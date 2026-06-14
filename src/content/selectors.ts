// CSS Selector path generator for DOM elements

export function getSelectorHint(el: Element): string {
  const stableSelf = getStableSelector(el);
  if (stableSelf) {
    return stableSelf;
  }

  if (el.hasAttribute('id')) {
    const id = el.getAttribute('id');
    // Ensure the ID matches standard characters to avoid CSS syntax issues
    if (id && /^[a-zA-Z0-9_-]+$/.test(id)) {
      return `#${id}`;
    }
  }

  const path: string[] = [];
  let current: Element | null = el;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    const stableSelector = getStableSelector(current);
    let selector = stableSelector || current.tagName.toLowerCase();
    
    // Check if the current element has an ID
    const currentId = current.getAttribute('id');
    if (!stableSelector && currentId && /^[a-zA-Z0-9_-]+$/.test(currentId)) {
      selector = `#${currentId}`;
      path.unshift(selector);
      break; // Unique anchor found, stop traversing upwards
    }

    // Try to include class names if helpful
    const className = current.getAttribute('class');
    if (!stableSelector && className) {
      // Get first clean class name
      const firstClass = className
        .trim()
        .split(/\s+/)
        .filter((c) => /^[a-zA-Z0-9_-]+$/.test(c))[0];
      if (firstClass) {
        selector += `.${firstClass}`;
      }
    }

    // Add nth-child if siblings share the same selector
    const parent = current.parentElement;
    if (parent && !stableSelector) {
      // Find all sibling elements
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(current) + 1;
      
      // If there's more than one sibling of this tag, add nth-child
      const siblingsOfSameTag = siblings.filter(
        (s) => s.tagName === current!.tagName
      );
      if (siblingsOfSameTag.length > 1) {
        selector += `:nth-child(${index})`;
      }
    }

    path.unshift(selector);
    if (stableSelector) {
      break;
    }
    current = current.parentElement;
  }

  return path.join(' > ');
}

function getStableSelector(el: Element): string | undefined {
  const tagName = el.tagName.toLowerCase();
  const stableAttributes = [
    'data-testid',
    'data-test',
    'data-cy',
    'data-qa',
    'data-track-id',
    'aria-label'
  ];

  for (const attr of stableAttributes) {
    const value = el.getAttribute(attr);
    if (value && value.length <= 80) {
      return `${tagName}[${attr}="${escapeCssAttribute(value)}"]`;
    }
  }

  const role = el.getAttribute('role');
  if (role) {
    const accessibleName = el.getAttribute('aria-label');
    if (accessibleName && accessibleName.length <= 80) {
      return `${tagName}[role="${escapeCssAttribute(role)}"][aria-label="${escapeCssAttribute(accessibleName)}"]`;
    }
    return `${tagName}[role="${escapeCssAttribute(role)}"]`;
  }

  return undefined;
}

function escapeCssAttribute(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
