'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { InputPanel } from '@/components/inspector/InputPanel';
import { PseudocodeTab } from '@/components/inspector/PseudocodeTab';
import { LogTab } from '@/components/inspector/LogTab';
import { InfoTab } from '@/components/inspector/InfoTab';
import { PlayerControls } from '@/components/player/PlayerControls';
import { ShareButton } from '@/components/shared/ShareButton';
import { ExportButton } from '@/components/shared/ExportButton';
import { LiveRegion } from '@/components/shared/LiveRegion';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { getVisualizer } from '@/components/visualizers';
import { useAlgorithm } from '@/hooks/useAlgorithm';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { parseUrlState } from '@/lib/schemas/url-state';
import { Clock, HardDrive, Search, Code2, ListFilter, Info } from 'lucide-react';

export interface VisualizerViewProps {
  category: string;
  algorithmId: string;
}

type InspectorTab = 'pseudocode' | 'log' | 'info';

export const VisualizerView: React.FC<VisualizerViewProps> = ({
  category,
  algorithmId,
}) => {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [activeInspectorTab, setActiveInspectorTab] = useState<InspectorTab>('pseudocode');
  const currentFrame = usePlayerStore((s) => s.currentFrame);
  const speed = usePlayerStore((s) => s.speed);
  const setSpeed = usePlayerStore((s) => s.setSpeed);
  const goToFrame = usePlayerStore((s) => s.goToFrame);
  
  const [persistedSpeed, setPersistedSpeed] = useLocalStorage('codemotion-speed', 1);
  const searchParams = useSearchParams();

  const {
    definition,
    input,
    setInput,
    snapshots,
    warning,
    totalFrames,
  } = useAlgorithm(algorithmId);

  const activeSnapshot = snapshots[currentFrame] || snapshots[0];
  
  useEffect(() => {
    setSpeed(persistedSpeed);
  }, [persistedSpeed, setSpeed]);
  
  useEffect(() => {
    setPersistedSpeed(speed);
  }, [speed, setPersistedSpeed]);
  
  useEffect(() => {
    try {
      const urlState = parseUrlState(searchParams);
      
      if (urlState.input) {
        const parsedInput = JSON.parse(urlState.input);
        setInput(parsedInput);
      }
      
      if (urlState.speed !== undefined) {
        setSpeed(urlState.speed);
      }
      
      if (urlState.step !== undefined && urlState.step < snapshots.length) {
        goToFrame(urlState.step);
      }
    } catch (error) {
      console.warn('Failed to parse URL state:', error);
    }
  }, [searchParams, setInput, setSpeed, goToFrame, snapshots.length]);
  
  const liveMessage = activeSnapshot
    ? `Step ${activeSnapshot.step}: ${activeSnapshot.description}`
    : '';

  // Difficulty badge styles
  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return {
          backgroundColor: '#D1FAE5',
          color: '#10B981',
          border: '1px solid #A7F3D0',
        };
      case 'Medium':
        return {
          backgroundColor: '#FEF3C7',
          color: '#F59E0B',
          border: '1px solid #FDE68A',
        };
      case 'Hard':
        return {
          backgroundColor: '#FFE4E6',
          color: '#E11D48',
          border: '1px solid #FECDD3',
        };
      default:
        return {};
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50 dark:bg-black font-sans">
      <LiveRegion message={liveMessage} />
      
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <Sidebar onOpenSearch={() => setPaletteOpen(true)} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Polished Top Bar */}
        <header
          className="h-16 shrink-0 px-6 border-b flex items-center justify-between sticky top-0 z-40 bg-white"
          style={{
            borderBottomColor: '#EEF0F4',
            borderBottomWidth: '1px',
            boxShadow: '0 1px 0 rgba(17, 24, 39, 0.04)',
          }}
        >
          {/* Left Side - Breadcrumb + Pills */}
          <div className="flex items-center gap-3">
            {/* Breadcrumb - Hidden on mobile */}
            <div className="hidden md:block">
              <Breadcrumb
                category={category}
                categoryName={definition.categoryName}
                algorithmName={definition.name}
              />
            </div>

            {/* Mobile: Just show algorithm name */}
            <h1 className="md:hidden text-base font-bold" style={{ color: '#111827' }}>
              {definition.name}
            </h1>

            {/* Category Pill */}
            <span
              className="text-xs font-medium px-3 py-1.5 transition-smooth"
              style={{
                backgroundColor: '#EDE9FE',
                color: '#6D28D9',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {definition.categoryName}
            </span>

            {/* Difficulty Pill */}
            <span
              className="text-xs font-medium px-3 py-1.5 transition-smooth"
              style={{
                ...getDifficultyStyles(definition.difficulty),
                borderRadius: 'var(--radius-md)',
              }}
            >
              {definition.difficulty}
            </span>
          </div>

          {/* Right Side - Metrics + Actions */}
          <div className="flex items-center gap-3">
            {/* Metrics - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-3">
              <div
                className="flex items-center gap-2 h-10 px-3 transition-smooth"
                style={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #F3F4F6',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <Clock className="w-4 h-4" style={{ color: '#7C3AED' }} />
                <span className="font-mono text-sm" style={{ color: '#111827' }}>
                  Avg: {definition.timeComplexity.average}
                </span>
              </div>

              <div
                className="flex items-center gap-2 h-10 px-3 transition-smooth"
                style={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #F3F4F6',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <HardDrive className="w-4 h-4" style={{ color: '#7C3AED' }} />
                <span className="font-mono text-sm" style={{ color: '#111827' }}>
                  Space: {definition.spaceComplexity}
                </span>
              </div>
            </div>

            {/* Actions */}
            <ExportButton
              snapshots={snapshots}
              currentSnapshot={activeSnapshot}
              algorithmName={definition.name}
            />
            
            <ShareButton
              algorithmId={algorithmId}
              input={input}
              speed={speed}
              step={currentFrame}
            />

            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 h-10 px-4 transition-smooth"
              style={{
                backgroundColor: '#7C3AED',
                color: 'white',
                borderRadius: 'var(--radius-md)',
                fontWeight: 500,
                fontSize: '14px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#6D28D9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#7C3AED';
              }}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd
                className="px-2 py-0.5 text-xs font-mono ml-1"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                }}
              >
                ⌘K
              </kbd>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            {(() => {
              const VisualizerComponent = getVisualizer(definition.category);
              return (
                <VisualizerComponent
                  snapshot={activeSnapshot}
                  {...(definition.category === 'graph'
                    ? {
                        algorithmId: definition.id,
                        initialGraph: input?.graph,
                        initialStartNode: input?.startNode,
                        initialTargetNode: input?.targetNode,
                        onGraphChange: (newGraph: any, startNode: string, targetNode?: string) => {
                          setInput({ graph: newGraph, startNode, targetNode });
                        },
                      }
                    : {})}
                />
              );
            })()}

            <PlayerControls />
          </div>

          <div className="w-full lg:w-96 shrink-0 flex flex-col gap-6">
            <InputPanel
              algorithm={definition}
              currentInput={input}
              onInputChange={(newInput) => setInput(newInput)}
            />

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80">
                <button
                  onClick={() => setActiveInspectorTab('pseudocode')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    activeInspectorTab === 'pseudocode'
                      ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-sm font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Code</span>
                </button>
                <button
                  onClick={() => setActiveInspectorTab('log')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    activeInspectorTab === 'log'
                      ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-sm font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>Log</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 font-mono">
                    {snapshots.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveInspectorTab('info')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    activeInspectorTab === 'info'
                      ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-sm font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Info</span>
                </button>
              </div>

              {activeInspectorTab === 'pseudocode' && (
                <PseudocodeTab
                  code={definition.code}
                  highlightedLine={activeSnapshot?.currentLine}
                  variables={activeSnapshot?.variables}
                />
              )}

              {activeInspectorTab === 'log' && (
                <LogTab />
              )}

              {activeInspectorTab === 'info' && (
                <InfoTab
                  algorithm={definition}
                  snapshot={activeSnapshot}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VisualizerView;
