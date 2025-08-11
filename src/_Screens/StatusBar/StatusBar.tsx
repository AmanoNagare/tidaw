import React, { useState, useEffect } from "react";
import TransportControls from "./TransportControls";
import TimeDisplay from "./TimeDisplay";
import TempoControl from "./TempoControl";
import VolumeControl from "./VolumeControl";
import UtilityControls from "./UtilityControls";
import * as wasmApi from "./wasmApi";

interface StatusBarProps {
  className?: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ className = "" }) => {
  // State management
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [volume, setVolume] = useState(75);
  const [isLooping, setIsLooping] = useState(false);
  const [isMetronomeEnabled, setIsMetronomeEnabled] = useState(false);

  // Initialize state from WASM on component mount
  useEffect(() => {
    const initializeState = async () => {
      try {
        const transportState = await wasmApi.getTransportState();
        const utilityState = await wasmApi.getUtilityState();
        const currentTempo = await wasmApi.getTempo();
        const currentVolume = await wasmApi.getMasterVolume();

        setIsPlaying(transportState.isPlaying);
        setIsRecording(transportState.isRecording);
        setCurrentTime(transportState.currentTime);
        setIsLooping(utilityState.isLooping);
        setIsMetronomeEnabled(utilityState.isMetronomeEnabled);
        setTempo(currentTempo);
        setVolume(currentVolume);
      } catch (error) {
        console.error("Failed to initialize StatusBar state:", error);
      }
    };

    initializeState();
  }, []);

  // Transport control handlers
  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await wasmApi.pauseAudio();
        setIsPlaying(false);
      } else {
        await wasmApi.playAudio();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Failed to toggle play/pause:", error);
    }
  };

  const handleStop = async () => {
    try {
      await wasmApi.stopAudio();
      setIsPlaying(false);
      setCurrentTime("00:00:00");
    } catch (error) {
      console.error("Failed to stop audio:", error);
    }
  };

  const handleRecord = async () => {
    try {
      if (isRecording) {
        await wasmApi.stopRecording();
        setIsRecording(false);
      } else {
        await wasmApi.startRecording();
        setIsRecording(true);
      }
    } catch (error) {
      console.error("Failed to toggle recording:", error);
    }
  };

  const handleRewind = async () => {
    try {
      await wasmApi.rewindToStart();
      setCurrentTime("00:00:00");
    } catch (error) {
      console.error("Failed to rewind:", error);
    }
  };

  // Tempo control handler
  const handleTempoChange = async (newTempo: number) => {
    try {
      await wasmApi.setTempo(newTempo);
      setTempo(newTempo);
    } catch (error) {
      console.error("Failed to change tempo:", error);
    }
  };

  // Volume control handler
  const handleVolumeChange = async (newVolume: number) => {
    try {
      await wasmApi.setMasterVolume(newVolume);
      setVolume(newVolume);
    } catch (error) {
      console.error("Failed to change volume:", error);
    }
  };

  // Utility control handlers
  const handleToggleLoop = async () => {
    try {
      const newLoopState = !isLooping;
      await wasmApi.toggleLoop(newLoopState);
      setIsLooping(newLoopState);
    } catch (error) {
      console.error("Failed to toggle loop:", error);
    }
  };

  const handleToggleMetronome = async () => {
    try {
      const newMetronomeState = !isMetronomeEnabled;
      await wasmApi.toggleMetronome(newMetronomeState);
      setIsMetronomeEnabled(newMetronomeState);
    } catch (error) {
      console.error("Failed to toggle metronome:", error);
    }
  };

  return (
    <div
      className={`h-20 flex-shrink-0 glass rounded-xl p-4 flex items-center justify-between border border-white/10 backdrop-blur-xl bg-gradient-to-r from-slate-800/50 to-gray-800/50 shadow-2xl panel-enter ${className}`}
    >
      {/* Transport Controls */}
      <TransportControls
        isPlaying={isPlaying}
        isRecording={isRecording}
        onPlayPause={handlePlayPause}
        onStop={handleStop}
        onRecord={handleRecord}
        onRewind={handleRewind}
      />

      {/* Time Display */}
      <TimeDisplay currentTime={currentTime} />

      {/* Tempo and Controls */}
      <div className="flex items-center space-x-6">
        {/* Tempo */}
        <TempoControl tempo={tempo} onTempoChange={handleTempoChange} />

        {/* Master Volume */}
        <VolumeControl volume={volume} onVolumeChange={handleVolumeChange} />

        {/* Utility Controls */}
        <UtilityControls
          isLooping={isLooping}
          isMetronomeEnabled={isMetronomeEnabled}
          onToggleLoop={handleToggleLoop}
          onToggleMetronome={handleToggleMetronome}
        />
      </div>
    </div>
  );
};

export default StatusBar;
