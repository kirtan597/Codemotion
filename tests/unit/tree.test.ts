import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { bst } from '@/lib/algorithms/tree/bst';
import { TreeNode, BSTOp } from '@/lib/algorithms/tree/types';

// Helper to check BST invariant on every node
function checkBSTInvariant(
  node: TreeNode | null,
  min = -Infinity,
  max = Infinity
): boolean {
  if (!node) return true;
  if (node.value <= min || node.value >= max) return false;
  return (
    checkBSTInvariant(node.left, min, node.value) &&
    checkBSTInvariant(node.right, node.value, max)
  );
}

// Helper to check if array is sorted ascending
function isSorted(arr: number[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] >= arr[i + 1]) return false;
  }
  return true;
}

describe('Binary Search Tree (BST)', () => {
  it('property test: BST invariant holds after random sequence of inserts and deletes', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 1, max: 200 }), { minLength: 1, maxLength: 15 }),
        fc.array(fc.integer({ min: 1, max: 200 }), { minLength: 1, maxLength: 8 }),
        (initial, toDelete) => {
          const ops: BSTOp[] = [
            ...toDelete.map((val): BSTOp => ({ type: 'delete', value: val })),
            { type: 'traverse', traversal: 'inorder' },
          ];

          const snapshots = bst.generate({ initialValues: initial, ops });

          // Every snapshot must satisfy BST invariant
          for (const s of snapshots) {
            expect(checkBSTInvariant(s.data.root)).toBe(true);
          }

          // Final inorder traversal must be sorted
          const lastSnap = snapshots[snapshots.length - 1];
          const output = lastSnap.data.outputArray;
          expect(isSorted(output)).toBe(true);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('inorder traversal is always sorted', () => {
    const values = [50, 30, 70, 20, 40, 60, 80];
    const snapshots = bst.generate({
      initialValues: values,
      ops: [{ type: 'traverse', traversal: 'inorder' }],
    });

    const finalSnap = snapshots[snapshots.length - 1];
    expect(finalSnap.data.outputArray).toEqual([20, 30, 40, 50, 60, 70, 80]);
  });

  it('correctly handles all 3 deletion cases', () => {
    // Tree:
    //         50
    //       /    \
    //      30     70
    //     /  \      \
    //    20   40     80
    //   /
    //  10
    const values = [50, 30, 70, 20, 40, 80, 10];
    const ops: BSTOp[] = [
      // Case 1: Leaf deletion (40)
      { type: 'delete', value: 40 },
      // Case 2: One child deletion (20 has child 10)
      { type: 'delete', value: 20 },
      // Case 3: Two children deletion (50 has 30 and 70)
      { type: 'delete', value: 50 },
      { type: 'traverse', traversal: 'inorder' },
    ];

    const snapshots = bst.generate({ initialValues: values, ops });
    const finalSnap = snapshots[snapshots.length - 1];
    const output = finalSnap.data.outputArray;

    // Remaining nodes should be 10, 30, 70, 80
    expect(output).toEqual([10, 30, 70, 80]);
    expect(checkBSTInvariant(finalSnap.data.root)).toBe(true);
  });

  it('supports search operation for existing and absent keys', () => {
    const values = [40, 20, 60, 10, 30, 50, 70];
    const ops: BSTOp[] = [
      { type: 'search', value: 50 },
      { type: 'search', value: 99 }, // absent
    ];

    const snapshots = bst.generate({ initialValues: values, ops });
    const foundSnap = snapshots.find((s) => s.description.includes('Match!'));
    const notFoundSnap = snapshots.find((s) => s.description.includes('does NOT exist'));

    expect(foundSnap).toBeDefined();
    expect(notFoundSnap).toBeDefined();
  });
});

