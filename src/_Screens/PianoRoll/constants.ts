import type { PianoRollConstants } from "./types";

export const createConstants = (zoom: number): PianoRollConstants => ({
  NOTE_HEIGHT: 20,
  PIANO_WIDTH: 80,
  BEAT_WIDTH: 60 * zoom,
  GRID_HEIGHT: 128 * 20, // 128 MIDI notes
  VISIBLE_BEATS: 32,
  NOTE_NAMES: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
});

export const DEFAULT_ZOOM = 1;
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 3;
export const ZOOM_STEP = 0.1;
