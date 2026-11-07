/**
 * Type definitions for mathematical and bitwise algorithm visualizations
 */

// ─── Bitwise Operations ───────────────────────────────────────────────────────

export interface BitRepresentation {
  decimal: number;
  binary: string;
  bits: Bit[];
  highlighted?: number[];  // Bit positions to highlight
}

export interface Bit {
  position: number;
  value: 0 | 1;
  state: 'default' | 'active' | 'changed' | 'result';
}

export interface BitwiseOperationData {
  operand1: BitRepresentation;
  operand2?: BitRepresentation;
  result?: BitRepresentation;
  operation: string;
  operationSymbol: string;
  step: string;
}

export interface BitwiseInput {
  num1: number;
  num2?: number;
  k?: number;  // For kth bit operations
}

// ─── Number Theory ────────────────────────────────────────────────────────────

export interface PrimeData {
  numbers: NumberCell[];
  primes: number[];
  currentNumber: number;
  operation: string;
}

export interface NumberCell {
  value: number;
  isPrime: boolean;
  isMarked: boolean;
  state: 'default' | 'checking' | 'prime' | 'composite' | 'active';
  markedBy?: number;  // Which prime marked it as composite
}

export interface SieveInput {
  n: number;
}

export interface GCDData {
  a: number;
  b: number;
  remainder?: number;
  quotient?: number;
  steps: GCDStep[];
}

export interface GCDStep {
  a: number;
  b: number;
  quotient: number;
  remainder: number;
  operation: string;
}

export interface GCDInput {
  a: number;
  b: number;
}

export interface FactorizationData {
  number: number;
  factors: Factor[];
  currentDivisor: number;
  remaining: number;
}

export interface Factor {
  prime: number;
  exponent: number;
  state: 'found' | 'checking' | 'complete';
}

export interface FactorizationInput {
  n: number;
}

// ─── Combinatorics ────────────────────────────────────────────────────────────

export interface PascalTriangleData {
  rows: PascalRow[];
  currentRow: number;
  highlightedCells?: [number, number][];
}

export interface PascalRow {
  rowNumber: number;
  values: PascalCell[];
}

export interface PascalCell {
  value: number;
  state: 'default' | 'computing' | 'complete' | 'highlighted';
  parents?: [number, number][];  // Parent cells used to compute this
}

export interface PascalInput {
  n: number;
}

export interface CombinatoricsData {
  n: number;
  r?: number;
  result: number;
  formula: string;
  steps: ComputationStep[];
}

export interface ComputationStep {
  operation: string;
  value: number;
  intermediate: number;
}

export interface CombinatoricsInput {
  n: number;
  r?: number;
}

// ─── Mathematical Algorithms ──────────────────────────────────────────────────

export interface MatrixData {
  matrix: MatrixCell[][];
  operation: string;
  currentRow?: number;
  currentCol?: number;
  pivotRow?: number;
  pivotCol?: number;
}

export interface MatrixCell {
  value: number;
  state: 'default' | 'pivot' | 'computing' | 'result' | 'swapped';
  row: number;
  col: number;
}

export interface MatrixInput {
  matrix: number[][];
  operation?: string;
}

export interface ExponentiationData {
  base: number;
  exponent: number;
  modulo?: number;
  result: number;
  binaryExp: string;
  steps: ExponentStep[];
  currentBit: number;
}

export interface ExponentStep {
  bit: number;
  power: number;
  result: number;
  operation: string;
}

export interface ExponentiationInput {
  base: number;
  exponent: number;
  modulo?: number;
}

export interface FibonacciMatrixData {
  n: number;
  matrix: number[][];
  resultMatrix?: number[][];
  step: string;
  value: number;
}

export interface NewtonRaphsonData {
  target: number;
  currentGuess: number;
  iterations: NewtonIteration[];
  converged: boolean;
}

export interface NewtonIteration {
  iteration: number;
  guess: number;
  fx: number;
  fPrimeX: number;
  nextGuess: number;
  error: number;
}

export interface NewtonRaphsonInput {
  target: number;
  initialGuess?: number;
  tolerance?: number;
}

// ─── General Math Snapshot ────────────────────────────────────────────────────

export type MathDataUnion = 
  | BitwiseOperationData
  | PrimeData
  | GCDData
  | FactorizationData
  | PascalTriangleData
  | CombinatoricsData
  | MatrixData
  | ExponentiationData
  | FibonacciMatrixData
  | NewtonRaphsonData;

export interface MathSnapshot<T = MathDataUnion> {
  id: string;
  step: number;
  description: string;
  data: T;
  currentLine?: number;
  variables?: Record<string, any>;
  formula?: string;
}

// ─── Subset Generation ────────────────────────────────────────────────────────

export interface SubsetData {
  elements: number[];
  subsets: Subset[];
  currentMask: number;
  currentSubset: number[];
  bitmask: BitRepresentation;
}

export interface Subset {
  elements: number[];
  bitmask: number;
  state: 'generating' | 'complete';
}

export interface SubsetInput {
  elements: number[];
}

// ─── Gray Code ────────────────────────────────────────────────────────────────

export interface GrayCodeData {
  n: number;
  codes: GrayCodeEntry[];
  currentIndex: number;
}

export interface GrayCodeEntry {
  decimal: number;
  binary: string;
  grayCode: string;
  state: 'default' | 'generating' | 'complete';
}

export interface GrayCodeInput {
  n: number;
}
