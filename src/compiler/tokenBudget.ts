import { ContentBlock, TokenProfile } from '../shared/types';

export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  // Character count divided by 4 is the standard heuristic for English
  return Math.ceil(text.length / 4);
}

export function applyTokenBudget(
  blocks: ContentBlock[],
  budget: number
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

  // 3. We are over budget - perform prioritized trimming
  notes.push(`Total content tokens (${rawEstimatedTokens}) exceeded token budget (${budget}). Trimming lowest score blocks.`);

  // Sort blocks by importanceScore descending to prioritize high value blocks
  // If scores are equal, preserve DOM source order
  const sortedBlocks = [...blocks].sort((a, b) => {
    if (b.importanceScore !== a.importanceScore) {
      return b.importanceScore - a.importanceScore;
    }
    return a.sourceOrder - b.sourceOrder;
  });

  const budgetedBlocks: ContentBlock[] = [];
  let currentTokens = 0;

  for (const block of sortedBlocks) {
    if (currentTokens + block.tokenEstimate <= budget) {
      budgetedBlocks.push(block);
      currentTokens += block.tokenEstimate;
    } else {
      // Skip this block as it doesn't fit in the budget anymore
      // (Optional: we can chunk it, but dropping it fits the schema better)
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
