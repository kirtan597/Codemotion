/**
 * Greatest Common Divisor (GCD) - Euclidean Algorithm
 * Time: O(log min(a,b))
 * Space: O(1)
 */

import { AlgorithmDefinition } from '../../types/algorithm';
import { GCDInput, GCDData, MathSnapshot } from '../../types/math';

function generateGCD(input: GCDInput): MathSnapshot<GCDData>[] {
  const { a: initialA, b: initialB } = input;
  const snapshots: MathSnapshot<GCDData>[] = [];
  let step = 0;
  let a = Math.max(initialA, initialB);
  let b = Math.min(initialA, initialB);
  const steps: any[] = [];

  snapshots.push({
    id: `gcd-${step++}`,
    step: snapshots.length,
    description: `Finding GCD(${a}, ${b}) using Euclidean Algorithm`,
    data: {
      a,
      b,
      steps: [],
    },
    currentLine: 1,
    variables: { a, b },
    formula: `GCD(${a}, ${b}) = ?`,
  });

  while (b !== 0) {
    const quotient = Math.floor(a / b);
    const remainder = a % b;

    steps.push({ a, b, quotient, remainder, operation: `${a} = ${b} × ${quotient} + ${remainder}` });

    snapshots.push({
      id: `gcd-${step++}`,
      step: snapshots.length,
      description: `${a} = ${b} × ${quotient} + ${remainder}`,
      data: {
        a,
        b,
        quotient,
        remainder,
        steps: [...steps],
      },
      currentLine: 2,
      variables: { a, b, quotient, remainder },
      formula: `${a} mod ${b} = ${remainder}`,
    });

    a = b;
    b = remainder;

    if (b !== 0) {
      snapshots.push({
        id: `gcd-${step++}`,
        step: snapshots.length,
        description: `Next: GCD(${a}, ${b})`,
        data: {
          a,
          b,
          steps: [...steps],
        },
        currentLine: 3,
        variables: { a, b },
      });
    }
  }

  snapshots.push({
    id: `gcd-${step++}`,
    step: snapshots.length,
    description: `GCD(${initialA}, ${initialB}) = ${a}`,
    data: {
      a,
      b: 0,
      steps: [...steps],
    },
    currentLine: 4,
    variables: { result: a },
    formula: `GCD(${initialA}, ${initialB}) = ${a}`,
  });

  return snapshots;
}

export const euclideanGCD: AlgorithmDefinition<GCDInput, GCDData> = {
  id: 'euclidean-gcd',
  name: 'Euclidean GCD',
  category: 'math',
  categoryName: 'Mathematical Algorithms',
  description: 'Find Greatest Common Divisor using Euclidean algorithm. Repeatedly applies: GCD(a,b) = GCD(b, a mod b) until b=0.',
  difficulty: 'Easy',
  timeComplexity: {
    best: 'O(log min(a,b))',
    average: 'O(log min(a,b))',
    worst: 'O(log min(a,b))',
  },
  spaceComplexity: 'O(1)',
  code: [
    'while b ≠ 0:',
    '  remainder = a mod b',
    '  a = b',
    '  b = remainder',
    'return a',
  ],
  defaultInput: { a: 48, b: 18 },
  inputConfig: { type: 'array' },
  generate: generateGCD,
};
