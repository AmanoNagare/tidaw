import React from "react";
import type { VolumeControlProps } from "./types";

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  onVolumeChange,
}) => {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    onVolumeChange(newVolume);
  };

  return (
    <div className="flex items-center space-x-3">
      <svg
        className="w-5 h-5 text-gray-300"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.01,19.86 21,16.28 21,12C21,7.72 18.01,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />
      </svg>
      <div className="relative">
        <input
          type="range"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
          min="0"
          max="100"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume}%, #374151 ${volume}%, #374151 100%)`,
          }}
        />
      </div>
      <span className="text-gray-300 text-sm w-10 font-mono">{volume}%</span>
    </div>
  );
};

export default VolumeControl;
