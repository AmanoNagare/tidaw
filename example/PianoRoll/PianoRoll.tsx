import { useState, useRef, useCallback, useEffect, useMemo } from "react";

interface Note {
  id: string;
  pitch: number; // MIDI note number (0-127)
  start: number; // Start time in beats
  duration: number; // Duration in beats
  velocity: number; // 0-127
  selected: boolean;
}

interface PianoRollProps {
  width: number;
  scrollX: number;
  scrollY: number;
  onScrollChange: (scrollX: number) => void;
  onVerticalScrollChange: (scrollY: number) => void;
}

const PianoRoll = ({
  width,
  scrollX,
  scrollY,
  onScrollChange,
  onVerticalScrollChange,
}: PianoRollProps) => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      pitch: 60,
      start: 1,
      duration: 1,
      velocity: 100,
      selected: false,
    }, // C4
    {
      id: "2",
      pitch: 64,
      start: 2,
      duration: 0.5,
      velocity: 80,
      selected: false,
    }, // E4
    {
      id: "3",
      pitch: 67,
      start: 3,
      duration: 2,
      velocity: 90,
      selected: false,
    }, // G4
  ]);

  const [zoom, setZoom] = useState(1);
  const [draggedNote, setDraggedNote] = useState<Note | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNote, setNewNote] = useState<{
    pitch: number;
    start: number;
  } | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const pianoRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Piano roll constants
  const constants = useMemo(
    () => ({
      NOTE_HEIGHT: 20,
      PIANO_WIDTH: 80,
      BEAT_WIDTH: 60 * zoom,
      GRID_HEIGHT: 128 * 20, // 128 MIDI notes
      VISIBLE_BEATS: 32,
      NOTE_NAMES: [
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B",
      ],
    }),
    [zoom]
  );

  // Utility functions
  const utils = useMemo(
    () => ({
      getNoteInfo: (midiNote: number) => {
        const octave = Math.floor(midiNote / 12) - 1;
        const noteName = constants.NOTE_NAMES[midiNote % 12];
        return {
          name: noteName || "C",
          octave,
          isBlack: noteName?.includes("#") || false,
        };
      },
      getYFromPitch: (pitch: number) => {
        return (127 - pitch) * constants.NOTE_HEIGHT;
      },
      getPitchFromY: (y: number) => {
        return Math.max(
          0,
          Math.min(127, 127 - Math.floor(y / constants.NOTE_HEIGHT))
        );
      },
      getTimeFromX: (x: number) => {
        return Math.max(0, (x + scrollX) / constants.BEAT_WIDTH);
      },
      getXFromTime: (time: number) => {
        return time * constants.BEAT_WIDTH - scrollX;
      },
    }),
    [constants, scrollX]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, note: Note) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = gridRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const noteX = utils.getXFromTime(note.start);

      setDraggedNote(note);
      setDragOffset({
        x: x - noteX,
        y: e.clientY - rect.top - utils.getYFromPitch(note.pitch),
      });

      // Select the note
      setNotes((prev) =>
        prev.map((n) => ({ ...n, selected: n.id === note.id }))
      );
    },
    [utils]
  );

  const handleGridMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (draggedNote || isCreatingNote) return;

      const rect = gridRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const pitch = utils.getPitchFromY(y);
      const time = utils.getTimeFromX(x);

      // Snap to grid
      const snappedTime = Math.round(time * 4) / 4; // Snap to 16th notes

      setNewNote({ pitch, start: snappedTime });
      setIsCreatingNote(true);
    },
    [draggedNote, isCreatingNote, utils]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = gridRef.current?.getBoundingClientRect();
      if (!rect) return;

      if (draggedNote) {
        const x = e.clientX - rect.left - dragOffset.x;
        const y = e.clientY - rect.top - dragOffset.y;

        const newTime = Math.max(0, utils.getTimeFromX(x));
        const newPitch = utils.getPitchFromY(y);

        // Snap to grid
        const snappedTime = Math.round(newTime * 4) / 4;
        const snappedPitch = Math.round(newPitch);

        setNotes((prev) =>
          prev.map((note) =>
            note.id === draggedNote.id
              ? { ...note, start: snappedTime, pitch: snappedPitch }
              : note
          )
        );
      }
    },
    [draggedNote, dragOffset, utils]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isCreatingNote && newNote) {
        const rect = gridRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const duration = Math.max(0.25, utils.getTimeFromX(x) - newNote.start);

        const note: Note = {
          id: Date.now().toString(),
          pitch: newNote.pitch,
          start: newNote.start,
          duration: Math.round(duration * 4) / 4, // Snap duration to 16th notes
          velocity: 100,
          selected: true,
        };

        setNotes((prev) => [
          ...prev.map((n) => ({ ...n, selected: false })),
          note,
        ]);
      }

      setDraggedNote(null);
      setIsCreatingNote(false);
      setNewNote(null);
    },
    [isCreatingNote, newNote, utils]
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      setNotes((prev) => prev.filter((note) => !note.selected));
    }
  }, []);

  const handleScrollChange = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      onScrollChange(target.scrollLeft);
      onVerticalScrollChange(target.scrollTop);
    },
    [onScrollChange, onVerticalScrollChange]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Synchronize scroll positions when they change externally
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollX;
      scrollContainerRef.current.scrollTop = scrollY;
    }
    // Piano keys will re-render automatically based on scrollY via renderPianoKeys
  }, [scrollX, scrollY]);

  const renderPianoKeys = useCallback(() => {
    const keys = [];

    // Calculate visible range based on scroll position
    const containerHeight = pianoRef.current?.clientHeight || 400;
    const visibleStart = Math.floor(scrollY / constants.NOTE_HEIGHT);
    const visibleEnd = Math.min(
      127,
      visibleStart + Math.ceil(containerHeight / constants.NOTE_HEIGHT) + 1
    );

    for (
      let i = Math.max(0, 127 - visibleEnd);
      i <= Math.min(127, 127 - visibleStart);
      i++
    ) {
      const noteInfo = utils.getNoteInfo(i);
      const y = utils.getYFromPitch(i) - scrollY;

      // Only render keys that are actually visible
      if (y >= -constants.NOTE_HEIGHT && y <= containerHeight) {
        keys.push(
          <div
            key={i}
            className={`absolute border-b border-gray-600 text-xs flex items-center justify-end pr-2 cursor-pointer hover:bg-opacity-80 transition-colors ${
              noteInfo.isBlack
                ? "bg-gray-800 text-gray-300"
                : "bg-gray-100 text-gray-800"
            }`}
            style={{
              top: y,
              height: constants.NOTE_HEIGHT,
              width: constants.PIANO_WIDTH,
              borderRightWidth: i === 60 ? "2px" : "1px", // Highlight middle C
              borderRightColor: i === 60 ? "#ef4444" : "#4b5563",
            }}
            onClick={() => {
              // Play note preview (placeholder)
              console.log(
                `Playing note: ${noteInfo.name}${noteInfo.octave} (MIDI ${i})`
              );
            }}
          >
            {noteInfo.name === "C" && `${noteInfo.name}${noteInfo.octave}`}
          </div>
        );
      }
    }
    return keys;
  }, [scrollY, constants, utils]);

  const renderGrid = () => {
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
  };

  const renderNotes = () => {
    return notes.map((note) => {
      const x = utils.getXFromTime(note.start);
      const y = utils.getYFromPitch(note.pitch);
      const noteWidth = note.duration * constants.BEAT_WIDTH;
      const opacity = note.velocity / 127;

      return (
        <div
          key={note.id}
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
          onMouseDown={(e) => handleMouseDown(e, note)}
        >
          <div className="w-full h-full flex items-center justify-center text-xs text-white font-bold drop-shadow-sm">
            {utils.getNoteInfo(note.pitch).name}
          </div>
        </div>
      );
    });
  };

  return (
    <div
      className="glass rounded-xl overflow-hidden flex flex-col h-full border border-white/10 shadow-2xl panel-enter"
      style={{ width: `${width}%` }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/80 to-gray-800/80 backdrop-blur-sm p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-lg font-bold drop-shadow-sm">
            🎹 Piano Roll
          </h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-gray-300 text-sm font-medium">Zoom:</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-24 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                    ((zoom - 0.5) / 2.5) * 100
                  }%, #374151 ${((zoom - 0.5) / 2.5) * 100}%, #374151 100%)`,
                }}
              />
              <span className="text-gray-300 text-sm font-mono w-12">
                {zoom.toFixed(1)}x
              </span>
            </div>
            <div className="text-gray-300 text-sm bg-black/30 px-3 py-1 rounded-lg border border-white/10">
              Notes:{" "}
              <span className="text-blue-400 font-mono">{notes.length}</span> |
              Selected:{" "}
              <span className="text-emerald-400 font-mono">
                {notes.filter((n) => n.selected).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Piano Roll Content */}
      <div className="flex flex-1 min-h-0">
        {/* Piano Keys */}
        <div
          ref={pianoRef}
          className="bg-gray-200 border-r border-gray-600 overflow-hidden flex-shrink-0 relative"
          style={{
            width: constants.PIANO_WIDTH,
            minWidth: constants.PIANO_WIDTH,
          }}
        >
          {renderPianoKeys()}
        </div>

        {/* Grid Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto bg-gradient-to-br from-slate-900/90 to-gray-900/90 min-w-0 backdrop-blur-sm"
          onScroll={handleScrollChange}
        >
          <div
            ref={gridRef}
            className="relative cursor-crosshair"
            style={{
              width: constants.VISIBLE_BEATS * constants.BEAT_WIDTH,
              height: constants.GRID_HEIGHT,
              minHeight: constants.GRID_HEIGHT,
            }}
            onMouseDown={handleGridMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
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
            {isCreatingNote && newNote && (
              <div
                className="absolute bg-gradient-to-r from-blue-400 to-blue-500 border-2 border-blue-400 rounded-lg opacity-60 shadow-lg shadow-blue-500/30"
                style={{
                  left: utils.getXFromTime(newNote.start),
                  top: utils.getYFromPitch(newNote.pitch) + 1,
                  width: Math.max(10, constants.BEAT_WIDTH / 4 - 2),
                  height: constants.NOTE_HEIGHT - 2,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-slate-800/80 to-gray-800/80 backdrop-blur-sm p-3 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <span className="text-blue-400">💡</span>
            Click to create notes | Drag to move | Delete key to remove selected
          </div>
          <div className="bg-black/30 px-2 py-1 rounded border border-white/10">
            Snap: <span className="text-emerald-400">16th notes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PianoRoll;
