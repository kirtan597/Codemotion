/**
 * Combination Sum — find all unique combinations that sum to target.
 * Candidates can be reused (classic LeetCode #39).
 */
import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { BacktrackingData, BoardCell, CellState, CombinationSumInput } from '@/lib/types/backtracking';

function makeBoard(candidates: number[], currentCombo: number[]): BoardCell[][] {
  const includeCount = new Map<number, number>();
  for (const v of currentCombo) includeCount.set(v, (includeCount.get(v) ?? 0) + 1);
  return [candidates.map((v, i) => {
    const cnt = includeCount.get(v) ?? 0;
    const state: CellState = cnt > 0 ? 'placed' : 'empty';
    return { row: 0, col: i, value: v, state };
  })];
}

export const combinationSum: AlgorithmDefinition<CombinationSumInput, BacktrackingData> = {
  id: 'combination-sum',
  name: 'Combination Sum',
  category: 'backtracking',
  categoryName: 'Backtracking',
  description:
    'Find all unique combinations of candidates that sum to the target. Candidates can be used multiple times. Uses backtracking with pruning when currentSum > target.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(n^t)', average: 'O(n^t)', worst: 'O(n^t)' },
  spaceComplexity: 'O(t)',
  defaultInput: { candidates: [2, 3, 6, 7], target: 7 },
  inputConfig: { type: 'array', supportsCustomInput: true },
  code: [
    'sort candidates',
    'function backtrack(start, current, remaining):',
    '  if remaining == 0: record current',
    '  for i from start to n:',
    '    if candidates[i] > remaining: break  // pruning',
    '    include candidates[i]',
    '    backtrack(i, current, remaining - candidates[i])  // reuse allowed',
    '    remove candidates[i]  // backtrack',
  ],
  generate: (input: CombinationSumInput): Snapshot<BacktrackingData>[] => {
    const candidates = [...(input.candidates ?? [2, 3, 6, 7])].sort((a, b) => a - b).slice(0, 12);
    const target = input.target ?? 7;
    const n = candidates.length;
    const out: Snapshot<BacktrackingData>[] = [];
    const current: number[] = [];
    let backtracks = 0, checks = 0;
    const solutions: string[] = [];
    const MAX_SNAPS = 2000;

    function snap(desc: string, line: number, phase: BacktrackingData['phase']): void {
      if (out.length >= MAX_SNAPS) return;
      out.push({
        id: `cs-${out.length}`, step: out.length, description: desc,
        data: {
          board: makeBoard(candidates, [...current]),
          solutions: [...solutions], backtracks, checks, phase,
          extra: { currentSum: current.reduce((a, b) => a + b, 0), target },
        },
        currentLine: line,
        variables: { target, currentSum: current.reduce((a, b) => a + b, 0), solutions: solutions.length, backtracks },
      });
    }

    snap(`Combination Sum: candidates=[${candidates.join(',')}], target=${target}.`, 0, 'placing');

    function backtrack(start: number, remaining: number): void {
      if (out.length >= MAX_SNAPS) return;
      checks++;
      if (remaining === 0) {
        solutions.push(`[${current.join('+')}]`);
        snap(`✓ Solution #${solutions.length}: [${current.join(', ')}] = ${target}`, 2, 'solution');
        return;
      }

      for (let i = start; i < n; i++) {
        if (candidates[i] > remaining) {
          snap(`candidates[${i}]=${candidates[i]} > ${remaining}. Prune branch.`, 4, 'backtracking');
          backtracks++;
          break;
        }
        current.push(candidates[i]);
        snap(`Include ${candidates[i]}. Current: [${current.join(',')}], remaining=${remaining - candidates[i]}.`, 5, 'placing');
        backtrack(i, remaining - candidates[i]);
        current.pop();
        backtracks++;
        snap(`Remove ${candidates[i]} — backtrack. Try next candidate.`, 7, 'backtracking');
      }
    }

    backtrack(0, target);

    snap(`Done. Found ${solutions.length} combination(s). Backtracks: ${backtracks}, Checks: ${checks}.`, 2, 'done');
    return out;
  },
};
