import { useState, useCallback } from "react";
import StatusBar from "./StatusBar";
import PianoRoll from "./PianoRoll";
import Timeline from "./Timeline";
import Property from "./Property";

function App() {
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const [rightTopHeight, setRightTopHeight] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState<string | null>(null);

  // Shared scroll state for synchronization
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const handleMouseDown = useCallback((handle: string) => {
    setIsDragging(handle);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      if (isDragging === "vertical") {
        const bottomRect = e.currentTarget
          .querySelector(".bottom-section")
          ?.getBoundingClientRect();
        if (bottomRect) {
          const newLeftWidth =
            ((e.clientX - bottomRect.left) / bottomRect.width) * 100;
          setLeftWidth(Math.max(20, Math.min(80, newLeftWidth)));
        }
      } else if (isDragging === "right-vertical") {
        const rightRect = e.currentTarget
          .querySelector(".right-section")
          ?.getBoundingClientRect();
        if (rightRect) {
          const newRightTopHeight =
            ((e.clientY - rightRect.top) / rightRect.height) * 100;
          setRightTopHeight(Math.max(20, Math.min(80, newRightTopHeight)));
        }
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  return (
    <div
      className="h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 select-none flex flex-col"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Main Grid Container */}
      <div className="flex-1 flex flex-col gap-2 p-3 min-h-0">
        {/* Top Section - Fixed Height Status Bar */}
        <div className="h-20 flex-shrink-0">
          <StatusBar />
        </div>

        {/* Bottom Section - Split Layout */}
        <div className="flex gap-2 bottom-section flex-1 min-h-0">
          {/* Left Section */}
          <PianoRoll
            width={leftWidth}
            scrollX={scrollX}
            scrollY={scrollY}
            onScrollChange={setScrollX}
            onVerticalScrollChange={setScrollY}
          />

          {/* Vertical Resize Handle */}
          <div
            className="w-1.5 bg-gradient-to-b from-blue-500/20 to-purple-500/20 hover:from-blue-400/40 hover:to-purple-400/40 cursor-col-resize rounded-full transition-all duration-200 shadow-lg border border-gray-600/50"
            onMouseDown={() => handleMouseDown("vertical")}
          />

          {/* Right Side - Two Sections Stacked */}
          <div
            className="flex flex-col gap-2 right-section flex-1 min-h-0"
            style={{ width: `${100 - leftWidth}%` }}
          >
            <Timeline
              height={rightTopHeight}
              scrollX={scrollX}
              scrollY={scrollY}
            />

            {/* Right Vertical Resize Handle */}
            <div
              className="h-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-400/40 hover:to-purple-400/40 cursor-row-resize rounded-full transition-all duration-200 shadow-lg border border-gray-600/50"
              onMouseDown={() => handleMouseDown("right-vertical")}
            />

            <Property height={100 - rightTopHeight} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
