/**
 * Basic Bitwise Operations
 * AND, OR, XOR, NOT, Left Shift, Right Shift
 */

import { AlgorithmDefinition } from '../../types/algorithm';
import { BitwiseInput, BitwiseOperationData, MathSnapshot, BitRepresentation, Bit } from '../../types/math';

function createBitRep(num: number, bits = 8, highlighted: number[] = []): BitRepresentation {
  const binary = (num >>> 0).toString(2).padStart(bits, '0');
  const bitArray: Bit[] = binary.split('').map((b, idx) => ({
    position: bits - 1 - idx,
    value: b === '1' ? 1 : 0,
    state: highlighted.includes(bits - 1 - idx) ? 'active' : 'default',
  }));
  
  return { decimal: num, binary, bits: bitArray, highlighted };
}

// AND Operation
function generateAND(input: BitwiseInput): MathSnapshot<BitwiseOperationData>[] {
  const { num1, num2 = 0 } = input;
  const snapshots: MathSnapshot<BitwiseOperationData>[] = [];
  let step = 0;

  snapshots.push({
    id: `and-${step++}`,
    step: snapshots.length,
    description: `Computing ${num1} AND ${num2}`,
    data: {
      operand1: createBitRep(num1),
      operand2: createBitRep(num2),
      operation: 'AND',
      operationSymbol: '&',
      step: 'Initial values',
    },
    currentLine: 1,
    variables: { num1, num2 },
  });

  const result = num1 & num2;
  
  // Show bit-by-bit operation
  for (let i = 7; i >= 0; i--) {
    const bit1 = (num1 >> i) & 1;
    const bit2 = (num2 >> i) & 1;
    const resBit = bit1 & bit2;

    snapshots.push({
      id: `and-${step++}`,
      step: snapshots.length,
      description: `Bit ${i}: ${bit1} AND ${bit2} = ${resBit}`,
      data: {
        operand1: createBitRep(num1, 8, [i]),
        operand2: createBitRep(num2, 8, [i]),
        result: createBitRep(result & ((1 << (i + 1)) - 1), 8, [i]),
        operation: 'AND',
        operationSymbol: '&',
        step: `Processing bit ${i}`,
      },
      currentLine: 2,
      variables: { bit1, bit2, resBit, position: i },
    });
  }

  snapshots.push({
    id: `and-${step++}`,
    step: snapshots.length,
    description: `Result: ${num1} & ${num2} = ${result}`,
    data: {
      operand1: createBitRep(num1),
      operand2: createBitRep(num2),
      result: createBitRep(result),
      operation: 'AND',
      operationSymbol: '&',
      step: 'Complete',
    },
    currentLine: 3,
    variables: { num1, num2, result },
    formula: `${num1} & ${num2} = ${result}`,
  });

  return snapshots;
}

// XOR Operation
function generateXOR(input: BitwiseInput): MathSnapshot<BitwiseOperationData>[] {
  const { num1, num2 = 0 } = input;
  const snapshots: MathSnapshot<BitwiseOperationData>[] = [];
  let step = 0;

  snapshots.push({
    id: `xor-${step++}`,
    step: snapshots.length,
    description: `Computing ${num1} XOR ${num2}`,
    data: {
      operand1: createBitRep(num1),
      operand2: createBitRep(num2),
      operation: 'XOR',
      operationSymbol: '^',
      step: 'Initial values',
    },
    currentLine: 1,
    variables: { num1, num2 },
  });

  const result = num1 ^ num2;
  
  for (let i = 7; i >= 0; i--) {
    const bit1 = (num1 >> i) & 1;
    const bit2 = (num2 >> i) & 1;
    const resBit = bit1 ^ bit2;

    snapshots.push({
      id: `xor-${step++}`,
      step: snapshots.length,
      description: `Bit ${i}: ${bit1} XOR ${bit2} = ${resBit} (different: ${bit1 !== bit2})`,
      data: {
        operand1: createBitRep(num1, 8, [i]),
        operand2: createBitRep(num2, 8, [i]),
        result: createBitRep(result & ((1 << (i + 1)) - 1), 8, [i]),
        operation: 'XOR',
        operationSymbol: '^',
        step: `Processing bit ${i}`,
      },
      currentLine: 2,
      variables: { bit1, bit2, resBit, position: i },
    });
  }

  snapshots.push({
    id: `xor-${step++}`,
    step: snapshots.length,
    description: `Result: ${num1} ^ ${num2} = ${result}`,
    data: {
      operand1: createBitRep(num1),
      operand2: createBitRep(num2),
      result: createBitRep(result),
      operation: 'XOR',
      operationSymbol: '^',
      step: 'Complete',
    },
    currentLine: 3,
    variables: { num1, num2, result },
    formula: `${num1} ^ ${num2} = ${result}`,
  });

  return snapshots;
}

