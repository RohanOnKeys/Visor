import { ContentBlock, TokenProfile } from '../shared/types';

const TOKEN_TOLERANCE = 100;

export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  // Character count divided by 4 is the standard heuristic for English
  return Math.ceil(text.length / 4);
}

export function applyTokenBudget(
  blocks: ContentBlock[],
  budget: number,
  tolerance = TOKEN_TOLERANCE
): {
  budgetedBlocks: ContentBlock[];
  profile: TokenProfile;
  compilerNotes: string[];
} {
  const notes: string[] = [];
  
  // 1. Calculate raw token count of all candidate blocks
  let rawEstimatedTokens = 0;
  for (const block of blocks) {
    rawEstimatedTokens += block.tokenEstimate;
  }

  // 2. Check if we are within budget
  if (rawEstimatedTokens <= budget) {
    const compressionRatio = rawEstimatedTokens > 0 ? parseFloat((rawEstimatedTokens / rawEstimatedTokens).toFixed(2)) : 1.0;
    return {
      budgetedBlocks: blocks,
      profile: {
        rawEstimatedTokens,
        compiledEstimatedTokens: rawEstimatedTokens,
        removedNoiseTokens: 0,
        compressionRatio,
        budget,
        budgetStatus: 'under_budget'
      },
      compilerNotes: []
    };
  }

  // 3. We are over budget - perform prioritized trimming with a final clipped fill block.
  notes.push(`Total content tokens (${rawEstimatedTokens}) exceeded token budget (${budget}). Trimming and clipping lower priority content toward a +/-${tolerance} token target.`);

  // Sort blocks by importanceScore descending to prioritize high value blocks
  // If scores are equal, preserve DOM source order
  const sortedBlocks = [...blocks].sort((a, b) => {
    if (b.importanceScore !== a.importanceScore) {
      return b.importanceScore - a.importanceScore;
    }
    return a.sourceOrder - b.sourceOrder;
  });

  const budgetedBlocks: ContentBlock[] = [];
  const skippedBlocks: ContentBlock[] = [];
  let currentTokens = 0;

  for (const block of sortedBlocks) {
    if (currentTokens + block.tokenEstimate <= budget) {
      budgetedBlocks.push(block);
      currentTokens += block.tokenEstimate;
    } else {
      skippedBlocks.push(block);
    }
  }

  if (budget - currentTokens > tolerance && skippedBlocks.length > 0) {
    const remainingTokens = budget - currentTokens;
    const filler = skippedBlocks.find((block) => block.text.length > 0);

    if (filler) {
      const clipped = clipBlockToTokenBudget(filler, remainingTokens);
      if (clipped.tokenEstimate > 0) {
        budgetedBlocks.push(clipped);
        currentTokens += clipped.tokenEstimate;
        notes.push(`Added a clipped block (${clipped.id}) to land closer to the requested budget.`);
      }
    }
  }

  // Re-sort the kept blocks by their original sourceOrder so they read chronologically
  budgetedBlocks.sort((a, b) => a.sourceOrder - b.sourceOrder);

  const removedNoiseTokens = rawEstimatedTokens - currentTokens;
  const compressionRatio = rawEstimatedTokens > 0 ? parseFloat((currentTokens / rawEstimatedTokens).toFixed(2)) : 0.0;

  let budgetStatus: TokenProfile['budgetStatus'] = 'under_budget';
  if (currentTokens > budget * 0.9) {
    budgetStatus = 'over_budget_trimmed';
  } else {
    budgetStatus = 'near_budget';
  }

  return {
    budgetedBlocks,
    profile: {
      rawEstimatedTokens,
      compiledEstimatedTokens: currentTokens,
      removedNoiseTokens,
      compressionRatio,
      budget,
      budgetStatus
    },
    compilerNotes: notes
  };
}

function clipBlockToTokenBudget(block: ContentBlock, maxTokens: number): ContentBlock {
  const maxChars = Math.max(0, maxTokens * 4);
  const clippedText = block.text.slice(0, maxChars).replace(/\s+\S*$/, '').trim();
  const suffix = block.text.length > clippedText.length ? ' ...' : '';
  const text = clippedText ? `${clippedText}${suffix}` : '';

  return {
    ...block,
    id: `${block.id}-budget-fill`,
    text,
    tokenEstimate: estimateTokenCount(text),
    sourceOrder: block.sourceOrder
  };
}
