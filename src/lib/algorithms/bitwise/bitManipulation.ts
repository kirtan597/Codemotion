/**
 * Advanced Bit Manipulation Algorithms
 * Count Set Bits, Brian Kernighan, Power of Two, Check/Set/Clear/Toggle Bits
 */

import { AlgorithmDefinition } from '../../types/algorithm';
import { BitwiseInput, BitwiseOperationData, MathSnapshot, BitRepresentation } from '../../types/math';

function createBitRep(num: number, bits = 8, highlighted: number[] = []): BitRepresentation {
  const binary = (num >>> 0).toString(2).padStart(bits, '0');
  const bitArray = binary.split('').map((b, idx) => ({
    position: bits - 1 - idx,
    value: b === '1' ? 1 as const : 0 as const,
    state: highlighted.includes(bits - 1 - idx) ? 'active' as const : 'default' as const,
  }));
  return { decimal: num, binary, bits: bitArray, highlighted };
}

// Count Set Bits (Naive)
function generateCountSetBits(input: BitwiseInput): MathSnapshot<BitwiseOperationData>[] {
  const { num1 } = input;
  const snapshots: MathSnapshot<BitwiseOperationData>[] = [];
  let step = 0;
  let count = 0;
  const setBits: number[] = [];

  snapshots.push({
    id: `count-${step++}`,
    step: snapshots.length,
    description: `Counting set bits (1s) in ${num1}`,
    data: {
      operand1: createBitRep(num1),
      operation: 'COUNT_BITS',
      operationSymbol: 'popcount',
      step: 'Initial',
    },
    currentLine: 1,
    variables: { num1, count: 0 },
  });

  for (let i = 0; i < 8; i++) {
    const bit = (num1 >> i) & 1;
    if (bit === 1) {
      count++;
      setBits.push(i);
    }

    snapshots.push({
      id: `count-${step++}`,
      step: snapshots.length,
      description: `Bit ${i}: ${bit} ${bit === 1 ? '→ count++' : ''}`,
      data: {
        operand1: createBitRep(num1, 8, [i]),
        result: createBitRep(count),
        operation: 'COUNT_BITS',
        operationSymbol: 'popcount',
        step: `Checking bit ${i}`,
      },
      currentLine: 2,
      variables: { i, bit, count, setBits: setBits.join(',') },
    });
  }

  snapshots.push({
    id: `count-${step++}`,
    step: snapshots.length,
    description: `Total set bits: ${count}`,
    data: {
      operand1: createBitRep(num1, 8, setBits),
      result: createBitRep(count),
      operation: 'COUNT_BITS',
      operationSymbol: 'popcount',
      step: 'Complete',
    },
    currentLine: 3,
    variables: { num1, count, setBits: setBits.join(',') },
    formula: `popcount(${num1}) = ${count}`,
  });

  return snapshots;
}

// Brian Kernighan's Algorithm
function generateBrianKernighan(input: BitwiseInput): MathSnapshot<BitwiseOperationData>[] {
  const { num1 } = input;
  const snapshots: MathSnapshot<BitwiseOperationData>[] = [];
  let step = 0;
  let n = num1;
  let count = 0;

  snapshots.push({
    id: `bk-${step++}`,
    step: snapshots.length,
    description: `Brian Kernighan's Algorithm: Count set bits efficiently`,
    data: {
      operand1: createBitRep(num1),
      operation: 'BRIAN_KERNIGHAN',
      operationSymbol: 'n & (n-1)',
      step: 'Initial',
    },
    currentLine: 1,
    variables: { n, count: 0 },
  });

  while (n > 0) {
    const nMinus1 = n - 1;
    const newN = n & nMinus1;
    
    snapshots.push({
      id: `bk-${step++}`,
      step: snapshots.length,
      description: `${n} & ${nMinus1} = ${newN} (removes rightmost set bit)`,
      data: {
        operand1: createBitRep(n),
        operand2: createBitRep(nMinus1),
        result: createBitRep(newN),
        operation: 'BRIAN_KERNIGHAN',
        operationSymbol: '&',
        step: `Iteration ${count + 1}`,
      },
      currentLine: 2,
      variables: { n, nMinus1, newN, count: count + 1 },
    });

    n = newN;
    count++;
  }

  snapshots.push({
    id: `bk-${step++}`,
    step: snapshots.length,
    description: `Total iterations = set bits = ${count}`,
    data: {
      operand1: createBitRep(num1),
      result: createBitRep(count),
      operation: 'BRIAN_KERNIGHAN',
      operationSymbol: 'n & (n-1)',
      step: 'Complete',
    },
    currentLine: 3,
    variables: { original: num1, count },
    formula: `Iterations: ${count} = number of set bits`,
  });

  return snapshots;
}

