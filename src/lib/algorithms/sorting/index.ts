// Re-export all sorting algorithm definitions from individual modules.
// The old monolithic sorting.ts still exports bubble/quick/insertion/selection
// for backwards compat with registry.ts — this index adds merge & heap.
export { bubbleSort } from './bubble';
export { selectionSort } from './selection';
export { insertionSort } from './insertion';
export { mergeSort } from './merge';
export { quickSort } from './quick';
export { heapSort } from './heap';

