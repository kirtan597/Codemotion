'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sliders, RefreshCw, AlertCircle, CheckCircle2, Sparkles, Hash, Target } from 'lucide-react';
import { AlgorithmDefinition } from '@/lib/types/algorithm';
import { usePlayerStore } from '@/store/usePlayerStore';
import { ARRAY_PRESETS, PresetType, generateArrayPreset } from '@/lib/presets/arrayPresets';
import { validateArrayInput, MIN_ARRAY_SIZE, MAX_ARRAY_SIZE } from '@/lib/schemas/inputSchemas';
import { OperationPanel, LinearStructure } from '@/components/inspector/OperationPanel';

export interface InputPanelProps {
  algorithm: AlgorithmDefinition;
  currentInput: any;
  onInputChange: (newInput: any) => void;
  className?: string;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  algorithm,
  currentInput,
  onInputChange,
  className = '',
}) => {
  const resetPlayer = usePlayerStore((state) => state.reset);

  // Determine current array data based on category/algorithm input structure
  const getArrayFromInput = (input: any): number[] => {
    if (Array.isArray(input)) return input;
    if (input && Array.isArray(input.array)) return input.array;
    if (Array.isArray(algorithm.defaultInput)) return algorithm.defaultInput;
    if (algorithm.defaultInput && Array.isArray(algorithm.defaultInput.array)) {
      return algorithm.defaultInput.array;
    }
    return [34, 12, 56, 8, 45, 23, 78, 19, 62, 5];
  };

  const getTargetFromInput = (input: any): number => {
    if (input && typeof input.target === 'number') return input.target;
    if (algorithm.defaultInput && typeof algorithm.defaultInput.target === 'number') {
      return algorithm.defaultInput.target;
    }
    const arr = getArrayFromInput(input);
    return arr[Math.floor(arr.length / 2)] ?? 45;
  };

  const initialArray = getArrayFromInput(currentInput);
  const isSearchAlgo = algorithm.category === 'searching' || algorithm.inputConfig.type === 'array-target';

  // Internal state
  const [arraySize, setArraySize] = useState<number>(initialArray.length || 15);
  const [selectedPreset, setSelectedPreset] = useState<PresetType>('random');
  const [customText, setCustomText] = useState<string>(initialArray.join(', '));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [targetValue, setTargetValue] = useState<number>(getTargetFromInput(currentInput));
  const [isRandomizing, setIsRandomizing] = useState<boolean>(false);

  // Sync internal state when algorithm or currentInput prop changes externally
  useEffect(() => {
    const arr = getArrayFromInput(currentInput);
    setArraySize(arr.length);
    setCustomText(arr.join(', '));
    setValidationError(null);
    if (isSearchAlgo) {
      setTargetValue(getTargetFromInput(currentInput));
    }
  }, [algorithm.id]);

  // Debounce ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Safe caller to dispatch update and reset player with 150ms debounce
  const triggerUpdate = useCallback(
    (newArray: number[], newTarget?: number, immediate: boolean = false) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      const execute = () => {
        // Reset player cleanly
        resetPlayer();

        // Pass new input up
        if (isSearchAlgo) {
          const finalTarget = newTarget !== undefined ? newTarget : targetValue;
          onInputChange({ array: newArray, target: finalTarget });
        } else {
          onInputChange(newArray);
        }
      };

      if (immediate) {
        execute();
      } else {
        debounceTimerRef.current = setTimeout(execute, 150);
      }
    },
    [resetPlayer, onInputChange, isSearchAlgo, targetValue]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle Array Size Slider Change (5 - 60)
  const handleSizeChange = (newSize: number) => {
    setArraySize(newSize);
    let newArr: number[];

    if (selectedPreset === 'custom') {
      // If custom, resize or generate new random array
      newArr = generateArrayPreset('random', newSize);
      setSelectedPreset('random');
    } else {
      newArr = generateArrayPreset(selectedPreset, newSize);
    }

    setCustomText(newArr.join(', '));
    setValidationError(null);

    // If searching and target not in array, pick midpoint
    let nextTarget = targetValue;
    if (isSearchAlgo && !newArr.includes(targetValue)) {
      nextTarget = newArr[Math.floor(newArr.length / 2)];
      setTargetValue(nextTarget);
    }

    triggerUpdate(newArr, nextTarget, false);
  };

  // Handle Preset Dropdown Selection
  const handlePresetChange = (preset: PresetType) => {
    setSelectedPreset(preset);

    if (preset === 'custom') {
      // Keep existing customText and validate
      const validation = validateArrayInput(customText);
      if (validation.success && validation.data) {
        setValidationError(null);
        triggerUpdate(validation.data, targetValue, true);
      } else {
        setValidationError(validation.error || 'Invalid custom input');
      }
      return;
    }

    const newArr = generateArrayPreset(preset, arraySize);
    setCustomText(newArr.join(', '));
    setValidationError(null);

    let nextTarget = targetValue;
    if (isSearchAlgo) {
      nextTarget = newArr[Math.floor(newArr.length / 2)];
      setTargetValue(nextTarget);
    }

    triggerUpdate(newArr, nextTarget, true);
  };

  // Handle Custom Input Text Change (Zod validation with inline errors)
  const handleCustomTextChange = (text: string) => {
    setCustomText(text);
    setSelectedPreset('custom');

    const validation = validateArrayInput(text);
    if (!validation.success) {
      setValidationError(validation.error || 'Invalid array values.');
      return;
    }

    setValidationError(null);
    const validArray = validation.data!;
    setArraySize(validArray.length);

    let nextTarget = targetValue;
    if (isSearchAlgo && !validArray.includes(targetValue)) {
      nextTarget = validArray[0] ?? 0;
      setTargetValue(nextTarget);
    }

    triggerUpdate(validArray, nextTarget, false);
  };

  // Handle Randomize button click
  const handleRandomize = () => {
    setIsRandomizing(true);
    setTimeout(() => setIsRandomizing(false), 400);

    const newArr = generateArrayPreset('random', arraySize);
    setSelectedPreset('random');
    setCustomText(newArr.join(', '));
    setValidationError(null);

    let nextTarget = targetValue;
    if (isSearchAlgo) {
      nextTarget = newArr[Math.floor(Math.random() * newArr.length)];
      setTargetValue(nextTarget);
    }

    triggerUpdate(newArr, nextTarget, true);
  };

  // Handle Target Search Value Change
  const handleTargetChange = (val: number) => {
    setTargetValue(val);
    const arr = getArrayFromInput(currentInput);
    triggerUpdate(arr, val, false);
  };

  // For linear data structures (Stack, Queue, Linked List), render interactive OperationPanel
  if (algorithm.id === 'stack' || algorithm.id === 'queue' || algorithm.id === 'linked-list') {
    const structure = algorithm.id as LinearStructure;
    const initial = currentInput?.initial ?? (algorithm.defaultInput?.initial ?? []);
    const ops = currentInput?.ops ?? (algorithm.defaultInput?.ops ?? []);
    return (
      <OperationPanel
        structure={structure}
        ops={ops}
        onOpsChange={(newOps) => {
          resetPlayer();
          onInputChange({ initial, ops: newOps });
        }}
        onReset={() => {
          resetPlayer();
          onInputChange({ initial: [], ops: [] });
        }}
        className={className}
      />
    );
  }

  // For non-array algorithms (e.g. general graphs), render category-aware notice
  const isArrayCategory =
    algorithm.category === 'sorting' ||
    algorithm.category === 'searching' ||
    algorithm.inputConfig.type === 'array' ||
    algorithm.inputConfig.type === 'array-target';

  if (!isArrayCategory) {
    return (
      <div className={`p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Graph Inputs & Traversal
          </h3>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
          Graph algorithms operate on an interactive SVG canvas. Click &quot;Edit Graph&quot; on the canvas to add nodes, drag to reposition, or connect edges.
        </p>
        <button
          onClick={() => {
            setIsRandomizing(true);
            setTimeout(() => setIsRandomizing(false), 400);
            resetPlayer();
            onInputChange(structuredClone(algorithm.defaultInput));
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRandomizing ? 'animate-spin' : ''}`} />
          Reset Graph State
        </button>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-sm space-y-4 ${className}`}
      data-testid="input-panel"
    >
      {/* Header with Title and Randomize Button */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Input Controls
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {algorithm.name} ({algorithm.categoryName})
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRandomize}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-all active:scale-95 cursor-pointer"
          title="Generate fresh random values"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-violet-500 ${isRandomizing ? 'animate-spin' : ''}`} />
          <span>Randomize</span>
        </button>
      </div>

      {/* Array Size Slider (5 to 60) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="array-size-slider" className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-zinc-400" />
            Array Size
          </label>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-semibold text-violet-600 dark:text-violet-400 border border-zinc-200 dark:border-zinc-700">
            {arraySize} elements
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-zinc-400">5</span>
          <input
            id="array-size-slider"
            type="range"
            min={MIN_ARRAY_SIZE}
            max={MAX_ARRAY_SIZE}
            value={arraySize}
            onChange={(e) => handleSizeChange(Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
          />
          <span className="text-[10px] font-mono text-zinc-400">60</span>
        </div>
      </div>

      {/* Preset Dropdown */}
      <div className="space-y-1.5">
        <label htmlFor="preset-select" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Input Preset
        </label>
        <select
          id="preset-select"
          value={selectedPreset}
          onChange={(e) => handlePresetChange(e.target.value as PresetType)}
          className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
        >
          {ARRAY_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>

      {/* Target Input (for Searching algorithms) */}
      {isSearchAlgo && (
        <div className="space-y-1.5 p-2.5 rounded-lg bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/50 dark:border-violet-800/50">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="target-input" className="font-medium text-violet-900 dark:text-violet-200 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-violet-500" />
              Target Value to Search
            </label>
            <span className="font-mono text-[11px] font-bold text-violet-600 dark:text-violet-400">
              {targetValue}
            </span>
          </div>
          <input
            id="target-input"
            type="number"
            value={targetValue}
            onChange={(e) => handleTargetChange(Number(e.target.value))}
            className="w-full px-2.5 py-1 text-xs rounded-md border border-violet-200 dark:border-violet-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      )}

      {/* Custom Comma-Separated Input with Zod Validation and Inline Errors */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="custom-array-input" className="font-medium text-zinc-700 dark:text-zinc-300">
            Custom Array (comma-separated)
          </label>
          <span className="text-[10px] text-zinc-400">
            {validationError ? (
              <span className="text-rose-500 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" /> Error
              </span>
            ) : (
              <span className="text-emerald-500 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Valid
              </span>
            )}
          </span>
        </div>

        <textarea
          id="custom-array-input"
          rows={2}
          value={customText}
          onChange={(e) => handleCustomTextChange(e.target.value)}
          placeholder="e.g. 15, 23, 8, 42, 19, 56, 33"
          className={`w-full px-3 py-2 text-xs font-mono rounded-lg border bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 resize-none transition-colors focus:outline-none focus:ring-2 ${
            validationError
              ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
              : 'border-zinc-200 dark:border-zinc-700 focus:ring-violet-500'
          }`}
        />

        {/* Inline Error Message */}
        {validationError && (
          <div
            className="flex items-start gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-md border border-rose-200 dark:border-rose-900/50"
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-rose-500" />
            <span>{validationError}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputPanel;