// Check if Power of Two
function generatePowerOfTwo(input: BitwiseInput): MathSnapshot<BitwiseOperationData>[] {
  const { num1 } = input;
  const snapshots: MathSnapshot<BitwiseOperationData>[] = [];
  let step = 0;

  snapshots.push({
    id: `pow2-${step++}`,
    step: snapshots.length,
    description: `Checking if ${num1} is a power of 2`,
    data: {
      operand1: createBitRep(num1),
      operation: 'POWER_OF_TWO',
      operationSymbol: 'n & (n-1)',
      step: 'Initial',
    },
    currentLine: 1,
    variables: { num1 },
  });

  if (num1 <= 0) {
    snapshots.push({
      id: `pow2-${step++}`,
      step: snapshots.length,
      description: `${num1} ≤ 0: Not a power of 2`,
      data: {
        operand1: createBitRep(num1),
        result: createBitRep(0),
        operation: 'POWER_OF_TWO',
        operationSymbol: '≤ 0',
        step: 'False',
      },
      currentLine: 2,
      variables: { num1, result: false },
      formula: `${num1} is NOT a power of 2`,
    });
    return snapshots;
  }

  const nMinus1 = num1 - 1;
  const andResult = num1 & nMinus1;
  const isPowerOf2 = andResult === 0;

  snapshots.push({
    id: `pow2-${step++}`,
    step: snapshots.length,
    description: `${num1} & ${nMinus1} = ${andResult}`,
    data: {
      operand1: createBitRep(num1),
      operand2: createBitRep(nMinus1),
      result: createBitRep(andResult),
      operation: 'POWER_OF_TWO',
      operationSymbol: '&',
      step: 'Computing',
    },
    currentLine: 3,
    variables: { num1, nMinus1, andResult },
  });

  snapshots.push({
    id: `pow2-${step++}`,
    step: snapshots.length,
    description: `Result: ${num1} ${isPowerOf2 ? 'IS' : 'is NOT'} a power of 2`,
    data: {
      operand1: createBitRep(num1),
      result: createBitRep(isPowerOf2 ? 1 : 0),
      operation: 'POWER_OF_TWO',
      operationSymbol: andResult === 0 ? '✓' : '✗',
      step: isPowerOf2 ? 'True' : 'False',
    },
    currentLine: 4,
    variables: { num1, result: isPowerOf2 },
    formula: `${num1} & (${num1}-1) = ${andResult} ${isPowerOf2 ? '→ Power of 2!' : '→ Not power of 2'}`,
  });

  return snapshots;
}

// Check Kth Bit
function generateCheckBit(input: BitwiseInput): MathSnapshot<BitwiseOperationData>[] {
  const { num1, k = 0 } = input;
  const snapshots: MathSnapshot<BitwiseOperationData>[] = [];
  let step = 0;

  snapshots.push({
    id: `check-${step++}`,
    step: snapshots.length,
    description: `Checking if bit ${k} is set in ${num1}`,
    data: {
      operand1: createBitRep(num1, 8, [k]),
      operation: 'CHECK_BIT',
      operationSymbol: '& (1<<k)',
      step: 'Initial',
    },
    currentLine: 1,
    variables: { num1, k },
  });

  const mask = 1 << k;
  const result = (num1 & mask) !== 0;

  snapshots.push({
    id: `check-${step++}`,
    step: snapshots.length,
    description: `Mask: 1 << ${k} = ${mask}`,
    data: {
      operand1: createBitRep(num1, 8, [k]),
      operand2: createBitRep(mask, 8, [k]),
      operation: 'CHECK_BIT',
      operationSymbol: '<<',
      step: 'Create mask',
    },
    currentLine: 2,
    variables: { num1, k, mask },
  });

  snapshots.push({
    id: `check-${step++}`,
    step: snapshots.length,
    description: `${num1} & ${mask} = ${num1 & mask} → Bit ${k} is ${result ? 'SET' : 'NOT SET'}`,
    data: {
      operand1: createBitRep(num1, 8, [k]),
      operand2: createBitRep(mask, 8, [k]),
      result: createBitRep(result ? 1 : 0),
      operation: 'CHECK_BIT',
      operationSymbol: '&',
      step: 'Complete',
    },
    currentLine: 3,
    variables: { num1, k, mask, result },
    formula: `Bit ${k} of ${num1}: ${result ? 'SET (1)' : 'NOT SET (0)'}`,
  });

  return snapshots;
}

