/**
 * Binary Search (Divide & Conquer framing) — shows recursive division and range elimination.
 * Reuses ArrayElement[] → DivConquerVisualizer for the D&C category.
 */
import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { DivConquerData } from '@/lib/types/divconquer';
import { ArrayElement, ElementState } from '@/lib/types/algorithm';

interface BinarySearchDCInput { array: number[]; target: number }

function makeElements(arr: number[], lo: number, hi: number, mid: number, target: number): ArrayElement[] {
  return arr.map((v, i) => {
    let state: ElementState = 'default';
    if (i < lo || i > hi) state = 'visited';   // eliminated
    else if (i === mid) state = v === target ? 'found' : 'comparing';
    else if (i >= lo && i <= hi) state = 'active';
    if (v === target && i !== mid) state = 'target';
    return { id: `bsdc-${i}`, value: v, state };
  });
}

export const binarySearchDC: AlgorithmDefinition<BinarySearchDCInput, DivConquerData> = {
  id: 'binary-search-dc',
  name: 'Binary Search (D&C)',
  category: 'divconquer',
  categoryName: 'Divide & Conquer',
  description:
    'Binary search expressed as a recursive Divide & Conquer algorithm. At each level, compute the midpoint, eliminate one half, and recurse on the other — classic D&C splitting.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
  spaceComplexity: 'O(log n)',
  defaultInput: { array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target: 23 },
  inputConfig: { type: 'array-target', supportsCustomInput: true },
  code: [
    'function binarySearch(arr, lo, hi, target):',
    '  if lo > hi: return -1  // not found',
    '  mid = (lo + hi) / 2',
    '  if arr[mid] == target: return mid',
    '  if target < arr[mid]:',
    '    return binarySearch(arr, lo, mid-1, target)  // left half',
    '  else:',
    '    return binarySearch(arr, mid+1, hi, target)  // right half',
  ],
  generate: (input: BinarySearchDCInput): Snapshot<DivConquerData>[] => {
    const arr = [...(input.array ?? [])].sort((a, b) => a - b);
    const target = input.target ?? arr[Math.floor(arr.length / 2)];
    const n = arr.length;
    const out: Snapshot<DivConquerData>[] = [];

    function snap(lo: number, hi: number, mid: number, desc: string, line: number, phase: DivConquerData['phase'], extra?: Record<string, any>): void {
      out.push({
        id: `bsdc-${out.length}`, step: out.length, description: desc,
        data: {
          elements: makeElements(arr, lo, hi, mid, target),
          activeRange: [lo, hi] as [number, number],
          phase, extra,
        },
        currentLine: line,
        variables: { lo, hi, mid, target, ...extra },
      });
    }

    snap(0, n - 1, Math.floor((n - 1) / 2), `Binary Search (D&C): target=${target} in sorted array of ${n} elements.`, 0, 'divide');

    function solve(lo: number, hi: number, depth: number): number {
      if (lo > hi) {
        out.push({
          id: `bsdc-${out.length}`, step: out.length, description: `lo(${lo}) > hi(${hi}): target ${target} not found.`,
          data: { elements: makeElements(arr, 0, -1, -1, target), activeRange: [lo, hi] as [number, number], phase: 'done' },
          currentLine: 1,
          variables: { lo, hi, target, found: false },
        });
        return -1;
      }

      const mid = Math.floor((lo + hi) / 2);
      snap(lo, hi, mid, `Divide [${lo}..${hi}]: mid=${mid}, arr[mid]=${arr[mid]}, target=${target}.`, 2, 'divide', { depth, lo, hi, mid });

      if (arr[mid] === target) {
        out.push({
          id: `bsdc-${out.length}`, step: out.length, description: `✓ arr[${mid}] = ${target}. Found at index ${mid}!`,
          data: { elements: makeElements(arr, lo, hi, mid, target), activeRange: [mid, mid] as [number, number], phase: 'done' },
          currentLine: 3,
          variables: { lo, hi, mid, target, found: true, index: mid },
        });
        return mid;
      }

      if (target < arr[mid]) {
        snap(lo, mid - 1, Math.floor((lo + mid - 1) / 2), `${target} < arr[${mid}]=${arr[mid]}: eliminate RIGHT half, recurse LEFT [${lo}..${mid - 1}].`, 5, 'divide', { eliminated: `right [${mid}..${hi}]` });
        return solve(lo, mid - 1, depth + 1);
      } else {
        snap(mid + 1, hi, Math.floor((mid + 1 + hi) / 2), `${target} > arr[${mid}]=${arr[mid]}: eliminate LEFT half, recurse RIGHT [${mid + 1}..${hi}].`, 7, 'divide', { eliminated: `left [${lo}..${mid}]` });
        return solve(mid + 1, hi, depth + 1);
      }
    }

    solve(0, n - 1, 0);
    return out;
  },
};
