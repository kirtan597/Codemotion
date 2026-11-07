import { Snapshot } from './algorithm';

export interface PlayerState {
  currentFrame: number;
  totalFrames: number;
  isPlaying: boolean;
  speed: number; // 0.5x, 1x, 2x, 4x, etc.
  snapshots: Snapshot[];
  warning: string | null;

  // Actions
  setSnapshots: (snapshots: Snapshot[], warning?: string | null) => void;
  reset: () => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  goToFrame: (frame: number) => void;
  setSpeed: (speed: number) => void;
  setWarning: (warning: string | null) => void;
}
