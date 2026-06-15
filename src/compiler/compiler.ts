import { 
  PageSnapshot, AgentContext, CompileRequest, ContentBlock, 
  ActionElement, HeadingNode, HeadingBlock, CompilerNote, LinkElement, RedactedItem, PrivacyReport,
  LayoutGroupElement, DataElement
} from '../shared/types';
import { normalizeText, normalizeUrl, cleanLabel } from './normalizer';
import { deduplicateTextBlocks, isNoiseElement } from './noiseFilter';
import { scoreTextBlock, scoreHeadingBlock } from './scorer';
import { classifyPage } from './classifier';
import { applyTokenBudget, estimateTokenCount } from './tokenBudget';
import { applyRedaction, redactPlainTextWithReport } from '../privacy/redactor';
import { formatAsMarkdown, formatAsPromptBlock } from './exporter';
import { AgentContextSchema } from '../shared/schema';

export function buildHeadingHierarchy(headings: HeadingBlock[]): HeadingNode[] {
  const rootNodes: HeadingNode[] = [];
  const stack: { level: number; node: HeadingNode }[] = [];

  for (const h of headings) {
    const node: HeadingNode = {
      id: h.id,
      text: h.text,
      level: h.level,
      children: []
    };

    while (stack.length > 0 && stack[stack.length - 1].level >= h.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      rootNodes.push(node);
    } else {
      stack[stack.length - 1].node.children.push(node);
    }

    stack.push({ level: h.level, node });
  }

  return rootNodes;
}

