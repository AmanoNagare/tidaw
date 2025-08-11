import React from "react";
import type { Note, PianoRollConstants } from "./types";
import { createUtils } from "./utils";

interface NoteRendererProps {
  note: Note;
  constants: PianoRollConstants;
  scrollX: number;
  onMouseDown: (e: React.MouseEvent, note: Note) => void;
}

const NoteRenderer: React.FC<NoteRendererProps> = ({
  note,
  constants,
  scrollX,
  onMouseDown,
}) => {
  const utils = createUtils(constants, scrollX);

  const x = utils.getXFromTime(note.start);
  const y = utils.getYFromPitch(note.pitch);
  const noteWidth = note.duration * constants.BEAT_WIDTH;
  const opacity = note.velocity / 127;

  return (
    <div
      className={`absolute rounded-lg cursor-move border-2 transition-all duration-200 shadow-lg ${
        note.selected
          ? "border-blue-400 bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/50"
          : "border-emerald-500 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 shadow-emerald-500/30"
      }`}
      style={{
        left: x,
        top: y + 1,
        width: Math.max(10, noteWidth - 2),
        height: constants.NOTE_HEIGHT - 2,
        opacity: Math.max(0.4, opacity),
        zIndex: note.selected ? 10 : 1,
      }}
      onMouseDown={(e) => onMouseDown(e, note)}
    >
      <div className="w-full h-full flex items-center justify-center text-xs text-white font-bold drop-shadow-sm">
        {utils.getNoteInfo(note.pitch).name}
      </div>
    </div>
  );
};

export default NoteRenderer;
