import React from "react";
import type { Track } from "./types";
import { setTrackMute, setTrackSolo, addTrack } from "./wasmApi";

interface TrackHeadersProps {
  tracks: Track[];
  scrollY: number;
  onTrackUpdate?: () => void; // Callback to refresh tracks after updates
}

const TrackHeaders: React.FC<TrackHeadersProps> = ({
  tracks,
  scrollY,
  onTrackUpdate,
}) => {
  const handleMuteToggle = async (trackId: string, currentMuted: boolean) => {
    try {
      await setTrackMute(trackId, !currentMuted);
      onTrackUpdate?.();
    } catch (error) {
      console.error("Failed to toggle mute:", error);
    }
  };

  const handleSoloToggle = async (trackId: string, currentSolo: boolean) => {
    try {
      await setTrackSolo(trackId, !currentSolo);
      onTrackUpdate?.();
    } catch (error) {
      console.error("Failed to toggle solo:", error);
    }
  };

  const handleAddTrack = async () => {
    try {
      await addTrack();
      onTrackUpdate?.();
    } catch (error) {
      console.error("Failed to add track:", error);
    }
  };

  return (
    <div className="w-52 bg-gradient-to-br from-slate-900/90 to-gray-900/90 backdrop-blur-sm border-r border-white/10 flex flex-col">
      <div className="h-12 bg-gradient-to-r from-slate-800/80 to-gray-800/80 border-b border-white/10 flex items-center px-4">
        <span className="text-white text-sm font-bold">🎵 Tracks</span>
      </div>
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
                  onClick={() => handleMuteToggle(track.id, track.muted)}
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
                  onClick={() => handleSoloToggle(track.id, track.solo)}
                  className={`px-2 py-1 text-xs rounded-md transition-all duration-200 font-medium ${
                    track.solo
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30"
                      : "bg-gradient-to-r from-slate-700 to-slate-800 text-gray-300 hover:from-slate-600 hover:to-slate-700 border border-white/10"
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
        <button
          onClick={handleAddTrack}
          className="h-12 border-b border-white/10 flex items-center px-4 bg-gradient-to-r from-slate-700/60 to-gray-700/60 hover:from-slate-600/70 hover:to-gray-600/70 transition-all duration-200 cursor-pointer w-full"
        >
          <div className="flex items-center gap-3 text-gray-400 hover:text-gray-200 transition-colors">
            <div className="w-6 h-6 rounded-lg border-2 border-dashed border-gray-500 hover:border-blue-400 flex items-center justify-center transition-colors">
              <span className="text-sm font-bold">+</span>
            </div>
            <span className="text-sm font-medium">Add Track</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default TrackHeaders;
