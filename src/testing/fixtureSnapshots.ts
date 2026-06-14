import { PageSnapshot } from '../shared/types';

const capturedAt = '2026-06-14T10:00:00.000Z';

function baseSnapshot(name: string, urlPath: string): PageSnapshot {
  return {
    schemaVersion: 'page_snapshot.v1',
    source: {
      url: `https://fixtures.local/${urlPath}`,
      title: name,
      capturedAt,
      language: 'en'
    },
    metadata: {
      description: `${name} fixture`
    },
    headings: [],
    textBlocks: [],
    links: [],
    actions: [],
    layoutGroups: [],
    forms: [],
    tables: [],
    media: [],
    stats: {
      totalNodes: 20,
      extractedNodes: 10,
      ignoredNodes: 10,
      timeElapsedMs: 5
    },
    warnings: []
  };
}

const article = baseSnapshot('Simple Article', 'simple-article');
article.headings = [
  { id: 'article-h1', text: 'Understanding Local Context', level: 1, selectorHint: 'article > h1', sourceOrder: 1 }
];
article.textBlocks = [
  {
    id: 'article-p1',
    text: 'Local-first browser tools should keep page content on the device while still producing useful structured summaries for agents.',
    selectorHint: 'main > article > p:nth-child(1)',
    sourceOrder: 2,
    parentHeadingId: 'article-h1'
  },
  {
    id: 'article-p2',
    text: 'A compiler pipeline can preserve headings, paragraphs, links, and action labels without copying hidden application state.',
    selectorHint: 'main > article > p:nth-child(2)',
    sourceOrder: 3,
    parentHeadingId: 'article-h1'
  },
  {
    id: 'article-p3',
    text: 'The safest output is explicit about source, capture time, token budget, and privacy status before anyone exports it.',
    selectorHint: 'main > article > p:nth-child(3)',
    sourceOrder: 4,
    parentHeadingId: 'article-h1'
  }
];
article.links = [
  { id: 'article-link', text: 'Read reference', href: 'https://fixtures.local/reference', rel: 'noopener', selectorHint: 'article > a', sourceOrder: 5 }
];

const docs = baseSnapshot('Docs With Code', 'docs');
docs.headings = [
  { id: 'docs-h1', text: 'Compiler API', level: 1, selectorHint: 'main > h1', sourceOrder: 1 },
  { id: 'docs-h2', text: 'Usage', level: 2, selectorHint: 'main > h2', sourceOrder: 2 }
];
docs.textBlocks = [
  {
    id: 'docs-p1',
    text: 'Use the compiler to transform a PageSnapshot into a schema-valid AgentContext with exports.',
    selectorHint: 'main > p',
    sourceOrder: 3,
    parentHeadingId: 'docs-h2'
  },
  {
    id: 'docs-code',
    text: 'const result = compileSnapshot(snapshot, { mode: "detailed", privacyLevel: "medium", tokenBudget: 4000 });',
    selectorHint: 'main > pre > code',
    sourceOrder: 4,
    parentHeadingId: 'docs-h2'
  }
];

const product = baseSnapshot('Product Page', 'product/widget');
product.headings = [
  { id: 'product-h1', text: 'Visor Pro Widget', level: 1, selectorHint: 'main > h1', sourceOrder: 1 }
];
product.textBlocks = [
  {
    id: 'product-price',
    text: 'Buy the Visor Pro Widget today for $49.00 with local-only compilation and privacy checks.',
    selectorHint: 'main > section.product > p.price',
    sourceOrder: 2,
    parentHeadingId: 'product-h1'
  }
];
product.actions = [
  { id: 'product-buy', type: 'button', label: 'Buy Now', selectorHint: 'button.buy', textContext: 'Buy Now', sourceOrder: 3 }
];
product.tables = [
  {
    id: 'product-specs',
    caption: 'Specifications',
    headers: ['Feature', 'Value'],
    rows: [['Mode', 'Local'], ['Export', 'JSON and Markdown']],
    selectorHint: 'table.specs',
    sourceOrder: 4
  }
];

