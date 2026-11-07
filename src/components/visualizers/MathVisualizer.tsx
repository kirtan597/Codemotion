'use client';

import React from 'react';
import {
  BitwiseOperationData,
  PrimeData,
  GCDData,
  PascalTriangleData,
  ExponentiationData,
} from '@/lib/types/math';

interface MathVisualizerProps {
  snapshot?: any;
  data?: any;
}

// Type guards
function isBitwiseData(data: any): data is BitwiseOperationData {
  return 'operand1' in data && 'operation' in data && data.operand1.bits;
}

function isPrimeData(data: any): data is PrimeData {
  return 'numbers' in data && 'primes' in data;
}

function isGCDData(data: any): data is GCDData {
  return 'a' in data && 'b' in data && 'steps' in data;
}

function isPascalData(data: any): data is PascalTriangleData {
  return 'rows' in data && Array.isArray(data.rows);
}

function isExponentiationData(data: any): data is ExponentiationData {
  return 'base' in data && 'exponent' in data && 'binaryExp' in data;
}

// Bitwise Visualizer
function BitwiseVisualizer({ data }: { data: BitwiseOperationData }) {
  const getBitColor = (state: string) => {
    switch (state) {
      case 'active':
        return 'bg-yellow-300 border-yellow-500';
      case 'changed':
        return 'bg-green-300 border-green-500';
      case 'result':
        return 'bg-blue-300 border-blue-500';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const renderBits = (bitRep: any, label: string) => (
    <div className="mb-4">
      <div className="text-sm font-semibold text-gray-700 mb-2">{label}: {bitRep.decimal}</div>
      <div className="flex gap-1">
        {bitRep.bits.map((bit: any, idx: number) => (
          <div key={idx} className="text-center">
            <div className="text-xs text-gray-500 mb-1">{bit.position}</div>
            <div
              className={`w-10 h-10 flex items-center justify-center border-2 rounded font-mono text-lg font-bold transition-all ${getBitColor(bit.state)}`}
            >
              {bit.value}
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-1">Binary: {bitRep.binary}</div>
    </div>
  );

  return (
    <div className="space-y-6 p-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          {data.operation} {data.operationSymbol}
        </h3>
        <div className="text-sm text-gray-600">{data.step}</div>
      </div>

      {renderBits(data.operand1, 'Operand 1')}
      {data.operand2 && renderBits(data.operand2, 'Operand 2')}
      {data.result && renderBits(data.result, 'Result')}
    </div>
  );
}

// Prime Sieve Visualizer
function PrimeVisualizer({ data }: { data: PrimeData }) {
  const getCellColor = (cell: any) => {
    switch (cell.state) {
      case 'prime':
        return 'bg-green-400 border-green-600 text-white font-bold';
      case 'composite':
        return 'bg-red-200 border-red-400';
      case 'checking':
        return 'bg-yellow-200 border-yellow-400';
      case 'active':
        return 'bg-blue-300 border-blue-500';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-2">Sieve of Eratosthenes</h3>
        <div className="text-sm text-gray-700">{data.operation}</div>
        <div className="mt-2 text-sm">
          <span className="text-gray-600">Primes found:</span>
          <span className="ml-2 font-semibold">{data.primes.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-1">
        {data.numbers.slice(0, 101).map((cell) => (
          <div
            key={cell.value}
            className={`w-10 h-10 flex items-center justify-center border-2 rounded text-sm transition-all ${getCellColor(cell)}`}
            title={cell.markedBy ? `Marked by ${cell.markedBy}` : ''}
          >
            {cell.value}
          </div>
        ))}
      </div>

      {data.primes.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Prime Numbers:</h4>
          <div className="text-sm">{data.primes.slice(0, 30).join(', ')}{data.primes.length > 30 ? '...' : ''}</div>
        </div>
      )}
    </div>
  );
}

// GCD Visualizer
function GCDVisualizer({ data }: { data: GCDData }) {
  return (
    <div className="space-y-6 p-4">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h3 className="font-semibold text-indigo-900 mb-2">Euclidean Algorithm</h3>
        <div className="text-2xl font-bold text-indigo-700">
          GCD({data.a}, {data.b}) = {data.remainder !== undefined ? '...' : data.a}
        </div>
      </div>

      {data.steps.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-700">Steps:</h4>
          {data.steps.map((step, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded p-3 font-mono text-sm">
              {step.operation}
            </div>
          ))}
        </div>
      )}

      {data.remainder !== undefined && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-lg">
            <span className="text-gray-600">Current:</span>
            <span className="ml-2 font-mono font-semibold">
              a = {data.a}, b = {data.b}, remainder = {data.remainder}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Pascal's Triangle Visualizer
function PascalVisualizer({ data }: { data: PascalTriangleData }) {
  const getCellColor = (state: string) => {
    switch (state) {
      case 'computing':
        return 'bg-yellow-200 border-yellow-400';
      case 'complete':
        return 'bg-green-100 border-green-300';
      case 'highlighted':
        return 'bg-blue-300 border-blue-500';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-2">Pascal's Triangle</h3>
        <div className="text-sm text-gray-700">
          Row {data.currentRow} of {data.rows.length}
        </div>
      </div>

      <div className="flex flex-col items-center space-y-2">
        {data.rows.map((row) => (
          <div key={row.rowNumber} className="flex gap-2">
            {row.values.map((cell, idx) => {
              const isHighlighted = data.highlightedCells?.some(
                ([r, c]) => r === row.rowNumber && c === idx
              );
              return (
                <div
                  key={idx}
                  className={`w-14 h-14 flex items-center justify-center border-2 rounded font-mono text-sm transition-all ${
                    isHighlighted ? 'bg-blue-300 border-blue-500' : getCellColor(cell.state)
                  }`}
                >
                  {cell.value}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Fast Exponentiation Visualizer
function ExponentiationVisualizer({ data }: { data: ExponentiationData }) {
  return (
    <div className="space-y-6 p-4">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="font-semibold text-orange-900 mb-2">Fast Exponentiation</h3>
        <div className="text-2xl font-bold text-orange-700">
          {data.base}^{data.exponent}{data.modulo && ` mod ${data.modulo}`} = {data.result}
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Binary: {data.binaryExp}
        </div>
      </div>

      {data.steps.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-700">Steps:</h4>
          {data.steps.map((step, idx) => (
            <div
              key={idx}
              className={`border-2 rounded p-3 text-sm ${
                idx === data.currentBit ? 'bg-yellow-100 border-yellow-400' : 'bg-white border-gray-200'
              }`}
            >
              <div className="font-mono">Bit {idx}: {step.bit}</div>
              <div className="text-gray-600">{step.operation}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Main Component
export default function MathVisualizer({ snapshot, data: propData }: MathVisualizerProps) {
  const data = propData || snapshot?.data;

  if (!data) {
    return <div className="p-4 text-gray-500">No data available</div>;
  }

  if (isBitwiseData(data)) {
    return <BitwiseVisualizer data={data} />;
  }

  if (isPrimeData(data)) {
    return <PrimeVisualizer data={data} />;
  }

  if (isGCDData(data)) {
    return <GCDVisualizer data={data} />;
  }

  if (isPascalData(data)) {
    return <PascalVisualizer data={data} />;
  }

  if (isExponentiationData(data)) {
    return <ExponentiationVisualizer data={data} />;
  }

  return <div className="p-4 text-gray-500">Unsupported math algorithm data type</div>;
}
