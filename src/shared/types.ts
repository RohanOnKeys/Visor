// Shared TypeScript Types for Visor DOM-to-Agent Context Compiler

export type PageSnapshot = {
  schemaVersion: 'page_snapshot.v1';
  source: {
    url: string;
    canonicalUrl?: string;
    title: string;
    capturedAt: string;
    language?: string;
  };
  metadata: Record<string, string>;
  headings: HeadingBlock[];
  textBlocks: TextBlock[];
  links: LinkBlock[];
  actions: ActionBlock[];
  layoutGroups: LayoutGroupBlock[];
  forms: FormBlock[];
  tables: TableBlock[];
  media: MediaBlock[];
  stats: DOMStats;
  warnings: ExtractionWarning[];
};

export type HeadingBlock = {
  id: string;
  text: string;
  level: number; // 1-6
  selectorHint: string;
  sourceOrder: number;
};

export type TextBlock = {
  id: string;
  text: string;
  selectorHint: string;
  sourceOrder: number;
  parentHeadingId?: string;
};

export type LinkBlock = {
  id: string;
  text: string;
  href: string;
  title?: string;
  rel?: string;
  selectorHint: string;
  sourceOrder: number;
};

export type ActionBlock = {
  id: string;
  type: 'button' | 'link' | 'input' | 'select' | 'textarea' | 'form';
  label: string;
  selectorHint: string;
  textContext: string;
  disabled?: boolean;
  required?: boolean;
  sourceOrder: number;
};

export type LayoutGroupBlock = {
  id: string;
  label: string;
  role: LayoutGroupRole;
  text: string;
  selectorHint: string;
  sourceOrder: number;
  childActionIds: string[];
  childMediaIds: string[];
};

export type LayoutGroupRole =
  | 'lead'
  | 'toc'
  | 'infobox'
  | 'article_section'
  | 'references'
  | 'media'
  | 'card'
  | 'section'
  | 'list'
  | 'nav'
  | 'dialog'
  | 'region'
  | 'generic';

export type FormBlock = {
  id: string;
  selectorHint: string;
  label?: string;
  purpose?: string;
  fields: FormField[];
  submitControls: ActionBlock[];
  sourceOrder: number;
};

export type FormField = {
  id: string;
  name?: string;
  type: string; // text, email, number, checkbox, radio, password, OTP, etc.
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string; // Note: sensitive fields should have this redacted or missing
};

export type TableBlock = {
  id: string;
  caption?: string;
  headers: string[];
  rows: string[][];
  selectorHint: string;
  sourceOrder: number;
};

export type MediaBlock = {
  id: string;
  type: 'image' | 'video' | 'audio' | 'canvas' | 'other';
  alt?: string;
  caption?: string;
  src?: string;
  selectorHint: string;
  sourceOrder: number;
};

export type DOMStats = {
  totalNodes: number;
  extractedNodes: number;
  ignoredNodes: number;
  timeElapsedMs: number;
};

export type ExtractionWarning = {
  type: 'shadow_dom' | 'iframe' | 'node_limit' | 'size_limit' | 'canvas_only' | 'error' | 'other';
  message: string;
  details?: string;
};

// --- AgentContext Types ---

export type AgentContextSchemaVersion =
  | 'agent_context.compact.v1'
  | 'agent_context.detailed.v1'
  | 'agent_context.agent_action.v1'
  | 'agent_context.rag.v1'
  | 'agent_context.debug.v1';

export type ModeProfile = {
  mode: CompileRequest['mode'];
  schemaVersion: AgentContextSchemaVersion;
  objective: string;
  includedSections: string[];
  omittedSections: string[];
  tokenTarget: number;
  tokenTolerance: number;
};

export type AgentContext = {
  schemaVersion: AgentContextSchemaVersion;
  compileMode: CompileRequest['mode'];
  modeProfile: ModeProfile;
  source: SourceInfo;
  pageClassification: PageClassification;
  summary: ContextSummary;
  hierarchy: HeadingNode[];
  mainContent: ContentBlock[];
  actionableElements: ActionElement[];
  layoutGroups: LayoutGroupElement[];
  dataElements: DataElement[];
  links: LinkElement[];
  forms: FormElement[];
  tables: TableElement[];
  media: MediaElement[];
  tokenProfile: TokenProfile;
  privacyReport: PrivacyReport;
  compilerNotes: CompilerNote[];
};

export type SourceInfo = {
  url: string;
  canonicalUrl?: string;
  title: string;
  capturedAt: string;
  language?: string;
  contentHash?: string;
};

export type PageClassification = {
  type: 'article' | 'docs' | 'dashboard' | 'product' | 'social' | 'form' | 'table' | 'app' | 'unknown';
  confidence: number;
};

