import React from "react";
import type { MasterSettings } from "./types";
import { updateMasterProperty, updateAudioConfig } from "./wasmApi";

interface MasterPropertiesProps {
  masterSettings: MasterSettings;
  onMasterSettingsChange: (settings: MasterSettings) => void;
}

const MasterProperties: React.FC<MasterPropertiesProps> = ({
  masterSettings,
  onMasterSettingsChange,
}) => {
  const handlePropertyChange = async (
    property: keyof MasterSettings,
    value: MasterSettings[keyof MasterSettings]
  ) => {
    const updatedSettings = { ...masterSettings, [property]: value };
    onMasterSettingsChange(updatedSettings);

    // Update WASM
    await updateMasterProperty(property, value);

    // Special handling for audio config changes
    if (property === "sampleRate" || property === "bufferSize") {
      await updateAudioConfig(
        updatedSettings.sampleRate,
        updatedSettings.bufferSize
      );
    }
  };

  const sampleRateOptions = [
    { value: 44100, label: "44.1 kHz" },
    { value: 48000, label: "48 kHz" },
    { value: 88200, label: "88.2 kHz" },
    { value: 96000, label: "96 kHz" },
  ];

  const bufferSizeOptions = [
    { value: 128, label: "128 samples" },
    { value: 256, label: "256 samples" },
    { value: 512, label: "512 samples" },
    { value: 1024, label: "1024 samples" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-white text-lg font-semibold mb-4">
        🎛️ Master Properties
      </h3>

      {/* Master Volume */}
      <div>
        <label className="block text-gray-300 text-sm mb-2">
          Master Volume: {masterSettings.volume}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={masterSettings.volume}
          onChange={(e) =>
            handlePropertyChange("volume", Number(e.target.value))
          }
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${masterSettings.volume}%, #374151 ${masterSettings.volume}%, #374151 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Master Pan */}
      <div>
        <label className="block text-gray-300 text-sm mb-2">
          Master Pan:{" "}
          {masterSettings.pan > 0
            ? `R${masterSettings.pan}`
            : masterSettings.pan < 0
            ? `L${Math.abs(masterSettings.pan)}`
            : "Center"}
        </label>
        <input
          type="range"
          min="-100"
          max="100"
          value={masterSettings.pan}
          onChange={(e) => handlePropertyChange("pan", Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${
              ((masterSettings.pan + 100) / 200) * 100
            }%, #374151 ${
              ((masterSettings.pan + 100) / 200) * 100
            }%, #374151 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>L100</span>
          <span>Center</span>
          <span>R100</span>
        </div>
      </div>

      {/* Limiter */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={masterSettings.limiter}
            onChange={(e) => handlePropertyChange("limiter", e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-300 text-sm">🛡️ Enable Limiter</span>
        </label>

        {masterSettings.limiter && (
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Limiter Threshold: {masterSettings.limiterThreshold} dB
            </label>
            <input
              type="range"
              min="-10"
              max="0"
              step="0.1"
              value={masterSettings.limiterThreshold}
              onChange={(e) =>
                handlePropertyChange("limiterThreshold", Number(e.target.value))
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${
                  ((masterSettings.limiterThreshold + 10) / 10) * 100
                }%, #374151 ${
                  ((masterSettings.limiterThreshold + 10) / 10) * 100
                }%, #374151 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>-10 dB</span>
              <span>0 dB</span>
            </div>
          </div>
        )}
      </div>

      {/* Audio Settings */}
      <div className="space-y-3">
        <h4 className="text-gray-300 font-medium border-t border-gray-600 pt-3">
          🔧 Audio Engine Settings
        </h4>

        <div>
          <label className="block text-gray-300 text-sm mb-2">
            Sample Rate
          </label>
          <select
            value={masterSettings.sampleRate}
            onChange={(e) =>
              handlePropertyChange("sampleRate", Number(e.target.value))
            }
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            {sampleRateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-2">
            Buffer Size
          </label>
          <select
            value={masterSettings.bufferSize}
            onChange={(e) =>
              handlePropertyChange("bufferSize", Number(e.target.value))
            }
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            {bufferSizeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Lower values = less latency, higher CPU usage
          </p>
        </div>
      </div>

      {/* Audio Info */}
      <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
        <h5 className="text-gray-300 font-medium text-sm">📊 Audio Status</h5>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-400">Sample Rate:</span>
            <span className="text-white ml-1">
              {(masterSettings.sampleRate / 1000).toFixed(1)} kHz
            </span>
          </div>
          <div>
            <span className="text-gray-400">Buffer:</span>
            <span className="text-white ml-1">
              {masterSettings.bufferSize} samples
            </span>
          </div>
          <div>
            <span className="text-gray-400">Latency:</span>
            <span className="text-white ml-1">
              {(
                (masterSettings.bufferSize / masterSettings.sampleRate) *
                1000
              ).toFixed(1)}{" "}
              ms
            </span>
          </div>
          <div>
            <span className="text-gray-400">Limiter:</span>
            <span
              className={`ml-1 ${
                masterSettings.limiter ? "text-green-400" : "text-red-400"
              }`}
            >
              {masterSettings.limiter ? "ON" : "OFF"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterProperties;