export function compileSnapshot(
  snapshot: PageSnapshot,
  request: CompileRequest
): {
  context: AgentContext;
  exports: { json: string; markdown: string; promptBlock: string };
} {
  const compilerNotes: CompilerNote[] = [];
  const structuredRedactions: RedactedItem[] = [];
  
  // 1. Normalization Step
  const normalizedUrl = normalizeUrl(snapshot.source.url);
  const normalizedTitle = normalizeText(snapshot.source.title);

  function redactStructuredText(text: string | undefined, location: string): string | undefined {
    const result = redactPlainTextWithReport(text, request.privacyLevel, location);
    structuredRedactions.push(...result.redactedItems);
    return result.text;
  }

  compilerNotes.push({
    level: 'info',
    category: 'filtering',
    message: `Starting compile in mode: ${request.mode}. Initial blocks: headings=${snapshot.headings.length}, text=${snapshot.textBlocks.length}.`
  });

  // Create lookup maps
  const headingMap = new Map<string, HeadingBlock>();
  snapshot.headings.forEach((h) => headingMap.set(h.id, h));

  // Helper to build heading path for a block
  function resolveHeadingPath(parentHeadingId?: string): string[] {
    const path: string[] = [];
    let currentId = parentHeadingId;
    while (currentId && headingMap.has(currentId)) {
      const h = headingMap.get(currentId)!;
      path.unshift(h.text);
      // Try to find if this heading has a parent heading (by level hierarchy traversal)
      // Since heading block flat list is ordered, we look backwards
      const idx = snapshot.headings.findIndex((x) => x.id === currentId);
      if (idx > 0) {
        let parentHeading: HeadingBlock | null = null;
        for (let i = idx - 1; i >= 0; i--) {
          if (snapshot.headings[i].level < h.level) {
            parentHeading = snapshot.headings[i];
            break;
          }
        }
        currentId = parentHeading ? parentHeading.id : undefined;
      } else {
        currentId = undefined;
      }
    }
    return path;
  }

  // 2. Score & Create initial ContentBlock list (Headings + Texts)
  const candidateBlocks: ContentBlock[] = [];

  // Add headings to candidate list
  snapshot.headings.forEach((h) => {
    const score = scoreHeadingBlock(h);
    const text = normalizeText(h.text);
    candidateBlocks.push({
      id: h.id,
      kind: 'heading',
      text,
      headingPath: resolveHeadingPath(h.id),
      selectorHint: h.selectorHint,
      importanceScore: score,
      tokenEstimate: estimateTokenCount(text),
      sourceOrder: h.sourceOrder
    });
  });

  // Deduplicate and filter text blocks
  const { keptBlocks, duplicateBlockIds, removedTokens } = deduplicateTextBlocks(snapshot.textBlocks);
  if (removedTokens > 0) {
    compilerNotes.push({
      level: 'info',
      category: 'deduplication',
      message: `Hashed duplicate detector removed ${duplicateBlockIds.size} repeated text blocks, pruning ${removedTokens} estimated tokens.`
    });
  }

  if (request.mode === 'debug' && duplicateBlockIds.size > 0) {
    compilerNotes.push({
      level: 'info',
      category: 'deduplication',
      message: `Debug mode retained duplicate blocks that normal modes remove: ${Array.from(duplicateBlockIds).slice(0, 20).join(', ')}.`
    });
  }

  const textBlocksForScoring = request.mode === 'debug' ? snapshot.textBlocks : keptBlocks;
  let filteredNoiseCount = 0;
  const filteredNoiseIds: string[] = [];

  textBlocksForScoring.forEach((tb) => {
    const isNoise = isNoiseElement(tb.selectorHint);
    
    // Skip obvious noise in modes other than debug
    if (isNoise && request.mode !== 'debug') {
      filteredNoiseCount++;
      if (filteredNoiseIds.length < 20) {
        filteredNoiseIds.push(tb.id);
      }
      return;
    }

    const headingBlock = tb.parentHeadingId ? headingMap.get(tb.parentHeadingId) : undefined;
    const score = scoreTextBlock(tb, headingBlock?.level);
    const text = normalizeText(tb.text);
    
    // Check if code block
    const isCode = tb.selectorHint.toLowerCase().includes('pre') || tb.selectorHint.toLowerCase().includes('code');

    candidateBlocks.push({
      id: tb.id,
      kind: isCode ? 'code' : 'paragraph',
      text,
      headingPath: resolveHeadingPath(tb.parentHeadingId),
      selectorHint: tb.selectorHint,
      importanceScore: isNoise ? -5.0 : score,
      tokenEstimate: estimateTokenCount(text),
      sourceOrder: tb.sourceOrder
    });
  });

  if (filteredNoiseCount > 0) {
    compilerNotes.push({
      level: 'info',
      category: 'filtering',
      message: `Noise filter removed ${filteredNoiseCount} text blocks before scoring: ${filteredNoiseIds.join(', ')}.`
    });
  }

  // 3. Process actions into ActionElements
  const actionableElements: ActionElement[] = snapshot.actions.map((act) => {
    const label = redactStructuredText(cleanLabel(act.label), `${act.id}.label`) || '';
    const textContext = redactStructuredText(act.textContext, `${act.id}.textContext`) || '';
    
    // Guess action purpose based on labels and tags
    let actionPurpose = 'interaction';
    const cleanLbl = label.toLowerCase();
    if (cleanLbl.includes('submit') || cleanLbl.includes('login') || cleanLbl.includes('sign')) {
      actionPurpose = 'submit';
    } else if (cleanLbl.includes('search')) {
      actionPurpose = 'search';
    } else if (cleanLbl.includes('close') || cleanLbl.includes('cancel') || cleanLbl.includes('dismiss')) {
      actionPurpose = 'navigation_close';
    } else if (cleanLbl.includes('next') || cleanLbl.includes('continue')) {
      actionPurpose = 'navigation_next';
    }

    return {
      id: act.id,
      type: act.type,
      label,
      selectorHint: act.selectorHint,
      textContext,
      actionPurpose,
      confidence: 0.9,
      disabled: act.disabled,
      required: act.required,
      privacySensitive: act.type === 'input' && act.selectorHint.includes('password')
    };
  });

  const layoutGroups: LayoutGroupElement[] = snapshot.layoutGroups.map((group) => {
    const text = redactStructuredText(normalizeText(group.text), `${group.id}.text`) || '';
    const label = redactStructuredText(cleanLabel(group.label), `${group.id}.label`) || inferGroupLabel(text, group.role);
    const importanceScore = scoreLayoutGroup(group.role, text);

    return {
      id: group.id,
      label,
      role: group.role,
      text,
      selectorHint: group.selectorHint,
      childActionIds: group.childActionIds,
      childMediaIds: group.childMediaIds,
      importanceScore
    };
  });

  const dataElements: DataElement[] = extractDataElements(snapshot, layoutGroups).map((element) => ({
    ...element,
    label: redactStructuredText(element.label, `${element.id}.label`) || element.label,
    value: redactStructuredText(element.value, `${element.id}.value`) || element.value
  }));

  // 4. Mode filtering heuristics
  let filteredBlocks = candidateBlocks;
  
  if (request.mode === 'compact') {
    // Keeps blocks with high importance scores (>= 4.0) or heading elements
    filteredBlocks = candidateBlocks.filter(
      (b) => b.kind === 'heading' || b.importanceScore >= 5.0
    );
  } else if (request.mode === 'agent_action') {
    const actionContextTerms = /error|warning|required|invalid|success|saved|failed|complete|continue|next|submit|login|sign in|checkout|cart|search/i;
    filteredBlocks = candidateBlocks.filter(
      (b) =>
        b.kind === 'heading' ||
        b.kind === 'code' ||
        b.importanceScore >= 6.0 ||
        actionContextTerms.test(b.text)
    );
    compilerNotes.push({
      level: 'info',
      category: 'filtering',
      message: `Agent Mode kept ${filteredBlocks.length} blocks focused on forms, actions, status text, selector traceability, and nearby operational context.`
    });
  } else if (request.mode === 'rag') {
    filteredBlocks = createRagChunks(
      candidateBlocks.filter((b) => b.kind !== 'heading' && b.importanceScore >= 3.0)
    );
    compilerNotes.push({
      level: 'info',
      category: 'filtering',
      message: `RAG mode emitted ${filteredBlocks.length} stable chunks with heading paths, selector hints, and block-derived IDs.`
    });
  } else if (request.mode === 'debug') {
    compilerNotes.push({
      level: 'info',
      category: 'filtering',
      message: 'Debug mode retained low-score/noise candidates so the preview can inspect compiler decisions.'
    });
  }

  // 5. Apply Privacy Redaction (Task 6)
  const { redactedBlocks, privacyReport } = applyRedaction(filteredBlocks, request.privacyLevel, {
    url: normalizedUrl,
    title: normalizedTitle
  });

  // 6. Token Budget Pruning
  const requestedBudget = request.tokenBudget;
  const effectiveBudget = request.mode === 'debug'
    ? Math.max(request.tokenBudget, redactedBlocks.reduce((sum, block) => sum + block.tokenEstimate, 0))
    : request.tokenBudget;

  if (effectiveBudget !== requestedBudget) {
    compilerNotes.push({
      level: 'info',
      category: 'budgeting',
      message: `Debug mode expanded the effective budget from ${requestedBudget} to ${effectiveBudget} tokens to avoid hiding diagnostic blocks.`
    });
  }

  const { budgetedBlocks, profile, compilerNotes: budgetNotes } = applyTokenBudget(
    redactedBlocks,
    effectiveBudget
  );

  budgetNotes.forEach((n) => {
    compilerNotes.push({
      level: 'warning',
      category: 'budgeting',
      message: n
    });
  });

  // 7. Page Classification
  const pageClassification = classifyPage(snapshot);
  compilerNotes.push({
    level: 'info',
    category: 'classification',
    message: `Page classified as: ${pageClassification.type} with confidence ${(pageClassification.confidence * 100).toFixed(0)}%`
  });

  // 8. Build Heading hierarchy
  const hierarchy = buildHeadingHierarchy(snapshot.headings);

  // Map links and tables to context structures
  const links: LinkElement[] = snapshot.links.map((l) => ({
    id: l.id,
    text: redactStructuredText(l.text, `${l.id}.text`) || '',
    href: redactStructuredText(l.href, `${l.id}.href`) || '',
    headingPath: [], // Heading path can be omitted or filled
    selectorHint: l.selectorHint
  }));

  const forms = snapshot.forms.map((f) => ({
    id: f.id,
    selectorHint: f.selectorHint,
    label: redactStructuredText(f.label, `${f.id}.label`),
    purpose: redactStructuredText(f.purpose, `${f.id}.purpose`),
    fields: f.fields.map((field) => ({
      ...field,
      name: redactStructuredText(field.name, `${field.id}.name`),
      label: redactStructuredText(field.label, `${field.id}.label`),
      placeholder: redactStructuredText(field.placeholder, `${field.id}.placeholder`),
      value: field.type === 'password' || field.type === 'one-time-code'
        ? undefined
        : redactStructuredText(field.value, `${field.id}.value`)
    })),
    submitControls: f.submitControls.map((sc) => {
      const match = actionableElements.find((ae) => ae.id === sc.id);
      if (match) return match;
      return {
        id: sc.id,
        type: sc.type,
        label: redactStructuredText(sc.label, `${sc.id}.label`) || '',
        selectorHint: sc.selectorHint,
        textContext: redactStructuredText(sc.textContext, `${sc.id}.textContext`) || '',
        actionPurpose: 'submit',
        confidence: 0.9,
        disabled: sc.disabled,
        required: sc.required,
        privacySensitive: false
      };
    })
  }));

  const tables = snapshot.tables.map((t) => ({
    id: t.id,
    caption: redactStructuredText(t.caption, `${t.id}.caption`),
    headingPath: [] as string[],
    headers: t.headers.map((header, index) => redactStructuredText(header, `${t.id}.headers.${index}`) || ''),
    rows: t.rows.map((row, rowIndex) => row.map((cell, cellIndex) => redactStructuredText(cell, `${t.id}.rows.${rowIndex}.${cellIndex}`) || '')),
    selectorHint: t.selectorHint
  }));

  const media = snapshot.media.map((item) => ({
    ...item,
    alt: redactStructuredText(item.alt, `${item.id}.alt`),
    caption: redactStructuredText(item.caption, `${item.id}.caption`),
    src: redactStructuredText(item.src, `${item.id}.src`)
  }));

  const structuredContext = shapeStructuredContext(request.mode, {
    actionableElements,
    layoutGroups,
    dataElements,
    links,
    forms,
    tables,
    media
  });

  if (structuredContext.note) {
    compilerNotes.push({
      level: 'info',
      category: 'filtering',
      message: structuredContext.note
    });
  }

  const mergedPrivacyReport = mergePrivacyReports(privacyReport, structuredRedactions, request.privacyLevel);

  // Compile final AgentContext object
  const context: AgentContext = {
    schemaVersion: 'agent_context.v1',
    source: {
      url: normalizedUrl,
      canonicalUrl: snapshot.source.canonicalUrl,
      title: normalizedTitle,
      capturedAt: snapshot.source.capturedAt,
      language: snapshot.source.language,
      contentHash: createContentHash(snapshot)
    },
    pageClassification,
    summary: {
      short: snapshot.source.title + ' Page. Extracted visible content.',
      method: 'heuristic'
    },
    hierarchy,
    mainContent: budgetedBlocks,
    actionableElements: structuredContext.actionableElements,
    layoutGroups: structuredContext.layoutGroups,
    dataElements: structuredContext.dataElements,
    links: structuredContext.links,
    forms: structuredContext.forms,
    tables: structuredContext.tables,
    media: structuredContext.media,
    tokenProfile: profile,
    privacyReport: mergedPrivacyReport,
    compilerNotes
  };

  // Compile Export format strings
  const validation = AgentContextSchema.safeParse(context);
  if (!validation.success) {
    throw new Error(`Generated AgentContext failed schema validation: ${validation.error.message}`);
  }

  const markdownExport = formatAsMarkdown(context);
  const promptBlockExport = formatAsPromptBlock(context);

  return {
    context,
    exports: {
      json: JSON.stringify(context, null, 2),
      markdown: markdownExport,
      promptBlock: promptBlockExport
    }
  };
}

