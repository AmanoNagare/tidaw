import React from "react";
import type { Note } from "./types";
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from "./constants";

interface PianoRollHeaderProps {
  zoom: number;
  notes: Note[];
  onZoomChange: (zoom: number) => void;
}

const PianoRollHeader: React.FC<PianoRollHeaderProps> = ({
  zoom,
  notes,
  onZoomChange,
}) => {
  const selectedCount = notes.filter((n) => n.selected).length;

  return (
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
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={ZOOM_STEP}
              value={zoom}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="w-24 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                  ((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100
                }%, #374151 ${
                  ((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100
                }%, #374151 100%)`,
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
            <span className="text-emerald-400 font-mono">{selectedCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PianoRollHeader;
