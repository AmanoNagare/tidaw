import React, { useCallback } from "react";
import type { PianoRollConstants } from "./types";
import { createUtils } from "./utils";
import { playNotePreview } from "./wasmApi";

interface PianoKeysProps {
  constants: PianoRollConstants;
  scrollY: number;
  containerHeight?: number;
}

const PianoKeys: React.FC<PianoKeysProps> = ({
  constants,
  scrollY,
  containerHeight = 400,
}) => {
  const utils = createUtils(constants, 0); // scrollX doesn't matter for piano keys

  const handleKeyClick = useCallback(async (pitch: number) => {
    await playNotePreview(pitch);
  }, []);

  const renderPianoKeys = useCallback(() => {
    const keys = [];

    // Calculate visible range based on scroll position
    const visibleStart = Math.floor(scrollY / constants.NOTE_HEIGHT);
    const visibleEnd = Math.min(
      127,
      visibleStart + Math.ceil(containerHeight / constants.NOTE_HEIGHT) + 1
    );

    for (
      let i = Math.max(0, 127 - visibleEnd);
      i <= Math.min(127, 127 - visibleStart);
      i++
    ) {
      const noteInfo = utils.getNoteInfo(i);
      const y = utils.getYFromPitch(i) - scrollY;

      // Only render keys that are actually visible
      if (y >= -constants.NOTE_HEIGHT && y <= containerHeight) {
        keys.push(
          <div
            key={i}
            className={`absolute border-b border-gray-600 text-xs flex items-center justify-end pr-2 cursor-pointer hover:bg-opacity-80 transition-colors ${
              noteInfo.isBlack
                ? "bg-gray-800 text-gray-300"
                : "bg-gray-100 text-gray-800"
            }`}
            style={{
              top: y,
              height: constants.NOTE_HEIGHT,
              width: constants.PIANO_WIDTH,
              borderRightWidth: i === 60 ? "2px" : "1px", // Highlight middle C
              borderRightColor: i === 60 ? "#ef4444" : "#4b5563",
            }}
            onClick={() => handleKeyClick(i)}
          >
            {noteInfo.name === "C" && `${noteInfo.name}${noteInfo.octave}`}
          </div>
        );
      }
    }
    return keys;
  }, [scrollY, constants, containerHeight, utils, handleKeyClick]);

  return (
    <div
      className="bg-gray-200 border-r border-gray-600 overflow-hidden flex-shrink-0 relative"
      style={{
        width: constants.PIANO_WIDTH,
        minWidth: constants.PIANO_WIDTH,
      }}
    >
      {renderPianoKeys()}
    </div>
  );
};

export default PianoKeys;
