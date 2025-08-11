import React, { useState, useCallback, useEffect, useMemo } from "react";
import type { Note, PianoRollProps, DragState, CreateNoteState } from "./types";
import { createConstants, DEFAULT_ZOOM } from "./constants";
import { createUtils } from "./utils";
import PianoKeys from "./PianoKeys";
import PianoGrid from "./PianoGrid";
import PianoRollHeader from "./PianoRollHeader";
import PianoRollFooter from "./PianoRollFooter";
import {
  getAllNotes,
  createNote,
  updateNote,
  deleteNotes,
  selectNotes,
  clearSelection,
  updateZoom as updateWasmZoom,
  updateScrollPosition,
} from "./wasmApi";

const PianoRoll: React.FC<PianoRollProps> = ({
  width,
  scrollX = 0,
  scrollY = 0,
  onScrollChange,
  onVerticalScrollChange,
  className = "",
}) => {
  // State management
  const [notes, setNotes] = useState<Note[]>([]);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [dragState, setDragState] = useState<DragState>({
    note: null,
    offset: { x: 0, y: 0 },
  });
  const [createNoteState, setCreateNoteState] = useState<CreateNoteState>({
    isCreating: false,
    note: null,
  });

  // Memoized constants and utils
  const constants = useMemo(() => createConstants(zoom), [zoom]);
  const utils = useMemo(
    () => createUtils(constants, scrollX),
    [constants, scrollX]
  );

  // Load initial data from WASM
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const wasmNotes = await getAllNotes();
        setNotes(wasmNotes);
      } catch (error) {
        console.error("Failed to load notes from WASM:", error);
      }
    };

    loadNotes();
  }, []);

  // Handle note dragging
  const handleNoteMouseDown = useCallback(
    async (e: React.MouseEvent, note: Note) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const noteX = utils.getXFromTime(note.start);

      setDragState({
        note,
        offset: {
          x: x - noteX,
          y: e.clientY - rect.top - utils.getYFromPitch(note.pitch),
        },
      });

      // Select the note via WASM
      try {
        await selectNotes([note.id]);
        setNotes((prev) =>
          prev.map((n) => ({ ...n, selected: n.id === note.id }))
        );
      } catch (error) {
        console.error("Failed to select note:", error);
      }
    },
    [utils]
  );

  // Handle grid mouse down for creating notes
  const handleGridMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (dragState.note || createNoteState.isCreating) return;

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const pitch = utils.getPitchFromY(y);
      const time = utils.getTimeFromX(x);

      // Snap to grid
      const snappedTime = utils.snapToGrid(time);

      setCreateNoteState({
        isCreating: true,
        note: { pitch, start: snappedTime },
      });
    },
    [dragState.note, createNoteState.isCreating, utils]
  );

  // Handle mouse move for dragging and creating
  const handleMouseMove = useCallback(
    async (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      if (!rect) return;

      if (dragState.note) {
        const x = e.clientX - rect.left - dragState.offset.x;
        const y = e.clientY - rect.top - dragState.offset.y;

        const newTime = Math.max(0, utils.getTimeFromX(x));
        const newPitch = utils.getPitchFromY(y);

        // Snap to grid
        const snappedTime = utils.snapToGrid(newTime);
        const snappedPitch = utils.snapPitch(newPitch);

        // Update note position locally (for immediate feedback)
        setNotes((prev) =>
          prev.map((note) =>
            note.id === dragState.note!.id
              ? { ...note, start: snappedTime, pitch: snappedPitch }
              : note
          )
        );

        // Update in WASM (this could be debounced for performance)
        try {
          await updateNote(dragState.note.id, {
            start: snappedTime,
            pitch: snappedPitch,
          });
        } catch (error) {
          console.error("Failed to update note position:", error);
        }
      }
    },
    [dragState, utils]
  );

  // Handle mouse up for finishing drag or creating note
  const handleMouseUp = useCallback(
    async (e: React.MouseEvent) => {
      if (createNoteState.isCreating && createNoteState.note) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const duration = Math.max(
          0.25,
          utils.getTimeFromX(x) - createNoteState.note.start
        );

        const noteData = {
          pitch: createNoteState.note.pitch,
          start: createNoteState.note.start,
          duration: utils.snapToGrid(duration), // Snap duration to grid
          velocity: 100,
          selected: true,
        };

        try {
          // Create note in WASM
          const noteId = await createNote(noteData);

          if (noteId) {
            const newNote: Note = {
              id: noteId,
              ...noteData,
            };

            // Clear previous selection and add new note
            await clearSelection();
            setNotes((prev) => [
              ...prev.map((n) => ({ ...n, selected: false })),
              newNote,
            ]);
          }
        } catch (error) {
          console.error("Failed to create note:", error);
        }
      }

      // Reset states
      setDragState({ note: null, offset: { x: 0, y: 0 } });
      setCreateNoteState({ isCreating: false, note: null });
    },
    [createNoteState, utils]
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const selectedNoteIds = notes
          .filter((note) => note.selected)
          .map((note) => note.id);

        if (selectedNoteIds.length > 0) {
          try {
            await deleteNotes(selectedNoteIds);
            setNotes((prev) => prev.filter((note) => !note.selected));
          } catch (error) {
            console.error("Failed to delete notes:", error);
          }
        }
      }
    },
    [notes]
  );

  // Handle scroll changes
  const handleScrollChange = useCallback(
    async (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      const newScrollX = target.scrollLeft;
      const newScrollY = target.scrollTop;

      // Update local state for immediate feedback
      onScrollChange?.(newScrollX);
      onVerticalScrollChange?.(newScrollY);

      // Update WASM state
      try {
        await updateScrollPosition(newScrollX, newScrollY);
      } catch (error) {
        console.error("Failed to update scroll position:", error);
      }
    },
    [onScrollChange, onVerticalScrollChange]
  );

  // Handle zoom changes
  const handleZoomChange = useCallback(async (newZoom: number) => {
    setZoom(newZoom);

    try {
      await updateWasmZoom(newZoom);
    } catch (error) {
      console.error("Failed to update zoom:", error);
    }
  }, []);

  // Setup keyboard event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className={`glass rounded-xl overflow-hidden flex flex-col h-full border border-white/10 shadow-2xl panel-enter ${className}`}
      style={{ width: `${width}%` }}
    >
      {/* Header */}
      <PianoRollHeader
        zoom={zoom}
        notes={notes}
        onZoomChange={handleZoomChange}
      />

      {/* Piano Roll Content */}
      <div className="flex flex-1 min-h-0">
        {/* Piano Keys */}
        <PianoKeys constants={constants} scrollY={scrollY} />

        {/* Grid Area */}
        <PianoGrid
          constants={constants}
          notes={notes}
          scrollX={scrollX}
          scrollY={scrollY}
          createNoteState={createNoteState}
          onGridMouseDown={handleGridMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onNoteMouseDown={handleNoteMouseDown}
          onScrollChange={handleScrollChange}
        />
      </div>

      {/* Footer */}
      <PianoRollFooter />
    </div>
  );
};

export default PianoRoll;
