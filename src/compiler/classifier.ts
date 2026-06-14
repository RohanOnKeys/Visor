import { PageSnapshot, PageClassification } from '../shared/types';

export function classifyPage(snapshot: PageSnapshot): PageClassification {
  const url = snapshot.source.url.toLowerCase();
  const title = snapshot.source.title.toLowerCase();
  const semanticRoute = snapshot.metadata.semanticRoute;
  
  // Counts of components
  const formCount = snapshot.forms.length;
  const tableCount = snapshot.tables.length;
  const actionCount = snapshot.actions.length;
  const textCount = snapshot.textBlocks.length;
  const headingCount = snapshot.headings.length;

  let longTextCount = 0;
  let codeSnippetCount = 0;

  for (const block of snapshot.textBlocks) {
    if (block.text.length > 150) longTextCount++;
    // Simple heuristic for code snippets if pre tags didn't isolate them
    if (block.text.includes('{') && block.text.includes('}') && block.text.includes(';')) {
      codeSnippetCount++;
    }
  }

  if (semanticRoute === 'wikipedia_article') {
    return { type: 'article', confidence: 0.93 };
  }

  // 1. Docs page check
  if (
    url.includes('docs') || 
    url.includes('documentation') || 
    codeSnippetCount > 2 ||
    (headingCount > 5 && codeSnippetCount >= 1)
  ) {
    return { type: 'docs', confidence: 0.85 };
  }

  // 2. Form-heavy page check
  if (formCount > 0) {
    // If there are input fields and form elements dominate
    const totalFields = snapshot.forms.reduce((acc, f) => acc + f.fields.length, 0);
    if (totalFields > 3 || (totalFields > 0 && textCount < 5)) {
      return { type: 'form', confidence: 0.9 };
    }
  }

  // 3. Table-heavy page check
  if (tableCount >= 1) {
    const totalRows = snapshot.tables.reduce((acc, t) => acc + t.rows.length, 0);
    if (totalRows > 10 || tableCount > 2) {
      return { type: 'table', confidence: 0.85 };
    }
  }

  // 4. Product page check
  const hasProductKeywords = 
    url.includes('product') || 
    url.includes('shop') || 
    url.includes('store') || 
    url.includes('item') || 
    title.includes('buy') || 
    title.includes('price');
  
  // Search for currency/price indicators in text
  let hasPrice = false;
  for (const block of snapshot.textBlocks) {
    if (/\$[0-9]+(\.[0-9]{2})?/.test(block.text) || /price|cost|usd/i.test(block.text)) {
      hasPrice = true;
      break;
    }
  }

  if (hasProductKeywords && (hasPrice || tableCount >= 1)) {
    return { type: 'product', confidence: 0.8 };
  }

  // 5. Article page check
  if (longTextCount >= 3 && headingCount >= 1 && textCount > headingCount) {
    return { type: 'article', confidence: 0.85 };
  }

  // 6. Dashboard check
  const hasDashboardKeywords = 
    url.includes('dashboard') || 
    url.includes('console') || 
    url.includes('admin') || 
    title.includes('dashboard') || 
    title.includes('console');
  
  if (hasDashboardKeywords || (actionCount > 5 && textCount < 15)) {
    return { type: 'dashboard', confidence: 0.75 };
  }

  // 7. App check
  if (actionCount > 10 && textCount < 8) {
    return { type: 'app', confidence: 0.8 };
  }

  // Fallback
  return { type: 'unknown', confidence: 0.5 };
}