export type ContextSummary = {
  short: string;
  method: 'extractive' | 'heuristic' | 'none';
};

export type HeadingNode = {
  id: string;
  text: string;
  level: number;
  children: HeadingNode[];
};

export type ContentBlock = {
  id: string;
  kind: 'heading' | 'paragraph' | 'list' | 'quote' | 'code' | 'status' | 'error' | 'other';
  text: string;
  headingPath: string[];
  selectorHint?: string;
  importanceScore: number;
  tokenEstimate: number;
  sourceOrder: number;
};

export type ActionElement = {
  id: string;
  type: 'button' | 'link' | 'input' | 'select' | 'textarea' | 'form';
  label: string;
  selectorHint: string;
  textContext: string;
  actionPurpose: string; // AI/heuristic-guessed action purpose
  confidence: number;
  disabled?: boolean;
  required?: boolean;
  privacySensitive?: boolean;
};

export type LayoutGroupElement = {
  id: string;
  label: string;
  role: LayoutGroupRole;
  text: string;
  selectorHint?: string;
  childActionIds: string[];
  childMediaIds: string[];
  importanceScore: number;
};

export type DataElement = {
  id: string;
  label: string;
  value: string;
  selectorHint?: string;
  confidence: number;
};

export type LinkElement = {
  id: string;
  text: string;
  href: string;
  headingPath: string[];
  selectorHint?: string;
};

export type FormElement = {
  id: string;
  selectorHint: string;
  label?: string;
  purpose?: string;
  fields: FormField[];
  submitControls: ActionElement[];
};

export type TableElement = {
  id: string;
  caption?: string;
  headingPath: string[];
  headers: string[];
  rows: string[][];
  truncated?: boolean;
  selectorHint?: string;
};

export type MediaElement = {
  id: string;
  type: 'image' | 'video' | 'audio' | 'canvas' | 'other';
  alt?: string;
  caption?: string;
  src?: string;
  selectorHint?: string;
};

export type TokenProfile = {
  rawEstimatedTokens: number;
  compiledEstimatedTokens: number;
  removedNoiseTokens: number;
  compressionRatio: number; // 0.0 to 1.0
  budget: number;
  budgetStatus: 'under_budget' | 'near_budget' | 'over_budget_trimmed';
};

export type PrivacyReport = {
  riskLevel: 'low' | 'medium' | 'high';
  redactionLevel: 'low' | 'medium' | 'strict';
  redactedItems: RedactedItem[];
  warnings: string[];
  externalSharingAllowed: boolean;
};

export type RedactedItem = {
  type: 'email' | 'phone' | 'password' | 'api_key' | 'jwt' | 'credit_card_like' | 'token' | 'other';
  count: number;
  locations: string[]; // references block IDs
};

export type CompilerNote = {
  level: 'info' | 'warning' | 'error';
  category: 'deduplication' | 'filtering' | 'budgeting' | 'scoring' | 'classification';
  message: string;
};

// --- Storage & Settings Types ---

export type UserSettings = {
  defaultMode: 'compact' | 'detailed' | 'agent_action' | 'rag' | 'debug';
  privacyLevel: 'low' | 'medium' | 'strict';
  tokenBudget: number;
  defaultExport: 'json' | 'markdown' | 'prompt_block';
  debugMode: boolean;
  autoCompile: boolean;
  widgetEnabled: boolean;
  blockedDomains: string[];
};

export type SiteProfile = {
  id: string;
  domain: string; // e.g. "github.com" or "wikipedia.org"
  preserveSelectors: string[];
  ignoreSelectors: string[];
  mainContentSelector?: string;
  privacyLevelOverride?: 'low' | 'medium' | 'strict';
  createdAt: string;
  updatedAt: string;
};

export type RecentCompileMetadata = {
  id: string;
  url: string;
  title: string;
  createdAt: string;
  mode: string;
  tokenCount: number;
  riskLevel: string;
};

export type AgentProvider = 'chatgpt' | 'grok' | 'gemini' | 'claude';

export type PendingAgentExport = {
  provider: AgentProvider;
  text: string;
  createdAt: string;
  sourceTitle?: string;
  sourceUrl?: string;
};

// --- Communication Protocol Types ---

export type CompileRequest = {
  mode: 'compact' | 'detailed' | 'agent_action' | 'rag' | 'debug';
  privacyLevel: 'low' | 'medium' | 'strict';
  tokenBudget: number;
  siteProfile?: SiteProfile;
};

export type CompileResponse = 
  | {
      ok: true;
      snapshot: PageSnapshot;
      context: AgentContext;
      exports: {
        json: string;
        markdown: string;
        promptBlock: string;
      };
    }
  | {
      ok: false;
      errorCode: string;
      userMessage: string;
      debug?: unknown;
    };
