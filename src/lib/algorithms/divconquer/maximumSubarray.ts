/**
 * Maximum Subarray (Divide & Conquer) — Kadane-free approach.
 * Split array in half, find max crossing subarray, combine.
 * O(n log n) — shows recursive splitting and merging clearly.
 */
import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DivConquerData } from '@/lib/types/divconquer';
import { ArrayElement, ElementState } from '@/lib/types/algorithm';

function makeElements(arr: number[], states: Record<number, ElementState>): ArrayElement[] {
  return arr.map((v, i) => ({ id: `msa-${i}`, value: v, state: states[i] ?? 'default' }));
}

export const maximumSubarray: AlgorithmDefinition<number[], DivConquerData> = {
  id: 'maximum-subarray-dc',
  name: 'Maximum Subarray (D&C)',
  category: 'divconquer',
  categoryName: 'Divide & Conquer',
  description:
    'Find the contiguous subarray with the largest sum using Divide & Conquer. Splits the array, finds the best subarray in each half and across the midpoint, then combines.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(log n)',
  defaultInput: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
  inputConfig: { type: 'array', minSize: 2, maxSize: 30, defaultSize: 9, supportsCustomInput: true },
  code: [
    'function maxSubarray(arr, lo, hi):',
    '  if lo == hi: return arr[lo]  // base case',
    '  mid = (lo + hi) / 2',
    '  leftMax = maxSubarray(arr, lo, mid)',
    '  rightMax = maxSubarray(arr, mid+1, hi)',
    '  crossMax = maxCrossing(arr, lo, mid, hi)',
    '  return max(leftMax, rightMax, crossMax)',
  ],
  generate: (input: number[]): Snapshot<DivConquerData>[] => {
    const arr = input.slice(0, 30);
    const n = arr.length;
    const out: Snapshot<DivConquerData>[] = [];
    const MAX_SNAPS = 2000;

    function snap(desc: string, line: number, activeRange: [number, number], leftRange?: [number, number], rightRange?: [number, number], phase?: DivConquerData['phase'], extra?: Record<string, any>): void {
      if (out.length >= MAX_SNAPS) return;
      const states: Record<number, ElementState> = {};
      for (let i = activeRange[0]; i <= activeRange[1]; i++) states[i] = 'active';
      if (leftRange) for (let i = leftRange[0]; i <= leftRange[1]; i++) if (states[i] !== 'active') states[i] = 'comparing';
      if (rightRange) for (let i = rightRange[0]; i <= rightRange[1]; i++) if (states[i] !== 'active') states[i] = 'comparing';

      out.push({
        id: `msa-${out.length}`, step: out.length, description: desc,
        data: { elements: makeElements(arr, states), activeRange, leftRange, rightRange, phase, extra },
        currentLine: line,
        variables: { ...extra },
      });
    }

    snap('Maximum Subarray via Divide & Conquer.', 0, [0, n - 1], undefined, undefined, 'divide');

    function maxCrossing(lo: number, mid: number, hi: number): { sum: number; left: number; right: number } {
      let leftSum = -Infinity, sum = 0, leftIdx = mid;
      for (let i = mid; i >= lo; i--) { sum += arr[i]; if (sum > leftSum) { leftSum = sum; leftIdx = i; } }

      let rightSum = -Infinity; sum = 0; let rightIdx = mid + 1;
      for (let i = mid + 1; i <= hi; i++) { sum += arr[i]; if (sum > rightSum) { rightSum = sum; rightIdx = i; } }

      const crossStates: Record<number, ElementState> = {};
      for (let i = leftIdx; i <= rightIdx; i++) crossStates[i] = 'pivot';
      snap(`Cross subarray [${leftIdx}..${rightIdx}] = ${leftSum + rightSum}`, 5,
        [lo, hi], [lo, mid], [mid + 1, hi], 'merge',
        { leftSum, rightSum, crossSum: leftSum + rightSum, leftIdx, rightIdx });

      return { sum: leftSum + rightSum, left: leftIdx, right: rightIdx };
    }

    let bestLeft = 0, bestRight = 0;

    function solve(lo: number, hi: number): number {
      if (out.length >= MAX_SNAPS) return arr[lo];
      if (lo === hi) {
        snap(`Base case: single element arr[${lo}]=${arr[lo]}`, 1, [lo, hi], undefined, undefined, 'solve', { baseCase: arr[lo] });
        return arr[lo];
      }

      const mid = Math.floor((lo + hi) / 2);
      snap(`Divide [${lo}..${hi}] at mid=${mid}`, 2, [lo, hi], [lo, mid], [mid + 1, hi], 'divide', { lo, mid, hi });

      const leftMax = solve(lo, mid);
      const rightMax = solve(mid + 1, hi);
      const cross = maxCrossing(lo, mid, hi);

      const best = Math.max(leftMax, rightMax, cross.sum);
      snap(`Combine [${lo}..${hi}]: left=${leftMax}, right=${rightMax}, cross=${cross.sum} → best=${best}`, 6,
        [lo, hi], [lo, mid], [mid + 1, hi], 'merge', { leftMax, rightMax, crossSum: cross.sum, best });

      if (best === cross.sum) { bestLeft = cross.left; bestRight = cross.right; }
      return best;
    }

    const result = solve(0, n - 1);

    // Highlight final best subarray
    const finalStates: Record<number, ElementState> = {};
    for (let i = bestLeft; i <= bestRight; i++) finalStates[i] = 'sorted';

    out.push({
      id: `msa-final`, step: out.length, description: `Maximum subarray sum = ${result}, subarray arr[${bestLeft}..${bestRight}] = [${arr.slice(bestLeft, bestRight + 1).join(', ')}]`,
      data: { elements: makeElements(arr, finalStates), activeRange: [bestLeft, bestRight], phase: 'done', extra: { maxSum: result } },
      currentLine: 6,
      variables: { maxSum: result, bestLeft, bestRight },
    });

    return out;
  },
};
