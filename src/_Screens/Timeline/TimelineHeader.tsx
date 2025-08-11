import React from "react";
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from "./constants";

interface TimelineHeaderProps {
  snapToGrid: boolean;
  setSnapToGrid: (value: boolean) => void;
  zoom: number;
  setZoom: (value: number) => void;
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  snapToGrid,
  setSnapToGrid,
  zoom,
  setZoom,
}) => (
  <div className="bg-gradient-to-r from-slate-800/80 to-gray-800/80 backdrop-blur-sm p-4 flex items-center justify-between border-b border-white/10">
    <div className="flex items-center gap-6">
      <span className="text-white text-lg font-bold drop-shadow-sm">
        🎬 Timeline
      </span>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={snapToGrid}
          onChange={(e) => setSnapToGrid(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-slate-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
        />
        <span className="text-gray-300 text-sm font-medium">Snap to Grid</span>
      </label>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-gray-300 text-sm font-medium">Zoom:</span>
      <input
        type="range"
        min={MIN_ZOOM}
        max={MAX_ZOOM}
        step={ZOOM_STEP}
        value={zoom}
        onChange={(e) => setZoom(Number(e.target.value))}
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
        {(zoom * 100).toFixed(0)}%
      </span>
    </div>
  </div>
);

export default TimelineHeader;
