/**
 * Z Algorithm
 * 
 * Linear time pattern matching using Z-array.
 * Z[i] = length of longest substring starting from i which is also prefix.
 * Time: O(n + m)
 * Space: O(n + m)
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

function computeZArray(s: string, snapshots: StringSnapshot<PatternMatchData>[], step: { count: number }, isPattern: boolean): number[] {
  const n = s.length;
  const z: number[] = new Array(n).fill(0);
  let l = 0, r = 0;

  snapshots.push({
    id: `z-${step.count++}`,
    step: snapshots.length,
    description: `Computing Z-array for "${s}" ${isPattern ? '(combined string)' : ''}`,
    data: {
      text: createTextChars(s),
      pattern: createPatternChars(''),
      textPointer: 0,
      patternPointer: -1,
      matches: [],
      comparisons: 0,
      algorithm: 'Z-Algorithm',
      zArray: [...z],
    },
    currentLine: 1,
    variables: { n, l, r, zArray: `[${z.join(', ')}]` },
  });

  for (let i = 1; i < n; i++) {
    const textChars = createTextChars(s);
    textChars[i].state = 'active';
    if (r > 0) {
      for (let k = l; k <= r; k++) {
        textChars[k].state = 'comparing';
      }
    }

    if (i > r) {
      // Outside Z-box, compute explicitly
      l = r = i;
      while (r < n && s[r - l] === s[r]) {
        r++;
      }
      z[i] = r - l;
      r--;
      
      snapshots.push({
        id: `z-${step.count++}`,
        step: snapshots.length,
        description: `i=${i} outside Z-box. Computed Z[${i}] = ${z[i]} explicitly`,
        data: {
          text: textChars,
          pattern: createPatternChars(''),
          textPointer: i,
          patternPointer: -1,
          matches: [],
          comparisons: 0,
          algorithm: 'Z-Algorithm',
          zArray: [...z],
        },
        currentLine: 2,
        variables: { n, i, l, r, zArray: `[${z.join(', ')}]` },
      });
    } else {
      // Inside Z-box, use previously computed values
      const k = i - l;
      if (z[k] < r - i + 1) {
        z[i] = z[k];
        
        snapshots.push({
          id: `z-${step.count++}`,
          step: snapshots.length,
          description: `i=${i} inside Z-box. Z[${i}] = Z[${k}] = ${z[k]} (reusing value)`,
          data: {
            text: textChars,
            pattern: createPatternChars(''),
            textPointer: i,
            patternPointer: -1,
            matches: [],
            comparisons: 0,
            algorithm: 'Z-Algorithm',
            zArray: [...z],
          },
          currentLine: 3,
          variables: { n, i, k, l, r, zArray: `[${z.join(', ')}]` },
        });
      } else {
        l = i;
        while (r < n && s[r - l] === s[r]) {
          r++;
        }
        z[i] = r - l;
        r--;
        
        snapshots.push({
          id: `z-${step.count++}`,
          step: snapshots.length,
          description: `i=${i} at Z-box boundary. Extended matching, Z[${i}] = ${z[i]}`,
          data: {
            text: textChars,
            pattern: createPatternChars(''),
            textPointer: i,
            patternPointer: -1,
            matches: [],
            comparisons: 0,
            algorithm: 'Z-Algorithm',
            zArray: [...z],
          },
          currentLine: 4,
          variables: { n, i, l, r, zArray: `[${z.join(', ')}]` },
        });
      }
    }
  }

  return z;
}

function generateZAlgorithm(input: PatternMatchInput): StringSnapshot<PatternMatchData>[] {
  const { text, pattern } = input;
  const m = pattern.length;
  const n = text.length;
  const snapshots: StringSnapshot<PatternMatchData>[] = [];
  const step = { count: 0 };
  const matches: number[] = [];

  // Create combined string: pattern$text
  const combined = pattern + '$' + text;
  const total = combined.length;

  snapshots.push({
    id: `z-${step.count++}`,
    step: snapshots.length,
    description: `Creating combined string: "${pattern}$${text}"`,
    data: {
      text: createTextChars(text),
      pattern: createPatternChars(pattern),
      textPointer: -1,
      patternPointer: -1,
      matches: [],
      comparisons: 0,
      algorithm: 'Z-Algorithm',
    },
    currentLine: 0,
    variables: { m, n, combined },
  });

  // Compute Z-array for combined string
  const z = computeZArray(combined, snapshots, step, true);

  snapshots.push({
    id: `z-${step.count++}`,
    step: snapshots.length,
    description: `Z-array computed: [${z.join(', ')}]. Now finding matches where Z[i] = pattern length`,
    data: {
      text: createTextChars(text),
      pattern: createPatternChars(pattern),
      textPointer: -1,
      patternPointer: -1,
      matches: [],
      comparisons: 0,
      algorithm: 'Z-Algorithm',
      zArray: [...z],
    },
    currentLine: 5,
    variables: { m, n, total, zArray: `[${z.join(', ')}]` },
  });

  // Find matches: Z[i] == m means pattern matches at position (i - m - 1) in text
  for (let i = m + 1; i < total; i++) {
    if (z[i] === m) {
      const textPos = i - m - 1;
      matches.push(textPos);
      
      const textChars = createTextChars(text);
      const patternChars = createPatternChars(pattern);
      
      for (let k = 0; k < m; k++) {
        textChars[textPos + k].state = 'found';
        patternChars[k].state = 'found';
      }
      
      snapshots.push({
        id: `z-${step.count++}`,
        step: snapshots.length,
        description: `✓ Z[${i}] = ${m} → Pattern found at text position ${textPos}!`,
        data: {
          text: textChars,
          pattern: patternChars,
          textPointer: textPos,
          patternPointer: 0,
          matches: [...matches],
          comparisons: 0,
          algorithm: 'Z-Algorithm',
          zArray: [...z],
        },
        currentLine: 6,
        variables: { m, n, i, textPos, matches: matches.length, zArray: `[${z.join(', ')}]` },
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
    id: `z-${step.count++}`,
    step: snapshots.length,
    description: `Z-Algorithm complete. Found ${matches.length} match${matches.length !== 1 ? 'es' : ''} in linear time O(n+m).`,
    data: {
      text: finalTextChars,
      pattern: createPatternChars(pattern),
      textPointer: -1,
      patternPointer: -1,
      matches,
      comparisons: 0,
      algorithm: 'Z-Algorithm',
      zArray: [...z],
    },
    currentLine: 7,
    variables: { m, n, matches: matches.length },
  });

  return snapshots;
}

export const zAlgorithmStringMatch: AlgorithmDefinition<PatternMatchInput, PatternMatchData> = {
  id: 'z-algorithm-string-match',
  name: 'Z Algorithm',
  category: 'string',
  categoryName: 'String Algorithms',
  description: 'Linear time pattern matching using Z-array. Z[i] represents the length of the longest substring starting from i which is also a prefix of the string.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(n + m)',
    average: 'O(n + m)',
    worst: 'O(n + m)',
  },
  spaceComplexity: 'O(n + m)',
  code: [
    'combined = pattern + "$" + text',
    'Z = computeZArray(combined)',
    'for i = m+1 to len(combined):',
    '  if Z[i] == m:',
    '    report match at position (i - m - 1)',
    '',
    'computeZArray: O(n) using Z-box optimization',
  ],
  defaultInput: {
    text: 'ABABCABABA',
    pattern: 'ABA',
  },
  inputConfig: {
    type: 'array',
  },
  generate: generateZAlgorithm,
};
