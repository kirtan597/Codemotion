/**
 * Permutations — generate all permutations of a set of elements via backtracking.
 * Swap-based in-place approach. Board shows the current array state.
 */
import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { BacktrackingData, BoardCell, CellState, PermutationsInput } from '@/lib/types/backtracking';

function makeBoard(arr: number[], swapA = -1, swapB = -1, fixed = -1): BoardCell[][] {
  return [arr.map((v, i) => {
    let state: CellState = 'empty';
    if (i === fixed) state = 'placed';
    else if (i === swapA || i === swapB) state = 'trying';
    return { row: 0, col: i, value: v, state };
  })];
}

export const permutations: AlgorithmDefinition<PermutationsInput, BacktrackingData> = {
  id: 'permutations',
  name: 'Permutations',
  category: 'backtracking',
  categoryName: 'Backtracking',
  description:
    'Generate all permutations of the input elements using an in-place swap-based backtracking approach. Fix one element at each position and recurse on the remaining elements.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(n!)', average: 'O(n!)', worst: 'O(n!)' },
  spaceComplexity: 'O(n)',
  defaultInput: { elements: [1, 2, 3, 4] },
  inputConfig: { type: 'array', supportsCustomInput: true },
  code: [
    'function permute(arr, start):',
    '  if start == n:',
    '    record arr as a permutation',
    '    return',
    '  for i in start..n-1:',
    '    swap(arr[start], arr[i])   // fix arr[start]',
    '    permute(arr, start + 1)    // recurse',
    '    swap(arr[start], arr[i])   // restore (backtrack)',
  ],
  generate: (input: PermutationsInput): Snapshot<BacktrackingData>[] => {
    const arr = (input.elements ?? [1, 2, 3, 4]).slice(0, 7).map(Number);
    const n = arr.length;
    const out: Snapshot<BacktrackingData>[] = [];
    let backtracks = 0, checks = 0;
    const solutions: string[] = [];
    const MAX_SNAPS = 2000;

    function snap(desc: string, line: number, phase: BacktrackingData['phase'], swapA = -1, swapB = -1, fixed = -1): void {
      if (out.length >= MAX_SNAPS) return;
      out.push({
        id: `perm-${out.length}`, step: out.length, description: desc,
        data: { board: makeBoard(arr, swapA, swapB, fixed), solutions: [...solutions], backtracks, checks, phase },
        currentLine: line,
        variables: { n, solutions: solutions.length, backtracks },
      });
    }

    snap(`Permutations of [${arr.join(', ')}]. Expect ${arr.reduce((a, b) => a * b)} permutations.`, 0, 'placing');

    function solve(start: number): void {
      if (out.length >= MAX_SNAPS) return;
      if (start === n) {
        checks++;
        solutions.push(`[${arr.join(',')}]`);
        snap(`✓ Permutation #${solutions.length}: [${arr.join(', ')}]`, 2, 'solution');
        return;
      }

      for (let i = start; i < n; i++) {
        // Swap arr[start] with arr[i]
        [arr[start], arr[i]] = [arr[i], arr[start]];
        snap(`Fix position ${start}: swap arr[${start}]=${arr[start]} with arr[${i}]=${arr[i]}. Recurse.`, 5, 'placing', start, i, start);
        solve(start + 1);

        // Backtrack: restore
        [arr[start], arr[i]] = [arr[i], arr[start]];
        backtracks++;
        snap(`Backtrack: restore swap at position ${start}. Try next choice.`, 7, 'backtracking', start, i);
      }
    }

    solve(0);

    snap(`Permutations complete. Found ${solutions.length} permutation(s). Backtracks: ${backtracks}.`, 2, 'done');
    return out;
  },
};
