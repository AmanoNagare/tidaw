import React from "react";
import type { Track } from "./types";
import { formatTime } from "./utils";
import { selectClip } from "./wasmApi";

interface TimelineGridProps {
  tracks: Track[];
  selectedClipId: string | null;
  setSelectedClipId: (id: string | null) => void;
  currentTime: number;
  pixelsPerSecond: number;
  totalDuration: number;
  scrollX: number;
  scrollY: number;
  onClipUpdate?: () => void; // Callback to refresh clips after updates
}

const TimelineGrid: React.FC<TimelineGridProps> = ({
  tracks,
  selectedClipId,
  setSelectedClipId,
  currentTime,
  pixelsPerSecond,
  totalDuration,
  scrollX,
  scrollY,
  onClipUpdate,
}) => {
  const timelineWidth = totalDuration * pixelsPerSecond;

  const handleClipClick = async (clipId: string) => {
    try {
      setSelectedClipId(clipId);
      await selectClip(clipId);
      onClipUpdate?.();
    } catch (error) {
      console.error("Failed to select clip:", error);
    }
  };

  return (
    <div className="flex-1 overflow-hidden bg-gradient-to-br from-slate-900/80 to-gray-900/80 backdrop-blur-sm">
      <div
        className="relative overflow-auto h-full"
        style={{ transform: `translateX(-${scrollX}px)` }}
      >
        <div style={{ width: timelineWidth }}>
          {/* Time Ruler */}
          <div className="h-12 bg-gradient-to-r from-slate-800/90 to-gray-800/90 border-b border-white/10 relative backdrop-blur-sm">
            {Array.from({ length: Math.ceil(totalDuration) + 1 }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l border-gray-500/30"
                style={{ left: i * pixelsPerSecond }}
              >
                <span className="absolute top-2 left-2 text-gray-300 text-xs font-mono bg-black/20 px-1 rounded">
                  {formatTime(i)}
                </span>
                {/* Beat markers */}
                {Array.from({ length: 4 }, (_, beat) => (
                  <div
                    key={beat}
                    className="absolute top-8 w-px h-4 bg-gray-400/50"
                    style={{ left: (beat + 1) * (pixelsPerSecond / 4) }}
                  ></div>
                ))}
              </div>
            ))}
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-400 to-red-600 z-10 pointer-events-none shadow-lg shadow-red-500/50"
            style={{ left: currentTime * pixelsPerSecond }}
          >
            <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded-sm -translate-x-1/2 mb-1 shadow-lg border border-red-300/50"></div>
          </div>

          {/* Track Lanes */}
          <div
            className="relative"
            style={{ transform: `translateY(-${scrollY}px)` }}
          >
            {tracks.map((track) => (
              <div
                key={track.id}
                className="h-16 border-b border-white/10 relative bg-gradient-to-r from-slate-800/30 to-gray-800/30 hover:from-slate-700/40 hover:to-gray-700/40 transition-all duration-200"
              >
                {/* Grid lines */}
                {Array.from(
                  { length: Math.ceil(totalDuration) + 1 },
                  (_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-l border-gray-500/20"
                      style={{ left: i * pixelsPerSecond }}
                    ></div>
                  )
                )}

                {/* Audio Clips */}
                {track.clips.map((clip) => (
                  <div
                    key={clip.id}
                    onClick={() => handleClipClick(clip.id)}
                    className={`absolute top-2 bottom-2 ${
                      clip.color
                    } rounded-lg cursor-pointer hover:scale-105 transition-all duration-200 flex items-center px-3 shadow-lg border border-white/20 ${
                      selectedClipId === clip.id
                        ? "ring-2 ring-blue-400 ring-opacity-75 shadow-blue-400/30"
                        : "shadow-black/30"
                    }`}
                    style={{
                      left: clip.startTime * pixelsPerSecond,
                      width: clip.duration * pixelsPerSecond,
                    }}
                  >
                    <span className="text-white text-xs font-bold truncate drop-shadow-sm">
                      {clip.name}
                    </span>
                    {/* Resize handles */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-2 bg-black/30 cursor-w-resize hover:bg-black/50 transition-colors rounded-l-lg"
                      onClick={(e) => e.stopPropagation()}
                      title="Resize clip start"
                    ></div>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-2 bg-black/30 cursor-e-resize hover:bg-black/50 transition-colors rounded-r-lg"
                      onClick={(e) => e.stopPropagation()}
                      title="Resize clip end"
                    ></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineGrid;