const dashboard = baseSnapshot('Account Dashboard', 'dashboard');
dashboard.headings = [
  { id: 'dashboard-h1', text: 'Dashboard', level: 1, selectorHint: 'main > h1', sourceOrder: 1 }
];
dashboard.textBlocks = [
  {
    id: 'dashboard-metric',
    text: 'Welcome back. Current usage metrics show 82 compiles this week and 4 warnings that need review.',
    selectorHint: 'main > section.metrics',
    sourceOrder: 2,
    parentHeadingId: 'dashboard-h1'
  }
];
dashboard.actions = Array.from({ length: 6 }, (_, index) => ({
  id: `dashboard-action-${index + 1}`,
  type: 'button' as const,
  label: `Dashboard Action ${index + 1}`,
  selectorHint: `button.action-${index + 1}`,
  textContext: `Dashboard Action ${index + 1}`,
  sourceOrder: 3 + index
}));

const formHeavy = baseSnapshot('Form Heavy', 'form-heavy');
formHeavy.headings = [
  { id: 'form-h1', text: 'Create Account', level: 1, selectorHint: 'main > h1', sourceOrder: 1 }
];
formHeavy.forms = [
  {
    id: 'signup-form',
    selectorHint: 'form#signup',
    label: 'Create account',
    fields: [
      { id: 'field-name', name: 'name', type: 'text', label: 'Full name', placeholder: 'Rohan PX', required: true },
      { id: 'field-email', name: 'email', type: 'email', label: 'Email', placeholder: 'you@example.com', required: true },
      { id: 'field-password', name: 'password', type: 'password', label: 'Password', value: 'fixture-password-value' }
    ],
    submitControls: [
      { id: 'signup-submit', type: 'button', label: 'Submit Application', selectorHint: 'form#signup > button', textContext: 'Submit Application', sourceOrder: 5 }
    ],
    sourceOrder: 2
  }
];

const tableHeavy = baseSnapshot('Table Heavy', 'table-heavy');
tableHeavy.headings = [
  { id: 'table-h1', text: 'Usage Table', level: 1, selectorHint: 'main > h1', sourceOrder: 1 }
];
tableHeavy.tables = [
  {
    id: 'usage-table',
    caption: 'Daily Usage',
    headers: ['Day', 'Compiles', 'Warnings'],
    rows: Array.from({ length: 12 }, (_, index) => [`Day ${index + 1}`, String(20 + index), String(index % 3)]),
    selectorHint: 'table.usage',
    sourceOrder: 2
  }
];

const noisyBlog = baseSnapshot('Noisy Blog', 'noisy-blog');
noisyBlog.headings = [
  { id: 'noisy-h1', text: 'Useful Post', level: 1, selectorHint: 'article > h1', sourceOrder: 1 }
];
noisyBlog.textBlocks = [
  { id: 'noisy-main', text: 'This article paragraph should remain because it contains the useful body of the page.', selectorHint: 'article > p', sourceOrder: 2, parentHeadingId: 'noisy-h1' },
  { id: 'noisy-cookie', text: 'Accept cookies and subscribe to our newsletter.', selectorHint: 'div.cookie-consent-banner > p', sourceOrder: 3 },
  { id: 'noisy-ad', text: 'Sponsored advertising module with unrelated promotional text.', selectorHint: 'aside.ad-container > p', sourceOrder: 4 }
];

const hiddenElements = baseSnapshot('Hidden Elements', 'hidden-elements');
hiddenElements.headings = [
  { id: 'hidden-h1', text: 'Visible Heading', level: 1, selectorHint: 'main > h1', sourceOrder: 1 }
];
hiddenElements.textBlocks = [
  { id: 'hidden-visible', text: 'Only visible text appears in this already-extracted snapshot.', selectorHint: 'main > p', sourceOrder: 2, parentHeadingId: 'hidden-h1' }
];
hiddenElements.stats.ignoredNodes = 8;

const secrets = baseSnapshot('Secrets Fixture', 'secrets');
secrets.textBlocks = [
  {
    id: 'secret-text',
    text: 'Contact rohan@example.com, call 555-123-4567, token eyJhbGciOiJIUzI1NiJ9.x.y, and key sk-proj-123456789012345678901234567890123456789012345678.',
    selectorHint: 'main > p.secret',
    sourceOrder: 1
  }
];

