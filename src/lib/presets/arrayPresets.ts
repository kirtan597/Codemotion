export type PresetType =
  | 'random'
  | 'sorted'
  | 'reversed'
  | 'nearly-sorted'
  | 'few-unique'
  | 'alternating'
  | 'custom';

export interface ArrayPresetOption {
  id: PresetType;
  label: string;
  description: string;
}

export const ARRAY_PRESETS: ArrayPresetOption[] = [
  { id: 'random', label: 'Random', description: 'Random uniform distribution of values' },
  { id: 'sorted', label: 'Sorted (Ascending)', description: 'Already sorted in ascending order (best-case for many)' },
  { id: 'reversed', label: 'Reverse Sorted', description: 'Sorted in descending order (worst-case for many)' },
  { id: 'nearly-sorted', label: 'Nearly Sorted', description: 'Ascending with a few elements swapped' },
  { id: 'few-unique', label: 'Few Unique Values', description: 'Contains duplicates across 3-4 distinct numbers' },
  { id: 'alternating', label: 'Alternating High/Low', description: 'Alternating peaks and valleys' },
  { id: 'custom', label: 'Custom Input', description: 'User-provided comma-separated numbers' },
];

/**
 * Generates an array of numbers based on preset type and size.
 * Values are bounded between 5 and 95 for visual clarity.
 */
export function generateArrayPreset(preset: PresetType, size: number = 15): number[] {
  const safeSize = Math.max(5, Math.min(size, 60));
  const minVal = 5;
  const maxVal = 95;

  switch (preset) {
    case 'sorted': {
      const step = (maxVal - minVal) / Math.max(1, safeSize - 1);
      return Array.from({ length: safeSize }, (_, i) => Math.round(minVal + i * step));
    }
    case 'reversed': {
      const step = (maxVal - minVal) / Math.max(1, safeSize - 1);
      return Array.from({ length: safeSize }, (_, i) => Math.round(maxVal - i * step));
    }
    case 'nearly-sorted': {
      const step = (maxVal - minVal) / Math.max(1, safeSize - 1);
      const arr = Array.from({ length: safeSize }, (_, i) => Math.round(minVal + i * step));
      // Swap ~10% of elements
      const numSwaps = Math.max(1, Math.floor(safeSize * 0.12));
      for (let s = 0; s < numSwaps; s++) {
        const i = Math.floor(Math.random() * (safeSize - 1));
        const j = Math.min(safeSize - 1, i + 1 + Math.floor(Math.random() * 2));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
    case 'few-unique': {
      const distinctValues = [15, 35, 65, 85];
      return Array.from({ length: safeSize }, () => {
        return distinctValues[Math.floor(Math.random() * distinctValues.length)];
      });
    }
    case 'alternating': {
      return Array.from({ length: safeSize }, (_, i) => {
        const high = 75 + Math.floor(Math.random() * 20);
        const low = 10 + Math.floor(Math.random() * 20);
        return i % 2 === 0 ? high : low;
      });
    }
    case 'random':
    case 'custom':
    default: {
      return Array.from({ length: safeSize }, () => {
        return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
      });
    }
  }
}
