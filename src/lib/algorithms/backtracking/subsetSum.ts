/**
 * Subset Sum — find all subsets of a set that sum to a given target.
 *
 * Visualizes as a 1D "selection grid" where each row is an element
 * and its state shows whether it's included, excluded, or being tried.
 */
import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { BacktrackingData, BoardCell, CellState, SubsetSumInput } from '@/lib/types/backtracking';

function makeSelectionBoard(set: number[], included: boolean[], tryIdx = -1, backIdx = -1): BoardCell[][] {
  // One row per element, shown as a single-row board for clarity
  return [set.map((v, i) => {
    let state: CellState = 'empty';
    if (i === tryIdx) state = 'trying';
    else if (i === backIdx) state = 'backtrack';
    else if (included[i]) state = 'placed';
    return { row: 0, col: i, value: v, state };
  })];
}

export const subsetSum: AlgorithmDefinition<SubsetSumInput, BacktrackingData> = {
  id: 'subset-sum',
  name: 'Subset Sum',
  category: 'backtracking',
  categoryName: 'Backtracking',
  description:
    'Find all subsets of the given set that sum to the target value. Uses backtracking with pruning: if remaining sum is impossible, prune the branch.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(2ⁿ)', average: 'O(2ⁿ)', worst: 'O(2ⁿ)' },
  spaceComplexity: 'O(n)',
  defaultInput: { set: [3, 1, 4, 2, 2], target: 6 },
  inputConfig: { type: 'array', supportsCustomInput: true },
  code: [
    'function solve(idx, currentSum):',
    '  if currentSum == target: record solution',
    '  if idx == n or currentSum > target: return',
    '  include set[idx]; solve(idx+1, currentSum + set[idx])',
    '  exclude set[idx]; solve(idx+1, currentSum)',
  ],
  generate: (input: SubsetSumInput): Snapshot<BacktrackingData>[] => {
    const set = (input.set ?? [3, 1, 4, 2, 2]).slice(0, 15);
    const target = input.target ?? 6;
    const n = set.length;
    const out: Snapshot<BacktrackingData>[] = [];
    const included: boolean[] = new Array(n).fill(false);
    let backtracks = 0, checks = 0;
    const solutions: string[] = [];
    const MAX_SNAPS = 2000;

    function snap(desc: string, line: number, phase: BacktrackingData['phase'], tryIdx = -1, backIdx = -1): void {
      if (out.length >= MAX_SNAPS) return;
      const currentSubset = set.filter((_, i) => included[i]);
      out.push({
        id: `ss-${out.length}`, step: out.length, description: desc,
        data: {
          board: makeSelectionBoard(set, included, tryIdx, backIdx),
          solutions: [...solutions], backtracks, checks, phase,
          extra: { currentSum: currentSubset.reduce((a, b) => a + b, 0), target },
        },
        currentLine: line,
        variables: { target, currentSum: currentSubset.reduce((a, b) => a + b, 0), solutions: solutions.length, backtracks },
      });
    }

    snap(`Subset Sum: find subsets of [${set.join(', ')}] that sum to ${target}.`, 0, 'placing');

    function solve(idx: number, currentSum: number): void {
      if (out.length >= MAX_SNAPS) return;
      checks++;
      if (currentSum === target) {
        const sol = `{${set.filter((_, i) => included[i]).join('+')}} = ${target}`;
        solutions.push(sol);
        snap(`✓ Found subset summing to ${target}: ${sol}`, 1, 'solution');
        return;
      }
      if (idx === n || currentSum > target) {
        if (currentSum > target) backtracks++;
        snap(`Pruned: sum=${currentSum} ${currentSum > target ? '> target' : 'idx=n'}. Backtrack.`, 2, 'backtracking');
        return;
      }

      // Include set[idx]
      included[idx] = true;
      snap(`Include ${set[idx]} (idx=${idx}). Current sum = ${currentSum + set[idx]}.`, 3, 'placing', idx);
      solve(idx + 1, currentSum + set[idx]);

      // Exclude set[idx]
      included[idx] = false;
      backtracks++;
      snap(`Exclude ${set[idx]} (idx=${idx}). Backtrack and try without it.`, 4, 'backtracking', -1, idx);
      solve(idx + 1, currentSum);
    }

    solve(0, 0);

    snap(`Subset Sum complete. Found ${solutions.length} solution(s). Checks: ${checks}, Backtracks: ${backtracks}.`, 1, 'done');
    return out;
  },
};
