/**
 * Fast Exponentiation (Binary Exponentiation)
 * Compute a^b efficiently
 * Time: O(log b)
 * Space: O(1)
 */

import { AlgorithmDefinition } from '../../types/algorithm';
import { ExponentiationInput, ExponentiationData, MathSnapshot, ExponentStep } from '../../types/math';

function generateFastExp(input: ExponentiationInput): MathSnapshot<ExponentiationData>[] {
  const { base, exponent, modulo } = input;
  const snapshots: MathSnapshot<ExponentiationData>[] = [];
  let step = 0;

  const binaryExp = exponent.toString(2);
  const steps: ExponentStep[] = [];

  snapshots.push({
    id: `fastexp-${step++}`,
    step: snapshots.length,
    description: `Computing ${base}^${exponent}${modulo ? ` mod ${modulo}` : ''} using binary exponentiation`,
    data: {
      base,
      exponent,
      modulo,
      result: 1,
      binaryExp,
      steps: [],
      currentBit: -1,
    },
    currentLine: 1,
    variables: { base, exponent, binary: binaryExp, modulo: modulo || 'none' },
    formula: `${base}^${exponent} = ${base}^(${binaryExp})₂`,
  });

  let result = 1;
  let currentPower = base;
  const bits = binaryExp.split('').reverse();

  for (let i = 0; i < bits.length; i++) {
    const bit = parseInt(bits[i]);
    const bitDesc = bit === 1 ? 'multiply' : 'skip';

    if (bit === 1) {
      const oldResult = result;
      result = modulo ? (result * currentPower) % modulo : result * currentPower;
      
      steps.push({
        bit,
        power: Math.pow(base, Math.pow(2, i)),
        result,
        operation: `result = ${oldResult} × ${currentPower}${modulo ? ` mod ${modulo}` : ''} = ${result}`,
      });

      snapshots.push({
        id: `fastexp-${step++}`,
        step: snapshots.length,
        description: `Bit ${i} = 1: Multiply result by ${base}^${Math.pow(2, i)} = ${currentPower}`,
        data: {
          base,
          exponent,
          modulo,
          result,
          binaryExp,
          steps: [...steps],
          currentBit: i,
        },
        currentLine: 2,
        variables: { bit, i, currentPower, result, operation: 'multiply' },
        formula: `result × ${currentPower}${modulo ? ` mod ${modulo}` : ''} = ${result}`,
      });
    } else {
      steps.push({
        bit,
        power: Math.pow(base, Math.pow(2, i)),
        result,
        operation: `bit = 0, skip`,
      });

      snapshots.push({
        id: `fastexp-${step++}`,
        step: snapshots.length,
        description: `Bit ${i} = 0: Skip (don't multiply)`,
        data: {
          base,
          exponent,
          modulo,
          result,
          binaryExp,
          steps: [...steps],
          currentBit: i,
        },
        currentLine: 3,
        variables: { bit, i, currentPower, result, operation: 'skip' },
      });
    }

    // Square current power for next bit
    if (i < bits.length - 1) {
      const oldPower = currentPower;
      currentPower = modulo ? (currentPower * currentPower) % modulo : currentPower * currentPower;

      snapshots.push({
        id: `fastexp-${step++}`,
        step: snapshots.length,
        description: `Square: ${oldPower}² = ${currentPower}${modulo ? ` mod ${modulo}` : ''}`,
        data: {
          base,
          exponent,
          modulo,
          result,
          binaryExp,
          steps: [...steps],
          currentBit: i,
        },
        currentLine: 4,
        variables: { oldPower, currentPower, operation: 'square' },
        formula: `${oldPower}² = ${currentPower}`,
      });
    }
  }

  snapshots.push({
    id: `fastexp-${step++}`,
    step: snapshots.length,
    description: `${base}^${exponent}${modulo ? ` mod ${modulo}` : ''} = ${result}`,
    data: {
      base,
      exponent,
      modulo,
      result,
      binaryExp,
      steps: [...steps],
      currentBit: -1,
    },
    currentLine: 5,
    variables: { base, exponent, result, modulo: modulo || 'none' },
    formula: `${base}^${exponent}${modulo ? ` mod ${modulo}` : ''} = ${result}`,
  });

  return snapshots;
}

export const fastExponentiation: AlgorithmDefinition<ExponentiationInput, ExponentiationData> = {
  id: 'fast-exponentiation',
  name: 'Fast Exponentiation',
  category: 'math',
  categoryName: 'Mathematical Algorithms',
  description: 'Compute a^b in O(log b) time using binary representation. Also known as exponentiation by squaring. Supports modular arithmetic.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(log b)',
    average: 'O(log b)',
    worst: 'O(log b)',
  },
  spaceComplexity: 'O(1)',
  code: [
    'result = 1, power = base',
    'while exponent > 0:',
    '  if exponent & 1:',
    '    result *= power',
    '  power *= power',
    '  exponent >>= 1',
  ],
  defaultInput: { base: 2, exponent: 10 },
  inputConfig: { type: 'array' },
  generate: generateFastExp,
};
