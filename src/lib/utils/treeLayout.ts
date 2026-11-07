/**
 * src/lib/utils/treeLayout.ts
 *
 * Recursive width-based layout algorithm for binary trees.
 * Calculates optimal (x, y) coordinates for each node so branches don't collide
 * and nodes are nicely spaced.
 */

import { TreeNode } from '@/lib/algorithms/tree/types';

interface LayoutMetrics {
  width: number;
  height: number;
  minX: number;
  maxX: number;
}

const NODE_SPACING_X = 48;
const LEVEL_HEIGHT = 64;
const PADDING_Y = 48;

/**
 * Assigns (x, y) coordinates to every node in the tree using recursive subtree width allocation.
 * Returns a new tree with coordinates without mutating the original tree.
 */
export function layoutTree(
  root: TreeNode | null,
  canvasWidth = 600,
  canvasHeight = 360
): TreeNode | null {
  if (!root) return null;

  // 1. Calculate subtree widths recursively
  function getSubtreeWidth(node: TreeNode | null): number {
    if (!node) return 0;
    if (!node.left && !node.right) return NODE_SPACING_X;

    const leftW = getSubtreeWidth(node.left);
    const rightW = getSubtreeWidth(node.right);
    return Math.max(NODE_SPACING_X, leftW + rightW);
  }

  // 2. Assign preliminary x, y coordinates
  function assignCoordinates(
    node: TreeNode,
    leftX: number,
    rightX: number,
    depth: number
  ): TreeNode {
    const x = (leftX + rightX) / 2;
    const y = PADDING_Y + depth * LEVEL_HEIGHT;

    let leftChild: TreeNode | null = null;
    let rightChild: TreeNode | null = null;

    if (node.left && node.right) {
      const leftW = getSubtreeWidth(node.left);
      const rightW = getSubtreeWidth(node.right);
      const totalW = leftW + rightW;
      const splitX = leftX + (rightX - leftX) * (leftW / totalW);

      leftChild = assignCoordinates(node.left, leftX, splitX, depth + 1);
      rightChild = assignCoordinates(node.right, splitX, rightX, depth + 1);
    } else if (node.left) {
      leftChild = assignCoordinates(node.left, leftX, x, depth + 1);
    } else if (node.right) {
      rightChild = assignCoordinates(node.right, x, rightX, depth + 1);
    }

    return {
      ...node,
      x: Math.round(x),
      y: Math.round(y),
      left: leftChild,
      right: rightChild,
    };
  }

  // Calculate full width needed
  const totalTreeWidth = Math.max(canvasWidth - 80, getSubtreeWidth(root));
  const startX = 40;
  const endX = startX + totalTreeWidth;

  const positionedTree = assignCoordinates(root, startX, endX, 0);

  // 3. Shift tree to be perfectly horizontally centered on canvas
  function getMinMaxX(node: TreeNode | null): { min: number; max: number } {
    if (!node) return { min: Infinity, max: -Infinity };
    const curX = node.x ?? 0;
    const leftRes = getMinMaxX(node.left);
    const rightRes = getMinMaxX(node.right);
    return {
      min: Math.min(curX, leftRes.min, rightRes.min),
      max: Math.max(curX, leftRes.max, rightRes.max),
    };
  }

  const { min, max } = getMinMaxX(positionedTree);
  const treeSpan = max - min;
  const targetMinX = Math.max(30, (canvasWidth - treeSpan) / 2);
  const shiftX = targetMinX - min;

  function shiftCoordinates(node: TreeNode | null): TreeNode | null {
    if (!node) return null;
    return {
      ...node,
      x: Math.round((node.x ?? 0) + shiftX),
      left: shiftCoordinates(node.left),
      right: shiftCoordinates(node.right),
    };
  }

  return shiftCoordinates(positionedTree);
}

