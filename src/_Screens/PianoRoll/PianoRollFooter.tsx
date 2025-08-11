import React from "react";

const PianoRollFooter: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-slate-800/80 to-gray-800/80 backdrop-blur-sm p-3 border-t border-white/10 flex-shrink-0">
      <div className="flex items-center justify-between text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <span className="text-blue-400">💡</span>
          Click to create notes | Drag to move | Delete key to remove selected
        </div>
        <div className="bg-black/30 px-2 py-1 rounded border border-white/10">
          Snap: <span className="text-emerald-400">16th notes</span>
        </div>
      </div>
    </div>
  );
};

export default PianoRollFooter;
