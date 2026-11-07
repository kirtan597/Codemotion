'use client';

import React from 'react';
import {
  ConvexHullData,
  ClosestPairData,
  SegmentTreeData,
  TrieData,
  FenwickTreeData,
  Point2D,
} from '@/lib/types/advanced';

interface AdvancedVisualizerProps {
  snapshot?: any;
  data?: any;
}

// Type guards
function isConvexHullData(data: any): data is ConvexHullData {
  return 'hull' in data && 'algorithm' in data;
}

function isClosestPairData(data: any): data is ClosestPairData {
  return 'distance' in data && Array.isArray(data.points);
}

function isSegmentTreeData(data: any): data is SegmentTreeData {
  return 'array' in data && ('root' in data || data.operation);
}

function isTrieData(data: any): data is TrieData {
  return 'root' in data && 'words' in data;
}

function isFenwickTreeData(data: any): data is FenwickTreeData {
  return 'tree' in data && 'originalArray' in data;
}

// Convex Hull Visualizer
function ConvexHullVisualizer({ data }: { data: ConvexHullData }) {
  const getPointColor = (state: string) => {
    switch (state) {
      case 'active':
        return 'fill-yellow-400 stroke-yellow-600';
      case 'selected':
        return 'fill-blue-400 stroke-blue-600';
      case 'hull':
        return 'fill-green-400 stroke-green-600';
      case 'checking':
        return 'fill-orange-400 stroke-orange-600';
      default:
        return 'fill-gray-300 stroke-gray-500';
    }
  };

  const scale = 40;
  const offset = 50;

  return (
    <div className="space-y-6 p-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">{data.algorithm}</h3>
        <div className="text-sm text-gray-700">
          Points: {data.points.length} | Hull vertices: {data.hull.length}
        </div>
      </div>

      <svg width="600" height="400" className="border border-gray-300 rounded bg-white">
        {/* Draw hull polygon */}
        {data.hull.length > 2 && (
          <polygon
            points={data.hull.map(p => `${p.x * scale + offset},${380 - p.y * scale - offset}`).join(' ')}
            fill="rgba(34, 197, 94, 0.1)"
            stroke="rgb(34, 197, 94)"
            strokeWidth="2"
          />
        )}

        {/* Draw all points */}
        {data.points.map((point, idx) => (
          <g key={idx}>
            <circle
              cx={point.x * scale + offset}
              cy={380 - point.y * scale - offset}
              r="6"
              className={`transition-all ${getPointColor(point.state || 'default')}`}
              strokeWidth="2"
            />
            <text
              x={point.x * scale + offset + 10}
              y={380 - point.y * scale - offset + 5}
              fontSize="12"
              fill="gray"
            >
              ({point.x},{point.y})
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// Closest Pair Visualizer
function ClosestPairVisualizer({ data }: { data: ClosestPairData }) {
  const scale = 5;
  const offset = 50;

  return (
    <div className="space-y-6 p-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-2">Closest Pair of Points</h3>
        <div className="text-lg">
          <span className="text-gray-600">Minimum Distance:</span>
          <span className="ml-2 font-bold text-purple-700">{data.distance.toFixed(2)}</span>
        </div>
      </div>

      <svg width="600" height="400" className="border border-gray-300 rounded bg-white">
        {/* Divide line */}
        {data.divideLine !== undefined && (
          <line
            x1={data.divideLine * scale + offset}
            y1="0"
            x2={data.divideLine * scale + offset}
            y2="400"
            stroke="blue"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}

        {/* Closest pair line */}
        {data.closestPair && (
          <line
            x1={data.closestPair[0].x * scale + offset}
            y1={380 - data.closestPair[0].y * scale - offset}
            x2={data.closestPair[1].x * scale + offset}
            y2={380 - data.closestPair[1].y * scale - offset}
            stroke="red"
            strokeWidth="3"
          />
        )}

        {/* Points */}
        {data.points.map((point, idx) => {
          const isClosest = data.closestPair && 
            (point === data.closestPair[0] || point === data.closestPair[1]);
          return (
            <circle
              key={idx}
              cx={point.x * scale + offset}
              cy={380 - point.y * scale - offset}
              r="5"
              fill={isClosest ? 'red' : point.state === 'checking' ? 'yellow' : 'gray'}
              stroke={isClosest ? 'darkred' : 'black'}
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
}

// Segment Tree Visualizer
function SegmentTreeVisualizer({ data }: { data: SegmentTreeData }) {
  return (
    <div className="space-y-6 p-4">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h3 className="font-semibold text-indigo-900 mb-2">Segment Tree</h3>
        <div className="text-sm">Operation: {data.operation}</div>
        {data.query && (
          <div className="mt-2 text-sm">
            Query: [{data.query.left}, {data.query.right}]
            {data.query.result !== undefined && ` = ${data.query.result}`}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded p-4">
        <h4 className="font-semibold mb-2">Original Array:</h4>
        <div className="flex gap-1">
          {data.array.map((val, idx) => (
            <div key={idx} className="w-12 h-12 flex items-center justify-center bg-blue-100 border border-blue-300 rounded">
              {val}
            </div>
          ))}
        </div>
      </div>

      {data.root && (
        <div className="text-sm text-gray-600">
          Tree structure: [{data.root.start}, {data.root.end}] = {data.root.value}
        </div>
      )}
    </div>
  );
}

// Trie Visualizer
function TrieVisualizer({ data }: { data: TrieData }) {
  const renderTrieNode = (node: any, x: number, y: number, width: number): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    const children = Array.from(node.children.values());
    const childWidth = width / Math.max(children.length, 1);

    // Draw node
    elements.push(
      <g key={node.id}>
        <circle
          cx={x}
          cy={y}
          r="15"
          fill={node.isEndOfWord ? 'lightgreen' : node.state === 'path' ? 'yellow' : 'white'}
          stroke="black"
          strokeWidth="2"
        />
        <text x={x} y={y + 5} textAnchor="middle" fontSize="12">
          {node.char || 'ROOT'}
        </text>
      </g>
    );

    // Draw children
    children.forEach((child: any, idx: number) => {
      const childX = x - width / 2 + childWidth * idx + childWidth / 2;
      const childY = y + 60;

      elements.push(
        <line
          key={`line-${node.id}-${child.id}`}
          x1={x}
          y1={y + 15}
          x2={childX}
          y2={childY - 15}
          stroke="gray"
          strokeWidth="1"
        />
      );

      elements.push(...renderTrieNode(child, childX, childY, childWidth));
    });

    return elements;
  };

  return (
    <div className="space-y-6 p-4">
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <h3 className="font-semibold text-teal-900 mb-2">Trie (Prefix Tree)</h3>
        <div className="text-sm">
          Words: {data.words.join(', ')}
        </div>
        {data.currentWord && (
          <div className="text-sm mt-1">
            Current: <span className="font-mono font-bold">{data.currentWord}</span>
          </div>
        )}
      </div>

      <svg width="600" height="400" className="border border-gray-300 rounded bg-white overflow-auto">
        {renderTrieNode(data.root, 300, 30, 500)}
      </svg>
    </div>
  );
}

// Fenwick Tree Visualizer
function FenwickTreeVisualizer({ data }: { data: FenwickTreeData }) {
  return (
    <div className="space-y-6 p-4">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="font-semibold text-orange-900 mb-2">Fenwick Tree (BIT)</h3>
        <div className="text-sm">Operation: {data.operation}</div>
        {data.sum !== undefined && (
          <div className="text-lg mt-2">
            <span className="text-gray-600">Sum:</span>
            <span className="ml-2 font-bold">{data.sum}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded p-4">
          <h4 className="font-semibold mb-2">Original Array:</h4>
          <div className="flex gap-1 flex-wrap">
            {data.originalArray.map((val, idx) => (
              <div
                key={idx}
                className={`w-10 h-10 flex items-center justify-center border-2 rounded text-sm ${
                  idx === data.index ? 'bg-yellow-200 border-yellow-400' : 'bg-gray-100 border-gray-300'
                }`}
              >
                {val}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded p-4">
          <h4 className="font-semibold mb-2">Fenwick Tree:</h4>
          <div className="flex gap-1 flex-wrap">
            {data.tree.map((val, idx) => (
              <div
                key={idx}
                className={`w-10 h-10 flex items-center justify-center border-2 rounded text-sm ${
                  idx === data.index ? 'bg-blue-200 border-blue-400' : 'bg-blue-50 border-blue-200'
                }`}
              >
                {val}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function AdvancedVisualizer({ snapshot, data: propData }: AdvancedVisualizerProps) {
  const data = propData || snapshot?.data;

  if (!data) {
    return <div className="p-4 text-gray-500">No data available</div>;
  }

  if (isConvexHullData(data)) {
    return <ConvexHullVisualizer data={data} />;
  }

  if (isClosestPairData(data)) {
    return <ClosestPairVisualizer data={data} />;
  }

  if (isSegmentTreeData(data)) {
    return <SegmentTreeVisualizer data={data} />;
  }

  if (isTrieData(data)) {
    return <TrieVisualizer data={data} />;
  }

  if (isFenwickTreeData(data)) {
    return <FenwickTreeVisualizer data={data} />;
  }

  return <div className="p-4 text-gray-500">Unsupported advanced algorithm data type</div>;
}