// Set Kth Bit
function generateSetBit(input: BitwiseInput): MathSnapshot<BitwiseOperationData>[] {
  const { num1, k = 0 } = input;
  const snapshots: MathSnapshot<BitwiseOperationData>[] = [];
  let step = 0;

  snapshots.push({
    id: `set-${step++}`,
    step: snapshots.length,
    description: `Setting bit ${k} in ${num1}`,
    data: {
      operand1: createBitRep(num1, 8, [k]),
      operation: 'SET_BIT',
      operationSymbol: '| (1<<k)',
      step: 'Initial',
    },
    currentLine: 1,
    variables: { num1, k },
  });

  const mask = 1 << k;
  const result = num1 | mask;

  snapshots.push({
    id: `set-${step++}`,
    step: snapshots.length,
    description: `${num1} | ${mask} = ${result}`,
    data: {
      operand1: createBitRep(num1, 8, [k]),
      operand2: createBitRep(mask, 8, [k]),
      result: createBitRep(result, 8, [k]),
      operation: 'SET_BIT',
      operationSymbol: '|',
      step: 'Complete',
    },
    currentLine: 2,
    variables: { num1, k, mask, result },
    formula: `${num1} | (1<<${k}) = ${result}`,
  });

  return snapshots;
}

// Clear Kth Bit
function generateClearBit(input: BitwiseInput): MathSnapshot<BitwiseOperationData>[] {
  const { num1, k = 0 } = input;
  const snapshots: MathSnapshot<BitwiseOperationData>[] = [];
  let step = 0;

  const mask = ~(1 << k);
  const result = num1 & mask;

  snapshots.push({
    id: `clear-${step++}`,
    step: snapshots.length,
    description: `Clearing bit ${k} in ${num1}`,
    data: {
      operand1: createBitRep(num1, 8, [k]),
      operation: 'CLEAR_BIT',
      operationSymbol: '& ~(1<<k)',
      step: 'Initial',
    },
    currentLine: 1,
    variables: { num1, k },
  });

  snapshots.push({
    id: `clear-${step++}`,
    step: snapshots.length,
    description: `${num1} & ${mask & 0xFF} = ${result}`,
    data: {
      operand1: createBitRep(num1, 8, [k]),
      operand2: createBitRep(mask & 0xFF, 8, [k]),
      result: createBitRep(result, 8, [k]),
      operation: 'CLEAR_BIT',
      operationSymbol: '&',
      step: 'Complete',
    },
    currentLine: 2,
    variables: { num1, k, mask: mask & 0xFF, result },
    formula: `${num1} & ~(1<<${k}) = ${result}`,
  });

  return snapshots;
}

// Toggle Kth Bit
function generateToggleBit(input: BitwiseInput): MathSnapshot<BitwiseOperationData>[] {
  const { num1, k = 0 } = input;
  const snapshots: MathSnapshot<BitwiseOperationData>[] = [];
  let step = 0;

  const mask = 1 << k;
  const result = num1 ^ mask;

  snapshots.push({
    id: `toggle-${step++}`,
    step: snapshots.length,
    description: `Toggling bit ${k} in ${num1}`,
    data: {
      operand1: createBitRep(num1, 8, [k]),
      operation: 'TOGGLE_BIT',
      operationSymbol: '^ (1<<k)',
      step: 'Initial',
    },
    currentLine: 1,
    variables: { num1, k },
  });

  snapshots.push({
    id: `toggle-${step++}`,
    step: snapshots.length,
    description: `${num1} ^ ${mask} = ${result}`,
    data: {
      operand1: createBitRep(num1, 8, [k]),
      operand2: createBitRep(mask, 8, [k]),
      result: createBitRep(result, 8, [k]),
      operation: 'TOGGLE_BIT',
      operationSymbol: '^',
      step: 'Complete',
    },
    currentLine: 2,
    variables: { num1, k, mask, result },
    formula: `${num1} ^ (1<<${k}) = ${result}`,
  });

  return snapshots;
}