const largePage = baseSnapshot('Large Page', 'large-page');
largePage.headings = [
  { id: 'large-h1', text: 'Large Documentation Page', level: 1, selectorHint: 'main > h1', sourceOrder: 1 }
];
largePage.textBlocks = Array.from({ length: 80 }, (_, index) => ({
  id: `large-p-${index + 1}`,
  text: `Large fixture paragraph ${index + 1}. This block contains enough descriptive text to exercise token budgeting and deterministic ordering across a long page.`,
  selectorHint: `main > article > p:nth-child(${index + 1})`,
  sourceOrder: index + 2,
  parentHeadingId: 'large-h1'
}));
largePage.stats.totalNodes = 15000;
largePage.warnings = [
  { type: 'node_limit', message: 'Page size limit exceeded. Extraction has been capped.' }
];

const wikipediaArticle = baseSnapshot('Artificial intelligence - Wikipedia', 'wiki/artificial-intelligence');
wikipediaArticle.source.url = 'https://en.wikipedia.org/wiki/Artificial_intelligence';
wikipediaArticle.metadata.semanticRoute = 'wikipedia_article';
wikipediaArticle.headings = [
  { id: 'firstHeading', text: 'Artificial intelligence', level: 1, selectorHint: '#firstHeading', sourceOrder: 1 },
  { id: 'toc-history', text: 'History', level: 2, selectorHint: '#History', sourceOrder: 8 },
  { id: 'toc-references', text: 'References', level: 2, selectorHint: '#References', sourceOrder: 20 }
];
wikipediaArticle.textBlocks = [
  {
    id: 'wiki-lead-p1',
    text: 'Artificial intelligence is the capability of computational systems to perform tasks typically associated with human intelligence.',
    selectorHint: '.mw-parser-output > p',
    sourceOrder: 2,
    parentHeadingId: 'firstHeading'
  },
  {
    id: 'wiki-history-p1',
    text: 'The field of artificial intelligence research was founded as an academic discipline in 1956.',
    selectorHint: '#History',
    sourceOrder: 9,
    parentHeadingId: 'toc-history'
  }
];
wikipediaArticle.layoutGroups = [
  {
    id: 'wikipedia-lead',
    label: 'Artificial intelligence lead',
    role: 'lead',
    text: 'Artificial intelligence is the capability of computational systems to perform tasks typically associated with human intelligence.',
    selectorHint: '.mw-parser-output > p',
    sourceOrder: 3,
    childActionIds: [],
    childMediaIds: []
  },
  {
    id: 'wikipedia-toc',
    label: 'Table of contents',
    role: 'toc',
    text: 'History\nGoals\nApplications\nReferences',
    selectorHint: '#toc',
    sourceOrder: 4,
    childActionIds: [],
    childMediaIds: []
  },
  {
    id: 'wikipedia-infobox',
    label: 'Artificial intelligence infobox',
    role: 'infobox',
    text: 'Artificial intelligence\nMajor goals\nReasoning\nKnowledge representation\nPlanning',
    selectorHint: 'table.infobox',
    sourceOrder: 5,
    childActionIds: [],
    childMediaIds: ['wiki-media-1']
  },
  {
    id: 'wikipedia-references',
    label: 'References',
    role: 'references',
    text: 'Russell, Stuart; Norvig, Peter. Artificial Intelligence: A Modern Approach.',
    selectorHint: '.reflist',
    sourceOrder: 21,
    childActionIds: [],
    childMediaIds: []
  }
];
wikipediaArticle.tables = [
  {
    id: 'wiki-infobox-table',
    caption: 'Artificial intelligence infobox',
    headers: [],
    rows: [
      ['Major goals', 'Reasoning | Knowledge representation | Planning'],
      ['Approaches', 'Machine learning | Logic | Search']
    ],
    selectorHint: 'table.infobox',
    sourceOrder: 6
  }
];
wikipediaArticle.media = [
  {
    id: 'wiki-media-1',
    type: 'image',
    alt: 'A robot hand touching a human hand',
    caption: 'Symbolic image for artificial intelligence',
    src: 'https://upload.wikimedia.org/example.jpg',
    selectorHint: '.thumb',
    sourceOrder: 7
  }
];

export const fixtureSnapshots = {
  article,
  docs,
  product,
  dashboard,
  formHeavy,
  tableHeavy,
  noisyBlog,
  hiddenElements,
  secrets,
  largePage,
  wikipediaArticle
} satisfies Record<string, PageSnapshot>;
