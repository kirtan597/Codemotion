/**
 * Factorial — visualizes the call stack as recursion unwinds and returns.
 *
 * Shows: direct recursion, linear recursion, base case, tail-recursive variant,
 * stack-frame creation, return-value propagation.
 */
import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { RecursionData, CallFrame, FrameState } from '@/lib/types/recursion';

export interface FactorialInput { n: number }

function makeFrame(fnName: string, n: number, depth: number, state: FrameState, ret?: number | null): CallFrame {
  return {
    id: `fact-frame-${depth}-${n}`,
    fnName,
    args: `n = ${n}`,
    state,
    depth,
    returnValue: ret !== undefined ? ret : undefined,
  };
}

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
    id: `fact-${out.length}`,
    step: out.length,
    description: desc,
    data: {
      frames: frames.map((f) => ({ ...f })),
      expression,
      result: result !== undefined ? result : undefined,
      phase,
    },
    currentLine: line,
    variables: {
      stackDepth: frames.length,
      topArg: frames[0] ? parseInt(frames[0].args.replace('n = ', '')) : null,
    },
  });
}

export const factorial: AlgorithmDefinition<FactorialInput, RecursionData> = {
  id: 'factorial',
  name: 'Factorial (Recursion)',
  category: 'recursion',
  categoryName: 'Recursion',
  description:
    'Classic tail-recursive and head-recursive factorial. Visualizes stack frame creation, base case detection, and return-value propagation back up the call stack.',
  difficulty: 'Easy',
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  defaultInput: { n: 5 },
  inputConfig: { type: 'array', supportsCustomInput: true },
  code: [
    'function factorial(n):',
    '  if n == 0 or n == 1:  // base case',
    '    return 1',
    '  else:                 // recursive case',
    '    return n * factorial(n - 1)',
  ],
  generate: (input: FactorialInput): Snapshot<RecursionData>[] => {
    const n = Math.max(0, Math.min(10, Math.round(input.n ?? 5)));
    const out: Snapshot<RecursionData>[] = [];
    const stack: CallFrame[] = [];

    snap(out, stack, `Computing factorial(${n}). Building call stack…`, 0, `${n}! = ?`, null, 'calling');

    // ── Phase 1: Winding down (pushing frames) ───────────────────────────────
    for (let i = n; i >= 0; i--) {
      // Mark previous top as 'calling'
      if (stack.length > 0) {
        stack[0] = { ...stack[0], state: 'calling' };
      }
      const isBase = i === 0 || i === 1;
      const newFrame = makeFrame('factorial', i, n - i, isBase ? 'base-case' : 'active');
      stack.unshift(newFrame);

      if (isBase) {
        snap(out, stack,
          `factorial(${i}): BASE CASE — n=${i}, return 1 immediately.`,
          2,
          `${n}! = ${Array.from({ length: n }, (_, k) => n - k).join(' × ')} × 1`,
          null,
          'base-case',
        );
      } else {
        snap(out, stack,
          `factorial(${i}): n=${i} > 1 → calling factorial(${i - 1})…`,
          4,
          `${i}! = ${i} × ${i - 1}!`,
          null,
          'calling',
        );
      }
    }

    // ── Phase 2: Returning (popping frames) ──────────────────────────────────
    let accumulated = 1;
    while (stack.length > 0) {
      const frame = stack[0];
      const argN = parseInt(frame.args.replace('n = ', ''));
      accumulated = argN <= 1 ? 1 : accumulated * argN;

      stack[0] = { ...frame, state: 'returning', returnValue: accumulated };
      snap(out, stack,
        `factorial(${argN}) returns ${accumulated}. Popping frame from stack.`,
        2,
        `${argN}! = ${accumulated}`,
        stack.length === 1 ? accumulated : null,
        'returning',
      );

      stack.shift();
      if (stack.length > 0) {
        stack[0] = { ...stack[0], state: 'active', returnValue: undefined };
      }
    }

    snap(out, [], `✓ factorial(${n}) = ${accumulated}. Call stack is now empty.`, 4,
      `${n}! = ${accumulated}`, accumulated, 'done');
    return out;
  },
};
