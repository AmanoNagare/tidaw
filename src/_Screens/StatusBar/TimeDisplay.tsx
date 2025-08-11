import React from "react";
import type { TimeDisplayProps } from "./types";

const TimeDisplay: React.FC<TimeDisplayProps> = ({ currentTime }) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-green-500/30 shadow-lg">
        <span className="text-green-400 font-mono text-xl font-bold tracking-wider drop-shadow-md">
          {currentTime}
        </span>
      </div>
    </div>
  );
};

export default TimeDisplay;
