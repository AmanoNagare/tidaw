import React, { useState, useEffect } from "react";
import type {
  PropertyProps,
  SourceType,
  Track,
  Clip,
  Effect,
  MasterSettings,
} from "./types";
import {
  getTrackData,
  getClipData,
  getEffectData,
  getMasterSettings,
} from "./wasmApi";
import PropertySelector from "./PropertySelector";
import TrackProperties from "./TrackProperties";
import ClipProperties from "./ClipProperties";
import EffectProperties from "./EffectProperties";
import MasterProperties from "./MasterProperties";

const Property: React.FC<PropertyProps> = ({ height, className = "" }) => {
  const [selectedSource, setSelectedSource] = useState<SourceType>("track");

  // State for each property type
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<Effect | null>(null);
  const [masterSettings, setMasterSettings] = useState<MasterSettings | null>(
    null
  );

  // Loading states
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load initial data when component mounts
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Load sample data for each type
        const [trackData, clipData, effectData, masterData] = await Promise.all(
          [
            getTrackData("sample-track-1"),
            getClipData("sample-clip-1"),
            getEffectData("sample-effect-1"),
            getMasterSettings(),
          ]
        );

        setSelectedTrack(trackData);
        setSelectedClip(clipData);
        setSelectedEffect(effectData);
        setMasterSettings(masterData);
      } catch (error) {
        console.error("Failed to load property data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const renderPropertyContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading properties...</p>
          </div>
        </div>
      );
    }

    switch (selectedSource) {
      case "track":
        return selectedTrack ? (
          <TrackProperties
            track={selectedTrack}
            onTrackChange={setSelectedTrack}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No track selected</p>
          </div>
        );

      case "clip":
        return selectedClip ? (
          <ClipProperties clip={selectedClip} onClipChange={setSelectedClip} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No clip selected</p>
          </div>
        );

      case "effect":
        return selectedEffect ? (
          <EffectProperties
            effect={selectedEffect}
            onEffectChange={setSelectedEffect}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No effect selected</p>
          </div>
        );

      case "master":
        return masterSettings ? (
          <MasterProperties
            masterSettings={masterSettings}
            onMasterSettingsChange={setMasterSettings}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Master settings unavailable</p>
          </div>
        );

      default:
        return (
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
        );
    }
  };

  return (
    <div
      className={`glass rounded-xl flex flex-col overflow-hidden border border-white/10 shadow-2xl panel-enter ${className}`}
      style={{ height: `${height}%` }}
    >
      {/* Property Type Selector */}
      <PropertySelector
        selectedSource={selectedSource}
        onSourceChange={setSelectedSource}
      />

      {/* Property Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-slate-900/50 to-gray-900/50 backdrop-blur-sm">
        {renderPropertyContent()}
      </div>
    </div>
  );
};

export default Property;
