/**
 * Generate Parentheses — generate all valid combinations of n pairs of parentheses.
 * Board shows the string being built, one character per cell.
 */
import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { BacktrackingData, BoardCell, CellState } from '@/lib/types/backtracking';

function makeBoard(current: string, maxLen: number): BoardCell[][] {
  return [Array.from({ length: maxLen }, (_, i) => {
    const ch = current[i] ?? '';
    const state: CellState = ch === '(' ? 'placed' : ch === ')' ? 'path' : 'empty';
    return { row: 0, col: i, value: ch || null, state };
  })];
}

export const generateParentheses: AlgorithmDefinition<{ n: number }, BacktrackingData> = {
  id: 'generate-parentheses',
  name: 'Generate Parentheses',
  category: 'backtracking',
  categoryName: 'Backtracking',
  description:
    'Generate all well-formed combinations of n pairs of parentheses. Uses backtracking with two constraints: open count ≤ n, close count ≤ open count.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(4ⁿ/√n)', average: 'O(4ⁿ/√n)', worst: 'O(4ⁿ/√n)' },
  spaceComplexity: 'O(n)',
  defaultInput: { n: 4 },
  inputConfig: { type: 'array', supportsCustomInput: true },
  code: [
    'function generate(current, open, close, n):',
    '  if len(current) == 2n: record solution',
    '  if open < n:',
    '    generate(current + "(", open+1, close, n)',
    '  if close < open:',
    '    generate(current + ")", open, close+1, n)',
  ],
  generate: (input: { n: number }): Snapshot<BacktrackingData>[] => {
    const n = Math.max(1, Math.min(5, Math.round(input.n ?? 4)));
    const maxLen = 2 * n;
    const out: Snapshot<BacktrackingData>[] = [];
    let backtracks = 0, checks = 0;
    const solutions: string[] = [];
    const MAX_SNAPS = 2000;

    function snap(current: string, desc: string, line: number, phase: BacktrackingData['phase']): void {
      if (out.length >= MAX_SNAPS) return;
      out.push({
        id: `gp-${out.length}`, step: out.length, description: desc,
        data: { board: makeBoard(current, maxLen), solutions: [...solutions], backtracks, checks, phase },
        currentLine: line,
        variables: { n, length: current.length, solutions: solutions.length, backtracks },
      });
    }

    snap('', `Generate Parentheses: n=${n}. Building valid combinations.`, 0, 'placing');

    function solve(current: string, open: number, close: number): void {
      if (out.length >= MAX_SNAPS) return;
      checks++;
      if (current.length === maxLen) {
        solutions.push(current);
        snap(current, `✓ Solution #${solutions.length}: "${current}"`, 1, 'solution');
        return;
      }

      if (open < n) {
        snap(current + '(', `Add "(" — open=${open+1}, close=${close}.`, 2, 'placing');
        solve(current + '(', open + 1, close);
        backtracks++;
      }

      if (close < open) {
        snap(current + ')', `Add ")" — open=${open}, close=${close+1}.`, 4, 'placing');
        solve(current + ')', open, close + 1);
        backtracks++;
      }
    }

    solve('', 0, 0);

    snap('', `Done. Found ${solutions.length} valid combination(s) of ${n} pairs.`, 1, 'done');
    return out;
  },
};
