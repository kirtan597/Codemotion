import { AlgorithmDefinition, Snapshot, ArrayElement, ElementState } from '../types/algorithm';

function toElements(arr: number[], states: Record<number, ElementState> = {}): ArrayElement[] {
  return arr.map((value, idx) => ({
    id: `search-el-${idx}-${value}`,
    value,
    state: states[idx] || 'default',
  }));
}

export interface SearchInput {
  array: number[];
  target: number;
}

// -------------------------------------------------------------
// Binary Search
// -------------------------------------------------------------
export const binarySearch: AlgorithmDefinition<SearchInput | number[], ArrayElement[]> = {
  id: 'binary-search',
  name: 'Binary Search',
  category: 'searching',
  categoryName: 'Searching',
  description: 'Efficiently searches a sorted array by repeatedly dividing the search interval in half.',
  difficulty: 'Easy',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
  },
  spaceComplexity: 'O(1)',
  defaultInput: {
    array: [10, 18, 25, 32, 45, 54, 63, 72, 81, 95],
    target: 54,
  },
  inputConfig: {
    type: 'array-target',
    minSize: 5,
    maxSize: 60,
    defaultSize: 10,
    supportsCustomInput: true,
  },
  code: [
    'low = 0, high = n - 1',
    'while low <= high:',
    '  mid = Math.floor((low + high) / 2)',
    '  if arr[mid] == target: return mid',
    '  else if arr[mid] < target: low = mid + 1',
    '  else: high = mid - 1',
    'return -1',
  ],
  generate: (input: SearchInput | number[]): Snapshot<ArrayElement[]>[] => {
    let rawArr: number[];
    let target: number;

    if (Array.isArray(input)) {
      rawArr = [...input].sort((a, b) => a - b);
      target = rawArr[Math.floor(rawArr.length / 2)];
    } else {
      rawArr = [...input.array].sort((a, b) => a - b);
      target = input.target ?? rawArr[Math.floor(rawArr.length / 2)];
    }

    const n = rawArr.length;
    const snapshots: Snapshot<ArrayElement[]>[] = [];
    let stepCount = 0;

    const pushSnapshot = (
      desc: string,
      low: number,
      high: number,
      mid: number | null,
      found: boolean = false,
      line: number = 0
    ) => {
      const states: Record<number, ElementState> = {};
      for (let i = 0; i < n; i++) {
        if (i < low || i > high) {
          states[i] = 'visited'; // ruled out
        } else {
          states[i] = 'default'; // active search window
        }
      }
      if (mid !== null && mid >= 0 && mid < n) {
        states[mid] = found ? 'found' : 'comparing';
      }

      snapshots.push({
        id: `bsearch-${stepCount++}`,
        step: snapshots.length,
        description: desc,
        data: toElements(rawArr, states),
        comparingIndices: mid !== null ? [mid] : [],
        highlightIndices: mid !== null ? [mid] : [],
        currentLine: line,
        variables: { low, high, mid, target, found },
      });
    };

    pushSnapshot(`Binary Search ready on sorted array of ${n} elements. Searching for target = ${target}.`, 0, n - 1, null, false, 0);

    let low = 0;
    let high = n - 1;
    let foundIndex = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      pushSnapshot(`Checking window [${low}..${high}]. Midpoint is index ${mid} (${rawArr[mid]}).`, low, high, mid, false, 2);

      if (rawArr[mid] === target) {
        foundIndex = mid;
        pushSnapshot(`Target ${target} found at index ${mid}!`, low, high, mid, true, 3);
        break;
      } else if (rawArr[mid] < target) {
        pushSnapshot(`arr[${mid}] (${rawArr[mid]}) < ${target}. Target must be in right half.`, low, high, mid, false, 4);
        low = mid + 1;
      } else {
        pushSnapshot(`arr[${mid}] (${rawArr[mid]}) > ${target}. Target must be in left half.`, low, high, mid, false, 5);
        high = mid - 1;
      }
    }

    if (foundIndex === -1) {
      pushSnapshot(`Target ${target} not found in the array. Search exhausted.`, low, high, null, false, 6);
    }

    return snapshots;
  },
};

// -------------------------------------------------------------
// Linear Search
// -------------------------------------------------------------
export const linearSearch: AlgorithmDefinition<SearchInput | number[], ArrayElement[]> = {
  id: 'linear-search',
  name: 'Linear Search',
  category: 'searching',
  categoryName: 'Searching',
  description: 'Sequentially checks each element of the list until a match is found or the whole list has been searched.',
  difficulty: 'Easy',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(n)',
    worst: 'O(n)',
  },
  spaceComplexity: 'O(1)',
  defaultInput: {
    array: [24, 7, 42, 19, 88, 3, 56, 12],
    target: 88,
  },
  inputConfig: {
    type: 'array-target',
    minSize: 5,
    maxSize: 60,
    defaultSize: 8,
    supportsCustomInput: true,
  },
  code: [
    'for i from 0 to n - 1:',
    '  if arr[i] == target: return i',
    'return -1',
  ],
  generate: (input: SearchInput | number[]): Snapshot<ArrayElement[]>[] => {
    let arr: number[];
    let target: number;

    if (Array.isArray(input)) {
      arr = [...input];
      target = arr[Math.floor(arr.length / 2)];
    } else {
      arr = [...input.array];
      target = input.target ?? arr[Math.floor(arr.length / 2)];
    }

    const n = arr.length;
    const snapshots: Snapshot<ArrayElement[]>[] = [];
    let stepCount = 0;

    const pushSnapshot = (desc: string, currentIdx: number | null, found: boolean, line: number) => {
      const states: Record<number, ElementState> = {};
      for (let i = 0; i < n; i++) {
        if (currentIdx !== null && i < currentIdx) {
          states[i] = 'visited';
        } else if (i === currentIdx) {
          states[i] = found ? 'found' : 'comparing';
        } else {
          states[i] = 'default';
        }
      }

      snapshots.push({
        id: `lsearch-${stepCount++}`,
        step: snapshots.length,
        description: desc,
        data: toElements(arr, states),
        comparingIndices: currentIdx !== null ? [currentIdx] : [],
        highlightIndices: currentIdx !== null ? [currentIdx] : [],
        currentLine: line,
        variables: { currentIdx, target, found },
      });
    };

    pushSnapshot(`Linear search ready. Looking for ${target} in ${n} elements.`, null, false, 0);

    let found = false;
    for (let i = 0; i < n; i++) {
      pushSnapshot(`Checking index ${i}: arr[${i}] = ${arr[i]}.`, i, false, 1);
      if (arr[i] === target) {
        found = true;
        pushSnapshot(`Target ${target} found at index ${i}!`, i, true, 1);
        break;
      }
    }

    if (!found) {
      pushSnapshot(`Target ${target} is not in the array.`, null, false, 2);
    }

    return snapshots;
  },
};
