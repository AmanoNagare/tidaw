import React from "react";
import type { UtilityControlsProps } from "./types";

const UtilityControls: React.FC<UtilityControlsProps> = ({
  isLooping,
  isMetronomeEnabled,
  onToggleLoop,
  onToggleMetronome,
}) => {
  return (
    <div className="flex items-center space-x-3">
      {/* Loop Button */}
      <button
        onClick={onToggleLoop}
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 button-modern border border-white/10 shadow-lg ${
          isLooping
            ? "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500"
            : "bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700"
        }`}
        title="Loop"
      >
        <svg
          className="w-4 h-4 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M17,17H7V14L3,18L7,22V19H19V13H17M7,7H17V10L21,6L17,2V5H5V11H7V7Z" />
        </svg>
      </button>

      {/* Metronome Button */}
      <button
        onClick={onToggleMetronome}
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 button-modern border border-white/10 shadow-lg ${
          isMetronomeEnabled
            ? "bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500"
            : "bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700"
        }`}
        title="Metronome"
      >
        <svg
          className="w-4 h-4 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6L16.5,10.5L15.08,11.92L12,8.84L8.92,11.92L7.5,10.5L12,6Z" />
        </svg>
      </button>
    </div>
  );
};

export default UtilityControls;