export const countSetBits: AlgorithmDefinition<BitwiseInput, BitwiseOperationData> = {
  id: 'count-set-bits',
  name: 'Count Set Bits',
  category: 'bitwise',
  categoryName: 'Bit Manipulation',
  description: 'Count the number of 1s in binary representation (population count). Checks each bit position.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
  spaceComplexity: 'O(1)',
  code: ['count = 0', 'while n > 0:', '  if n & 1: count++', '  n >>= 1', 'return count'],
  defaultInput: { num1: 29 },
  inputConfig: { type: 'array' },
  generate: generateCountSetBits,
};

export const brianKernighan: AlgorithmDefinition<BitwiseInput, BitwiseOperationData> = {
  id: 'brian-kernighan',
  name: "Brian Kernighan's Algorithm",
  category: 'bitwise',
  categoryName: 'Bit Manipulation',
  description: 'Efficiently count set bits using n & (n-1) which removes the rightmost set bit. Only iterates for each set bit.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(k)', average: 'O(k)', worst: 'O(k)' },
  spaceComplexity: 'O(1)',
  code: ['count = 0', 'while n > 0:', '  n = n & (n-1)', '  count++', 'return count'],
  defaultInput: { num1: 29 },
  inputConfig: { type: 'array' },
  generate: generateBrianKernighan,
};

export const powerOfTwo: AlgorithmDefinition<BitwiseInput, BitwiseOperationData> = {
  id: 'power-of-two-check',
  name: 'Power of Two Check',
  category: 'bitwise',
  categoryName: 'Bit Manipulation',
  description: 'Check if a number is a power of 2 using n & (n-1) == 0. Powers of 2 have exactly one set bit.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
  spaceComplexity: 'O(1)',
  code: ['if n <= 0: return false', 'return (n & (n-1)) == 0'],
  defaultInput: { num1: 16 },
  inputConfig: { type: 'array' },
  generate: generatePowerOfTwo,
};

export const checkKthBit: AlgorithmDefinition<BitwiseInput, BitwiseOperationData> = {
  id: 'check-kth-bit',
  name: 'Check Kth Bit',
  category: 'bitwise',
  categoryName: 'Bit Manipulation',
  description: 'Check if the kth bit is set using (n & (1 << k)) != 0. Creates a mask with only kth bit set.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
  spaceComplexity: 'O(1)',
  code: ['mask = 1 << k', 'return (n & mask) != 0'],
  defaultInput: { num1: 13, k: 2 },
  inputConfig: { type: 'array' },
  generate: generateCheckBit,
};

export const setKthBit: AlgorithmDefinition<BitwiseInput, BitwiseOperationData> = {
  id: 'set-kth-bit',
  name: 'Set Kth Bit',
  category: 'bitwise',
  categoryName: 'Bit Manipulation',
  description: 'Set the kth bit to 1 using n | (1 << k). OR operation ensures the bit is set.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
  spaceComplexity: 'O(1)',
  code: ['return n | (1 << k)'],
  defaultInput: { num1: 10, k: 2 },
  inputConfig: { type: 'array' },
  generate: generateSetBit,
};

export const clearKthBit: AlgorithmDefinition<BitwiseInput, BitwiseOperationData> = {
  id: 'clear-kth-bit',
  name: 'Clear Kth Bit',
  category: 'bitwise',
  categoryName: 'Bit Manipulation',
  description: 'Clear the kth bit to 0 using n & ~(1 << k). AND with inverted mask clears the bit.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
  spaceComplexity: 'O(1)',
  code: ['return n & ~(1 << k)'],
  defaultInput: { num1: 13, k: 2 },
  inputConfig: { type: 'array' },
  generate: generateClearBit,
};

export const toggleKthBit: AlgorithmDefinition<BitwiseInput, BitwiseOperationData> = {
  id: 'toggle-kth-bit',
  name: 'Toggle Kth Bit',
  category: 'bitwise',
  categoryName: 'Bit Manipulation',
  description: 'Toggle the kth bit using n ^ (1 << k). XOR flips the bit (0→1, 1→0).',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
  spaceComplexity: 'O(1)',
  code: ['return n ^ (1 << k)'],
  defaultInput: { num1: 10, k: 2 },
  inputConfig: { type: 'array' },
  generate: generateToggleBit,
};
