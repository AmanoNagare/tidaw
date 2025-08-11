import React, { useState, useEffect } from "react";
import type { Effect } from "./types";
import {
  updateEffectProperty,
  updateEffectParameter,
  getAvailableEffectTypes,
} from "./wasmApi";

interface EffectPropertiesProps {
  effect: Effect;
  onEffectChange: (effect: Effect) => void;
}

const EffectProperties: React.FC<EffectPropertiesProps> = ({
  effect,
  onEffectChange,
}) => {
  const [availableEffectTypes, setAvailableEffectTypes] = useState<string[]>(
    []
  );

  useEffect(() => {
    // Load available effect types
    const loadEffectTypes = async () => {
      const types = await getAvailableEffectTypes();
      setAvailableEffectTypes(types);
    };

    loadEffectTypes();
  }, []);

  const handlePropertyChange = async (
    property: keyof Effect,
    value: Effect[keyof Effect]
  ) => {
    const updatedEffect = { ...effect, [property]: value };
    onEffectChange(updatedEffect);

    // Update WASM
    await updateEffectProperty(effect.id, property, value);
  };

  const handleParameterChange = async (
    parameterName: string,
    value: number
  ) => {
    const updatedParameters = {
      ...effect.parameters,
      [parameterName]: value,
    };
    const updatedEffect = { ...effect, parameters: updatedParameters };
    onEffectChange(updatedEffect);

    // Update WASM
    await updateEffectParameter(effect.id, parameterName, value);
  };

  const formatParameterName = (paramName: string): string => {
    return paramName
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className="space-y-4">
      <h3 className="text-white text-lg font-semibold mb-4">
        ⚡ Effect Properties
      </h3>

      {/* Effect Name & Enable */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="block text-gray-300 text-sm mb-2">
            Effect Name
          </label>
          <input
            type="text"
            value={effect.name}
            onChange={(e) => handlePropertyChange("name", e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="ml-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={effect.enabled}
              onChange={(e) =>
                handlePropertyChange("enabled", e.target.checked)
              }
              className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
            />
            <span className="text-gray-300 text-sm">✅ Enabled</span>
          </label>
        </div>
      </div>

      {/* Effect Type */}
      <div>
        <label className="block text-gray-300 text-sm mb-2">Effect Type</label>
        <select
          value={effect.type}
          onChange={(e) => handlePropertyChange("type", e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
        >
          {availableEffectTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Effect Parameters */}
      <div className="space-y-3">
        <h4 className="text-gray-300 font-medium">Parameters</h4>
        {Object.entries(effect.parameters).map(([key, value]) => (
          <div key={key}>
            <label className="block text-gray-300 text-sm mb-2">
              {formatParameterName(key)}: {(value * 100).toFixed(1)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={value}
              onChange={(e) =>
                handleParameterChange(key, Number(e.target.value))
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${
                  value * 100
                }%, #374151 ${value * 100}%, #374151 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Effect Status */}
      <div className="pt-2 border-t border-gray-600">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Status:</span>
          <span
            className={`font-medium ${
              effect.enabled ? "text-green-400" : "text-red-400"
            }`}
          >
            {effect.enabled ? "🟢 Active" : "🔴 Bypassed"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EffectProperties;
