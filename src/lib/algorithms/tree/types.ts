export type TreeNodeState =
  | 'default'
  | 'active'
  | 'comparing'
  | 'found'
  | 'inserting'
  | 'deleting'
  | 'visited'
  | 'successor';

export interface TreeNode {
  id: string;
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
  state?: TreeNodeState;
  visitOrder?: number;
}

export type TraversalType = 'inorder' | 'preorder' | 'postorder' | 'level-order';

export interface TreeData {
  root: TreeNode | null;
  outputArray: number[];
  activeNodeId?: string | null;
  traversalType?: TraversalType;
  operation?: string;
  visitedCount?: number;
}

export type BSTOp =
  | { type: 'insert'; value: number }
  | { type: 'delete'; value: number }
  | { type: 'search'; value: number }
  | { type: 'traverse'; traversal: TraversalType };

export interface BSTInput {
  initialValues: number[];
  ops?: BSTOp[];
}

export const DEFAULT_BST_INPUT: BSTInput = {
  initialValues: [50, 30, 70, 20, 40, 60, 80],
  ops: [
    { type: 'traverse', traversal: 'inorder' },
    { type: 'insert', value: 25 },
    { type: 'search', value: 60 },
    { type: 'delete', value: 30 },
    { type: 'traverse', traversal: 'level-order' },
  ],
};