function inferGroupLabel(text: string, role: LayoutGroupElement['role']): string {
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0]?.slice(0, 80).trim();
  return firstSentence || `${role} group`;
}

function scoreLayoutGroup(role: LayoutGroupElement['role'], text: string): number {
  let score = 3;
  if (role === 'lead') score = 10;
  else if (role === 'infobox') score = 9;
  else if (role === 'article_section') score = 8;
  else if (role === 'references') score = 6;
  else if (role === 'toc') score = 5;
  else if (role === 'media') score = 5;
  else if (role === 'card') score = 7;
  else if (role === 'section') score = 5;
  if (/\b(plan|tier|price|premium|benefit|feature|monthly|yearly)\b/i.test(text)) score += 2;
  if (/\$\s?\d|\d+[.,]\d{2}/.test(text)) score += 2;
  return Math.min(score, 10);
}

function extractDataElements(snapshot: PageSnapshot, groups: LayoutGroupElement[]): DataElement[] {
  const elements: DataElement[] = [];
  const seen = new Set<string>();
  const pricePattern = /(?:[$]\s?\d+(?:[.,]\d{2})?|\d+(?:[.,]\d{2})?\s?(?:USD|EUR|GBP|INR|\/\s?(?:mo|month|yr|year)))/gi;

  function add(label: string, value: string, selectorHint: string | undefined, confidence: number) {
    const key = `${label.toLowerCase()}::${value.toLowerCase()}::${selectorHint || ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    elements.push({
      id: `data-${elements.length + 1}`,
      label,
      value,
      selectorHint,
      confidence
    });
  }

  groups.forEach((group) => {
    const matches = group.text.match(pricePattern) || [];
    matches.forEach((value) => add(`${group.label} price`, value, group.selectorHint, 0.82));
  });

  snapshot.textBlocks.forEach((block) => {
    const matches = block.text.match(pricePattern) || [];
    matches.forEach((value) => add('price', value, block.selectorHint, 0.72));
  });

  snapshot.tables
    .filter((table) => /infobox/i.test(`${table.caption || ''} ${table.selectorHint}`))
    .forEach((table) => {
      table.rows.forEach((row) => {
        if (row.length < 2) return;
        const label = row[0];
        const value = row.slice(1).join(' | ');
        if (label && value && value.length <= 500) {
          add(`infobox.${label}`, value, table.selectorHint, 0.86);
        }
      });
    });

  return elements;
}

function createRagChunks(blocks: ContentBlock[]): ContentBlock[] {
  const maxChunkChars = 900;
  const overlapChars = 120;
  const chunks: ContentBlock[] = [];

  for (const block of blocks) {
    if (block.text.length <= maxChunkChars) {
      chunks.push({
        ...block,
        id: `${block.id}-chunk-1`,
        tokenEstimate: estimateTokenCount(block.text)
      });
      continue;
    }

    let start = 0;
    let chunkIndex = 1;

    while (start < block.text.length) {
      const end = Math.min(block.text.length, start + maxChunkChars);
      const chunkText = block.text.slice(start, end).trim();

      if (chunkText) {
        chunks.push({
          ...block,
          id: `${block.id}-chunk-${chunkIndex}`,
          text: chunkText,
          tokenEstimate: estimateTokenCount(chunkText),
          sourceOrder: block.sourceOrder * 1000 + chunkIndex
        });
      }

      if (end >= block.text.length) {
        break;
      }

      start = Math.max(0, end - overlapChars);
      chunkIndex++;
    }
  }

  return chunks.sort((a, b) => a.sourceOrder - b.sourceOrder);
}

type StructuredContextSlices = Pick<
  AgentContext,
  'actionableElements' | 'layoutGroups' | 'dataElements' | 'links' | 'forms' | 'tables' | 'media'
>;

function shapeStructuredContext(
  mode: CompileRequest['mode'],
  slices: StructuredContextSlices
): StructuredContextSlices & { note?: string } {
  if (mode === 'debug' || mode === 'detailed') {
    return {
      ...slices,
      note: mode === 'debug'
        ? 'Debug mode preserved all structured context arrays for inspection.'
        : 'Detailed mode preserved full structured context arrays.'
    };
  }

  if (mode === 'rag') {
    return {
      actionableElements: [],
      forms: [],
      links: slices.links.slice(0, 40),
      layoutGroups: slices.layoutGroups
        .filter((group) => ['lead', 'article_section', 'infobox', 'references', 'toc', 'table'].includes(group.role))
        .slice(0, 20),
      dataElements: slices.dataElements.slice(0, 40),
      tables: slices.tables.slice(0, 10),
      media: slices.media
        .filter((item) => item.alt || item.caption)
        .slice(0, 12),
      note: 'RAG mode removed interactive controls and kept chunk-adjacent structured data, tables, media labels, and reference links.'
    };
  }

  if (mode === 'agent_action') {
    const actionRelatedGroupIds = new Set(
      slices.layoutGroups
        .filter((group) => group.childActionIds.length > 0 || /\b(error|required|submit|checkout|login|sign|search|save|continue|next)\b/i.test(group.text))
        .map((group) => group.id)
    );

    return {
      actionableElements: slices.actionableElements,
      forms: slices.forms,
      links: slices.links.slice(0, 60),
      layoutGroups: slices.layoutGroups
        .filter((group) => actionRelatedGroupIds.has(group.id) || group.importanceScore >= 7)
        .slice(0, 24),
      dataElements: slices.dataElements.slice(0, 30),
      tables: slices.tables.slice(0, 6),
      media: slices.media.slice(0, 8),
      note: 'Agent Mode prioritized controls, forms, operational layout groups, and nearby structured data.'
    };
  }

  return {
    actionableElements: slices.actionableElements.slice(0, 12),
    forms: slices.forms.slice(0, 4),
    links: slices.links.slice(0, 25),
    layoutGroups: slices.layoutGroups
      .filter((group) => group.importanceScore >= 6)
      .slice(0, 10),
    dataElements: slices.dataElements.slice(0, 20),
    tables: slices.tables.slice(0, 4),
    media: slices.media
      .filter((item) => item.alt || item.caption)
      .slice(0, 8),
    note: 'Compact mode trimmed structured context arrays to the highest-signal items.'
  };
}

function mergePrivacyReports(
  baseReport: PrivacyReport,
  structuredRedactions: RedactedItem[],
  privacyLevel: CompileRequest['privacyLevel']
): PrivacyReport {
  if (structuredRedactions.length === 0) {
    return baseReport;
  }

  const itemMap = new Map<RedactedItem['type'], { count: number; locations: Set<string> }>();

  function addItem(item: RedactedItem) {
    if (!itemMap.has(item.type)) {
      itemMap.set(item.type, { count: 0, locations: new Set() });
    }

    const merged = itemMap.get(item.type)!;
    merged.count += item.count;
    item.locations.forEach((location) => merged.locations.add(location));
  }

  baseReport.redactedItems.forEach(addItem);
  structuredRedactions.forEach(addItem);

  const redactedItems: RedactedItem[] = Array.from(itemMap.entries()).map(([type, value]) => ({
    type,
    count: value.count,
    locations: Array.from(value.locations)
  }));

  const warnings = [...baseReport.warnings];
  if (!warnings.some((warning) => warning.includes('Structured fields contained sensitive data'))) {
    warnings.push(`Structured fields contained sensitive data which was redacted (level: ${privacyLevel}).`);
  }

  return {
    ...baseReport,
    riskLevel: 'high',
    redactedItems,
    warnings,
    externalSharingAllowed: false
  };
}

function createContentHash(snapshot: PageSnapshot): string {
  const input = [
    snapshot.source.url,
    snapshot.source.title,
    ...snapshot.headings.map((heading) => heading.text),
    ...snapshot.textBlocks.map((block) => block.text)
  ].join('\n');

  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}
