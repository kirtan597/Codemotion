/**
 * Convex Hull - Graham Scan Algorithm
 * Find the smallest convex polygon containing all points
 * Time: O(n log n)
 * Space: O(n)
 */

import { AlgorithmDefinition } from '../../types/algorithm';
import { GeometryInput, ConvexHullData, AdvancedSnapshot, Point2D } from '../../types/advanced';

function crossProduct(o: Point2D, a: Point2D, b: Point2D): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function distance(p1: Point2D, p2: Point2D): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function generateGrahamScan(input: GeometryInput): AdvancedSnapshot<ConvexHullData>[] {
  const { points } = input;
  const snapshots: AdvancedSnapshot<ConvexHullData>[] = [];
  let step = 0;

  if (points.length < 3) {
    snapshots.push({
      id: `hull-${step++}`,
      step: snapshots.length,
      description: 'Need at least 3 points for convex hull',
      data: {
        points: points.map(p => ({ ...p, state: 'default' })),
        hull: [],
        algorithm: 'Graham Scan',
      },
      currentLine: 1,
    });
    return snapshots;
  }

  // Find bottom-most point (or leftmost if tie)
  let pivot = points[0];
  for (const p of points) {
    if (p.y < pivot.y || (p.y === pivot.y && p.x < pivot.x)) {
      pivot = p;
    }
  }

  snapshots.push({
    id: `hull-${step++}`,
    step: snapshots.length,
    description: `Found pivot point (${pivot.x}, ${pivot.y}) - bottom-most point`,
    data: {
      points: points.map(p => ({ ...p, state: p === pivot ? 'selected' : 'default' })),
      hull: [],
      currentPoint: pivot,
      algorithm: 'Graham Scan',
    },
    currentLine: 2,
    variables: { pivotX: pivot.x, pivotY: pivot.y },
  });

  // Sort points by polar angle with respect to pivot
  const sortedPoints = points
    .filter(p => p !== pivot)
    .sort((a, b) => {
      const angleA = Math.atan2(a.y - pivot.y, a.x - pivot.x);
      const angleB = Math.atan2(b.y - pivot.y, b.x - pivot.x);
      if (angleA !== angleB) return angleA - angleB;
      return distance(pivot, a) - distance(pivot, b);
    });

  sortedPoints.unshift(pivot);

  snapshots.push({
    id: `hull-${step++}`,
    step: snapshots.length,
    description: 'Sorted points by polar angle from pivot',
    data: {
      points: sortedPoints.map((p, idx) => ({ ...p, state: 'default', label: `${idx}` })),
      hull: [],
      algorithm: 'Graham Scan',
    },
    currentLine: 3,
    variables: { sorted: sortedPoints.length },
  });

  // Graham scan
  const hull: Point2D[] = [];
  
  for (let i = 0; i < sortedPoints.length; i++) {
    const point = sortedPoints[i];

    snapshots.push({
      id: `hull-${step++}`,
      step: snapshots.length,
      description: `Processing point ${i}: (${point.x}, ${point.y})`,
      data: {
        points: sortedPoints.map(p => ({ ...p, state: p === point ? 'active' : 'default' })),
        hull: [...hull],
        currentPoint: point,
        algorithm: 'Graham Scan',
      },
      currentLine: 4,
      variables: { i, hullSize: hull.length },
    });

    // Remove points that make clockwise turn
    while (hull.length >= 2) {
      const top = hull[hull.length - 1];
      const secondTop = hull[hull.length - 2];
      const cross = crossProduct(secondTop, top, point);

      if (cross > 0) {
        // Counter-clockwise turn, keep the point
        break;
      }

      // Clockwise or collinear, remove top point
      hull.pop();

      snapshots.push({
        id: `hull-${step++}`,
        step: snapshots.length,
        description: `Clockwise turn detected. Removing (${top.x}, ${top.y}) from hull`,
        data: {
          points: sortedPoints.map(p => ({ 
            ...p, 
            state: p === point ? 'active' : p === top ? 'checking' : 'default' 
          })),
          hull: [...hull],
          consideredPoints: [secondTop, top, point],
          algorithm: 'Graham Scan',
        },
        currentLine: 5,
        variables: { i, cross, action: 'remove' },
      });
    }

    hull.push(point);

    snapshots.push({
      id: `hull-${step++}`,
      step: snapshots.length,
      description: `Added (${point.x}, ${point.y}) to hull`,
      data: {
        points: sortedPoints.map(p => ({ ...p, state: 'default' })),
        hull: hull.map(p => ({ ...p, state: 'hull' })),
        algorithm: 'Graham Scan',
      },
      currentLine: 6,
      variables: { i, hullSize: hull.length },
    });
  }

  snapshots.push({
    id: `hull-${step++}`,
    step: snapshots.length,
    description: `Convex hull complete with ${hull.length} vertices`,
    data: {
      points: points.map(p => ({ ...p, state: 'default' })),
      hull: hull.map(p => ({ ...p, state: 'hull' })),
      algorithm: 'Graham Scan',
    },
    currentLine: 7,
    variables: { hullVertices: hull.length, totalPoints: points.length },
    formula: `Hull vertices: ${hull.length}`,
  });

  return snapshots;
}

export const grahamScanConvexHull: AlgorithmDefinition<GeometryInput, ConvexHullData> = {
  id: 'graham-scan-convex-hull',
  name: 'Convex Hull (Graham Scan)',
  category: 'geometry',
  categoryName: 'Computational Geometry',
  description: 'Find the smallest convex polygon containing all points using Graham Scan. Sorts points by polar angle and processes them while maintaining convex property.',
  difficulty: 'Hard',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
  },
  spaceComplexity: 'O(n)',
  code: [
    '1. Find pivot (bottom-most point)',
    '2. Sort by polar angle from pivot',
    '3. For each point:',
    '   While last 3 points make clockwise turn:',
    '     Remove middle point',
    '   Add current point to hull',
  ],
  defaultInput: {
    points: [
      { x: 0, y: 3 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 4, y: 4 },
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
    ],
  },
  inputConfig: { type: 'array' },
  generate: generateGrahamScan,
};
