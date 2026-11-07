/**
 * Manacher's Algorithm
 * 
 * Linear time algorithm to find longest palindromic substring.
 * Uses center expansion with clever reuse of previously computed values.
 * Time: O(n)
 * Space: O(n)
 */

import { AlgorithmDefinition } from '../../types/algorithm';
import { 
  PalindromeInput, 
  PalindromeData, 
  StringSnapshot, 
  StringChar 
} from '../../types/string';

function createTextChars(text: string, state = 'default' as const): StringChar[] {
  return text.split('').map((char, index) => ({ char, index, state }));
}

function generateManacher(input: PalindromeInput): StringSnapshot<PalindromeData>[] {
  const { text } = input;
  const snapshots: StringSnapshot<PalindromeData>[] = [];
  let step = 0;

  // Transform string: insert # between characters
  // Example: "abc" → "#a#b#c#"
  const transformed = '#' + text.split('').join('#') + '#';
  const n = transformed.length;
  const lengths: number[] = new Array(n).fill(0);
  
  snapshots.push({
    id: `manacher-${step++}`,
    step: snapshots.length,
    description: `Transformed "${text}" → "${transformed}" (inserting # to handle even-length palindromes)`,
    data: {
      text: createTextChars(transformed),
      center: -1,
      left: -1,
      right: -1,
      lengths: [...lengths],
      longestStart: 0,
      longestEnd: 0,
      currentPalindrome: '',
    },
    currentLine: 1,
    variables: { n, original: text, transformed },
  });

  let center = 0;      // Center of rightmost palindrome
  let rightBound = 0;  // Right boundary of rightmost palindrome
  let maxLen = 0;
  let maxCenter = 0;

  for (let i = 0; i < n; i++) {
    // Mirror of i with respect to center
    const mirror = 2 * center - i;
    
    const textChars = createTextChars(transformed);
    textChars[i].state = 'active';
    if (i < rightBound) {
      textChars[center].state = 'comparing';
      textChars[mirror].state = 'comparing';
    }

    // Initialize length[i]
    if (i < rightBound) {
      lengths[i] = Math.min(rightBound - i, lengths[mirror]);
      
      snapshots.push({
        id: `manacher-${step++}`,
        step: snapshots.length,
        description: `i=${i} inside palindrome boundary. Using mirror: lengths[${i}] = min(${rightBound - i}, lengths[${mirror}]=${lengths[mirror]}) = ${lengths[i]}`,
        data: {
          text: textChars,
          center,
          left: i - lengths[i],
          right: i + lengths[i],
          lengths: [...lengths],
          longestStart: maxCenter - lengths[maxCenter],
          longestEnd: maxCenter + lengths[maxCenter],
          currentPalindrome: transformed.substring(i - lengths[i], i + lengths[i] + 1),
        },
        currentLine: 2,
        variables: { i, center, rightBound, mirror, lengths: `[${lengths.join(', ')}]` },
      });
    }

    // Expand around center i
    let expandCount = 0;
    while (
      i - lengths[i] - 1 >= 0 &&
      i + lengths[i] + 1 < n &&
      transformed[i - lengths[i] - 1] === transformed[i + lengths[i] + 1]
    ) {
      lengths[i]++;
      expandCount++;
      
      const expandChars = createTextChars(transformed);
      for (let k = i - lengths[i]; k <= i + lengths[i]; k++) {
        expandChars[k].state = 'match';
      }
      expandChars[i].state = 'active';
      expandChars[i - lengths[i]].state = 'comparing';
      expandChars[i + lengths[i]].state = 'comparing';
      
      snapshots.push({
        id: `manacher-${step++}`,
        step: snapshots.length,
        description: `Expanding around center ${i}: matched '${transformed[i - lengths[i]]}' and '${transformed[i + lengths[i]]}'. Length = ${lengths[i]}`,
        data: {
          text: expandChars,
          center: i,
          left: i - lengths[i],
          right: i + lengths[i],
          lengths: [...lengths],
          longestStart: maxCenter - lengths[maxCenter],
          longestEnd: maxCenter + lengths[maxCenter],
          currentPalindrome: transformed.substring(i - lengths[i], i + lengths[i] + 1),
        },
        currentLine: 3,
        variables: { i, center, lengths: `[${lengths.join(', ')}]`, expandCount },
      });
    }

    // Update rightmost palindrome if necessary
    if (i + lengths[i] > rightBound) {
      center = i;
      rightBound = i + lengths[i];
      
      const updateChars = createTextChars(transformed);
      for (let k = i - lengths[i]; k <= i + lengths[i]; k++) {
        updateChars[k].state = 'found';
      }
      updateChars[i].state = 'active';
      
      snapshots.push({
        id: `manacher-${step++}`,
        step: snapshots.length,
        description: `Updated rightmost palindrome: center=${center}, rightBound=${rightBound}`,
        data: {
          text: updateChars,
          center,
          left: center - lengths[center],
          right: rightBound,
          lengths: [...lengths],
          longestStart: maxCenter - lengths[maxCenter],
          longestEnd: maxCenter + lengths[maxCenter],
          currentPalindrome: transformed.substring(center - lengths[center], rightBound + 1),
        },
        currentLine: 4,
        variables: { i, center, rightBound, lengths: `[${lengths.join(', ')}]` },
      });
    }

    // Track longest palindrome
    if (lengths[i] > maxLen) {
      maxLen = lengths[i];
      maxCenter = i;
      
      const longestChars = createTextChars(transformed);
      for (let k = maxCenter - maxLen; k <= maxCenter + maxLen; k++) {
        longestChars[k].state = 'found';
      }
      longestChars[maxCenter].state = 'active';
      
      // Extract actual palindrome (remove #)
      const start = (maxCenter - maxLen) / 2;
      const palindrome = text.substring(start, start + maxLen);
      
      snapshots.push({
        id: `manacher-${step++}`,
        step: snapshots.length,
        description: `New longest palindrome found: "${palindrome}" (length ${maxLen})`,
        data: {
          text: longestChars,
          center: maxCenter,
          left: maxCenter - maxLen,
          right: maxCenter + maxLen,
          lengths: [...lengths],
          longestStart: maxCenter - maxLen,
          longestEnd: maxCenter + maxLen,
          currentPalindrome: palindrome,
        },
        currentLine: 5,
        variables: { i, maxCenter, maxLen, palindrome, lengths: `[${lengths.join(', ')}]` },
      });
    }
  }

  // Final result
  const start = (maxCenter - maxLen) / 2;
  const longestPalindrome = text.substring(start, start + maxLen);
  
  const finalChars = createTextChars(transformed);
  for (let k = maxCenter - maxLen; k <= maxCenter + maxLen; k++) {
    finalChars[k].state = 'found';
  }
  finalChars[maxCenter].state = 'active';

  snapshots.push({
    id: `manacher-${step++}`,
    step: snapshots.length,
    description: `Manacher's Algorithm complete. Longest palindromic substring: "${longestPalindrome}" (length ${maxLen}) in O(n) time.`,
    data: {
      text: finalChars,
      center: maxCenter,
      left: maxCenter - maxLen,
      right: maxCenter + maxLen,
      lengths: [...lengths],
      longestStart: start,
      longestEnd: start + maxLen,
      currentPalindrome: longestPalindrome,
    },
    currentLine: 6,
    variables: { maxLen, longestPalindrome, start },
  });

  return snapshots;
}

export const manacherAlgorithm: AlgorithmDefinition<PalindromeInput, PalindromeData> = {
  id: 'manacher-algorithm',
  name: "Manacher's Algorithm",
  category: 'string',
  categoryName: 'String Algorithms',
  description: 'Linear time algorithm to find the longest palindromic substring. Uses center expansion with clever reuse of previously computed palindrome information.',
  difficulty: 'Hard',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
  },
  spaceComplexity: 'O(n)',
  code: [
    'transformed = "#" + join(text, "#") + "#"',
    'for each center i:',
    '  if i < rightBound:',
    '    length[i] = min(rightBound - i, length[mirror])',
    '  expand around center i',
    '  if i + length[i] > rightBound:',
    '    update center and rightBound',
  ],
  defaultInput: {
    text: 'BABAD',
  },
  inputConfig: {
    type: 'array',
  },
  generate: generateManacher,
};
