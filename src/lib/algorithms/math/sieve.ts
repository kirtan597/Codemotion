/**
 * Sieve of Eratosthenes
 * Find all primes up to n
 * Time: O(n log log n)
 * Space: O(n)
 */

import { AlgorithmDefinition } from '../../types/algorithm';
import { SieveInput, PrimeData, MathSnapshot, NumberCell } from '../../types/math';

function generateSieve(input: SieveInput): MathSnapshot<PrimeData>[] {
  const { n } = input;
  const snapshots: MathSnapshot<PrimeData>[] = [];
  let step = 0;

  // Initialize
  const numbers: NumberCell[] = [];
  for (let i = 0; i <= n; i++) {
    numbers.push({
      value: i,
      isPrime: i >= 2,
      isMarked: i < 2,
      state: i < 2 ? 'composite' : 'default',
    });
  }

  snapshots.push({
    id: `sieve-${step++}`,
    step: snapshots.length,
    description: `Finding all primes up to ${n} using Sieve of Eratosthenes`,
    data: {
      numbers: numbers.map(n => ({ ...n })),
      primes: [],
      currentNumber: 2,
      operation: 'Initialized',
    },
    currentLine: 1,
    variables: { n, primes: 0 },
  });

  const primes: number[] = [];

  for (let p = 2; p * p <= n; p++) {
    if (!numbers[p].isMarked) {
      numbers[p].state = 'prime';
      primes.push(p);

      snapshots.push({
        id: `sieve-${step++}`,
        step: snapshots.length,
        description: `${p} is prime. Marking all multiples of ${p}...`,
        data: {
          numbers: numbers.map(n => ({ ...n })),
          primes: [...primes],
          currentNumber: p,
          operation: `Processing prime ${p}`,
        },
        currentLine: 2,
        variables: { p, primes: primes.length },
      });

      // Mark multiples
      for (let i = p * p; i <= n; i += p) {
        if (!numbers[i].isMarked) {
          numbers[i].isMarked = true;
          numbers[i].isPrime = false;
          numbers[i].state = 'composite';
          numbers[i].markedBy = p;

          if (i <= Math.min(n, 100)) {  // Limit snapshots for large n
            snapshots.push({
              id: `sieve-${step++}`,
              step: snapshots.length,
              description: `Marking ${i} as composite (multiple of ${p})`,
              data: {
                numbers: numbers.map(n => ({ ...n })),
                primes: [...primes],
                currentNumber: i,
                operation: `Marking multiples of ${p}`,
              },
              currentLine: 3,
              variables: { p, i, markedBy: p },
            });
          }
        }
      }
    }
  }

  // Collect remaining primes
  for (let p = 2; p <= n; p++) {
    if (!numbers[p].isMarked && numbers[p].isPrime) {
      numbers[p].state = 'prime';
      if (!primes.includes(p)) {
        primes.push(p);
      }
    }
  }

  snapshots.push({
    id: `sieve-${step++}`,
    step: snapshots.length,
    description: `Found ${primes.length} primes: ${primes.slice(0, 20).join(', ')}${primes.length > 20 ? '...' : ''}`,
    data: {
      numbers: numbers.map(n => ({ ...n })),
      primes,
      currentNumber: -1,
      operation: 'Complete',
    },
    currentLine: 4,
    variables: { n, totalPrimes: primes.length },
    formula: `Primes ≤ ${n}: ${primes.length}`,
  });

  return snapshots;
}

export const sieveOfEratosthenes: AlgorithmDefinition<SieveInput, PrimeData> = {
  id: 'sieve-of-eratosthenes',
  name: 'Sieve of Eratosthenes',
  category: 'math',
  categoryName: 'Mathematical Algorithms',
  description: 'Find all prime numbers up to n by iteratively marking multiples of each prime as composite. Ancient and efficient algorithm.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(n log log n)',
    average: 'O(n log log n)',
    worst: 'O(n log log n)',
  },
  spaceComplexity: 'O(n)',
  code: [
    'isPrime[0..n] = true',
    'isPrime[0] = isPrime[1] = false',
    'for p = 2 to √n:',
    '  if isPrime[p]:',
    '    for i = p² to n step p:',
    '      isPrime[i] = false',
  ],
  defaultInput: { n: 30 },
  inputConfig: { type: 'array', minSize: 2, maxSize: 100, defaultSize: 30 },
  generate: generateSieve,
};
