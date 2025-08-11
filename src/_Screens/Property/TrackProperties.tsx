import React, { useState, useEffect } from "react";
import type { Track } from "./types";
import {
  updateTrackProperty,
  getAudioInputs,
  getAudioOutputs,
} from "./wasmApi";

interface TrackPropertiesProps {
  track: Track;
  onTrackChange: (track: Track) => void;
}

const TrackProperties: React.FC<TrackPropertiesProps> = ({
  track,
  onTrackChange,
}) => {
  const [availableInputs, setAvailableInputs] = useState<string[]>([]);
  const [availableOutputs, setAvailableOutputs] = useState<string[]>([]);

  useEffect(() => {
    // Load available inputs and outputs
    const loadAudioOptions = async () => {
      const inputs = await getAudioInputs();
      const outputs = await getAudioOutputs();
      setAvailableInputs(inputs);
      setAvailableOutputs(outputs);
    };

    loadAudioOptions();
  }, []);

  const handlePropertyChange = async (
    property: keyof Track,
    value: Track[keyof Track]
  ) => {
    const updatedTrack = { ...track, [property]: value };
    onTrackChange(updatedTrack);

    // Update WASM
    await updateTrackProperty(track.id, property, value);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-white text-xl font-bold mb-6 drop-shadow-sm">
        🎵 Track Properties
      </h3>

      {/* Track Name */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-3">
          Track Name
        </label>
        <input
          type="text"
          value={track.name}
          onChange={(e) => handlePropertyChange("name", e.target.value)}
          className="w-full px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg border border-white/20 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-lg"
        />
      </div>

      {/* Track Color */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-3">
          Track Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={track.color}
            onChange={(e) => handlePropertyChange("color", e.target.value)}
            className="w-14 h-12 rounded-lg border-2 border-white/20 shadow-lg cursor-pointer"
          />
          <input
            type="text"
            value={track.color}
            onChange={(e) => handlePropertyChange("color", e.target.value)}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg border border-white/20 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-lg font-mono"
          />
        </div>
      </div>

      {/* Volume */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-3">
          Volume:{" "}
          <span className="text-blue-400 font-mono">{track.volume}%</span>
        </label>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={track.volume}
            onChange={(e) =>
              handlePropertyChange("volume", Number(e.target.value))
            }
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer shadow-lg"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${track.volume}%, #374151 ${track.volume}%, #374151 100%)`,
            }}
          />
        </div>
      </div>

      {/* Pan */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-3">
          Pan:{" "}
          <span className="text-purple-400 font-mono">
            {track.pan > 0
              ? `R${track.pan}`
              : track.pan < 0
              ? `L${Math.abs(track.pan)}`
              : "Center"}
          </span>
        </label>
        <div className="relative">
          <input
            type="range"
            min="-100"
            max="100"
            value={track.pan}
            onChange={(e) =>
              handlePropertyChange("pan", Number(e.target.value))
            }
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer shadow-lg"
            style={{
              background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${
                ((track.pan + 100) / 200) * 100
              }%, #374151 ${((track.pan + 100) / 200) * 100}%, #374151 100%)`,
            }}
          />
        </div>
      </div>

      {/* Input/Output */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-3">
            Input
          </label>
          <select
            value={track.input}
            onChange={(e) => handlePropertyChange("input", e.target.value)}
            className="w-full px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg border border-white/20 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-lg"
          >
            {availableInputs.map((input) => (
              <option key={input} value={input}>
                {input}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-3">
            Output
          </label>
          <select
            value={track.output}
            onChange={(e) => handlePropertyChange("output", e.target.value)}
            className="w-full px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg border border-white/20 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-lg"
          >
            {availableOutputs.map((output) => (
              <option key={output} value={output}>
                {output}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mute/Solo */}
      <div className="flex gap-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={track.muted}
            onChange={(e) => handlePropertyChange("muted", e.target.checked)}
            className="w-5 h-5 text-red-600 bg-slate-700 border-gray-600 rounded-md focus:ring-red-500 focus:ring-2"
          />
          <span className="text-gray-300 text-sm font-medium">🔇 Mute</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={track.solo}
            onChange={(e) => handlePropertyChange("solo", e.target.checked)}
            className="w-5 h-5 text-yellow-600 bg-slate-700 border-gray-600 rounded-md focus:ring-yellow-500 focus:ring-2"
          />
          <span className="text-gray-300 text-sm font-medium">🎤 Solo</span>
        </label>
      </div>
    </div>
  );
};

export default TrackProperties;
