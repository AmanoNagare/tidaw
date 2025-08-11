import React from "react";
import type { TempoControlProps } from "./types";

const TempoControl: React.FC<TempoControlProps> = ({
  tempo,
  onTempoChange,
}) => {
  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTempo = Number(e.target.value);
    onTempoChange(newTempo);
  };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-gray-300 text-sm font-medium">BPM:</span>
      <input
        type="number"
        value={tempo}
        onChange={handleTempoChange}
        className="w-18 h-9 bg-gradient-to-br from-slate-700 to-slate-800 text-white text-center rounded-lg border border-white/10 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 font-mono shadow-lg"
        min="60"
        max="200"
      />
    </div>
  );
};

export default TempoControl;
