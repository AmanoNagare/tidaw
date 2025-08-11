import type { NoteInfo, PianoRollConstants } from "./types";

export const createUtils = (
  constants: PianoRollConstants,
  scrollX: number
) => ({
  getNoteInfo: (midiNote: number): NoteInfo => {
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = constants.NOTE_NAMES[midiNote % 12];
    return {
      name: noteName || "C",
      octave,
      isBlack: noteName?.includes("#") || false,
    };
  },

  getYFromPitch: (pitch: number): number => {
    return (127 - pitch) * constants.NOTE_HEIGHT;
  },

  getPitchFromY: (y: number): number => {
    return Math.max(
      0,
      Math.min(127, 127 - Math.floor(y / constants.NOTE_HEIGHT))
    );
  },

  getTimeFromX: (x: number): number => {
    return Math.max(0, (x + scrollX) / constants.BEAT_WIDTH);
  },

  getXFromTime: (time: number): number => {
    return time * constants.BEAT_WIDTH - scrollX;
  },

  snapToGrid: (time: number, snapDivision: number = 4): number => {
    return Math.round(time * snapDivision) / snapDivision;
  },

  snapPitch: (pitch: number): number => {
    return Math.round(pitch);
  },
});
