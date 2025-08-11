export interface Note {
  id: string;
  pitch: number; // MIDI note number (0-127)
  start: number; // Start time in beats
  duration: number; // Duration in beats
  velocity: number; // 0-127
  selected: boolean;
}

export interface PianoRollProps {
  width: number; // percentage
  scrollX?: number;
  scrollY?: number;
  onScrollChange?: (scrollX: number) => void;
  onVerticalScrollChange?: (scrollY: number) => void;
  className?: string;
}

export interface NoteInfo {
  name: string;
  octave: number;
  isBlack: boolean;
}

export interface DragState {
  note: Note | null;
  offset: { x: number; y: number };
}

export interface CreateNoteState {
  isCreating: boolean;
  note: { pitch: number; start: number } | null;
}

export interface PianoRollConstants {
  NOTE_HEIGHT: number;
  PIANO_WIDTH: number;
  BEAT_WIDTH: number;
  GRID_HEIGHT: number;
  VISIBLE_BEATS: number;
  NOTE_NAMES: string[];
}
