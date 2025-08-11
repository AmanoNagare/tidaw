import { useState } from "react";

interface PropertyProps {
  height: number;
}

interface Track {
  id: string;
  name: string;
  color: string;
  muted: boolean;
  solo: boolean;
  volume: number;
  pan: number;
  input: string;
  output: string;
}

interface Clip {
  id: string;
  name: string;
  startTime: number;
  duration: number;
  color: string;
  volume: number;
  pitch: number;
  fadeIn: number;
  fadeOut: number;
  reverse: boolean;
}

interface Effect {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  parameters: { [key: string]: number };
}

type SourceType = "track" | "clip" | "effect" | "master" | null;

const Property = ({ height }: PropertyProps) => {
  const [selectedSource, setSelectedSource] = useState<SourceType>("track");

  // Sample data - in a real app, this would come from props or context
  const [selectedTrack, setSelectedTrack] = useState<Track>({
    id: "1",
    name: "Drums",
    color: "#ef4444",
    muted: false,
    solo: false,
    volume: 80,
    pan: 0,
    input: "Audio Input 1",
    output: "Master Bus",
  });

  const [selectedClip, setSelectedClip] = useState<Clip>({
    id: "1",
    name: "Kick Pattern",
    startTime: 0,
    duration: 4,
    color: "#f87171",
    volume: 85,
    pitch: 0,
    fadeIn: 0.1,
    fadeOut: 0.1,
    reverse: false,
  });

  const [selectedEffect, setSelectedEffect] = useState<Effect>({
    id: "1",
    name: "Reverb",
    type: "Reverb",
    enabled: true,
    parameters: {
      roomSize: 0.5,
      damping: 0.3,
      wetLevel: 0.2,
      dryLevel: 0.8,
    },
  });

  const [masterSettings, setMasterSettings] = useState({
    volume: 75,
    pan: 0,
    limiter: true,
    limiterThreshold: -0.1,
    sampleRate: 44100,
    bufferSize: 512,
  });

  const renderTrackProperties = () => (
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
          value={selectedTrack.name}
          onChange={(e) =>
            setSelectedTrack({ ...selectedTrack, name: e.target.value })
          }
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
            value={selectedTrack.color}
            onChange={(e) =>
              setSelectedTrack({ ...selectedTrack, color: e.target.value })
            }
            className="w-14 h-12 rounded-lg border-2 border-white/20 shadow-lg cursor-pointer"
          />
          <input
            type="text"
            value={selectedTrack.color}
            onChange={(e) =>
              setSelectedTrack({ ...selectedTrack, color: e.target.value })
            }
            className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg border border-white/20 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-lg font-mono"
          />
        </div>
      </div>

      {/* Volume */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-3">
          Volume:{" "}
          <span className="text-blue-400 font-mono">
            {selectedTrack.volume}%
          </span>
        </label>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={selectedTrack.volume}
            onChange={(e) =>
              setSelectedTrack({
                ...selectedTrack,
                volume: Number(e.target.value),
              })
            }
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer shadow-lg"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${selectedTrack.volume}%, #374151 ${selectedTrack.volume}%, #374151 100%)`,
            }}
          />
        </div>
      </div>

      {/* Pan */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-3">
          Pan:{" "}
          <span className="text-purple-400 font-mono">
            {selectedTrack.pan > 0
              ? `R${selectedTrack.pan}`
              : selectedTrack.pan < 0
              ? `L${Math.abs(selectedTrack.pan)}`
              : "Center"}
          </span>
        </label>
        <div className="relative">
          <input
            type="range"
            min="-100"
            max="100"
            value={selectedTrack.pan}
            onChange={(e) =>
              setSelectedTrack({
                ...selectedTrack,
                pan: Number(e.target.value),
              })
            }
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer shadow-lg"
            style={{
              background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${
                ((selectedTrack.pan + 100) / 200) * 100
              }%, #374151 ${
                ((selectedTrack.pan + 100) / 200) * 100
              }%, #374151 100%)`,
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
            value={selectedTrack.input}
            onChange={(e) =>
              setSelectedTrack({ ...selectedTrack, input: e.target.value })
            }
            className="w-full px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg border border-white/20 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-lg"
          >
            <option>Audio Input 1</option>
            <option>Audio Input 2</option>
            <option>Stereo Input</option>
            <option>MIDI Input</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-3">
            Output
          </label>
          <select
            value={selectedTrack.output}
            onChange={(e) =>
              setSelectedTrack({ ...selectedTrack, output: e.target.value })
            }
            className="w-full px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg border border-white/20 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-lg"
          >
            <option>Master Bus</option>
            <option>Bus 1</option>
            <option>Bus 2</option>
            <option>External Output</option>
          </select>
        </div>
      </div>

      {/* Mute/Solo */}
      <div className="flex gap-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedTrack.muted}
            onChange={(e) =>
              setSelectedTrack({ ...selectedTrack, muted: e.target.checked })
            }
            className="w-5 h-5 text-red-600 bg-slate-700 border-gray-600 rounded-md focus:ring-red-500 focus:ring-2"
          />
          <span className="text-gray-300 text-sm font-medium">🔇 Mute</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedTrack.solo}
            onChange={(e) =>
              setSelectedTrack({ ...selectedTrack, solo: e.target.checked })
            }
            className="w-5 h-5 text-yellow-600 bg-slate-700 border-gray-600 rounded-md focus:ring-yellow-500 focus:ring-2"
          />
          <span className="text-gray-300 text-sm font-medium">🎤 Solo</span>
        </label>
      </div>
    </div>
  );

  const renderClipProperties = () => (
    <div className="space-y-4">
      <h3 className="text-white text-lg font-semibold mb-4">Clip Properties</h3>

      {/* Clip Name */}
      <div>
        <label className="block text-gray-300 text-sm mb-2">Clip Name</label>
        <input
          type="text"
          value={selectedClip.name}
          onChange={(e) =>
            setSelectedClip({ ...selectedClip, name: e.target.value })
          }
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
            value={selectedClip.startTime}
            onChange={(e) =>
              setSelectedClip({
                ...selectedClip,
                startTime: Number(e.target.value),
              })
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
            value={selectedClip.duration}
            onChange={(e) =>
              setSelectedClip({
                ...selectedClip,
                duration: Number(e.target.value),
              })
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
          Volume: {selectedClip.volume}%
        </label>
        <input
          type="range"
          min="0"
          max="200"
          value={selectedClip.volume}
          onChange={(e) =>
            setSelectedClip({ ...selectedClip, volume: Number(e.target.value) })
          }
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Pitch */}
      <div>
        <label className="block text-gray-300 text-sm mb-2">
          Pitch:{" "}
          {selectedClip.pitch > 0
            ? `+${selectedClip.pitch}`
            : selectedClip.pitch}{" "}
          semitones
        </label>
        <input
          type="range"
          min="-24"
          max="24"
          value={selectedClip.pitch}
          onChange={(e) =>
            setSelectedClip({ ...selectedClip, pitch: Number(e.target.value) })
          }
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Fade In/Out */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-300 text-sm mb-2">
            Fade In: {selectedClip.fadeIn}s
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={selectedClip.fadeIn}
            onChange={(e) =>
              setSelectedClip({
                ...selectedClip,
                fadeIn: Number(e.target.value),
              })
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-2">
            Fade Out: {selectedClip.fadeOut}s
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={selectedClip.fadeOut}
            onChange={(e) =>
              setSelectedClip({
                ...selectedClip,
                fadeOut: Number(e.target.value),
              })
            }
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Clip Color */}
      <div>
        <label className="block text-gray-300 text-sm mb-2">Clip Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={selectedClip.color}
            onChange={(e) =>
              setSelectedClip({ ...selectedClip, color: e.target.value })
            }
            className="w-12 h-10 rounded border border-gray-600"
          />
          <input
            type="text"
            value={selectedClip.color}
            onChange={(e) =>
              setSelectedClip({ ...selectedClip, color: e.target.value })
            }
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Reverse */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedClip.reverse}
            onChange={(e) =>
              setSelectedClip({ ...selectedClip, reverse: e.target.checked })
            }
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-300 text-sm">Reverse Audio</span>
        </label>
      </div>
    </div>
  );

  const renderEffectProperties = () => (
    <div className="space-y-4">
      <h3 className="text-white text-lg font-semibold mb-4">
        Effect Properties
      </h3>

      {/* Effect Name & Enable */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="block text-gray-300 text-sm mb-2">
            Effect Name
          </label>
          <input
            type="text"
            value={selectedEffect.name}
            onChange={(e) =>
              setSelectedEffect({ ...selectedEffect, name: e.target.value })
            }
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="ml-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedEffect.enabled}
              onChange={(e) =>
                setSelectedEffect({
                  ...selectedEffect,
                  enabled: e.target.checked,
                })
              }
              className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
            />
            <span className="text-gray-300 text-sm">Enabled</span>
          </label>
        </div>
      </div>

      {/* Effect Type */}
      <div>
        <label className="block text-gray-300 text-sm mb-2">Effect Type</label>
        <select
          value={selectedEffect.type}
          onChange={(e) =>
            setSelectedEffect({ ...selectedEffect, type: e.target.value })
          }
          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
        >
          <option>Reverb</option>
          <option>Delay</option>
          <option>Chorus</option>
          <option>Distortion</option>
          <option>EQ</option>
          <option>Compressor</option>
        </select>
      </div>

      {/* Effect Parameters */}
      <div className="space-y-3">
        <h4 className="text-gray-300 font-medium">Parameters</h4>
        {Object.entries(selectedEffect.parameters).map(([key, value]) => (
          <div key={key}>
            <label className="block text-gray-300 text-sm mb-2 capitalize">
              {key.replace(/([A-Z])/g, " $1")}: {(value * 100).toFixed(1)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={value}
              onChange={(e) =>
                setSelectedEffect({
                  ...selectedEffect,
                  parameters: {
                    ...selectedEffect.parameters,
                    [key]: Number(e.target.value),
                  },
                })
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderMasterProperties = () => (
    <div className="space-y-4">
      <h3 className="text-white text-lg font-semibold mb-4">
        Master Properties
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
            setMasterSettings({
              ...masterSettings,
              volume: Number(e.target.value),
            })
          }
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
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
          onChange={(e) =>
            setMasterSettings({
              ...masterSettings,
              pan: Number(e.target.value),
            })
          }
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Limiter */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={masterSettings.limiter}
            onChange={(e) =>
              setMasterSettings({
                ...masterSettings,
                limiter: e.target.checked,
              })
            }
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-300 text-sm">Enable Limiter</span>
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
                setMasterSettings({
                  ...masterSettings,
                  limiterThreshold: Number(e.target.value),
                })
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Audio Settings */}
      <div className="space-y-3">
        <h4 className="text-gray-300 font-medium">Audio Settings</h4>

        <div>
          <label className="block text-gray-300 text-sm mb-2">
            Sample Rate
          </label>
          <select
            value={masterSettings.sampleRate}
            onChange={(e) =>
              setMasterSettings({
                ...masterSettings,
                sampleRate: Number(e.target.value),
              })
            }
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value={44100}>44.1 kHz</option>
            <option value={48000}>48 kHz</option>
            <option value={88200}>88.2 kHz</option>
            <option value={96000}>96 kHz</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-2">
            Buffer Size
          </label>
          <select
            value={masterSettings.bufferSize}
            onChange={(e) =>
              setMasterSettings({
                ...masterSettings,
                bufferSize: Number(e.target.value),
              })
            }
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value={128}>128 samples</option>
            <option value={256}>256 samples</option>
            <option value={512}>512 samples</option>
            <option value={1024}>1024 samples</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="glass rounded-xl flex flex-col overflow-hidden border border-white/10 shadow-2xl panel-enter"
      style={{ height: `${height}%` }}
    >
      {/* Property Type Selector */}
      <div className="bg-gradient-to-r from-slate-800/80 to-gray-800/80 backdrop-blur-sm p-4 border-b border-white/10">
        <div className="flex gap-2">
          {(["track", "clip", "effect", "master"] as SourceType[]).map(
            (type) => (
              <button
                key={type}
                onClick={() => setSelectedSource(type)}
                className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 capitalize font-medium button-modern ${
                  selectedSource === type
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/50"
                    : "bg-gradient-to-r from-slate-700 to-slate-800 text-gray-300 hover:from-slate-600 hover:to-slate-700 border border-white/10"
                }`}
              >
                {type === "track" && "🎵 "}
                {type === "clip" && "🎬 "}
                {type === "effect" && "⚡ "}
                {type === "master" && "🎛️ "}
                {type}
              </button>
            )
          )}
        </div>
      </div>

      {/* Property Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-slate-900/50 to-gray-900/50 backdrop-blur-sm">
        {selectedSource === "track" && renderTrackProperties()}
        {selectedSource === "clip" && renderClipProperties()}
        {selectedSource === "effect" && renderEffectProperties()}
        {selectedSource === "master" && renderMasterProperties()}
        {selectedSource === null && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center shadow-xl border border-white/10">
                <svg
                  className="w-10 h-10 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
                </svg>
              </div>
              <p className="text-xl font-bold mb-3 text-white drop-shadow-sm">
                No Selection
              </p>
              <p className="text-sm text-gray-300">
                Select a track, clip, or effect to view properties
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Property;
