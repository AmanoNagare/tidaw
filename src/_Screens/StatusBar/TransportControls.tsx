import React from "react";
import type { TransportControlsProps } from "./types";

const TransportControls: React.FC<TransportControlsProps> = ({
  isPlaying,
  isRecording,
  onPlayPause,
  onStop,
  onRecord,
  onRewind,
}) => {
  return (
    <div className="flex items-center space-x-3">
      {/* Rewind Button */}
      <button
        onClick={onRewind}
        className="w-11 h-11 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-xl flex items-center justify-center transition-all duration-200 button-modern neon-glow border border-white/10 shadow-lg"
        title="Rewind"
      >
        <svg
          className="w-5 h-5 text-white drop-shadow-sm"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M11,18V6L6,12M13,6V18L18,12" />
        </svg>
      </button>

      {/* Stop Button */}
      <button
        onClick={onStop}
        className="w-11 h-11 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-xl flex items-center justify-center transition-all duration-200 button-modern neon-glow border border-white/10 shadow-lg"
        title="Stop"
      >
        <svg
          className="w-5 h-5 text-white drop-shadow-sm"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="6" y="6" width="12" height="12" />
        </svg>
      </button>

      {/* Play/Pause Button */}
      <button
        onClick={onPlayPause}
        className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 button-modern shadow-lg border border-white/20 ${
          isPlaying
            ? "bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 shadow-orange-500/30"
            : "bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-green-500/30"
        }`}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <svg
            className="w-7 h-7 text-white drop-shadow-md"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg
            className="w-7 h-7 text-white ml-1 drop-shadow-md"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <polygon points="8,5 19,12 8,19" />
          </svg>
        )}
      </button>

      {/* Record Button */}
      <button
        onClick={onRecord}
        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 button-modern border border-white/10 shadow-lg ${
          isRecording
            ? "bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 animate-pulse shadow-red-500/50"
            : "bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 shadow-slate-500/20"
        }`}
        title="Record"
      >
        <div
          className={`w-4 h-4 rounded-full transition-all duration-200 ${
            isRecording ? "bg-white shadow-lg" : "bg-red-500"
          }`}
        ></div>
      </button>
    </div>
  );
};

export default TransportControls;
