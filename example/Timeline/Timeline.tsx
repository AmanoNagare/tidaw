import { useState, useRef } from "react";

interface TimelineProps {
  height: number;
  scrollX: number;
  scrollY: number;
}

interface Track {
  id: string;
  name: string;
  color: string;
  muted: boolean;
  solo: boolean;
  volume: number;
  clips: Clip[];
}

interface Clip {
  id: string;
  name: string;
  startTime: number;
  duration: number;
  color: string;
}

const Timeline = ({ height, scrollX, scrollY }: TimelineProps) => {
  const [currentTime] = useState(0); // This could be passed as prop from StatusBar in the future
  const [zoom, setZoom] = useState(1);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Sample tracks data
  const [tracks] = useState<Track[]>([
    {
      id: "1",
      name: "Drums",
      color: "bg-red-500",
      muted: false,
      solo: false,
      volume: 80,
      clips: [
        {
          id: "1",
          name: "Kick Pattern",
          startTime: 0,
          duration: 4,
          color: "bg-red-400",
        },
        {
          id: "2",
          name: "Snare Fill",
          startTime: 8,
          duration: 2,
          color: "bg-red-300",
        },
      ],
    },
    {
      id: "2",
      name: "Bass",
      color: "bg-blue-500",
      muted: false,
      solo: false,
      volume: 75,
      clips: [
        {
          id: "3",
          name: "Bass Line",
          startTime: 2,
          duration: 6,
          color: "bg-blue-400",
        },
      ],
    },
    {
      id: "3",
      name: "Synth Lead",
      color: "bg-green-500",
      muted: false,
      solo: false,
      volume: 65,
      clips: [
        {
          id: "4",
          name: "Melody",
          startTime: 4,
          duration: 8,
          color: "bg-green-400",
        },
        {
          id: "5",
          name: "Harmony",
          startTime: 12,
          duration: 4,
          color: "bg-green-300",
        },
      ],
    },
    {
      id: "4",
      name: "Vocals",
      color: "bg-purple-500",
      muted: false,
      solo: false,
      volume: 90,
      clips: [],
    },
  ]);

  // Time ruler calculations
  const pixelsPerSecond = 50 * zoom;
  const totalDuration = 32; // seconds
  const timelineWidth = totalDuration * pixelsPerSecond;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30); // 30fps
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="glass rounded-xl flex flex-col overflow-hidden border border-white/10 shadow-2xl panel-enter"
      style={{ height: `${height}%` }}
    >
      {/* Timeline Header */}
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
            <span className="text-gray-300 text-sm font-medium">
              Snap to Grid
            </span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-gray-300 text-sm font-medium">Zoom:</span>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-24 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                ((zoom - 0.1) / 2.9) * 100
              }%, #374151 ${((zoom - 0.1) / 2.9) * 100}%, #374151 100%)`,
            }}
          />
          <span className="text-gray-300 text-sm font-mono w-12">
            {(zoom * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers */}
        <div className="w-52 bg-gradient-to-br from-slate-900/90 to-gray-900/90 backdrop-blur-sm border-r border-white/10 flex flex-col">
          {/* Time Ruler Header */}
          <div className="h-12 bg-gradient-to-r from-slate-800/80 to-gray-800/80 border-b border-white/10 flex items-center px-4">
            <span className="text-white text-sm font-bold">🎵 Tracks</span>
          </div>

          {/* Track Controls */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ transform: `translateY(-${scrollY}px)` }}
          >
            {tracks.map((track) => (
              <div
                key={track.id}
                className="h-16 border-b border-white/10 flex items-center px-4 bg-gradient-to-r from-slate-800/50 to-gray-800/50 hover:from-slate-700/60 hover:to-gray-700/60 transition-all duration-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-4 h-4 rounded-full ${track.color} shadow-lg border border-white/20`}
                    ></div>
                    <span className="text-white text-sm font-semibold truncate drop-shadow-sm">
                      {track.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className={`px-2 py-1 text-xs rounded-md transition-all duration-200 font-medium ${
                        track.muted
                          ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30"
                          : "bg-gradient-to-r from-slate-700 to-slate-800 text-gray-300 hover:from-slate-600 hover:to-slate-700 border border-white/10"
                      }`}
                      title="Mute"
                    >
                      M
                    </button>
                    <button
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        track.solo
                          ? "bg-yellow-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                      title="Solo"
                    >
                      S
                    </button>
                    <div
                      className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden"
                      title={`Volume: ${track.volume}%`}
                    >
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${track.volume}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Track Button */}
            <div className="h-12 border-b border-white/10 flex items-center px-4 bg-gradient-to-r from-slate-700/60 to-gray-700/60 hover:from-slate-600/70 hover:to-gray-600/70 transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3 text-gray-400 hover:text-gray-200 transition-colors">
                <div className="w-6 h-6 rounded-lg border-2 border-dashed border-gray-500 hover:border-blue-400 flex items-center justify-center transition-colors">
                  <span className="text-sm font-bold">+</span>
                </div>
                <span className="text-sm font-medium">Add Track</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Grid */}
        <div
          className="flex-1 overflow-hidden bg-gradient-to-br from-slate-900/80 to-gray-900/80 backdrop-blur-sm"
          ref={timelineRef}
        >
          <div
            className="relative overflow-auto h-full"
            style={{ transform: `translateX(-${scrollX}px)` }}
          >
            <div style={{ width: timelineWidth }}>
              {/* Time Ruler */}
              <div className="h-12 bg-gradient-to-r from-slate-800/90 to-gray-800/90 border-b border-white/10 relative backdrop-blur-sm">
                {Array.from(
                  { length: Math.ceil(totalDuration) + 1 },
                  (_, i) => (
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
                  )
                )}
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
                        onClick={() => setSelectedClipId(clip.id)}
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
                          background: `linear-gradient(135deg, ${clip.color.replace(
                            "bg-",
                            "rgb("
                          )} 0%, ${clip.color.replace("bg-", "rgb(")} 100%)`,
                        }}
                      >
                        <span className="text-white text-xs font-bold truncate drop-shadow-sm">
                          {clip.name}
                        </span>
                        {/* Resize handles */}
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/30 cursor-w-resize hover:bg-black/50 transition-colors rounded-l-lg"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-black/30 cursor-e-resize hover:bg-black/50 transition-colors rounded-r-lg"></div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
