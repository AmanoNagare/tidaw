import React from "react";
import type { Clip } from "./types";
import { updateClipProperty } from "./wasmApi";

interface ClipPropertiesProps {
  clip: Clip;
  onClipChange: (clip: Clip) => void;
}

const ClipProperties: React.FC<ClipPropertiesProps> = ({
  clip,
  onClipChange,
}) => {
  const handlePropertyChange = async (
    property: keyof Clip,
    value: Clip[keyof Clip]
  ) => {
    const updatedClip = { ...clip, [property]: value };
    onClipChange(updatedClip);

    // Update WASM
    await updateClipProperty(clip.id, property, value);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-white text-lg font-semibold mb-4">
        🎬 Clip Properties
      </h3>

      {/* Clip Name */}
      <div>
        <label className="block text-gray-300 text-sm mb-2">Clip Name</label>
        <input
          type="text"
          value={clip.name}
          onChange={(e) => handlePropertyChange("name", e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Timing */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-300 text-sm mb-2">
            Start Time (s)
          </label>
          <input
            type="number"
            value={clip.startTime}
            onChange={(e) =>
              handlePropertyChange("startTime", Number(e.target.value))
            }
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-2">
            Duration (s)
          </label>
          <input
            type="number"
            value={clip.duration}
            onChange={(e) =>
              handlePropertyChange("duration", Number(e.target.value))
            }
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            step="0.1"
            min="0.1"
          />
        </div>
      </div>

      {/* Volume */}
      <div>
        <label className="block text-gray-300 text-sm mb-2">
          Volume: {clip.volume}%
        </label>
        <input
          type="range"
          min="0"
          max="200"
          value={clip.volume}
          onChange={(e) =>
            handlePropertyChange("volume", Number(e.target.value))
          }
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
              (clip.volume / 200) * 100
            }%, #374151 ${(clip.volume / 200) * 100}%, #374151 100%)`,
          }}
        />
      </div>

      {/* Pitch */}
      <div>
        <label className="block text-gray-300 text-sm mb-2">
          Pitch: {clip.pitch > 0 ? `+${clip.pitch}` : clip.pitch} semitones
        </label>
        <input
          type="range"
          min="-24"
          max="24"
          value={clip.pitch}
          onChange={(e) =>
            handlePropertyChange("pitch", Number(e.target.value))
          }
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${
              ((clip.pitch + 24) / 48) * 100
            }%, #374151 ${((clip.pitch + 24) / 48) * 100}%, #374151 100%)`,
          }}
        />
      </div>

      {/* Fade In/Out */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-300 text-sm mb-2">
            Fade In: {clip.fadeIn}s
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={clip.fadeIn}
            onChange={(e) =>
              handlePropertyChange("fadeIn", Number(e.target.value))
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                (clip.fadeIn / 2) * 100
              }%, #374151 ${(clip.fadeIn / 2) * 100}%, #374151 100%)`,
            }}
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-2">
            Fade Out: {clip.fadeOut}s
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={clip.fadeOut}
            onChange={(e) =>
              handlePropertyChange("fadeOut", Number(e.target.value))
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${
                (clip.fadeOut / 2) * 100
              }%, #374151 ${(clip.fadeOut / 2) * 100}%, #374151 100%)`,
            }}
          />
        </div>
      </div>

      {/* Clip Color */}
      <div>
        <label className="block text-gray-300 text-sm mb-2">Clip Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={clip.color}
            onChange={(e) => handlePropertyChange("color", e.target.value)}
            className="w-12 h-10 rounded border border-gray-600"
          />
          <input
            type="text"
            value={clip.color}
            onChange={(e) => handlePropertyChange("color", e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Reverse */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={clip.reverse}
            onChange={(e) => handlePropertyChange("reverse", e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-300 text-sm">🔄 Reverse Audio</span>
        </label>
      </div>
    </div>
  );
};

export default ClipProperties;
