/**
 * Rabin-Karp Algorithm
 * 
 * Pattern matching using rolling hash for efficient comparison.
 * Time: O(n + m) average, O(nm) worst case
 * Space: O(1)
 */

import { AlgorithmDefinition } from '../../types/algorithm';
import { 
  PatternMatchInput, 
  PatternMatchData, 
  StringSnapshot, 
  StringChar 
} from '../../types/string';

const PRIME = 101; // Prime number for hashing
const BASE = 256;  // Number of characters in alphabet

function createTextChars(text: string, state = 'default' as const): StringChar[] {
  return text.split('').map((char, index) => ({ char, index, state }));
}

function createPatternChars(pattern: string, state = 'default' as const): StringChar[] {
  return pattern.split('').map((char, index) => ({ char, index, state }));
}

function hash(str: string, m: number): number {
  let h = 0;
  for (let i = 0; i < m; i++) {
    h = (BASE * h + str.charCodeAt(i)) % PRIME;
  }
  return h;
}

function recalculateHash(oldHash: number, oldChar: string, newChar: string, h: number): number {
  let newHash = (oldHash - oldChar.charCodeAt(0) * h) % PRIME;
  newHash = (newHash * BASE + newChar.charCodeAt(0)) % PRIME;
  if (newHash < 0) newHash += PRIME;
  return newHash;
}

