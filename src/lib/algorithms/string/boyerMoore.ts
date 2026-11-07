/**
 * Boyer-Moore Algorithm
 * 
 * Fast pattern matching using bad character and good suffix heuristics.
 * Searches from right to left in the pattern.
 * Time: O(n/m) best case, O(nm) worst case
 * Space: O(m + σ) where σ is alphabet size
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

function buildBadCharTable(pattern: string): Map<string, number> {
  const m = pattern.length;
  const badChar = new Map<string, number>();
  
  // Rightmost occurrence of each character (except last)
  for (let i = 0; i < m - 1; i++) {
    badChar.set(pattern[i], i);
  }
  
  return badChar;
}

function buildGoodSuffixTable(pattern: string): number[] {
  const m = pattern.length;
  const goodSuffix = new Array(m).fill(m);
  const borderPos = new Array(m + 1);
  
  // Compute border positions
  let i = m;
  let j = m + 1;
  borderPos[i] = j;
  
  while (i > 0) {
    while (j <= m && pattern[i - 1] !== pattern[j - 1]) {
      if (goodSuffix[j - 1] === m) {
        goodSuffix[j - 1] = j - i;
      }
      j = borderPos[j];
    }
    i--;
    j--;
    borderPos[i] = j;
  }
  
  // Case 2: partial match
  j = borderPos[0];
  for (i = 0; i < m; i++) {
    if (goodSuffix[i] === m) {
      goodSuffix[i] = j;
    }
    if (i === j) {
      j = borderPos[j];
    }
  }
  
  return goodSuffix;
}

function generateBoyerMoore(input: PatternMatchInput): StringSnapshot<PatternMatchData>[] {
  const { text, pattern } = input;
  const n = text.length;
  const m = pattern.length;
  const snapshots: StringSnapshot<PatternMatchData>[] = [];
  let step = 0;
  let comparisons = 0;
  const matches: number[] = [];

  // Build bad character table
  const badChar = buildBadCharTable(pattern);
  
  snapshots.push({
    id: `bm-${step++}`,
    step: snapshots.length,
    description: `Built bad character table with ${badChar.size} entries`,
    data: {
      text: createTextChars(text),
      pattern: createPatternChars(pattern),
      textPointer: -1,
      patternPointer: -1,
      matches: [],
      comparisons: 0,
      algorithm: 'Boyer-Moore',
      badChar,
    },
    currentLine: 1,
    variables: { n, m, badCharSize: badChar.size },
  });

  // Build good suffix table
  const goodSuffix = buildGoodSuffixTable(pattern);
  
  snapshots.push({
    id: `bm-${step++}`,
    step: snapshots.length,
    description: `Built good suffix table: [${goodSuffix.join(', ')}]`,
    data: {
      text: createTextChars(text),
      pattern: createPatternChars(pattern),
      textPointer: -1,
      patternPointer: -1,
      matches: [],
      comparisons: 0,
      algorithm: 'Boyer-Moore',
      badChar,
      goodSuffix,
    },
    currentLine: 2,
    variables: { n, m, goodSuffix: `[${goodSuffix.join(', ')}]` },
  });

  // Search
  let s = 0; // shift of pattern relative to text
  
  snapshots.push({
    id: `bm-${step++}`,
    step: snapshots.length,
    description: `Starting Boyer-Moore search (right-to-left matching)`,
    data: {
      text: createTextChars(text),
      pattern: createPatternChars(pattern),
      textPointer: 0,
      patternPointer: m - 1,
      matches: [],
      comparisons: 0,
      algorithm: 'Boyer-Moore',
      badChar,
      goodSuffix,
    },
    currentLine: 3,
    variables: { n, m, s: 0, matches: 0 },
  });

  while (s <= n - m) {
    let j = m - 1;
    
    // Show alignment
    const alignTextChars = createTextChars(text);
    const alignPatternChars = createPatternChars(pattern);
    
    for (let k = 0; k < m; k++) {
      alignTextChars[s + k].state = 'comparing';
    }
    alignPatternChars[j].state = 'active';
    
    snapshots.push({
      id: `bm-${step++}`,
      step: snapshots.length,
      description: `Aligning pattern at position ${s}. Starting comparison from right (position ${j})`,
      data: {
        text: alignTextChars,
        pattern: alignPatternChars,
        textPointer: s + j,
        patternPointer: j,
        matches: [...matches],
        comparisons,
        algorithm: 'Boyer-Moore',
        badChar,
        goodSuffix,
      },
      currentLine: 4,
      variables: { n, m, s, j, matches: matches.length, comparisons },
    });

    // Match pattern from right to left
    while (j >= 0) {
      comparisons++;
      
      const textChars = createTextChars(text);
      const patternChars = createPatternChars(pattern);
      
      textChars[s + j].state = 'comparing';
      patternChars[j].state = 'comparing';
      
      // Show matched suffix
      for (let k = j + 1; k < m; k++) {
        textChars[s + k].state = 'match';
        patternChars[k].state = 'match';
      }

      if (pattern[j] !== text[s + j]) {
        break;
      }
      
      snapshots.push({
        id: `bm-${step++}`,
        step: snapshots.length,
        description: `Match at position ${j}: '${pattern[j]}' = '${text[s + j]}'`,
        data: {
          text: textChars,
          pattern: patternChars,
          textPointer: s + j,
          patternPointer: j,
          matches: [...matches],
          comparisons,
          algorithm: 'Boyer-Moore',
          badChar,
          goodSuffix,
        },
        currentLine: 5,
        variables: { n, m, s, j, matches: matches.length, comparisons },
      });
      
      j--;
    }

    if (j < 0) {
      // Pattern found
      matches.push(s);
      
      const foundTextChars = createTextChars(text);
      const foundPatternChars = createPatternChars(pattern);
      
      for (let k = 0; k < m; k++) {
        foundTextChars[s + k].state = 'found';
        foundPatternChars[k].state = 'found';
      }
      
      snapshots.push({
        id: `bm-${step++}`,
        step: snapshots.length,
        description: `✓ Pattern found at position ${s}!`,
        data: {
          text: foundTextChars,
          pattern: foundPatternChars,
          textPointer: s,
          patternPointer: 0,
          matches: [...matches],
          comparisons,
          algorithm: 'Boyer-Moore',
          badChar,
          goodSuffix,
        },
        currentLine: 6,
        variables: { n, m, s, j: -1, matches: matches.length, comparisons },
      });
      
      // Shift by good suffix
      s += s + m < n ? m - goodSuffix[0] : 1;
    } else {
      // Mismatch found
      const mismatchChar = text[s + j];
      const textChars = createTextChars(text);
      const patternChars = createPatternChars(pattern);
      
      textChars[s + j].state = 'mismatch';
      patternChars[j].state = 'mismatch';
      
      // Show matched suffix
      for (let k = j + 1; k < m; k++) {
        textChars[s + k].state = 'match';
        patternChars[k].state = 'match';
      }
      
      // Calculate shifts
      const badCharShift = badChar.has(mismatchChar) 
        ? Math.max(1, j - badChar.get(mismatchChar)!)
        : j + 1;
      const goodSuffixShift = goodSuffix[j];
      const shift = Math.max(badCharShift, goodSuffixShift);
      
      snapshots.push({
        id: `bm-${step++}`,
        step: snapshots.length,
        description: `Mismatch at position ${j}: '${mismatchChar}'. Bad char shift: ${badCharShift}, Good suffix shift: ${goodSuffixShift}. Using max = ${shift}`,
        data: {
          text: textChars,
          pattern: patternChars,
          textPointer: s + j,
          patternPointer: j,
          matches: [...matches],
          comparisons,
          algorithm: 'Boyer-Moore',
          badChar,
          goodSuffix,
        },
        currentLine: 7,
        variables: { n, m, s, j, shift, matches: matches.length, comparisons },
      });
      
      s += shift;
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
    id: `bm-${step++}`,
    step: snapshots.length,
    description: `Boyer-Moore complete. Found ${matches.length} match${matches.length !== 1 ? 'es' : ''} with ${comparisons} comparisons (efficient right-to-left search).`,
    data: {
      text: finalTextChars,
      pattern: createPatternChars(pattern),
      textPointer: -1,
      patternPointer: -1,
      matches,
      comparisons,
      algorithm: 'Boyer-Moore',
      badChar,
      goodSuffix,
    },
    currentLine: 8,
    variables: { n, m, matches: matches.length, comparisons },
  });

  return snapshots;
}

export const boyerMooreStringMatch: AlgorithmDefinition<PatternMatchInput, PatternMatchData> = {
  id: 'boyer-moore-string-match',
  name: 'Boyer-Moore Algorithm',
  category: 'string',
  categoryName: 'String Algorithms',
  description: 'Fast pattern matching using bad character and good suffix heuristics. Searches right-to-left and can skip multiple characters, making it very efficient for large alphabets.',
  difficulty: 'Hard',
  timeComplexity: {
    best: 'O(n/m)',
    average: 'O(n)',
    worst: 'O(nm)',
  },
  spaceComplexity: 'O(m + σ)',
  code: [
    'buildBadCharTable(pattern)',
    'buildGoodSuffixTable(pattern)',
    'while s ≤ n - m:',
    '  j = m - 1',
    '  while j ≥ 0 and pattern[j] == text[s+j]:',
    '    j--',
    '  if j < 0: report match at s',
    '  else: shift = max(badCharShift, goodSuffixShift)',
  ],
  defaultInput: {
    text: 'ABABCABABA',
    pattern: 'ABA',
  },
  inputConfig: {
    type: 'array',
  },
  generate: generateBoyerMoore,
};
