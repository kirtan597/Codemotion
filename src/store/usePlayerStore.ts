import { create } from 'zustand';
import { PlayerState } from '@/lib/types/player';
import { Snapshot } from '@/lib/types/algorithm';

export const usePlayerStore = create<PlayerState>((set) => ({
  currentFrame: 0,
  totalFrames: 0,
  isPlaying: false,
  speed: 1,
  snapshots: [],
  warning: null,

  setSnapshots: (snapshots: Snapshot[], warning: string | null = null) => {
    set({
      snapshots,
      totalFrames: snapshots.length,
      currentFrame: 0,
      isPlaying: false,
      warning: warning ?? null,
    });
  },

  reset: () => {
    set({
      currentFrame: 0,
      isPlaying: false,
    });
  },

  play: () => {
    set((state) => {
      if (state.snapshots.length === 0) return { isPlaying: false };
      if (state.currentFrame >= state.snapshots.length - 1) {
        return { currentFrame: 0, isPlaying: true };
      }
      return { isPlaying: true };
    });
  },

  pause: () => {
    set({ isPlaying: false });
  },

  togglePlay: () => {
    set((state) => {
      if (state.isPlaying) {
        return { isPlaying: false };
      }
      if (state.snapshots.length === 0) {
        return { isPlaying: false };
      }
      if (state.currentFrame >= state.snapshots.length - 1) {
        return { currentFrame: 0, isPlaying: true };
      }
      return { isPlaying: true };
    });
  },

  stepForward: () => {
    set((state) => {
      if (state.currentFrame < state.snapshots.length - 1) {
        return { currentFrame: state.currentFrame + 1 };
      }
      return { isPlaying: false };
    });
  },

  stepBackward: () => {
    set((state) => {
      if (state.currentFrame > 0) {
        return { currentFrame: state.currentFrame - 1, isPlaying: false };
      }
      return { isPlaying: false };
    });
  },

  goToFrame: (frame: number) => {
    set((state) => {
      if (state.snapshots.length === 0) return { currentFrame: 0, isPlaying: false };
      const clamped = Math.max(0, Math.min(frame, state.snapshots.length - 1));
      return {
        currentFrame: clamped,
        isPlaying: false,
      };
    });
  },

  setSpeed: (speed: number) => {
    set({ speed });
  },

  setWarning: (warning: string | null) => {
    set({ warning });
  },
}));
