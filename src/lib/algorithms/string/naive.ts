/**
 * Naive String Matching Algorithm
 * 
 * Brute force pattern matching that checks all possible positions.
 * Time: O(nm) where n = text length, m = pattern length
 * Space: O(1)
 */

import { AlgorithmDefinition } from '../../types/algorithm';
import { 
  PatternMatchInput, 
  PatternMatchData, 
  StringSnapshot, 
  StringChar 
} from '../../types/string';

function createTextChars(text: string, state = 'default' as const): StringChar[] {
  return text.split('').map((char, index) => ({ char, index, state }));
}

function createPatternChars(pattern: string, state = 'default' as const): StringChar[] {
  return pattern.split('').map((char, index) => ({ char, index, state }));
}

function generateNaive(input: PatternMatchInput): StringSnapshot<PatternMatchData>[] {
  const { text, pattern } = input;
  const n = text.length;
  const m = pattern.length;
  const snapshots: StringSnapshot<PatternMatchData>[] = [];
  let step = 0;
  let comparisons = 0;
  const matches: number[] = [];

  // Initial state
  snapshots.push({
    id: `naive-${step++}`,
    step: snapshots.length,
    description: `Starting naive string matching. Text length: ${n}, Pattern length: ${m}`,
    data: {
      text: createTextChars(text),
      pattern: createPatternChars(pattern),
      textPointer: 0,
      patternPointer: 0,
      matches: [],
      comparisons: 0,
      algorithm: 'Naive',
    },
    currentLine: 1,
    variables: { n, m, i: 0, j: 0, matches: 0 },
  });

  // Try each position in text
  for (let i = 0; i <= n - m; i++) {
    // Show starting position
    const textChars = createTextChars(text);
    textChars[i].state = 'text-position';
    
    snapshots.push({
      id: `naive-${step++}`,
      step: snapshots.length,
      description: `Checking position ${i} in text`,
      data: {
        text: textChars,
        pattern: createPatternChars(pattern),
        textPointer: i,
        patternPointer: 0,
        matches: [...matches],
        comparisons,
        algorithm: 'Naive',
      },
      currentLine: 2,
      variables: { n, m, i, j: 0, matches: matches.length },
    });

    // Compare pattern with text at position i
    let j = 0;
    while (j < m) {
      comparisons++;
      
      const textChars = createTextChars(text);
      const patternChars = createPatternChars(pattern);
      
      // Highlight current comparison
      textChars[i + j].state = 'comparing';
      patternChars[j].state = 'comparing';
      
      // Show previous matches
      for (let k = 0; k < j; k++) {
        textChars[i + k].state = 'match';
        patternChars[k].state = 'match';
      }

      const isMatch = text[i + j] === pattern[j];
      
      snapshots.push({
        id: `naive-${step++}`,
        step: snapshots.length,
        description: `Comparing text[${i + j}] = '${text[i + j]}' with pattern[${j}] = '${pattern[j]}': ${isMatch ? 'Match ✓' : 'Mismatch ✗'}`,
        data: {
          text: textChars,
          pattern: patternChars,
          textPointer: i + j,
          patternPointer: j,
          matches: [...matches],
          comparisons,
          algorithm: 'Naive',
        },
        currentLine: 3,
        variables: { n, m, i, j, matches: matches.length, comparisons },
      });

      if (!isMatch) {
        // Mismatch - show and break
        textChars[i + j].state = 'mismatch';
        patternChars[j].state = 'mismatch';
        
        snapshots.push({
          id: `naive-${step++}`,
          step: snapshots.length,
          description: `Mismatch at position ${i + j}. Moving to next position.`,
          data: {
            text: textChars,
            pattern: patternChars,
            textPointer: i + j,
            patternPointer: j,
            matches: [...matches],
            comparisons,
            algorithm: 'Naive',
          },
          currentLine: 4,
          variables: { n, m, i, j, matches: matches.length, comparisons },
        });
        break;
      }

      j++;
    }

    // Check if we found a complete match
    if (j === m) {
      matches.push(i);
      
      const textChars = createTextChars(text);
      const patternChars = createPatternChars(pattern);
      
      // Highlight the match
      for (let k = 0; k < m; k++) {
        textChars[i + k].state = 'found';
        patternChars[k].state = 'found';
      }
      
      snapshots.push({
        id: `naive-${step++}`,
        step: snapshots.length,
        description: `✓ Pattern found at position ${i}!`,
        data: {
          text: textChars,
          pattern: patternChars,
          textPointer: i,
          patternPointer: 0,
          matches: [...matches],
          comparisons,
          algorithm: 'Naive',
        },
        currentLine: 5,
        variables: { n, m, i, j: m, matches: matches.length, comparisons },
      });
    }
  }

  // Final result
  const finalTextChars = createTextChars(text);
  matches.forEach(pos => {
    for (let k = 0; k < m; k++) {
      finalTextChars[pos + k].state = 'found';
    }
  });

  snapshots.push({
    id: `naive-${step++}`,
    step: snapshots.length,
    description: `Search complete. Found ${matches.length} match${matches.length !== 1 ? 'es' : ''} with ${comparisons} comparisons.`,
    data: {
      text: finalTextChars,
      pattern: createPatternChars(pattern),
      textPointer: -1,
      patternPointer: -1,
      matches,
      comparisons,
      algorithm: 'Naive',
    },
    currentLine: 6,
    variables: { n, m, matches: matches.length, comparisons },
  });

  return snapshots;
}

export const naiveStringMatch: AlgorithmDefinition<PatternMatchInput, PatternMatchData> = {
  id: 'naive-string-match',
  name: 'Naive String Matching',
  category: 'string',
  categoryName: 'String Algorithms',
  description: 'Brute force pattern matching that checks every possible position in the text. Simple but inefficient for large inputs.',
  difficulty: 'Easy',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(nm)',
    worst: 'O(nm)',
  },
  spaceComplexity: 'O(1)',
  code: [
    'for i = 0 to n - m:',
    '  for j = 0 to m - 1:',
    '    if text[i + j] ≠ pattern[j]:',
    '      break',
    '  if j == m:',
    '    report match at position i',
  ],
  defaultInput: {
    text: 'ABABCABABA',
    pattern: 'ABA',
  },
  inputConfig: {
    type: 'array',
  },
  generate: generateNaive,
};
