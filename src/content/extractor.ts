import { 
  PageSnapshot, HeadingBlock, TextBlock, LinkBlock, ActionBlock, 
  FormBlock, FormField, TableBlock, MediaBlock, ExtractionWarning, CompileRequest, LayoutGroupBlock
} from '../shared/types';
import { isProbablyVisible } from './visibility';
import { getSelectorHint } from './selectors';

export function extractPageSnapshot(request: CompileRequest): PageSnapshot {
  const startTime = performance.now();
  
  // State accumulators
  const headings: HeadingBlock[] = [];
  const textBlocks: TextBlock[] = [];
  const links: LinkBlock[] = [];
  const actions: ActionBlock[] = [];
  const layoutGroups: LayoutGroupBlock[] = [];
  const forms: FormBlock[] = [];
  const tables: TableBlock[] = [];
  const media: MediaBlock[] = [];
  const warnings: ExtractionWarning[] = [];
  
  let totalNodes = 0;
  let extractedNodes = 0;
  let ignoredNodes = 0;
  let sourceOrder = 0;

  // Maximum element threshold to prevent hanging on huge pages (e.g., stress test node cap)
  const MAX_NODE_CAP = 12000;
  let capExceeded = false;

  // Pre-mapping of label associations: inputId -> label text
  const labelMap = new Map<string, string>();
  
  // Gather label mappings from the entire document (including standard and shadow DOM if accessible)
  function collectLabels(root: ParentNode) {
    try {
      const labels = root.querySelectorAll('label');
      labels.forEach((lbl) => {
        const forId = lbl.getAttribute('for');
        const text = (lbl.textContent || '').trim().replace(/\s+/g, ' ');
        if (forId && text) {
          labelMap.set(forId, text);
        }
      });
    } catch (e) {
      // Ignore errors querying labels
    }
  }

  collectLabels(document);

  const ignoreSelectors = request.siteProfile?.ignoreSelectors || [];
  const preserveSelectors = request.siteProfile?.preserveSelectors || [];

  function matchesAnySelector(el: Element, selectors: string[]): boolean {
    return selectors.some((selector) => {
      try {
        return el.matches(selector);
      } catch {
        warnings.push({
          type: 'other',
          message: 'Invalid site profile selector ignored.',
          details: selector
        });
        return false;
      }
    });
  }

  // Helper to extract text safely and clean whitespaces
  function cleanText(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }

  function getDirectText(el: Element): string {
    let directText = '';
    for (let i = 0; i < el.childNodes.length; i++) {
      const child = el.childNodes[i];
      if (child.nodeType === Node.TEXT_NODE) {
        directText += child.textContent;
      }
    }

    return cleanText(directText);
  }

  function getReadableBlockText(el: Element, tagName: string): string {
    if (['p', 'li', 'blockquote', 'td', 'span'].includes(tagName)) {
      return cleanText(el.textContent || '');
    }

    if (isCompactTextContainer(el)) {
      return cleanText(el.textContent || '');
    }

    return getDirectText(el);
  }

  function isCompactTextContainer(el: Element): boolean {
    const text = cleanText(el.textContent || '');
    if (text.length < 4 || text.length > 700) return false;

    const blockDescendants = el.querySelectorAll('article, section, div, table, form, ul, ol, nav, aside, header, footer');
    if (blockDescendants.length > 3) return false;

    const inlineDescendants = el.querySelectorAll('a, span, strong, em, b, i, small, sup, sub');
    return inlineDescendants.length > 0;
  }

  function resolveElementLabel(el: Element): string {
    const ariaLabel = el.getAttribute('aria-label');
    const title = el.getAttribute('title');
    const labelledBy = el.getAttribute('aria-labelledby');
    const labelledByText = labelledBy
      ?.split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent || '')
      .filter(Boolean)
      .join(' ');
    const text = cleanText(el.textContent || '');
    const value = (el as HTMLInputElement).value;
    const stableName = el.getAttribute('name') || el.getAttribute('data-testid') || el.getAttribute('data-test') || el.getAttribute('data-cy');

    return cleanText(labelledByText || ariaLabel || title || text || value || stableName || '');
  }

  function inferLayoutRole(el: Element, tagName: string): LayoutGroupBlock['role'] {
    const role = el.getAttribute('role');
    const descriptor = `${tagName} ${role || ''} ${el.getAttribute('class') || ''} ${el.getAttribute('data-testid') || ''}`.toLowerCase();

    if (descriptor.includes('dialog') || role === 'dialog') return 'dialog';
    if (descriptor.includes('nav') || role === 'navigation' || tagName === 'nav') return 'nav';
    if (descriptor.includes('card') || descriptor.includes('plan') || descriptor.includes('tier') || descriptor.includes('price')) return 'card';
    if (tagName === 'ul' || tagName === 'ol' || role === 'list') return 'list';
    if (tagName === 'section' || tagName === 'article' || role === 'region') return 'section';
    return 'generic';
  }

  function shouldCaptureLayoutGroup(el: Element, tagName: string): boolean {
    if (!['article', 'section', 'div', 'li', 'ul', 'ol', 'nav', 'aside'].includes(tagName)) return false;

    const text = cleanText(el.textContent || '');
    if (text.length < 20 || text.length > 1200) return false;

    const descriptor = `${tagName} ${el.getAttribute('role') || ''} ${el.getAttribute('class') || ''} ${el.getAttribute('data-testid') || ''}`.toLowerCase();
    const hasUsefulStructure = el.querySelectorAll('button, a[href], img, video, svg, [role="button"], [aria-label]').length > 0;
    const looksLikeCommercialCard = /\b(plan|tier|price|premium|fan|mega|benefit|feature|subscription|monthly|yearly|\$\s?\d|\d+[.,]\d{2})\b/i.test(text + ' ' + descriptor);
    const childBlockCount = el.querySelectorAll('article, section, div, li, table, form').length;

    return (hasUsefulStructure || looksLikeCommercialCard) && childBlockCount <= 12;
  }

  function collectChildIds<T extends { id: string; selectorHint: string }>(items: T[], parentSelectorHint: string): string[] {
    return items
      .filter((item) => item.selectorHint === parentSelectorHint || item.selectorHint.startsWith(`${parentSelectorHint} > `))
      .map((item) => item.id)
      .slice(0, 20);
  }

  function refreshLayoutGroupChildren(): LayoutGroupBlock[] {
    return layoutGroups.map((group) => ({
      ...group,
      childActionIds: collectChildIds(actions, group.selectorHint),
      childMediaIds: collectChildIds(media, group.selectorHint)
    }));
  }

  function extractBackgroundImageUrl(el: Element): string | undefined {
    const backgroundImage = window.getComputedStyle(el).backgroundImage;
    const match = backgroundImage.match(/url\(["']?(.*?)["']?\)/);
    return match?.[1];
  }

  function nextSourceOrder(): number {
    sourceOrder++;
    return sourceOrder;
  }

  function addSemanticGroup(group: Omit<LayoutGroupBlock, 'sourceOrder' | 'childActionIds' | 'childMediaIds'> & { sourceOrder?: number }) {
    if (!group.text || layoutGroups.some((existing) => existing.id === group.id)) return;

    layoutGroups.push({
      ...group,
      sourceOrder: group.sourceOrder || nextSourceOrder(),
      childActionIds: [],
      childMediaIds: []
    });
  }

  function isWikipediaPage(): boolean {
    return /(^|\.)wikipedia\.org$/i.test(window.location.hostname) && !!document.querySelector('#mw-content-text, .mw-parser-output');
  }

  function appendWikipediaSemanticRegions() {
    if (!isWikipediaPage()) return;

    const parserOutput = document.querySelector('.mw-parser-output');
    if (!parserOutput) return;

    warnings.push({
      type: 'other',
      message: 'Wikipedia semantic route applied: lead, TOC, infobox, sections, references, media, and nav are preserved as separate layout groups.'
    });

    const articleTitle = cleanText(document.querySelector('#firstHeading')?.textContent || document.title);
    const leadParagraphs: string[] = [];
    for (const child of Array.from(parserOutput.children)) {
      if (child.matches('h2, .mw-heading2, #toc, .vector-toc, table.infobox')) break;
      if (child.matches('p')) {
        const text = cleanText(child.textContent || '');
        if (text.length > 40) leadParagraphs.push(text);
      }
    }

    if (leadParagraphs.length > 0) {
      addSemanticGroup({
        id: 'wikipedia-lead',
        label: `${articleTitle} lead`,
        role: 'lead',
        text: leadParagraphs.join('\n\n'),
        selectorHint: '.mw-parser-output > p'
      });
    }

    const toc = document.querySelector('#toc, .vector-toc, [aria-label="Contents"]');
    if (toc) {
      const tocItems = Array.from(toc.querySelectorAll('a'))
        .map((item) => cleanText(item.textContent || ''))
        .filter(Boolean)
        .slice(0, 80);
      addSemanticGroup({
        id: 'wikipedia-toc',
        label: 'Table of contents',
        role: 'toc',
        text: tocItems.join('\n'),
        selectorHint: getSelectorHint(toc)
      });
    }

    const infobox = parserOutput.querySelector('table.infobox');
    if (infobox) {
      const infoboxText = cleanText(infobox.textContent || '');
      addSemanticGroup({
        id: 'wikipedia-infobox',
        label: cleanText(infobox.querySelector('caption, th')?.textContent || `${articleTitle} infobox`),
        role: 'infobox',
        text: infoboxText,
        selectorHint: getSelectorHint(infobox)
      });
    }

    const sectionHeadings = Array.from(parserOutput.querySelectorAll<HTMLElement>('h2, .mw-heading2'));
    sectionHeadings.forEach((heading, index) => {
      const label = cleanText(heading.textContent || '').replace(/\[edit\]$/i, '').trim();
      if (!label) return;

      const parts: string[] = [];
      let current = heading.nextElementSibling;
      while (current && !current.matches('h2, .mw-heading2')) {
        if (current.matches('p, ul, ol, table, figure, .thumb, .reflist, ol.references')) {
          const text = cleanText(current.textContent || '');
          if (text.length > 20) parts.push(text);
        }
        current = current.nextElementSibling;
      }

      if (parts.length > 0) {
        addSemanticGroup({
          id: `wikipedia-section-${index + 1}`,
          label,
          role: /references|notes|bibliography|external links/i.test(label) ? 'references' : 'article_section',
          text: parts.join('\n\n').slice(0, 6000),
          selectorHint: getSelectorHint(heading)
        });
      }
    });

    const referencesRoot = parserOutput.querySelector('.reflist, ol.references, section[aria-labelledby="References"]');
    if (referencesRoot) {
      const refs = Array.from(referencesRoot.querySelectorAll('li, cite'))
        .map((ref) => cleanText(ref.textContent || ''))
        .filter((text) => text.length > 10)
        .slice(0, 80);
      addSemanticGroup({
        id: 'wikipedia-references',
        label: 'References',
        role: 'references',
        text: refs.join('\n'),
        selectorHint: getSelectorHint(referencesRoot)
      });
    }

    const nav = document.querySelector('#p-navigation, .vector-page-toolbar, nav[aria-label]');
    if (nav) {
      const navText = Array.from(nav.querySelectorAll('a, button'))
        .map((item) => cleanText(item.textContent || item.getAttribute('aria-label') || ''))
        .filter(Boolean)
        .slice(0, 60)
        .join('\n');
      addSemanticGroup({
        id: 'wikipedia-nav',
        label: 'Page navigation',
        role: 'nav',
        text: navText,
        selectorHint: getSelectorHint(nav)
      });
    }

    const seenMedia = new Set(media.map((item) => `${item.src || ''}:${item.alt || ''}`));
    parserOutput.querySelectorAll('figure, .thumb, .mw-file-description').forEach((item, index) => {
      const image = item.querySelector<HTMLImageElement>('img');
      const src = image?.currentSrc || image?.getAttribute('src') || image?.getAttribute('srcset') || undefined;
      const alt = image?.getAttribute('alt') || undefined;
      const caption = cleanText(item.querySelector('figcaption, .thumbcaption')?.textContent || image?.getAttribute('title') || '');
      const key = `${src || ''}:${alt || caption}`;
      if (!src || seenMedia.has(key)) return;
      seenMedia.add(key);

      const order = nextSourceOrder();
      const selectorHint = getSelectorHint(item);
      const mediaId = `wikipedia-media-${index + 1}`;
      media.push({
        id: mediaId,
        type: 'image',
        alt,
        caption: caption || undefined,
        src,
        selectorHint,
        sourceOrder: order
      });

      addSemanticGroup({
        id: `${mediaId}-group`,
        label: caption || alt || 'Wikipedia media',
        role: 'media',
        text: caption || alt || src,
        selectorHint,
        sourceOrder: order
      });
    });
  }

  // Helper to retrieve the parent heading at the moment
  function getCurrentHeadingId(): string | undefined {
    if (headings.length === 0) return undefined;
    // Return the id of the most recent heading block
    return headings[headings.length - 1].id;
  }

  // Recursive traversal function
  function traverse(node: Node, parentHeadingId?: string) {
    if (capExceeded) return;
    
    totalNodes++;

    // Guard against huge pages
    if (totalNodes > MAX_NODE_CAP) {
      if (!capExceeded) {
        capExceeded = true;
        warnings.push({
          type: 'node_limit',
          message: `Page size limit exceeded (processed over ${MAX_NODE_CAP} nodes). Extraction has been capped.`,
          details: `Processed nodes: ${totalNodes}`
        });
      }
      return;
    }

    // Only process element nodes
    if (node.nodeType !== Node.ELEMENT_NODE) {
      // Traverse children for document/fragment nodes
      node.childNodes.forEach((child) => traverse(child, parentHeadingId));
      return;
    }

    const el = node as Element;
    const tagName = el.tagName.toLowerCase();
    const isPreservedByProfile = matchesAnySelector(el, preserveSelectors);

    // 1. Exclude script, style, noscript, template, metadata, and invisible elements
    if (['script', 'style', 'noscript', 'template', 'head', 'meta', 'link', 'title'].includes(tagName)) {
      ignoredNodes++;
      return;
    }

    if (!isPreservedByProfile && matchesAnySelector(el, ignoreSelectors)) {
      ignoredNodes++;
      return;
    }

    // Visibility Check
    if (!isPreservedByProfile && !isProbablyVisible(el)) {
      ignoredNodes++;
      return;
    }

    // Process elements by category
    extractedNodes++;
    sourceOrder++;
    const elementId = el.getAttribute('id') || `visor-el-${sourceOrder}`;
    const selectorHint = getSelectorHint(el);

    if (shouldCaptureLayoutGroup(el, tagName)) {
      const text = cleanText(el.textContent || '');
      const explicitLabel = el.getAttribute('aria-label') || el.getAttribute('title') || '';
      const headingLabel = cleanText(el.querySelector('h1, h2, h3, h4, h5, h6')?.textContent || '');
      const firstLine = text.split(/(?<=[.!?])\s+/)[0] || text;

      layoutGroups.push({
        id: `${elementId}-group`,
        label: cleanText(explicitLabel || headingLabel || firstLine.slice(0, 80)),
        role: inferLayoutRole(el, tagName),
        text,
        selectorHint,
        sourceOrder,
        childActionIds: collectChildIds(actions, selectorHint),
        childMediaIds: collectChildIds(media, selectorHint)
      });
    }

    // --- CASE A: Headings (H1 - H6) ---
    const headingMatch = tagName.match(/^h([1-6])$/);
    if (headingMatch) {
      const level = parseInt(headingMatch[1]);
      const text = cleanText(el.textContent || '');
      if (text) {
        const hBlock: HeadingBlock = {
          id: elementId,
          text,
          level,
          selectorHint,
          sourceOrder
        };
        headings.push(hBlock);
        // Children of this heading will be traversed under this heading level context
        parentHeadingId = elementId;
      }
    }

    // --- CASE B: Code Blocks ---
    else if (tagName === 'pre' || tagName === 'code') {
      // If code inside pre, avoid duplicate extraction, let pre handle it
      if (tagName === 'code' && el.parentElement?.tagName.toLowerCase() === 'pre') {
        // Skip code tag itself since pre handles it
      } else {
        const text = el.textContent || '';
        if (text.trim()) {
          textBlocks.push({
            id: elementId,
            text, // Keep raw whitespace for code
            selectorHint,
            sourceOrder,
            parentHeadingId
          });
        }
        // Do not traverse children of code blocks to avoid extra text block spam
        return;
      }
    }

    // --- CASE C: Tables ---
    else if (tagName === 'table') {
      const tableHeaders: string[] = [];
      const tableRows: string[][] = [];
      let caption: string | undefined;

      // Extract caption
      const captionEl = el.querySelector('caption');
      if (captionEl) {
        caption = cleanText(captionEl.textContent || '');
      }

      // Extract headers
      el.querySelectorAll('th').forEach((th) => {
        const txt = cleanText(th.textContent || '');
        if (txt) tableHeaders.push(txt);
      });

      // Extract rows
      el.querySelectorAll('tr').forEach((tr) => {
        const rowData: string[] = [];
        tr.querySelectorAll('th, td').forEach((cell) => {
          const value = cleanText(cell.textContent || '');
          if (value) rowData.push(value);
        });
        if (rowData.length > 0) {
          tableRows.push(rowData);
        }
      });

      tables.push({
        id: elementId,
        caption,
        headers: tableHeaders,
        rows: tableRows,
        selectorHint,
        sourceOrder
      });
      // Do not traverse tables deeply to avoid duplicates, but table text is self-contained
      return;
    }

    // --- CASE D: Media Elements ---
    else if (['img', 'video', 'audio', 'canvas', 'svg'].includes(tagName)) {
      const type = tagName === 'img' || tagName === 'svg' ? 'image' : (tagName as 'video' | 'audio' | 'canvas');
      const imageEl = el as HTMLImageElement;
      const alt = el.getAttribute('alt') || el.getAttribute('aria-label') || undefined;
      const src = imageEl.currentSrc || el.getAttribute('src') || el.getAttribute('data-src') || el.getAttribute('srcset') || el.getAttribute('data-srcset') || undefined;
      const caption = el.getAttribute('title') || undefined;

      media.push({
        id: elementId,
        type,
        alt,
        caption,
        src,
        selectorHint,
        sourceOrder
      });
      
      if (tagName === 'canvas') {
        warnings.push({
          type: 'canvas_only',
          message: 'Page contains a Canvas element. Graphic contents inside Canvas are unreadable as HTML DOM.'
        });
      }
    }

    // --- CASE E: Forms & Inputs ---
    else if (tagName === 'form') {
      const fields: FormField[] = [];
      const submitControls: ActionBlock[] = [];

      // Look for inputs, selects, textareas inside this form
      const formControls = el.querySelectorAll('input, select, textarea, button');
      formControls.forEach((ctrl, idx) => {
        const ctrlId = ctrl.getAttribute('id') || `form-ctrl-${sourceOrder}-${idx}`;
        const ctrlName = ctrl.getAttribute('name') || undefined;
        const ctrlTagName = ctrl.tagName.toLowerCase();
        const typeAttr = ctrl.getAttribute('type') || 'text';
        const required = ctrl.hasAttribute('required');
        const disabled = ctrl.hasAttribute('disabled');
        const placeholder = ctrl.getAttribute('placeholder') || undefined;

        // Label resolving
        let label = labelMap.get(ctrl.getAttribute('id') || '') || undefined;
        if (!label) {
          // Check for surrounding label tag
          const parentLabel = ctrl.closest('label');
          if (parentLabel) {
            label = cleanText(parentLabel.textContent || '');
          }
        }
        if (!label) {
          label = ctrl.getAttribute('aria-label') || ctrl.getAttribute('title') || undefined;
        }

        if (ctrlTagName === 'button' || ['submit', 'button', 'image', 'reset'].includes(typeAttr)) {
          // Button/Submit action
          const btnLabel = label || cleanText(ctrl.textContent || '') || typeAttr;
          submitControls.push({
            id: ctrlId,
            type: 'button',
            label: btnLabel,
            selectorHint: getSelectorHint(ctrl),
            textContext: cleanText(ctrl.textContent || ''),
            disabled,
            sourceOrder
          });
        } else {
          // Form input field
          let value = (ctrl as HTMLInputElement).value || undefined;
          
          // STRICT SECURITY RULE (SEC-001): Never extract password/OTP values
          if (typeAttr === 'password' || typeAttr === 'one-time-code' || ctrl.getAttribute('autocomplete') === 'one-time-code') {
            value = undefined; // Do not read under any circumstances
          }

          fields.push({
            id: ctrlId,
            name: ctrlName,
            type: typeAttr,
            label,
            placeholder,
            required,
            disabled,
            value
          });
        }
      });

      forms.push({
        id: elementId,
        selectorHint,
        label: el.getAttribute('aria-label') || el.getAttribute('name') || undefined,
        fields,
        submitControls,
        sourceOrder
      });
      // Skip deep children traversal to avoid duplicate fields extraction, but continue
    }

    // --- CASE F: Interactive Action elements (Buttons, standalone links, roles) ---
    else if (tagName === 'button' || el.getAttribute('role') === 'button' || (tagName === 'input' && ['button', 'submit', 'image'].includes(el.getAttribute('type') || ''))) {
      const type = 'button';
      const label = resolveElementLabel(el) || 'Button';
      const disabled = el.hasAttribute('disabled');

      actions.push({
        id: elementId,
        type,
        label,
        selectorHint,
        textContext: cleanText(el.textContent || ''),
        disabled,
        sourceOrder
      });
    }

    // --- CASE G: Links ---
    else if (tagName === 'a' && el.hasAttribute('href')) {
      const href = el.getAttribute('href') || '';
      const text = cleanText(el.textContent || '');
      const title = el.getAttribute('title') || undefined;
      const rel = el.getAttribute('rel') || undefined;

      // Classify as button action if it has a button role
      if (el.getAttribute('role') === 'button') {
        actions.push({
          id: elementId,
          type: 'button',
          label: text || title || 'Link Button',
          selectorHint,
          textContext: text,
          sourceOrder
        });
      } else {
        links.push({
          id: elementId,
          text: text || href,
          href,
          title,
          rel,
          selectorHint,
          sourceOrder
        });
      }
    }

    // --- CASE H: Standard Paragraph / Text Block ---
    else if (['p', 'span', 'li', 'article', 'section', 'div', 'td', 'blockquote'].includes(tagName)) {
      const cleaned = getReadableBlockText(el, tagName);
      if (cleaned.length > 3) { // Filter out tiny spacer texts
        textBlocks.push({
          id: elementId,
          text: cleaned,
          selectorHint,
          sourceOrder,
          parentHeadingId: parentHeadingId || getCurrentHeadingId()
        });
      }

      const backgroundImageUrl = extractBackgroundImageUrl(el);
      if (backgroundImageUrl) {
        media.push({
          id: `${elementId}-background`,
          type: 'image',
          alt: el.getAttribute('aria-label') || undefined,
          caption: el.getAttribute('title') || undefined,
          src: backgroundImageUrl,
          selectorHint,
          sourceOrder
        });
      }
    }

    // 3. Traverse Shadow DOM (recursively compile inside open shadow roots)
    if (el.shadowRoot) {
      warnings.push({
        type: 'shadow_dom',
        message: 'Shadow DOM encountered and traversed.'
      });
      collectLabels(el.shadowRoot);
      el.shadowRoot.childNodes.forEach((child) => traverse(child, parentHeadingId));
    }

    // 4. Handle Iframes (traverse same-origin iframes)
    if (tagName === 'iframe') {
      try {
        const iframe = el as HTMLIFrameElement;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          collectLabels(iframeDoc);
          iframeDoc.childNodes.forEach((child) => traverse(child, parentHeadingId));
        } else {
          // Cross-origin iframe
          warnings.push({
            type: 'iframe',
            message: 'Cross-origin iframe detected. Content is restricted due to browser same-origin policies.',
            details: `Source: ${iframe.src || 'about:blank'}`
          });
        }
      } catch (err: any) {
        warnings.push({
          type: 'iframe',
          message: 'Iframe access blocked. Same-origin validation failed.',
          details: err.message || err
        });
      }
    }

    // Traverse remaining children (if not explicitly ignored above)
    el.childNodes.forEach((child) => traverse(child, parentHeadingId));
  }

  // Kick off traversal from the configured main content root when available.
  let root: Element | null = document.body;
  const mainContentSelector = request.siteProfile?.mainContentSelector;
  if (mainContentSelector) {
    try {
      root = document.querySelector(mainContentSelector) || document.body;
      if (root === document.body) {
        warnings.push({
          type: 'other',
          message: 'Site profile main content selector did not match. Falling back to document body.',
          details: mainContentSelector
        });
      }
    } catch {
      warnings.push({
        type: 'other',
        message: 'Invalid site profile main content selector. Falling back to document body.',
        details: mainContentSelector
      });
    }
  }

  if (root) {
    traverse(root);
  }

  appendWikipediaSemanticRegions();

  const durationMs = performance.now() - startTime;
  
  return {
    schemaVersion: 'page_snapshot.v1',
    source: {
      url: window.location.href,
      canonicalUrl: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || undefined,
      title: document.title,
      capturedAt: new Date().toISOString(),
      language: document.documentElement.lang || undefined
    },
    metadata: {
      generator: 'Visor DOM Extractor v0.1.0',
      userAgent: navigator.userAgent,
      semanticRoute: isWikipediaPage() ? 'wikipedia_article' : 'generic'
    },
    headings,
    textBlocks,
      links,
      actions,
      layoutGroups: refreshLayoutGroupChildren(),
      forms,
    tables,
    media,
    stats: {
      totalNodes,
      extractedNodes,
      ignoredNodes,
      timeElapsedMs: durationMs
    },
    warnings
  };
}
