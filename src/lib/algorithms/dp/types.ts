export type DPMode = 'table' | 'sequence' | 'tree' | 'graph';

export interface DPMatrixData {
  table: (number | null)[][];
  rowHeaders: string[];
  colHeaders: string[];
  rowLabels?: string[];
  computingCell?: [number, number] | null;
  dependencyCells?: Array<[number, number]>;
  backtrackCells?: Array<[number, number]>;
  phase?: 'init' | 'compute' | 'backtrack' | 'done';
  dpMode?: DPMode; // 4-mode support: table (default), sequence (1D), tree (parent-child), graph (DAG)
}

export interface KnapsackItem {
  id?: string;
  name: string;
  weight: number;
  value: number;
}

export interface KnapsackInput {
  items: KnapsackItem[];
  capacity: number;
}

export interface LCSInput {
  text1: string;
  text2: string;
}

export interface DPMetaVariables {
  formula?: string;
  substitutedFormula?: string;
  decision?: 'skip' | 'take' | 'match' | 'left' | 'top' | 'init' | 'backtrack' | 'done';
  skipVal?: number | null;
  takeVal?: number | null;
  bestValue?: number;
  remainingCapacity?: number;
  currentItem?: KnapsackItem | null;
  chosenItems?: KnapsackItem[];
  currentPair?: { char1: string; char2: string; i: number; j: number };
  lcsString?: string;
  reconstructedLCS?: string;
  [key: string]: any;
}

export const DEFAULT_KNAPSACK_INPUT: KnapsackInput = {
  capacity: 7,
  items: [
    { name: 'Guitar', weight: 1, value: 1500 },
    { name: 'Stereo', weight: 4, value: 3000 },
    { name: 'Laptop', weight: 3, value: 2000 },
    { name: 'Phone', weight: 1, value: 2000 },
  ],
};

export const DEFAULT_LCS_INPUT: LCSInput = {
  text1: 'STONE',
  text2: 'LONGEST',
};

