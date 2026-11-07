import { AlgorithmDefinition, Snapshot } from '@/lib/types/algorithm';
import { layoutTree } from '@/lib/utils/treeLayout';
import {
  TreeNode,
  TreeData,
  BSTInput,
  BSTOp,
  DEFAULT_BST_INPUT,
  TraversalType,
} from './types';

let nodeCounter = 0;
function createNode(value: number): TreeNode {
  return {
    id: `node-${value}-${nodeCounter++}`,
    value,
    left: null,
    right: null,
    state: 'default',
  };
}

function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    ...node,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
}

function resetTreeStates(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    ...node,
    state: 'default',
    visitOrder: undefined,
    left: resetTreeStates(node.left),
    right: resetTreeStates(node.right),
  };
}

export const bst: AlgorithmDefinition<BSTInput | any, TreeData> = {
  id: 'bst',
  name: 'Binary Search Tree (BST)',
  category: 'tree',
  categoryName: 'Trees',
  description:
    'Interactive Binary Search Tree supporting immutable insert, search, delete (leaf, 1 child, 2 children), and four traversal orders.',
  difficulty: 'Medium',
  timeComplexity: {
    best: 'O(log n)',
    average: 'O(log n)',
    worst: 'O(n)',
  },
  spaceComplexity: 'O(n)',
  defaultInput: DEFAULT_BST_INPUT,
  inputConfig: {
    type: 'tree',
    supportsCustomInput: true,
  },
  code: [
    'BST Operations: insert, search, delete, traversals',
    'insert(node, val): if val < node.val: left; else: right',
    'search(node, val): compare val with node.val',
    'delete(node, val): leaf, 1-child, or 2-children (successor)',
    'inorder: Left -> Root -> Right (produces sorted order)',
    'preorder: Root -> Left -> Right',
    'postorder: Left -> Right -> Root',
    'level-order: BFS queue per tree depth level',
  ],
  generate: (input?: BSTInput): Snapshot<TreeData>[] => {
    const initialValues = input?.initialValues ?? DEFAULT_BST_INPUT.initialValues;
    const ops: BSTOp[] = input?.ops ?? DEFAULT_BST_INPUT.ops ?? [];

    const snapshots: Snapshot<TreeData>[] = [];
    let currentTree: TreeNode | null = null;
    let outputArray: number[] = [];

    const pushSnapshot = (
      tree: TreeNode | null,
      desc: string,
      line: number,
      opName = 'tree',
      activeNodeId: string | null = null,
      traversalType?: TraversalType
    ) => {
      const positioned = layoutTree(cloneTree(tree));
      snapshots.push({
        id: `bst-${snapshots.length}`,
        step: snapshots.length,
        description: desc,
        data: {
          root: positioned,
          outputArray: [...outputArray],
          activeNodeId,
          traversalType,
          operation: opName,
        },
        currentLine: line,
        variables: {
          operation: opName,
          activeNodeId,
          outputLength: outputArray.length,
          output: [...outputArray],
        },
      });
    };

    // 1. Build initial tree from initialValues
    function insertPure(
      node: TreeNode | null,
      val: number,
      emitSteps = false
    ): TreeNode {
      if (!node) {
        const newNode = createNode(val);
        if (emitSteps) {
          newNode.state = 'inserting';
          pushSnapshot(
            updateNodeInTree(currentTree, newNode.id, () => newNode),
            `Found insertion location. Created new leaf node ${val}.`,
            1,
            'insert',
            newNode.id
          );
        }
        return newNode;
      }

      if (emitSteps) {
        pushSnapshot(
          setNodeState(currentTree, node.id, 'comparing'),
          `Comparing value ${val} with current node ${node.value}.`,
          1,
          'insert',
          node.id
        );
      }

      if (val < node.value) {
        return {
          ...node,
          left: insertPure(node.left, val, emitSteps),
        };
      } else if (val > node.value) {
        return {
          ...node,
          right: insertPure(node.right, val, emitSteps),
        };
      }
      return node;
    }

    // Helper functions for immutable tree updates
    function updateNodeInTree(
      root: TreeNode | null,
      id: string,
      updater: (n: TreeNode) => TreeNode
    ): TreeNode | null {
      if (!root) return null;
      if (root.id === id) return updater(root);
      return {
        ...root,
        left: updateNodeInTree(root.left, id, updater),
        right: updateNodeInTree(root.right, id, updater),
      };
    }

    function setNodeState(
      root: TreeNode | null,
      id: string,
      state: TreeNode['state']
    ): TreeNode | null {
      return updateNodeInTree(root, id, (n) => ({ ...n, state }));
    }

    // Build initial tree
    for (const val of initialValues) {
      currentTree = insertPure(currentTree, val, false);
    }

    pushSnapshot(
      currentTree,
      `Binary Search Tree initialized with ${initialValues.length} nodes: [${initialValues.join(', ')}].`,
      0,
      'init'
    );

    // 2. Execute Operations
    for (const op of ops) {
      currentTree = resetTreeStates(currentTree);
      outputArray = [];

      // ─── INSERT ───
      if (op.type === 'insert') {
        pushSnapshot(
          currentTree,
          `Starting insert(${op.value}). Traversing from root.`,
          1,
          'insert'
        );

        function insertStep(node: TreeNode | null, val: number): TreeNode {
          if (!node) {
            const newNode = createNode(val);
            newNode.state = 'inserting';
            return newNode;
          }

          pushSnapshot(
            setNodeState(currentTree, node.id, 'comparing'),
            `insert(${val}): ${val} ${val < node.value ? '<' : '>'} ${node.value}. Navigating to ${val < node.value ? 'left' : 'right'} subtree.`,
            1,
            'insert',
            node.id
          );

          if (val < node.value) {
            const newLeft = insertStep(node.left, val);
            const updated = { ...node, left: newLeft };
            currentTree = updateNodeInTree(currentTree, node.id, () => updated);
            return updated;
          } else if (val > node.value) {
            const newRight = insertStep(node.right, val);
            const updated = { ...node, right: newRight };
            currentTree = updateNodeInTree(currentTree, node.id, () => updated);
            return updated;
          }

          return node;
        }

        currentTree = insertStep(currentTree, op.value);
        currentTree = resetTreeStates(currentTree);
        pushSnapshot(
          currentTree,
          `insert(${op.value}) complete! Node ${op.value} is placed at valid BST position.`,
          1,
          'insert'
        );
      }

      // ─── SEARCH ───
      else if (op.type === 'search') {
        pushSnapshot(
          currentTree,
          `Starting search(${op.value}). Traversing from root.`,
          2,
          'search'
        );

        let curr = currentTree;
        let found = false;

        while (curr) {
          pushSnapshot(
            setNodeState(currentTree, curr.id, 'comparing'),
            `search(${op.value}): Comparing target ${op.value} with node ${curr.value}.`,
            2,
            'search',
            curr.id
          );

          if (op.value === curr.value) {
            found = true;
            pushSnapshot(
              setNodeState(currentTree, curr.id, 'found'),
              `Match! Value ${op.value} found in BST at node ${curr.id}.`,
              2,
              'search',
              curr.id
            );
            break;
          } else if (op.value < curr.value) {
            curr = curr.left;
          } else {
            curr = curr.right;
          }
        }

        if (!found) {
          pushSnapshot(
            currentTree,
            `search(${op.value}): Reached null branch. Value ${op.value} does NOT exist in the tree.`,
            2,
            'search'
          );
        }
      }

      // ─── DELETE ───
      else if (op.type === 'delete') {
        pushSnapshot(
          currentTree,
          `Starting delete(${op.value}). Searching for node to remove.`,
          3,
          'delete'
        );

        function findMin(node: TreeNode): TreeNode {
          let curr = node;
          while (curr.left) {
            curr = curr.left;
          }
          return curr;
        }

        function deleteNode(node: TreeNode | null, val: number): TreeNode | null {
          if (!node) {
            pushSnapshot(
              currentTree,
              `delete(${val}): Value ${val} not found in the BST.`,
              3,
              'delete'
            );
            return null;
          }

          if (val < node.value) {
            pushSnapshot(
              setNodeState(currentTree, node.id, 'comparing'),
              `delete(${val}): ${val} < ${node.value}. Searching left subtree.`,
              3,
              'delete',
              node.id
            );
            return { ...node, left: deleteNode(node.left, val) };
          } else if (val > node.value) {
            pushSnapshot(
              setNodeState(currentTree, node.id, 'comparing'),
              `delete(${val}): ${val} > ${node.value}. Searching right subtree.`,
              3,
              'delete',
              node.id
            );
            return { ...node, right: deleteNode(node.right, val) };
          } else {
            // Node found!
            pushSnapshot(
              setNodeState(currentTree, node.id, 'deleting'),
              `Found node ${val} to delete. Evaluating cases (leaf, 1 child, 2 children).`,
              3,
              'delete',
              node.id
            );

            // Case 1: Leaf node (no children)
            if (!node.left && !node.right) {
              pushSnapshot(
                setNodeState(currentTree, node.id, 'deleting'),
                `Case 1: Node ${val} is a leaf node. Removing node directly.`,
                3,
                'delete',
                node.id
              );
              return null;
            }

            // Case 2: One child
            if (!node.left) {
              const rightChild = node.right!;
              pushSnapshot(
                setNodeState(currentTree, node.id, 'deleting'),
                `Case 2: Node ${val} has only right child (${rightChild.value}). Replacing node with right child.`,
                3,
                'delete',
                node.id
              );
              return rightChild;
            }
            if (!node.right) {
              const leftChild = node.left!;
              pushSnapshot(
                setNodeState(currentTree, node.id, 'deleting'),
                `Case 2: Node ${val} has only left child (${leftChild.value}). Replacing node with left child.`,
                3,
                'delete',
                node.id
              );
              return leftChild;
            }

            // Case 3: Two children (find in-order successor)
            const successor = findMin(node.right);
            pushSnapshot(
              setNodeState(setNodeState(currentTree, node.id, 'deleting'), successor.id, 'successor'),
              `Case 3: Node ${val} has two children. In-order successor is ${successor.value} (min of right subtree). Copying value and deleting successor.`,
              3,
              'delete',
              successor.id
            );

            return {
              ...node,
              value: successor.value,
              right: deleteNode(node.right, successor.value),
            };
          }
        }

        currentTree = deleteNode(currentTree, op.value);
        currentTree = resetTreeStates(currentTree);
        pushSnapshot(
          currentTree,
          `delete(${op.value}) complete. BST invariants preserved.`,
          3,
          'delete'
        );
      }

      // ─── TRAVERSALS ───
      else if (op.type === 'traverse') {
        const travType = op.traversal;
        let visitCount = 0;
        outputArray = [];

        pushSnapshot(
          currentTree,
          `Starting ${travType} traversal. Output array initialized.`,
          travType === 'inorder' ? 4 : travType === 'preorder' ? 5 : travType === 'postorder' ? 6 : 7,
          'traverse',
          null,
          travType
        );

        if (travType === 'inorder') {
          function traverseInorder(node: TreeNode | null) {
            if (!node) return;
            traverseInorder(node.left);

            visitCount++;
            outputArray.push(node.value);
            node.state = 'visited';
            node.visitOrder = visitCount;

            pushSnapshot(
              currentTree,
              `Inorder visit #${visitCount}: node ${node.value}. Appended to output array: [${outputArray.join(', ')}].`,
              4,
              'traverse',
              node.id,
              'inorder'
            );

            traverseInorder(node.right);
          }
          traverseInorder(currentTree);
        } else if (travType === 'preorder') {
          function traversePreorder(node: TreeNode | null) {
            if (!node) return;

            visitCount++;
            outputArray.push(node.value);
            node.state = 'visited';
            node.visitOrder = visitCount;

            pushSnapshot(
              currentTree,
              `Preorder visit #${visitCount}: node ${node.value}. Appended to output array: [${outputArray.join(', ')}].`,
              5,
              'traverse',
              node.id,
              'preorder'
            );

            traversePreorder(node.left);
            traversePreorder(node.right);
          }
          traversePreorder(currentTree);
        } else if (travType === 'postorder') {
          function traversePostorder(node: TreeNode | null) {
            if (!node) return;
            traversePostorder(node.left);
            traversePostorder(node.right);

            visitCount++;
            outputArray.push(node.value);
            node.state = 'visited';
            node.visitOrder = visitCount;

            pushSnapshot(
              currentTree,
              `Postorder visit #${visitCount}: node ${node.value}. Appended to output array: [${outputArray.join(', ')}].`,
              6,
              'traverse',
              node.id,
              'postorder'
            );
          }
          traversePostorder(currentTree);
        } else if (travType === 'level-order') {
          if (currentTree) {
            const queue: TreeNode[] = [currentTree];
            while (queue.length > 0) {
              const node = queue.shift()!;
              visitCount++;
              outputArray.push(node.value);
              node.state = 'visited';
              node.visitOrder = visitCount;

              pushSnapshot(
                currentTree,
                `Level-order visit #${visitCount}: node ${node.value}. Appended to output: [${outputArray.join(', ')}].`,
                7,
                'traverse',
                node.id,
                'level-order'
              );

              if (node.left) queue.push(node.left);
              if (node.right) queue.push(node.right);
            }
          }
        }

        pushSnapshot(
          currentTree,
          `${travType} traversal finished! All nodes visited in order: [${outputArray.join(', ')}].`,
          travType === 'inorder' ? 4 : 5,
          'traverse',
          null,
          travType
        );
      }
    }

    return snapshots;
  },
};
