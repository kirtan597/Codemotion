'use client';

import { useState } from 'react';
import { Download, FileJson, Image } from 'lucide-react';
import { Snapshot } from '@/lib/types/algorithm';

interface ExportButtonProps {
  snapshots: Snapshot[];
  currentSnapshot?: Snapshot;
  algorithmName: string;
}

export function ExportButton({ snapshots, currentSnapshot, algorithmName }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const exportJSON = () => {
    const data = JSON.stringify(snapshots, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${algorithmName}-snapshots.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const exportPNG = async () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Find the main visualizer canvas/svg
      const visualizer = document.querySelector('[data-visualizer], canvas, svg');
      
      if (!visualizer) return;
      
      if (visualizer instanceof HTMLCanvasElement) {
        // Direct canvas export
        const url = visualizer.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `${algorithmName}-frame-${currentSnapshot?.step || 0}.png`;
        a.click();
      } else if (visualizer instanceof SVGElement) {
        // SVG to canvas conversion
        const svgData = new XMLSerializer().serializeToString(visualizer);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        const img = document.createElement('img');
        img.onload = () => {
          canvas.width = visualizer.clientWidth || 800;
          canvas.height = visualizer.clientHeight || 600;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          const pngUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = `${algorithmName}-frame-${currentSnapshot?.step || 0}.png`;
          a.click();
          
          URL.revokeObjectURL(url);
        };
        img.src = url;
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Export PNG failed:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors relative z-10"
        aria-label="Export options"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl z-[110]">
            <button
              onClick={exportJSON}
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-t-lg"
            >
              <FileJson className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  Export JSON
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  All snapshots
                </div>
              </div>
            </button>
            <button
              onClick={exportPNG}
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-b-lg"
            >
              <Image className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  Export PNG
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Current frame
                </div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
