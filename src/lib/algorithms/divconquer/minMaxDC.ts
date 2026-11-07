/**
 * Min-Max Algorithm (Divide & Conquer) — find both min and max using fewer comparisons.
 * Classic D&C: split array in half, find min/max in each, combine.
 * Uses ~3n/2 comparisons vs 2n for naive approach.
 */
import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DivConquerData } from '@/lib/types/divconquer';
import { ArrayElement, ElementState } from '@/lib/types/algorithm';

function makeElements(arr: number[], lo: number, hi: number, minIdx: number, maxIdx: number): ArrayElement[] {
  return arr.map((v, i) => {
    let state: ElementState = 'default';
    if (i >= lo && i <= hi) state = 'active';
    if (i === minIdx) state = 'found';
    if (i === maxIdx) state = 'sorted';
    return { id: `mm-${i}`, value: v, state };
  });
}

export const minMaxDC: AlgorithmDefinition<number[], DivConquerData> = {
  id: 'min-max-dc',
  name: 'Min-Max (D&C)',
  category: 'divconquer',
  categoryName: 'Divide & Conquer',
  description:
    'Find both minimum and maximum in O(n) using ~3n/2 comparisons — fewer than the naive 2n. Splits the array in half recursively, finds min/max in each sub-problem, then combines.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(log n)',
  defaultInput: [3, 2, 9, 5, 1, 8, 4, 7, 6],
  inputConfig: { type: 'array', minSize: 2, maxSize: 30, defaultSize: 9, supportsCustomInput: true },
  code: [
    'function minMax(arr, lo, hi):',
    '  if lo == hi: return (arr[lo], arr[lo])  // base case',
    '  if hi == lo+1:',
    '    return (min(arr[lo],arr[hi]), max(arr[lo],arr[hi]))',
    '  mid = (lo + hi) / 2',
    '  (lMin, lMax) = minMax(arr, lo, mid)',
    '  (rMin, rMax) = minMax(arr, mid+1, hi)',
    '  return (min(lMin, rMin), max(lMax, rMax))',
  ],
  generate: (input: number[]): Snapshot<DivConquerData>[] => {
    const arr = input.slice(0, 30);
    const n = arr.length;
    const out: Snapshot<DivConquerData>[] = [];
    let comparisons = 0;
    let globalMin = arr[0], globalMax = arr[0], minIdx = 0, maxIdx = 0;
    const MAX_SNAPS = 2000;

    function snap(lo: number, hi: number, desc: string, line: number, phase: DivConquerData['phase'], extra?: Record<string, any>): void {
      if (out.length >= MAX_SNAPS) return;
      out.push({
        id: `mm-${out.length}`, step: out.length, description: desc,
        data: {
          elements: makeElements(arr, lo, hi, minIdx, maxIdx),
          activeRange: [lo, hi] as [number, number],
          phase, extra,
        },
        currentLine: line,
        variables: { lo, hi, comparisons, globalMin, globalMax, ...extra },
      });
    }

    snap(0, n - 1, `Min-Max D&C on [${arr.join(', ')}]`, 0, 'divide');

    function solve(lo: number, hi: number): { min: number; max: number; minI: number; maxI: number } {
      if (out.length >= MAX_SNAPS) return { min: arr[lo], max: arr[lo], minI: lo, maxI: lo };

      if (lo === hi) {
        snap(lo, hi, `Base: single element arr[${lo}]=${arr[lo]}`, 1, 'solve', { baseMin: arr[lo], baseMax: arr[lo] });
        return { min: arr[lo], max: arr[lo], minI: lo, maxI: lo };
      }

      if (hi === lo + 1) {
        comparisons++;
        const [mn, mx, mi, xi] = arr[lo] <= arr[hi]
          ? [arr[lo], arr[hi], lo, hi]
          : [arr[hi], arr[lo], hi, lo];
        snap(lo, hi, `Base: pair arr[${lo}]=${arr[lo]}, arr[${hi}]=${arr[hi]} → min=${mn}, max=${mx}`, 2, 'solve', { pairMin: mn, pairMax: mx });
        return { min: mn, max: mx, minI: mi, maxI: xi };
      }

      const mid = Math.floor((lo + hi) / 2);
      snap(lo, hi, `Divide [${lo}..${hi}] at mid=${mid}`, 4, 'divide', { lo, hi, mid });

      const left = solve(lo, mid);
      const right = solve(mid + 1, hi);

      comparisons += 2;
      const resMin = Math.min(left.min, right.min);
      const resMax = Math.max(left.max, right.max);
      const minI = resMin === left.min ? left.minI : right.minI;
      const maxI = resMax === left.max ? left.maxI : right.maxI;

      if (resMin < globalMin) { globalMin = resMin; minIdx = minI; }
      if (resMax > globalMax) { globalMax = resMax; maxIdx = maxI; }

      snap(lo, hi, `Combine [${lo}..${hi}]: min=${resMin}, max=${resMax}`, 7, 'merge',
        { leftMin: left.min, leftMax: left.max, rightMin: right.min, rightMax: right.max, resMin, resMax });

      return { min: resMin, max: resMax, minI, maxI };
    }

    const result = solve(0, n - 1);

    out.push({
      id: `mm-final`, step: out.length,
      description: `✓ Min = ${result.min} (index ${result.minI}), Max = ${result.max} (index ${result.maxI}). Comparisons: ${comparisons}.`,
      data: {
        elements: makeElements(arr, 0, n - 1, result.minI, result.maxI),
        activeRange: [0, n - 1], phase: 'done',
        extra: { min: result.min, max: result.max, comparisons, naiveComparisons: 2 * (n - 1) },
      },
      currentLine: 7,
      variables: { min: result.min, max: result.max, comparisons, saved: 2 * (n - 1) - comparisons },
    });

    return out;
  },
};
