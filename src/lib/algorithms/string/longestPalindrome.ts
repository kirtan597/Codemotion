/**
 * Longest Palindromic Substring (Expand Around Center)
 * 
 * Find longest palindrome by expanding around each possible center.
 * Time: O(n²)
 * Space: O(1)
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

function expandAroundCenter(
  text: string,
  left: number,
  right: number,
  snapshots: StringSnapshot<PalindromeData>[],
  step: { count: number },
  maxStart: { value: number },
  maxLen: { value: number }
): void {
  const n = text.length;
  
  const textChars = createTextChars(text);
  if (left >= 0 && right < n) {
    textChars[left].state = 'active';
    textChars[right].state = 'active';
  }
  
  snapshots.push({
    id: `lps-${step.count++}`,
    step: snapshots.length,
    description: `Expanding around center: left=${left}, right=${right}`,
    data: {
      text: textChars,
      center: Math.floor((left + right) / 2),
      left,
      right,
      longestStart: maxStart.value,
      longestEnd: maxStart.value + maxLen.value,
      currentPalindrome: text.substring(maxStart.value, maxStart.value + maxLen.value),
    },
    currentLine: 1,
    variables: { left, right, maxLen: maxLen.value },
  });

  while (left >= 0 && right < n && text[left] === text[right]) {
    const expandChars = createTextChars(text);
    for (let k = left; k <= right; k++) {
      expandChars[k].state = 'match';
    }
    expandChars[left].state = 'comparing';
    expandChars[right].state = 'comparing';
    
    snapshots.push({
      id: `lps-${step.count++}`,
      step: snapshots.length,
      description: `Match found: text[${left}]='${text[left]}' == text[${right}]='${text[right]}'. Palindrome: "${text.substring(left, right + 1)}"`,
      data: {
        text: expandChars,
        center: Math.floor((left + right) / 2),
        left,
        right,
        longestStart: maxStart.value,
        longestEnd: maxStart.value + maxLen.value,
        currentPalindrome: text.substring(left, right + 1),
      },
      currentLine: 2,
      variables: { left, right, length: right - left + 1, maxLen: maxLen.value },
    });
    
    const currentLen = right - left + 1;
    if (currentLen > maxLen.value) {
      maxStart.value = left;
      maxLen.value = currentLen;
      
      const foundChars = createTextChars(text);
      for (let k = left; k <= right; k++) {
        foundChars[k].state = 'found';
      }
      
      snapshots.push({
        id: `lps-${step.count++}`,
        step: snapshots.length,
        description: `New longest palindrome: "${text.substring(left, right + 1)}" (length ${currentLen})`,
        data: {
          text: foundChars,
          center: Math.floor((left + right) / 2),
          left,
          right,
          longestStart: maxStart.value,
          longestEnd: maxStart.value + maxLen.value,
          currentPalindrome: text.substring(maxStart.value, maxStart.value + maxLen.value),
        },
        currentLine: 3,
        variables: { left, right, length: currentLen, maxLen: maxLen.value },
      });
    }
    
    left--;
    right++;
  }

  if (left >= 0 && right < n) {
    const mismatchChars = createTextChars(text);
    mismatchChars[left].state = 'mismatch';
    mismatchChars[right].state = 'mismatch';
    
    snapshots.push({
      id: `lps-${step.count++}`,
      step: snapshots.length,
      description: `Stop expanding: text[${left}]='${text[left]}' ≠ text[${right}]='${text[right]}'`,
      data: {
        text: mismatchChars,
        center: Math.floor((left + right) / 2),
        left,
        right,
        longestStart: maxStart.value,
        longestEnd: maxStart.value + maxLen.value,
        currentPalindrome: text.substring(maxStart.value, maxStart.value + maxLen.value),
      },
      currentLine: 4,
      variables: { left, right, maxLen: maxLen.value },
    });
  }
}

function generateLongestPalindrome(input: PalindromeInput): StringSnapshot<PalindromeData>[] {
  const { text } = input;
  const n = text.length;
  const snapshots: StringSnapshot<PalindromeData>[] = [];
  const step = { count: 0 };
  const maxStart = { value: 0 };
  const maxLen = { value: 1 };

  snapshots.push({
    id: `lps-${step.count++}`,
    step: snapshots.length,
    description: `Finding longest palindromic substring in "${text}" using expand-around-center`,
    data: {
      text: createTextChars(text),
      center: -1,
      left: -1,
      right: -1,
      longestStart: 0,
      longestEnd: 1,
      currentPalindrome: text[0],
    },
    currentLine: 0,
    variables: { n },
  });

  for (let i = 0; i < n; i++) {
    // Odd length palindromes (center is a single character)
    snapshots.push({
      id: `lps-${step.count++}`,
      step: snapshots.length,
      description: `Checking odd-length palindromes centered at index ${i}`,
      data: {
        text: createTextChars(text),
        center: i,
        left: i,
        right: i,
        longestStart: maxStart.value,
        longestEnd: maxStart.value + maxLen.value,
        currentPalindrome: text.substring(maxStart.value, maxStart.value + maxLen.value),
      },
      currentLine: 5,
      variables: { i, n, maxLen: maxLen.value },
    });
    
    expandAroundCenter(text, i, i, snapshots, step, maxStart, maxLen);

    // Even length palindromes (center is between two characters)
    if (i < n - 1) {
      snapshots.push({
        id: `lps-${step.count++}`,
        step: snapshots.length,
        description: `Checking even-length palindromes centered between ${i} and ${i + 1}`,
        data: {
          text: createTextChars(text),
          center: i,
          left: i,
          right: i + 1,
          longestStart: maxStart.value,
          longestEnd: maxStart.value + maxLen.value,
          currentPalindrome: text.substring(maxStart.value, maxStart.value + maxLen.value),
        },
        currentLine: 6,
        variables: { i, n, maxLen: maxLen.value },
      });
      
      expandAroundCenter(text, i, i + 1, snapshots, step, maxStart, maxLen);
    }
  }

  // Final result
  const longestPalindrome = text.substring(maxStart.value, maxStart.value + maxLen.value);
  const finalChars = createTextChars(text);
  for (let k = maxStart.value; k < maxStart.value + maxLen.value; k++) {
    finalChars[k].state = 'found';
  }

  snapshots.push({
    id: `lps-${step.count++}`,
    step: snapshots.length,
    description: `Complete! Longest palindromic substring: "${longestPalindrome}" (length ${maxLen.value})`,
    data: {
      text: finalChars,
      center: Math.floor((maxStart.value + maxStart.value + maxLen.value) / 2),
      left: maxStart.value,
      right: maxStart.value + maxLen.value - 1,
      longestStart: maxStart.value,
      longestEnd: maxStart.value + maxLen.value,
      currentPalindrome: longestPalindrome,
    },
    currentLine: 7,
    variables: { maxLen: maxLen.value, longestPalindrome },
  });

  return snapshots;
}

export const longestPalindromicSubstring: AlgorithmDefinition<PalindromeInput, PalindromeData> = {
  id: 'longest-palindromic-substring',
  name: 'Longest Palindromic Substring',
  category: 'string',
  categoryName: 'String Algorithms',
  description: 'Find the longest palindromic substring by expanding around each possible center (both odd and even length palindromes). Simple and intuitive approach.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
  },
  spaceComplexity: 'O(1)',
  code: [
    'for each center i:',
    '  // Odd length palindromes',
    '  expand around (i, i)',
    '  // Even length palindromes',
    '  expand around (i, i+1)',
    '',
    'expand(left, right):',
    '  while text[left] == text[right]: left--, right++',
  ],
  defaultInput: {
    text: 'BABAD',
  },
  inputConfig: {
    type: 'array',
  },
  generate: generateLongestPalindrome,
};
