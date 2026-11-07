/**
 * Suffix Array Construction
 * 
 * Build a sorted array of all suffixes of a string.
 * Time: O(n² log n) naive, O(n log n) optimized
 * Space: O(n)
 */

import { AlgorithmDefinition } from '../../types/algorithm';
import { 
  SuffixInput, 
  SuffixData, 
  StringSnapshot,
  Suffix 
} from '../../types/string';

function generateSuffixArray(input: SuffixInput): StringSnapshot<SuffixData>[] {
  const { text } = input;
  const n = text.length;
  const snapshots: StringSnapshot<SuffixData>[] = [];
  let step = 0;

  // Generate all suffixes
  const suffixes: Suffix[] = [];
  for (let i = 0; i < n; i++) {
    suffixes.push({
      index: i,
      suffix: text.substring(i),
      state: 'default',
    });
  }

  snapshots.push({
    id: `suffix-${step++}`,
    step: snapshots.length,
    description: `Generated ${n} suffixes from "${text}"`,
    data: {
      text,
      suffixes: suffixes.map(s => ({ ...s })),
      currentIndex: -1,
      highlightIndices: [],
    },
    currentLine: 1,
    variables: { n, suffixCount: n },
  });

  // Sort suffixes using comparison-based sort
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      const suffixesCopy = suffixes.map(s => ({ ...s }));
      suffixesCopy[j].state = 'comparing';
      suffixesCopy[j + 1].state = 'comparing';

      snapshots.push({
        id: `suffix-${step++}`,
        step: snapshots.length,
        description: `Comparing suffix[${j}] = "${suffixes[j].suffix}" with suffix[${j+1}] = "${suffixes[j+1].suffix}"`,
        data: {
          text,
          suffixes: suffixesCopy,
          currentIndex: j,
          highlightIndices: [j, j + 1],
        },
        currentLine: 2,
        variables: { i, j, n },
      });

      if (suffixes[j].suffix > suffixes[j + 1].suffix) {
        // Swap
        [suffixes[j], suffixes[j + 1]] = [suffixes[j + 1], suffixes[j]];
        
        const swappedCopy = suffixes.map(s => ({ ...s }));
        swappedCopy[j].state = 'active';
        swappedCopy[j + 1].state = 'active';

        snapshots.push({
          id: `suffix-${step++}`,
          step: snapshots.length,
          description: `Swapped: suffix[${j}] ↔ suffix[${j+1}]`,
          data: {
            text,
            suffixes: swappedCopy,
            currentIndex: j,
            highlightIndices: [j, j + 1],
          },
          currentLine: 3,
          variables: { i, j, n },
        });
      }
    }

    // Mark last i suffixes as sorted
    const sortedCopy = suffixes.map(s => ({ ...s }));
    for (let k = n - i - 1; k < n; k++) {
      sortedCopy[k].state = 'sorted';
    }

    snapshots.push({
      id: `suffix-${step++}`,
      step: snapshots.length,
      description: `Pass ${i + 1} complete. ${i + 1} largest suffix${i > 0 ? 'es' : ''} sorted.`,
      data: {
        text,
        suffixes: sortedCopy,
        currentIndex: -1,
        highlightIndices: [],
      },
      currentLine: 4,
      variables: { i, n, sorted: i + 1 },
    });
  }

  // Build suffix array (indices)
  const suffixArray = suffixes.map(s => s.index);
  
  // Build LCP array (Longest Common Prefix)
  const lcpArray: number[] = new Array(n).fill(0);
  for (let i = 1; i < n; i++) {
    const s1 = suffixes[i - 1].suffix;
    const s2 = suffixes[i].suffix;
    let lcp = 0;
    while (lcp < s1.length && lcp < s2.length && s1[lcp] === s2[lcp]) {
      lcp++;
    }
    lcpArray[i] = lcp;
  }

  const finalSuffixes = suffixes.map((s, idx) => ({
    ...s,
    rank: idx,
    state: 'sorted' as const,
  }));

  snapshots.push({
    id: `suffix-${step++}`,
    step: snapshots.length,
    description: `Suffix array complete. Suffix Array: [${suffixArray.join(', ')}]`,
    data: {
      text,
      suffixes: finalSuffixes,
      suffixArray,
      lcpArray,
      currentIndex: -1,
      highlightIndices: [],
    },
    currentLine: 5,
    variables: { n, suffixArray: `[${suffixArray.join(', ')}]`, lcpArray: `[${lcpArray.join(', ')}]` },
  });

  return snapshots;
}

export const suffixArrayConstruction: AlgorithmDefinition<SuffixInput, SuffixData> = {
  id: 'suffix-array-construction',
  name: 'Suffix Array',
  category: 'string',
  categoryName: 'String Algorithms',
  description: 'Build a sorted array of all suffixes of a string. Enables efficient pattern matching and substring queries. Also computes LCP (Longest Common Prefix) array.',
  difficulty: 'Hard',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n² log n)',
    worst: 'O(n² log n)',
  },
  spaceComplexity: 'O(n)',
  code: [
    'suffixes = []',
    'for i = 0 to n-1:',
    '  suffixes[i] = (i, text[i:])',
    'sort suffixes lexicographically',
    'suffixArray = [suffix.index for suffix in suffixes]',
    'compute LCP array',
  ],
  defaultInput: {
    text: 'BANANA',
  },
  inputConfig: {
    type: 'array',
  },
  generate: generateSuffixArray,
};
