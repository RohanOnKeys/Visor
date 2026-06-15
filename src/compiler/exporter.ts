import { AgentContext } from '../shared/types';

export function formatAsMarkdown(context: AgentContext): string {
  const lines: string[] = [];
  
  // Header details
  lines.push(`# ${context.source.title}`);
  lines.push(`**Source URL:** [${context.source.url}](${context.source.url})`);
  lines.push(`**Captured At:** ${context.source.capturedAt}`);
  lines.push(`**Page Type:** ${context.pageClassification.type} (confidence: ${(context.pageClassification.confidence * 100).toFixed(0)}%)`);
  lines.push(`**Token Count:** ${context.tokenProfile.compiledEstimatedTokens} tokens`);
  lines.push('');

  // Privacy Warning if any risks detected
  if (context.privacyReport.riskLevel !== 'low') {
    lines.push('> [!WARNING]');
    lines.push(`> **Privacy Risk Warning:** Visor classified this page with a **${context.privacyReport.riskLevel.toUpperCase()}** privacy risk level.`);
    context.privacyReport.warnings.forEach((warning) => {
      lines.push(`> - ${warning}`);
    });
    lines.push('');
  }

  // Summary
  if (context.summary.short) {
    lines.push('## Page Summary');
    lines.push(context.summary.short);
    lines.push('');
  }

  // Content Blocks
  lines.push('## Page Content');
  context.mainContent.forEach((block) => {
    if (block.kind === 'heading') {
      const levelPrefix = '#'.repeat(Math.min(5, block.headingPath.length + 2));
      lines.push(`${levelPrefix} ${block.text}`);
    } else if (block.kind === 'code') {
      lines.push('```');
      lines.push(block.text);
      lines.push('```');
    } else if (block.kind === 'quote') {
      lines.push(`> ${block.text}`);
    } else {
      lines.push(block.text);
    }
    lines.push('');
  });

  if (context.layoutGroups.length > 0) {
    lines.push('## Semantic Regions');
    context.layoutGroups
      .filter((group) => group.importanceScore >= 5)
      .sort((a, b) => b.importanceScore - a.importanceScore)
      .forEach((group) => {
        lines.push(`### ${group.label} (${group.role})`);
        lines.push(group.text);
        if (group.childActionIds.length > 0) {
          lines.push(`Actions in group: ${group.childActionIds.join(', ')}`);
        }
        lines.push('');
      });
  }

  if (context.dataElements.length > 0) {
    lines.push('## Data Elements');
    context.dataElements.forEach((element) => {
      lines.push(`- **${element.label}:** ${element.value}`);
    });
    lines.push('');
  }

  // Actionable Elements
  if (context.actionableElements.length > 0) {
    lines.push('## Actionable Elements');
    context.actionableElements.forEach((el) => {
      const sensitivity = el.privacySensitive ? ' [Sensitive]' : '';
      const disabled = el.disabled ? ' (Disabled)' : '';
      lines.push(`- **${el.label}** [${el.type}] - Selector: \`${el.selectorHint}\`${disabled}${sensitivity}`);
    });
    lines.push('');
  }

  // Tables
  if (context.tables.length > 0) {
    lines.push('## Tables');
    context.tables.forEach((t) => {
      if (t.caption) {
        lines.push(`### Table: ${t.caption}`);
      } else {
        lines.push(`### Table (Selector: \`${t.selectorHint}\`)`);
      }
      
      if (t.headers.length > 0) {
        lines.push(`| ${t.headers.join(' | ')} |`);
        lines.push(`| ${t.headers.map(() => '---').join(' | ')} |`);
      }
      
      t.rows.forEach((row) => {
        lines.push(`| ${row.join(' | ')} |`);
      });
      lines.push('');
    });
  }

  // Forms
  if (context.forms.length > 0) {
    lines.push('## Forms');
    context.forms.forEach((f) => {
      lines.push(`### Form: ${f.label || 'Unnamed Form'} (Selector: \`${f.selectorHint}\`)`);
      f.fields.forEach((field) => {
        const req = field.required ? ' *' : '';
        const placeholder = field.placeholder ? ` (placeholder: "${field.placeholder}")` : '';
        const value = field.value ? ` [Value: ${field.value}]` : '';
        lines.push(`- Field **${field.label || field.name || 'Unnamed'}** [Type: ${field.type}]${req}${placeholder}${value}`);
      });
      
      if (f.submitControls.length > 0) {
        lines.push('- Submit controls:');
        f.submitControls.forEach((sub) => {
          lines.push(`  - **${sub.label}** (Selector: \`${sub.selectorHint}\`)`);
        });
      }
      lines.push('');
    });
  }

  if (context.media.length > 0) {
    lines.push('## Media');
    context.media.forEach((item) => {
      lines.push(`- ${item.type}: ${item.alt || item.caption || item.src || item.id}`);
    });
    lines.push('');
  }

  return lines.join('\n').trim();
}

export function formatAsPromptBlock(context: AgentContext): string {
  const lines: string[] = [];

  lines.push(`Source URL: ${context.source.url}`);
  lines.push(`Page Title: ${context.source.title}`);
  lines.push('');
  
  if (context.summary.short) {
    lines.push(`Summary:\n${context.summary.short}`);
    lines.push('');
  }

  context.mainContent.forEach((block) => {
    if (block.kind === 'heading') {
      lines.push(`[Heading] ${block.text}`);
    } else if (block.kind === 'code') {
      lines.push(`[Code Block]\n${block.text}\n[End Code Block]`);
    } else {
      lines.push(block.text);
    }
  });

  if (context.layoutGroups.length > 0) {
    lines.push('\nSemantic Regions:');
    context.layoutGroups
      .filter((group) => group.importanceScore >= 5)
      .sort((a, b) => b.importanceScore - a.importanceScore)
      .forEach((group) => {
        lines.push(`- ${group.label} (${group.role}): ${group.text}`);
      });
  }

  if (context.dataElements.length > 0) {
    lines.push('\nStructured Data Elements:');
    context.dataElements.forEach((element) => {
      lines.push(`- ${element.label}: ${element.value}`);
    });
  }

  if (context.actionableElements.length > 0) {
    lines.push('\nActionable Elements:');
    context.actionableElements.forEach((el) => {
      lines.push(`- Element: "${el.label}" (Type: ${el.type}, Selector: ${el.selectorHint})`);
    });
  }

  if (context.media.length > 0) {
    lines.push('\nMedia:');
    context.media.forEach((item) => {
      lines.push(`- ${item.type}: ${item.alt || item.caption || item.src || item.id}`);
    });
  }

  return lines.join('\n');
}
