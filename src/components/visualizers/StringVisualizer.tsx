'use client';

import React from 'react';
import { PatternMatchData, PalindromeData, DistanceMatrixData, SuffixData } from '@/lib/types/string';

interface StringVisualizerProps {
  snapshot?: any;
  data?: PatternMatchData | PalindromeData | DistanceMatrixData | SuffixData;
}

// Type guards
function isPatternMatchData(data: any): data is PatternMatchData {
  return 'pattern' in data && 'textPointer' in data;
}

function isPalindromeData(data: any): data is PalindromeData {
  return 'center' in data && 'currentPalindrome' in data;
}

function isDistanceMatrixData(data: any): data is DistanceMatrixData {
  return 'text1' in data && 'text2' in data && 'matrix' in data;
}

function isSuffixData(data: any): data is SuffixData {
  return 'suffixes' in data;
}

// Pattern Match Visualizer
function PatternMatchVisualizer({ data }: { data: PatternMatchData }) {
  const getCharColor = (state: string) => {
    switch (state) {
      case 'comparing':
        return 'bg-yellow-200 border-yellow-400 animate-pulse';
      case 'match':
        return 'bg-green-200 border-green-400';
      case 'mismatch':
        return 'bg-red-200 border-red-400';
      case 'found':
        return 'bg-emerald-400 border-emerald-600 text-white font-bold';
      case 'active':
        return 'bg-blue-200 border-blue-400';
      case 'text-position':
        return 'bg-purple-200 border-purple-400';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Algorithm Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">{data.algorithm}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Comparisons:</span>
            <span className="ml-2 font-semibold">{data.comparisons}</span>
          </div>
          <div>
            <span className="text-gray-600">Matches Found:</span>
            <span className="ml-2 font-semibold">{data.matches.length}</span>
          </div>
        </div>
        {data.matches.length > 0 && (
          <div className="mt-2 text-sm">
            <span className="text-gray-600">Positions:</span>
            <span className="ml-2 font-semibold">[{data.matches.join(', ')}]</span>
          </div>
        )}
      </div>

      {/* Text Display */}
      <div>
        <div className="text-sm font-semibold text-gray-700 mb-2">Text:</div>
        <div className="flex flex-wrap gap-1">
          {data.text.map((char, idx) => (
            <div
              key={idx}
              className={`w-12 h-12 flex items-center justify-center border-2 rounded font-mono text-lg transition-all ${getCharColor(char.state)}`}
            >
              {char.char}
            </div>
          ))}
        </div>
        {data.textPointer >= 0 && (
          <div className="flex gap-1 mt-1">
            {Array.from({ length: data.text.length }).map((_, idx) => (
              <div key={idx} className="w-12 text-center text-xs text-gray-500">
                {idx === data.textPointer ? '↑' : ''}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pattern Display */}
      <div>
        <div className="text-sm font-semibold text-gray-700 mb-2">Pattern:</div>
        <div className="flex flex-wrap gap-1">
          {data.pattern.map((char, idx) => (
            <div
              key={idx}
              className={`w-12 h-12 flex items-center justify-center border-2 rounded font-mono text-lg transition-all ${getCharColor(char.state)}`}
            >
              {char.char}
            </div>
          ))}
        </div>
      </div>

      {/* Algorithm-Specific Data */}
      {data.lps && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">LPS Array (KMP):</h4>
          <div className="flex gap-1">
            {data.lps.map((val, idx) => (
              <div key={idx} className="w-12 text-center">
                <div className="text-xs text-gray-500 mb-1">{idx}</div>
                <div className="w-12 h-10 flex items-center justify-center bg-purple-100 border border-purple-300 rounded font-mono">
                  {val}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.zArray && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h4 className="font-semibold text-indigo-900 mb-2">Z-Array:</h4>
          <div className="flex gap-1 flex-wrap">
            {data.zArray.map((val, idx) => (
              <div key={idx} className="w-12 text-center">
                <div className="text-xs text-gray-500 mb-1">{idx}</div>
                <div className="w-12 h-10 flex items-center justify-center bg-indigo-100 border border-indigo-300 rounded font-mono">
                  {val}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.hashValues && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <h4 className="font-semibold text-teal-900 mb-2">Hash Values (Rabin-Karp):</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {data.hashValues.patternHash !== undefined && (
              <div>
                <span className="text-gray-600">Pattern Hash:</span>
                <span className="ml-2 font-mono font-semibold">{data.hashValues.patternHash}</span>
              </div>
            )}
            {data.hashValues.textHash !== undefined && (
              <div>
                <span className="text-gray-600">Text Hash:</span>
                <span className="ml-2 font-mono font-semibold">{data.hashValues.textHash}</span>
              </div>
            )}
            {data.hashValues.currentHash !== undefined && (
              <div>
                <span className="text-gray-600">Current Hash:</span>
                <span className="ml-2 font-mono font-semibold">{data.hashValues.currentHash}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Palindrome Visualizer
function PalindromeVisualizer({ data }: { data: PalindromeData }) {
  const getCharColor = (state: string) => {
    switch (state) {
      case 'comparing':
        return 'bg-yellow-200 border-yellow-400 animate-pulse';
      case 'match':
        return 'bg-green-200 border-green-400';
      case 'active':
        return 'bg-blue-300 border-blue-500';
      case 'found':
        return 'bg-emerald-400 border-emerald-600 text-white font-bold';
      case 'mismatch':
        return 'bg-red-200 border-red-400';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Current Palindrome */}
      {data.currentPalindrome && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <h3 className="font-semibold text-emerald-900 mb-2">Current Longest Palindrome:</h3>
          <div className="text-2xl font-mono text-emerald-700 text-center">
            "{data.currentPalindrome}"
          </div>
          <div className="text-sm text-gray-600 text-center mt-1">
            Length: {data.currentPalindrome.length}
          </div>
        </div>
      )}

      {/* Text Display */}
      <div>
        <div className="text-sm font-semibold text-gray-700 mb-2">String:</div>
        <div className="flex flex-wrap gap-1">
          {data.text.map((char, idx) => (
            <div
              key={idx}
              className={`w-12 h-12 flex items-center justify-center border-2 rounded font-mono text-lg transition-all ${getCharColor(char.state)}`}
            >
              {char.char}
            </div>
          ))}
        </div>
        {data.center >= 0 && (
          <div className="flex gap-1 mt-1">
            {data.text.map((_, idx) => (
              <div key={idx} className="w-12 text-center text-xs font-semibold">
                {idx === data.left && '←'}
                {idx === data.center && '↑'}
                {idx === data.right && '→'}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manacher's Lengths Array */}
      {data.lengths && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">Palindrome Lengths:</h4>
          <div className="flex gap-1 flex-wrap">
            {data.lengths.map((val, idx) => (
              <div key={idx} className="w-10 text-center">
                <div className="text-xs text-gray-500 mb-1">{idx}</div>
                <div className="w-10 h-10 flex items-center justify-center bg-purple-100 border border-purple-300 rounded text-sm font-mono">
                  {val}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Distance Matrix Visualizer
function DistanceMatrixVisualizer({ data }: { data: DistanceMatrixData }) {
  const getCellColor = (state: string) => {
    switch (state) {
      case 'active':
        return 'bg-yellow-200 border-yellow-400 animate-pulse';
      case 'computed':
        return 'bg-blue-100 border-blue-300';
      case 'comparing':
        return 'bg-purple-100 border-purple-300';
      case 'path':
        return 'bg-green-300 border-green-500 font-bold';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getOperationSymbol = (op?: string) => {
    switch (op) {
      case 'match':
        return '↘';
      case 'replace':
        return '↘';
      case 'insert':
        return '←';
      case 'delete':
        return '↑';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Result */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Edit Distance:</h3>
        <div className="text-3xl font-bold text-blue-700 text-center">
          {data.distance}
        </div>
        {data.operations.length > 0 && (
          <div className="mt-3 text-sm">
            <div className="font-semibold text-gray-700 mb-1">Operations:</div>
            <div className="flex flex-wrap gap-1">
              {data.operations.map((op, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-1 rounded text-xs ${
                    op.type === 'match'
                      ? 'bg-green-100 text-green-800'
                      : op.type === 'insert'
                      ? 'bg-blue-100 text-blue-800'
                      : op.type === 'delete'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {op.type}
                  {op.char && ` '${op.char}'`}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="w-10 h-10"></th>
                <th className="w-10 h-10"></th>
                {data.text2.split('').map((char, idx) => (
                  <th key={idx} className="w-10 h-10 text-center font-mono text-sm">
                    {char}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.matrix.map((row, i) => (
                <tr key={i}>
                  <td className="w-10 h-10 text-center font-mono text-sm font-semibold">
                    {i === 0 ? '' : data.text1[i - 1]}
                  </td>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`w-10 h-10 border-2 text-center font-mono text-sm transition-all ${getCellColor(cell.state)}`}
                    >
                      <div>{cell.value}</div>
                      {cell.operation && (
                        <div className="text-xs text-gray-500">
                          {getOperationSymbol(cell.operation)}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Suffix Visualizer
function SuffixVisualizer({ data }: { data: SuffixData }) {
  const getSuffixColor = (state: string) => {
    switch (state) {
      case 'comparing':
        return 'bg-yellow-100 border-yellow-300';
      case 'sorted':
        return 'bg-green-100 border-green-300';
      case 'active':
        return 'bg-blue-200 border-blue-400';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Original Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Original Text:</h3>
        <div className="text-xl font-mono text-blue-700 text-center">"{data.text}"</div>
      </div>

      {/* Suffix Array & LCP */}
      {data.suffixArray && data.lcpArray && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">Suffix Array:</h4>
            <div className="flex gap-1 flex-wrap">
              {data.suffixArray.map((val, idx) => (
                <div key={idx} className="w-10 h-10 flex items-center justify-center bg-purple-100 border border-purple-300 rounded font-mono">
                  {val}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <h4 className="font-semibold text-teal-900 mb-2">LCP Array:</h4>
            <div className="flex gap-1 flex-wrap">
              {data.lcpArray.map((val, idx) => (
                <div key={idx} className="w-10 h-10 flex items-center justify-center bg-teal-100 border border-teal-300 rounded font-mono">
                  {val}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Suffixes */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Suffixes:</h4>
        <div className="space-y-1">
          {data.suffixes.map((suffix, idx) => (
            <div
              key={idx}
              className={`p-3 border-2 rounded flex justify-between items-center transition-all ${getSuffixColor(suffix.state)}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 font-semibold w-8">
                  {suffix.rank !== undefined ? suffix.rank : idx}
                </span>
                <span className="text-xs text-gray-500">Index {suffix.index}:</span>
                <span className="font-mono">{suffix.suffix}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function StringVisualizer({ snapshot, data: propData }: StringVisualizerProps) {
  // Extract data from snapshot if provided
  const data = propData || snapshot?.data;
  
  if (!data) {
    return (
      <div className="p-4 text-gray-500">
        No data available
      </div>
    );
  }

  if (isPatternMatchData(data)) {
    return <PatternMatchVisualizer data={data} />;
  }

  if (isPalindromeData(data)) {
    return <PalindromeVisualizer data={data} />;
  }

  if (isDistanceMatrixData(data)) {
    return <DistanceMatrixVisualizer data={data} />;
  }

  if (isSuffixData(data)) {
    return <SuffixVisualizer data={data} />;
  }

  return (
    <div className="p-4 text-gray-500">
      Unsupported string algorithm data type
    </div>
  );
}
