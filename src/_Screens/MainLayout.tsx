import React, { useState, useCallback } from "react";
import StatusBar from "./StatusBar";
import PianoRoll from "./PianoRoll";
import Timeline from "./Timeline";
import Property from "./Property";

const MainLayout: React.FC = () => {
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const [rightTopHeight, setRightTopHeight] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState<Set<string>>(new Set());
  const [cursorStyle, setCursorStyle] = useState<string>("");

  // Shared scroll state for synchronization
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const checkDualDragZone = useCallback(
    (direction: "vertical" | "horizontal", e: React.MouseEvent) => {
      const threshold = 20; // pixels

      if (direction === "vertical") {
        const rightSection = document.querySelector(".right-section");
        if (rightSection) {
          const rightRect = rightSection.getBoundingClientRect();
          const horizontalGapY =
            rightRect.top + (rightRect.height * rightTopHeight) / 100;
          return Math.abs(e.clientY - horizontalGapY) <= threshold;
        }
      } else {
        const bottomSection = document.querySelector(".bottom-section");
        if (bottomSection) {
          const bottomRect = bottomSection.getBoundingClientRect();
          const verticalGapX =
            bottomRect.left + (bottomRect.width * leftWidth) / 100;
          return Math.abs(e.clientX - verticalGapX) <= threshold;
        }
      }
      return false;
    },
    [leftWidth, rightTopHeight]
  );

  const handleGapMouseMove = useCallback(
    (direction: "vertical" | "horizontal") => (e: React.MouseEvent) => {
      if (isDragging.size > 0) return; // Don't change cursor while dragging

      if (checkDualDragZone(direction, e)) {
        setCursorStyle("cursor-move");
      } else {
        setCursorStyle(
          direction === "vertical" ? "cursor-col-resize" : "cursor-row-resize"
        );
      }
    },
    [checkDualDragZone, isDragging]
  );

  const handleGapMouseLeave = useCallback(() => {
    setCursorStyle("");
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging.size === 0) return;

      if (isDragging.has("vertical")) {
        const bottomRect = e.currentTarget
          .querySelector(".bottom-section")
          ?.getBoundingClientRect();
        if (bottomRect) {
          const newLeftWidth =
            ((e.clientX - bottomRect.left) / bottomRect.width) * 100;
          setLeftWidth(Math.max(20, Math.min(80, newLeftWidth)));
        }
      }

      if (isDragging.has("right-vertical")) {
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
    setIsDragging(new Set());
    setCursorStyle("");
  }, []);

  const handleGapMouseDown = useCallback(
    (direction: "vertical" | "horizontal", e: React.MouseEvent) => {
      e.preventDefault();

      // Check if we're near the intersection for dual-drag
      const threshold = 20; // pixels

      if (direction === "vertical") {
        // Check if we're also near the horizontal gap
        const rightSection = document.querySelector(".right-section");
        if (rightSection) {
          const rightRect = rightSection.getBoundingClientRect();
          const horizontalGapY =
            rightRect.top + (rightRect.height * rightTopHeight) / 100;

          if (Math.abs(e.clientY - horizontalGapY) <= threshold) {
            setIsDragging(new Set(["vertical", "right-vertical"]));
            return;
          }
        }
        setIsDragging(new Set(["vertical"]));
      } else {
        // Check if we're also near the vertical gap
        const bottomSection = document.querySelector(".bottom-section");
        if (bottomSection) {
          const bottomRect = bottomSection.getBoundingClientRect();
          const verticalGapX =
            bottomRect.left + (bottomRect.width * leftWidth) / 100;

          if (Math.abs(e.clientX - verticalGapX) <= threshold) {
            setIsDragging(new Set(["vertical", "right-vertical"]));
            return;
          }
        }
        setIsDragging(new Set(["right-vertical"]));
      }
    },
    [leftWidth, rightTopHeight]
  );

  return (
    <div
      className={`h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 select-none flex flex-col ${cursorStyle}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Main Grid Container */}
      <div className="flex-1 flex flex-col gap-2 p-3 min-h-0">
        {/* Top Section - Fixed Height Status Bar */}
        <StatusBar />

        {/* Bottom Section - Split Layout */}
        <div className="flex gap-2 bottom-section flex-1 min-h-0 relative">
          {/* Left Section */}
          <PianoRoll
            width={leftWidth}
            scrollX={scrollX}
            scrollY={scrollY}
            onScrollChange={setScrollX}
            onVerticalScrollChange={setScrollY}
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

            <Property height={100 - rightTopHeight} />
          </div>

          {/* Invisible Drag Areas - Absolutely positioned over gaps */}
          <div
            className="absolute top-0 bottom-0 w-2"
            style={{ left: `${leftWidth}%`, transform: "translateX(-50%)" }}
            onMouseDown={(e) => handleGapMouseDown("vertical", e)}
            onMouseMove={handleGapMouseMove("vertical")}
            onMouseLeave={handleGapMouseLeave}
          />
          <div
            className="absolute left-0 right-0 h-2"
            style={{
              top: `${rightTopHeight}%`,
              transform: "translateY(-50%)",
              marginLeft: `${leftWidth + 1}%`, // Offset to only cover right section
            }}
            onMouseDown={(e) => handleGapMouseDown("horizontal", e)}
            onMouseMove={handleGapMouseMove("horizontal")}
            onMouseLeave={handleGapMouseLeave}
          />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
