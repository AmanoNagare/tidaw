import React from "react";
import type { SourceType } from "./types";

interface PropertySelectorProps {
  selectedSource: SourceType;
  onSourceChange: (source: SourceType) => void;
}

const PropertySelector: React.FC<PropertySelectorProps> = ({
  selectedSource,
  onSourceChange,
}) => {
  const sourceTypes: { type: SourceType; label: string; icon: string }[] = [
    { type: "track", label: "Track", icon: "🎵" },
    { type: "clip", label: "Clip", icon: "🎬" },
    { type: "effect", label: "Effect", icon: "⚡" },
    { type: "master", label: "Master", icon: "🎛️" },
  ];

  return (
    <div className="bg-gradient-to-r from-slate-800/80 to-gray-800/80 backdrop-blur-sm p-4 border-b border-white/10">
      <div className="flex gap-2">
        {sourceTypes.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => onSourceChange(type)}
            className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 capitalize font-medium button-modern ${
              selectedSource === type
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/50"
                : "bg-gradient-to-r from-slate-700 to-slate-800 text-gray-300 hover:from-slate-600 hover:to-slate-700 border border-white/10"
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PropertySelector;