// Left Shift
function generateLeftShift(input: BitwiseInput): MathSnapshot<BitwiseOperationData>[] {
  const { num1, k = 1 } = input;
  const snapshots: MathSnapshot<BitwiseOperationData>[] = [];
  let step = 0;

  snapshots.push({
    id: `lshift-${step++}`,
    step: snapshots.length,
    description: `Left shifting ${num1} by ${k} positions`,
    data: {
      operand1: createBitRep(num1),
      operation: 'LEFT_SHIFT',
      operationSymbol: '<<',
      step: `Shift ${k} positions left`,
    },
    currentLine: 1,
    variables: { num1, k },
  });

  const result = num1 << k;

  snapshots.push({
    id: `lshift-${step++}`,
    step: snapshots.length,
    description: `Result: ${num1} << ${k} = ${result} (multiply by 2^${k} = ${Math.pow(2, k)})`,
    data: {
      operand1: createBitRep(num1),
      result: createBitRep(result),
      operation: 'LEFT_SHIFT',
      operationSymbol: '<<',
      step: 'Complete',
    },
    currentLine: 2,
    variables: { num1, k, result, multiplier: Math.pow(2, k) },
    formula: `${num1} << ${k} = ${num1} × 2^${k} = ${result}`,
  });

  return snapshots;
}

// Right Shift
function generateRightShift(input: BitwiseInput): MathSnapshot<BitwiseOperationData>[] {
  const { num1, k = 1 } = input;
  const snapshots: MathSnapshot<BitwiseOperationData>[] = [];
  let step = 0;

  snapshots.push({
    id: `rshift-${step++}`,
    step: snapshots.length,
    description: `Right shifting ${num1} by ${k} positions`,
    data: {
      operand1: createBitRep(num1),
      operation: 'RIGHT_SHIFT',
      operationSymbol: '>>',
      step: `Shift ${k} positions right`,
    },
    currentLine: 1,
    variables: { num1, k },
  });

  const result = num1 >> k;

  snapshots.push({
    id: `rshift-${step++}`,
    step: snapshots.length,
    description: `Result: ${num1} >> ${k} = ${result} (divide by 2^${k} = ${Math.pow(2, k)})`,
    data: {
      operand1: createBitRep(num1),
      result: createBitRep(result),
      operation: 'RIGHT_SHIFT',
      operationSymbol: '>>',
      step: 'Complete',
    },
    currentLine: 2,
    variables: { num1, k, result, divisor: Math.pow(2, k) },
    formula: `${num1} >> ${k} = ${num1} ÷ 2^${k} = ${result}`,
  });

  return snapshots;
}

export const bitwiseAND: AlgorithmDefinition<BitwiseInput, BitwiseOperationData> = {
  id: 'bitwise-and',
  name: 'Bitwise AND',
  category: 'bitwise',
  categoryName: 'Bit Manipulation',
  description: 'Performs AND operation on each bit pair. Result bit is 1 only if both bits are 1. Used for bit masking and checking if bits are set.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
  spaceComplexity: 'O(1)',
  code: ['result = 0', 'for each bit position i:', '  bit1 = (num1 >> i) & 1', '  bit2 = (num2 >> i) & 1', '  result |= (bit1 & bit2) << i'],
  defaultInput: { num1: 12, num2: 10 },
  inputConfig: { type: 'array' },
  generate: generateAND,
};

export const bitwiseXOR: AlgorithmDefinition<BitwiseInput, BitwiseOperationData> = {
  id: 'bitwise-xor',
  name: 'Bitwise XOR',
  category: 'bitwise',
  categoryName: 'Bit Manipulation',
  description: 'Performs XOR operation on each bit pair. Result bit is 1 if bits are different, 0 if same. Used for toggling bits and finding unique elements.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
  spaceComplexity: 'O(1)',
  code: ['result = 0', 'for each bit position i:', '  bit1 = (num1 >> i) & 1', '  bit2 = (num2 >> i) & 1', '  result |= (bit1 ^ bit2) << i'],
  defaultInput: { num1: 12, num2: 10 },
  inputConfig: { type: 'array' },
  generate: generateXOR,
};

export const leftShift: AlgorithmDefinition<BitwiseInput, BitwiseOperationData> = {
  id: 'left-shift',
  name: 'Left Shift',
  category: 'bitwise',
  categoryName: 'Bit Manipulation',
  description: 'Shifts all bits to the left by k positions, filling with 0s. Equivalent to multiplying by 2^k. Fast multiplication by powers of 2.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
  spaceComplexity: 'O(1)',
  code: ['result = num << k', '// Equivalent to num * 2^k'],
  defaultInput: { num1: 5, k: 2 },
  inputConfig: { type: 'array' },
  generate: generateLeftShift,
};

export const rightShift: AlgorithmDefinition<BitwiseInput, BitwiseOperationData> = {
  id: 'right-shift',
  name: 'Right Shift',
  category: 'bitwise',
  categoryName: 'Bit Manipulation',
  description: 'Shifts all bits to the right by k positions. Equivalent to integer division by 2^k. Fast division by powers of 2.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
  spaceComplexity: 'O(1)',
  code: ['result = num >> k', '// Equivalent to num / 2^k'],
  defaultInput: { num1: 20, k: 2 },
  inputConfig: { type: 'array' },
  generate: generateRightShift,
};
