import React, { useRef, useCallback } from "react";
import type { Note, PianoRollConstants, CreateNoteState } from "./types";
import { createUtils } from "./utils";
import NoteRenderer from "./NoteRenderer";

interface PianoGridProps {
  constants: PianoRollConstants;
  notes: Note[];
  scrollX: number;
  scrollY: number;
  createNoteState: CreateNoteState;
  onGridMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onNoteMouseDown: (e: React.MouseEvent, note: Note) => void;
  onScrollChange: (e: React.UIEvent<HTMLDivElement>) => void;
}

const PianoGrid: React.FC<PianoGridProps> = ({
  constants,
  notes,
  scrollX,
  scrollY,
  createNoteState,
  onGridMouseDown,
  onMouseMove,
  onMouseUp,
  onNoteMouseDown,
  onScrollChange,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const utils = createUtils(constants, scrollX);

  const renderGrid = useCallback(() => {
    const gridLines = [];

    // Horizontal lines (pitch)
    for (let i = 0; i <= 128; i++) {
      const y = i * constants.NOTE_HEIGHT;
      const noteInfo = utils.getNoteInfo(127 - i);

      gridLines.push(
        <line
          key={`h-${i}`}
          x1={0}
          y1={y}
          x2={constants.VISIBLE_BEATS * constants.BEAT_WIDTH}
          y2={y}
          stroke={noteInfo.name === "C" ? "#374151" : "#1f2937"}
          strokeWidth={noteInfo.name === "C" ? 1 : 0.5}
        />
      );
    }

    // Vertical lines (time)
    for (let i = 0; i <= constants.VISIBLE_BEATS * 4; i++) {
      const x = (i / 4) * constants.BEAT_WIDTH;
      const isBeat = i % 4 === 0;
      const isMeasure = i % 16 === 0;

      gridLines.push(
        <line
          key={`v-${i}`}
          x1={x}
          y1={0}
          x2={x}
          y2={constants.GRID_HEIGHT}
          stroke={isMeasure ? "#4b5563" : isBeat ? "#374151" : "#1f2937"}
          strokeWidth={isMeasure ? 2 : isBeat ? 1 : 0.5}
        />
      );
    }

    return gridLines;
  }, [constants, utils]);

  const renderNotes = useCallback(() => {
    return notes.map((note) => (
      <NoteRenderer
        key={note.id}
        note={note}
        constants={constants}
        scrollX={scrollX}
        onMouseDown={onNoteMouseDown}
      />
    ));
  }, [notes, constants, scrollX, onNoteMouseDown]);

  const renderPreviewNote = useCallback(() => {
    if (!createNoteState.isCreating || !createNoteState.note) return null;

    return (
      <div
        className="absolute bg-gradient-to-r from-blue-400 to-blue-500 border-2 border-blue-400 rounded-lg opacity-60 shadow-lg shadow-blue-500/30"
        style={{
          left: utils.getXFromTime(createNoteState.note.start),
          top: utils.getYFromPitch(createNoteState.note.pitch) + 1,
          width: Math.max(10, constants.BEAT_WIDTH / 4 - 2),
          height: constants.NOTE_HEIGHT - 2,
        }}
      />
    );
  }, [createNoteState, utils, constants]);

  // Synchronize scroll positions when they change externally
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollX;
      scrollContainerRef.current.scrollTop = scrollY;
    }
  }, [scrollX, scrollY]);

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-auto bg-gradient-to-br from-slate-900/90 to-gray-900/90 min-w-0 backdrop-blur-sm"
      onScroll={onScrollChange}
    >
      <div
        ref={gridRef}
        className="relative cursor-crosshair"
        style={{
          width: constants.VISIBLE_BEATS * constants.BEAT_WIDTH,
          height: constants.GRID_HEIGHT,
          minHeight: constants.GRID_HEIGHT,
        }}
        onMouseDown={onGridMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        {/* Grid SVG */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width="100%"
          height="100%"
        >
          {renderGrid()}
        </svg>

        {/* Notes */}
        <div className="absolute inset-0">{renderNotes()}</div>

        {/* Preview note while creating */}
        {renderPreviewNote()}
      </div>
    </div>
  );
};

export default PianoGrid;
