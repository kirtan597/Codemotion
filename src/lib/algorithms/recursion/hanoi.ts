/**
 * Tower of Hanoi — visualizes disk movements, call stack, and recursive structure.
 *
 * Shows: 3-peg animation, recursive sub-problems, 2^n - 1 minimum moves,
 * stack depth, base case (n=1 = direct move).
 */
import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { HanoiData, HanoiDisk, CallFrame } from '@/lib/types/recursion';

export interface HanoiInput { n: number }

type Peg = 'A' | 'B' | 'C';

let _fc = 0;
function fid(): string { return `hanoi-frame-${_fc++}`; }

export const hanoi: AlgorithmDefinition<HanoiInput, HanoiData> = {
  id: 'tower-of-hanoi',
  name: 'Tower of Hanoi',
  category: 'recursion',
  categoryName: 'Recursion',
  description:
    'Move n disks from peg A to peg C using peg B as auxiliary. Demonstrates exponential recursion (2ⁿ−1 moves), the call stack, and the elegant divide-conquer-combine pattern.',
  difficulty: 'Medium',
  timeComplexity: { best: 'O(2ⁿ)', average: 'O(2ⁿ)', worst: 'O(2ⁿ)' },
  spaceComplexity: 'O(n)',
  defaultInput: { n: 4 },
  inputConfig: { type: 'array', supportsCustomInput: true },
  code: [
    'function hanoi(n, from, to, via):',
    '  if n == 1:                     // base case',
    '    move disk 1 from "from" to "to"',
    '    return',
    '  hanoi(n-1, from, via, to)      // move n-1 disks to aux',
    '  move disk n from "from" to "to"',
    '  hanoi(n-1, via, to, from)      // move n-1 disks from aux',
  ],
  generate: (input: HanoiInput): Snapshot<HanoiData>[] => {
    _fc = 0;
    const n = Math.max(1, Math.min(6, Math.round(input.n ?? 4)));
    const out: Snapshot<HanoiData>[] = [];
    const stack: CallFrame[] = [];
    const totalMoves = Math.pow(2, n) - 1;

    const pegs: { A: HanoiDisk[]; B: HanoiDisk[]; C: HanoiDisk[] } = { A: [], B: [], C: [] };
    // Load disks (largest at bottom, smallest at top)
    for (let i = n; i >= 1; i--) {
      pegs.A.push({ id: i, size: i });
    }

    let moveCount = 0;

    function snap(desc: string, line: number, phase?: HanoiData['phase']): void {
      out.push({
        id: `hanoi-${out.length}`,
        step: out.length,
        description: desc,
        data: {
          pegs: { A: [...pegs.A], B: [...pegs.B], C: [...pegs.C] },
          frames: stack.map((f) => ({ ...f })),
          totalMoves,
          currentMove: moveCount,
          phase,
        },
        currentLine: line,
        variables: { moves: moveCount, totalMoves, stackDepth: stack.length, n },
      });
    }

    snap(`Tower of Hanoi with ${n} disks. Need ${totalMoves} moves. Initial state: all disks on A.`, 0, 'calling');

    function solve(k: number, from: Peg, to: Peg, via: Peg, depth: number): void {
      const id = fid();
      const frame: CallFrame = {
        id,
        fnName: 'hanoi',
        args: `n=${k}, ${from}→${to} via ${via}`,
        state: 'active',
        depth,
      };
      stack.unshift(frame);
      snap(`hanoi(${k}, ${from}→${to}): called at depth ${depth}.`, 0, 'calling');

      if (k === 1) {
        // Base case
        stack[0] = { ...frame, state: 'base-case' };
        snap(`BASE CASE: Move disk 1 from ${from} to ${to}.`, 2, 'base-case');

        // Perform move
        const disk = pegs[from].pop()!;
        pegs[to].push(disk);
        moveCount++;
        stack[0] = { ...stack[0], returnValue: undefined };
        snap(`Move ${moveCount}/${totalMoves}: Disk 1 moved from ${from} to ${to}.`, 2, 'base-case');
      } else {
        // Step 1: move n-1 to via
        stack[0] = { ...frame, state: 'calling' };
        snap(`hanoi(${k}): Step 1 — move top ${k-1} disks from ${from} to ${via} using ${to}.`, 4, 'calling');
        solve(k - 1, from, via, to, depth + 1);

        // Step 2: move disk k
        const disk = pegs[from].pop()!;
        pegs[to].push(disk);
        moveCount++;
        stack[0] = { ...frame, state: 'active' };
        snap(`hanoi(${k}): Move disk ${k} from ${from} to ${to}. (Move ${moveCount}/${totalMoves})`, 5, 'calling');

        // Step 3: move n-1 from via to to
        stack[0] = { ...frame, state: 'calling' };
        snap(`hanoi(${k}): Step 3 — move top ${k-1} disks from ${via} to ${to} using ${from}.`, 6, 'calling');
        solve(k - 1, via, to, from, depth + 1);
      }

      stack.shift();
      if (stack.length > 0) stack[0] = { ...stack[0], state: 'active' };
      snap(`hanoi(${k}): returning.`, 3, 'returning');
    }

    solve(n, 'A', 'C', 'B', 0);

    snap(`✓ Tower of Hanoi complete! All ${n} disks moved from A to C in ${moveCount} moves.`, 6, 'done');
    return out;
  },
};
