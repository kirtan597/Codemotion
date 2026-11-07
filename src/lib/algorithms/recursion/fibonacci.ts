/**
 * Fibonacci — visualizes tree recursion and the overlapping subproblems.
 *
 * Shows: tree recursion, multiple recursive calls, exponential branching,
 * duplicate sub-computations (motivating memoization).
 */
import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { RecursionData, CallFrame } from '@/lib/types/recursion';

export interface FibonacciInput { n: number }

let counter = 0;
function makeId(): string { return `fib-f-${counter++}`; }

function snap(
  out: Snapshot<RecursionData>[],
  frames: CallFrame[],
  desc: string,
  line: number,
  expression?: string,
  result?: number | null,
  phase?: RecursionData['phase'],
): void {
  out.push({
    id: `fib-${out.length}`,
    step: out.length,
    description: desc,
    data: { frames: frames.map((f) => ({ ...f })), expression, result: result ?? undefined, phase },
    currentLine: line,
    variables: { stackDepth: frames.length },
  });
}

export const fibonacci: AlgorithmDefinition<FibonacciInput, RecursionData> = {
  id: 'fibonacci',
  name: 'Fibonacci (Tree Recursion)',
  category: 'recursion',
  categoryName: 'Recursion',
  description:
    'Classic doubly-recursive Fibonacci. Demonstrates tree recursion and overlapping subproblems — the same fib(k) is computed multiple times, motivating memoization / DP.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(2ⁿ)', average: 'O(2ⁿ)', worst: 'O(2ⁿ)' },
  spaceComplexity: 'O(n)',
  defaultInput: { n: 6 },
  inputConfig: { type: 'array', supportsCustomInput: true },
  code: [
    'function fib(n):',
    '  if n <= 1:  // base case',
    '    return n',
    '  return fib(n-1) + fib(n-2)  // tree recursion',
  ],
  generate: (input: FibonacciInput): Snapshot<RecursionData>[] => {
    counter = 0;
    const n = Math.max(0, Math.min(8, Math.round(input.n ?? 6)));
    const out: Snapshot<RecursionData>[] = [];
    const stack: CallFrame[] = [];

    snap(out, stack, `Computing fib(${n}) via tree recursion.`, 0, `fib(${n}) = ?`, null, 'calling');

    const memo: Map<number, number> = new Map();

    function solve(k: number, depth: number): number {
      const id = makeId();
      const frame: CallFrame = { id, fnName: 'fib', args: `n = ${k}`, state: 'active', depth };
      stack.unshift(frame);
      snap(out, stack, `fib(${k}): called at depth ${depth}.`, 0, `fib(${k}) = ?`, null, 'calling');

      let result: number;
      if (k <= 1) {
        frame.state = 'base-case';
        frame.returnValue = k;
        stack[0] = { ...frame };
        snap(out, stack, `fib(${k}): BASE CASE — return ${k}.`, 2, `fib(${k}) = ${k}`, k, 'base-case');
        result = k;
      } else {
        // left branch
        frame.state = 'calling';
        stack[0] = { ...frame };
        snap(out, stack, `fib(${k}): calling fib(${k - 1})…`, 3, `fib(${k}) = fib(${k-1}) + fib(${k-2})`, null, 'calling');
        const left = solve(k - 1, depth + 1);

        // right branch
        stack.unshift({ ...frame, state: 'calling' });
        snap(out, stack, `fib(${k}): calling fib(${k - 2})…`, 3, `fib(${k}) = ${left} + fib(${k-2})`, null, 'calling');
        const right = solve(k - 2, depth + 1);
        stack.shift();

        result = left + right;
        frame.state = 'returning';
        frame.returnValue = result;
        stack[0] = { ...frame };
        snap(out, stack, `fib(${k}): ${left} + ${right} = ${result}. Returning ${result}.`, 3, `fib(${k}) = ${result}`, result, 'returning');
      }

      stack.shift();
      if (stack.length > 0) stack[0] = { ...stack[0], state: 'active' };
      memo.set(k, result);
      return result;
    }

    const answer = solve(n, 0);
    snap(out, [], `✓ fib(${n}) = ${answer}. Total snapshots: ${out.length}.`, 3,
      `fib(${n}) = ${answer}`, answer, 'done');
    return out;
  },
};