function generateRabinKarp(input: PatternMatchInput): StringSnapshot<PatternMatchData>[] {
  const { text, pattern } = input;
  const n = text.length;
  const m = pattern.length;
  const snapshots: StringSnapshot<PatternMatchData>[] = [];
  let step = 0;
  let comparisons = 0;
  const matches: number[] = [];

  // Calculate h = pow(BASE, m-1) % PRIME
  let h = 1;
  for (let i = 0; i < m - 1; i++) {
    h = (h * BASE) % PRIME;
  }

  // Calculate hash of pattern
  const patternHash = hash(pattern, m);
  
  snapshots.push({
    id: `rk-${step++}`,
    step: snapshots.length,
    description: `Computed pattern hash: ${patternHash} (using base ${BASE}, prime ${PRIME})`,
    data: {
      text: createTextChars(text),
      pattern: createPatternChars(pattern),
      textPointer: -1,
      patternPointer: -1,
      matches: [],
      comparisons: 0,
      algorithm: 'Rabin-Karp',
      hashValues: {
        patternHash,
      },
    },
    currentLine: 1,
    variables: { n, m, patternHash, base: BASE, prime: PRIME },
  });

  // Calculate hash of first window of text
  let textHash = hash(text, m);
  
  const firstWindowChars = createTextChars(text);
  for (let i = 0; i < m; i++) {
    firstWindowChars[i].state = 'comparing';
  }
  
  snapshots.push({
    id: `rk-${step++}`,
    step: snapshots.length,
    description: `Computed hash of first window [0..${m-1}]: ${textHash}`,
    data: {
      text: firstWindowChars,
      pattern: createPatternChars(pattern),
      textPointer: 0,
      patternPointer: 0,
      matches: [],
      comparisons: 0,
      algorithm: 'Rabin-Karp',
      hashValues: {
        patternHash,
        textHash,
        currentHash: textHash,
      },
    },
    currentLine: 2,
    variables: { n, m, i: 0, textHash, patternHash },
  });

  // Slide pattern over text
  for (let i = 0; i <= n - m; i++) {
    const textChars = createTextChars(text);
    const patternChars = createPatternChars(pattern);
    
    // Highlight current window
    for (let j = 0; j < m; j++) {
      textChars[i + j].state = 'comparing';
    }

    // Check if hashes match
    if (patternHash === textHash) {
      snapshots.push({
        id: `rk-${step++}`,
        step: snapshots.length,
        description: `Hash match at position ${i}! (hash = ${textHash}). Verifying character by character...`,
        data: {
          text: textChars,
          pattern: patternChars,
          textPointer: i,
          patternPointer: 0,
          matches: [...matches],
          comparisons,
          algorithm: 'Rabin-Karp',
          hashValues: {
            patternHash,
            textHash,
            currentHash: textHash,
          },
        },
        currentLine: 3,
        variables: { n, m, i, textHash, patternHash, matches: matches.length },
      });

      // Verify character by character (spurious hit check)
      let j = 0;
      let isRealMatch = true;
      
      for (j = 0; j < m; j++) {
        comparisons++;
        
        const verifyTextChars = createTextChars(text);
        const verifyPatternChars = createPatternChars(pattern);
        
        verifyTextChars[i + j].state = 'comparing';
        verifyPatternChars[j].state = 'comparing';
        
        for (let k = 0; k < j; k++) {
          verifyTextChars[i + k].state = 'match';
          verifyPatternChars[k].state = 'match';
        }

        if (pattern[j] !== text[i + j]) {
          isRealMatch = false;
          verifyTextChars[i + j].state = 'mismatch';
          verifyPatternChars[j].state = 'mismatch';
          
          snapshots.push({
            id: `rk-${step++}`,
            step: snapshots.length,
            description: `Spurious hit! Hash matched but characters differ at position ${j}.`,
            data: {
              text: verifyTextChars,
              pattern: verifyPatternChars,
              textPointer: i + j,
              patternPointer: j,
              matches: [...matches],
              comparisons,
              algorithm: 'Rabin-Karp',
              hashValues: {
                patternHash,
                textHash,
                currentHash: textHash,
              },
            },
            currentLine: 4,
            variables: { n, m, i, j, textHash, patternHash, matches: matches.length, comparisons },
          });
          
          break;
        }
      }

      if (isRealMatch) {
        matches.push(i);
        
        for (let k = 0; k < m; k++) {
          textChars[i + k].state = 'found';
          patternChars[k].state = 'found';
        }
        
        snapshots.push({
          id: `rk-${step++}`,
          step: snapshots.length,
          description: `✓ Real match found at position ${i}!`,
          data: {
            text: textChars,
            pattern: patternChars,
            textPointer: i,
            patternPointer: 0,
            matches: [...matches],
            comparisons,
            algorithm: 'Rabin-Karp',
            hashValues: {
              patternHash,
              textHash,
              currentHash: textHash,
            },
          },
          currentLine: 5,
          variables: { n, m, i, j: m, textHash, patternHash, matches: matches.length, comparisons },
        });
      }
    } else {
      snapshots.push({
        id: `rk-${step++}`,
        step: snapshots.length,
        description: `Hash mismatch at position ${i} (${textHash} ≠ ${patternHash}). Skipping character comparison.`,
        data: {
          text: textChars,
          pattern: patternChars,
          textPointer: i,
          patternPointer: 0,
          matches: [...matches],
          comparisons,
          algorithm: 'Rabin-Karp',
          hashValues: {
            patternHash,
            textHash,
            currentHash: textHash,
          },
        },
        currentLine: 6,
        variables: { n, m, i, textHash, patternHash, matches: matches.length, comparisons },
      });
    }

    // Calculate hash of next window (rolling hash)
    if (i < n - m) {
      const oldChar = text[i];
      const newChar = text[i + m];
      textHash = recalculateHash(textHash, oldChar, newChar, h);
      
      const rollingChars = createTextChars(text);
      rollingChars[i].state = 'mismatch';
      rollingChars[i + m].state = 'active';
      
      for (let j = 1; j < m; j++) {
        rollingChars[i + j].state = 'comparing';
      }
      
      snapshots.push({
        id: `rk-${step++}`,
        step: snapshots.length,
        description: `Rolling hash: Remove '${oldChar}', add '${newChar}'. New hash: ${textHash}`,
        data: {
          text: rollingChars,
          pattern: createPatternChars(pattern),
          textPointer: i + m,
          patternPointer: 0,
          matches: [...matches],
          comparisons,
          algorithm: 'Rabin-Karp',
          hashValues: {
            patternHash,
            textHash,
            currentHash: textHash,
          },
        },
        currentLine: 7,
        variables: { n, m, i: i + 1, textHash, patternHash, matches: matches.length, comparisons },
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
    id: `rk-${step++}`,
    step: snapshots.length,
    description: `Rabin-Karp complete. Found ${matches.length} match${matches.length !== 1 ? 'es' : ''} with ${comparisons} character comparisons.`,
    data: {
      text: finalTextChars,
      pattern: createPatternChars(pattern),
      textPointer: -1,
      patternPointer: -1,
      matches,
      comparisons,
      algorithm: 'Rabin-Karp',
      hashValues: {
        patternHash,
        textHash,
      },
    },
    currentLine: 8,
    variables: { n, m, matches: matches.length, comparisons, patternHash },
  });

  return snapshots;
}

export const rabinKarpStringMatch: AlgorithmDefinition<PatternMatchInput, PatternMatchData> = {
  id: 'rabin-karp-string-match',
  name: 'Rabin-Karp Algorithm',
  category: 'string',
  categoryName: 'String Algorithms',
  description: 'Pattern matching using rolling hash for fast comparison. Efficiently handles multiple pattern searches. Uses polynomial rolling hash with prime modulo.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(n + m)',
    average: 'O(n + m)',
    worst: 'O(nm)',
  },
  spaceComplexity: 'O(1)',
  code: [
    'patternHash = hash(pattern)',
    'textHash = hash(text[0...m-1])',
    'for i = 0 to n - m:',
    '  if patternHash == textHash:',
    '    verify character by character',
    '    if match: report position i',
    '  // Rolling hash',
    '  textHash = (textHash - text[i]*h) * BASE + text[i+m]',
  ],
  defaultInput: {
    text: 'ABABCABABA',
    pattern: 'ABA',
  },
  inputConfig: {
    type: 'array',
  },
  generate: generateRabinKarp,
};
