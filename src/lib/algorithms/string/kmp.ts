/**
 * Knuth-Morris-Pratt (KMP) Algorithm
 * 
 * Efficient pattern matching using LPS (Longest Proper Prefix which is also Suffix) array
 * to avoid redundant comparisons.
 * Time: O(n + m)
 * Space: O(m)
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

function computeLPS(pattern: string, snapshots: StringSnapshot<PatternMatchData>[], step: { count: number }): number[] {
  const m = pattern.length;
  const lps: number[] = new Array(m).fill(0);
  let len = 0; // Length of previous longest prefix suffix
  let i = 1;

  snapshots.push({
    id: `kmp-${step.count++}`,
    step: snapshots.length,
    description: 'Building LPS (Longest Proper Prefix which is also Suffix) array for pattern',
    data: {
      text: createTextChars(''),
      pattern: createPatternChars(pattern),
      textPointer: -1,
      patternPointer: 0,
      matches: [],
      comparisons: 0,
      algorithm: 'KMP',
      lps: [...lps],
    },
    currentLine: 1,
    variables: { m, len, i: 0, lps: `[${lps.join(', ')}]` },
  });

  while (i < m) {
    const patternChars = createPatternChars(pattern);
    patternChars[i].state = 'comparing';
    if (len > 0) patternChars[len].state = 'comparing';

    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      
      snapshots.push({
        id: `kmp-${step.count++}`,
        step: snapshots.length,
        description: `pattern[${i}] = pattern[${len - 1}]: Match! Set LPS[${i}] = ${len}`,
        data: {
          text: createTextChars(''),
          pattern: patternChars,
          textPointer: -1,
          patternPointer: i,
          matches: [],
          comparisons: 0,
          algorithm: 'KMP',
          lps: [...lps],
        },
        currentLine: 2,
        variables: { m, len, i, lps: `[${lps.join(', ')}]` },
      });
      
      i++;
    } else {
      if (len !== 0) {
        len = lps[len - 1];
        
        snapshots.push({
          id: `kmp-${step.count++}`,
          step: snapshots.length,
          description: `Mismatch. Using LPS: len = LPS[${len}] = ${lps[len]}`,
          data: {
            text: createTextChars(''),
            pattern: patternChars,
            textPointer: -1,
            patternPointer: i,
            matches: [],
            comparisons: 0,
            algorithm: 'KMP',
            lps: [...lps],
          },
          currentLine: 3,
          variables: { m, len, i, lps: `[${lps.join(', ')}]` },
        });
      } else {
        lps[i] = 0;
        
        snapshots.push({
          id: `kmp-${step.count++}`,
          step: snapshots.length,
          description: `No prefix match. Set LPS[${i}] = 0`,
          data: {
            text: createTextChars(''),
            pattern: patternChars,
            textPointer: -1,
            patternPointer: i,
            matches: [],
            comparisons: 0,
            algorithm: 'KMP',
            lps: [...lps],
          },
          currentLine: 4,
          variables: { m, len, i, lps: `[${lps.join(', ')}]` },
        });
        
        i++;
      }
    }
  }

  snapshots.push({
    id: `kmp-${step.count++}`,
    step: snapshots.length,
    description: `LPS array complete: [${lps.join(', ')}]. Now searching for pattern in text.`,
    data: {
      text: createTextChars(''),
      pattern: createPatternChars(pattern),
      textPointer: -1,
      patternPointer: -1,
      matches: [],
      comparisons: 0,
      algorithm: 'KMP',
      lps: [...lps],
    },
    currentLine: 5,
    variables: { m, lps: `[${lps.join(', ')}]` },
  });

  return lps;
}

function generateKMP(input: PatternMatchInput): StringSnapshot<PatternMatchData>[] {
  const { text, pattern } = input;
  const n = text.length;
  const m = pattern.length;
  const snapshots: StringSnapshot<PatternMatchData>[] = [];
  const step = { count: 0 };
  let comparisons = 0;
  const matches: number[] = [];

  // Build LPS array
  const lps = computeLPS(pattern, snapshots, step);

  // Search pattern in text
  let i = 0; // index for text
  let j = 0; // index for pattern

  snapshots.push({
    id: `kmp-${step.count++}`,
    step: snapshots.length,
    description: `Starting KMP search. Text length: ${n}, Pattern length: ${m}`,
    data: {
      text: createTextChars(text),
      pattern: createPatternChars(pattern),
      textPointer: 0,
      patternPointer: 0,
      matches: [],
      comparisons: 0,
      algorithm: 'KMP',
      lps: [...lps],
    },
    currentLine: 6,
    variables: { n, m, i: 0, j: 0, matches: 0, comparisons: 0 },
  });

  while (i < n) {
    comparisons++;
    
    const textChars = createTextChars(text);
    const patternChars = createPatternChars(pattern);
    
    textChars[i].state = 'comparing';
    patternChars[j].state = 'comparing';
    
    // Show matched prefix
    for (let k = 0; k < j; k++) {
      textChars[i - j + k].state = 'match';
      patternChars[k].state = 'match';
    }

    if (pattern[j] === text[i]) {
      snapshots.push({
        id: `kmp-${step.count++}`,
        step: snapshots.length,
        description: `text[${i}] = '${text[i]}' matches pattern[${j}] = '${pattern[j]}' ✓`,
        data: {
          text: textChars,
          pattern: patternChars,
          textPointer: i,
          patternPointer: j,
          matches: [...matches],
          comparisons,
          algorithm: 'KMP',
          lps: [...lps],
        },
        currentLine: 7,
        variables: { n, m, i, j, matches: matches.length, comparisons },
      });
      
      i++;
      j++;
    }

    if (j === m) {
      // Pattern found
      matches.push(i - j);
      
      const foundTextChars = createTextChars(text);
      const foundPatternChars = createPatternChars(pattern);
      
      for (let k = 0; k < m; k++) {
        foundTextChars[i - m + k].state = 'found';
        foundPatternChars[k].state = 'found';
      }
      
      snapshots.push({
        id: `kmp-${step.count++}`,
        step: snapshots.length,
        description: `✓ Pattern found at position ${i - j}! Using LPS to continue search.`,
        data: {
          text: foundTextChars,
          pattern: foundPatternChars,
          textPointer: i - 1,
          patternPointer: j - 1,
          matches: [...matches],
          comparisons,
          algorithm: 'KMP',
          lps: [...lps],
        },
        currentLine: 8,
        variables: { n, m, i, j, matches: matches.length, comparisons },
      });
      
      j = lps[j - 1];
    } else if (i < n && pattern[j] !== text[i]) {
      // Mismatch
      textChars[i].state = 'mismatch';
      patternChars[j].state = 'mismatch';
      
      if (j !== 0) {
        snapshots.push({
          id: `kmp-${step.count++}`,
          step: snapshots.length,
          description: `Mismatch at text[${i}]. Using LPS[${j - 1}] = ${lps[j - 1]} to skip redundant comparisons.`,
          data: {
            text: textChars,
            pattern: patternChars,
            textPointer: i,
            patternPointer: j,
            matches: [...matches],
            comparisons,
            algorithm: 'KMP',
            lps: [...lps],
          },
          currentLine: 9,
          variables: { n, m, i, j, matches: matches.length, comparisons },
        });
        
        j = lps[j - 1];
      } else {
        snapshots.push({
          id: `kmp-${step.count++}`,
          step: snapshots.length,
          description: `Mismatch at start of pattern. Moving to next character in text.`,
          data: {
            text: textChars,
            pattern: patternChars,
            textPointer: i,
            patternPointer: j,
            matches: [...matches],
            comparisons,
            algorithm: 'KMP',
            lps: [...lps],
          },
          currentLine: 10,
          variables: { n, m, i, j, matches: matches.length, comparisons },
        });
        
        i++;
      }
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
    id: `kmp-${step.count++}`,
    step: snapshots.length,
    description: `KMP search complete. Found ${matches.length} match${matches.length !== 1 ? 'es' : ''} with only ${comparisons} comparisons!`,
    data: {
      text: finalTextChars,
      pattern: createPatternChars(pattern),
      textPointer: -1,
      patternPointer: -1,
      matches,
      comparisons,
      algorithm: 'KMP',
      lps: [...lps],
    },
    currentLine: 11,
    variables: { n, m, matches: matches.length, comparisons },
  });

  return snapshots;
}

export const kmpStringMatch: AlgorithmDefinition<PatternMatchInput, PatternMatchData> = {
  id: 'kmp-string-match',
  name: 'KMP Pattern Matching',
  category: 'string',
  categoryName: 'String Algorithms',
  description: 'Efficient pattern matching using the Longest Proper Prefix which is also Suffix (LPS) array to avoid redundant comparisons. Linear time complexity.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(n + m)',
    average: 'O(n + m)',
    worst: 'O(n + m)',
  },
  spaceComplexity: 'O(m)',
  code: [
    '// Build LPS array',
    'for i = 1 to m - 1:',
    '  if pattern[i] == pattern[len]:',
    '    LPS[i] = ++len',
    '  else if len != 0:',
    '    len = LPS[len - 1]',
    '// Search using LPS',
    'while i < n:',
    '  if pattern[j] == text[i]: i++, j++',
    '  if j == m: report match, j = LPS[j-1]',
    '  else if mismatch: j = LPS[j-1] or i++',
  ],
  defaultInput: {
    text: 'ABABCABABA',
    pattern: 'ABA',
  },
  inputConfig: {
    type: 'array',
  },
  generate: generateKMP,
};
