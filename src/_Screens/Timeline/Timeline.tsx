import React, { useState, useEffect } from "react";
import TimelineHeader from "./TimelineHeader";
import TrackHeaders from "./TrackHeaders";
import TimelineGrid from "./TimelineGrid";
import type { Track } from "./types";
import { getTracks, getCurrentTime } from "./wasmApi";
import { calculatePixelsPerSecond } from "./utils";
import { DEFAULT_ZOOM, DEFAULT_TOTAL_DURATION } from "./constants";

interface TimelineProps {
  height: number;
  scrollX: number;
  scrollY: number;
}

const Timeline: React.FC<TimelineProps> = ({ height, scrollX, scrollY }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data from WASM
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [tracksData, currentTimeData] = await Promise.all([
          getTracks(),
          getCurrentTime(),
        ]);
        setTracks(tracksData);
        setCurrentTime(currentTimeData);
      } catch (error) {
        console.error("Failed to load timeline data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Refresh tracks data when needed
  const handleTrackUpdate = async () => {
    try {
      const tracksData = await getTracks();
      setTracks(tracksData);
    } catch (error) {
      console.error("Failed to refresh tracks:", error);
    }
  };

  // Refresh clip data when needed
  const handleClipUpdate = async () => {
    try {
      const tracksData = await getTracks();
      setTracks(tracksData);
    } catch (error) {
      console.error("Failed to refresh clips:", error);
    }
  };

  const pixelsPerSecond = calculatePixelsPerSecond(zoom);
  const totalDuration = DEFAULT_TOTAL_DURATION; // TODO: Get from WASM

  if (loading) {
    return (
      <div
        className="glass rounded-xl flex items-center justify-center border border-white/10 shadow-2xl"
        style={{ height: `${height}%` }}
      >
        <div className="text-white text-lg">Loading Timeline...</div>
      </div>
    );
  }

  return (
    <div
      className="glass rounded-xl flex flex-col overflow-hidden border border-white/10 shadow-2xl panel-enter"
      style={{ height: `${height}%` }}
    >
      <TimelineHeader
        snapToGrid={snapToGrid}
        setSnapToGrid={setSnapToGrid}
        zoom={zoom}
        setZoom={setZoom}
      />
      <div className="flex-1 flex overflow-hidden">
        <TrackHeaders
          tracks={tracks}
          scrollY={scrollY}
          onTrackUpdate={handleTrackUpdate}
        />
        <TimelineGrid
          tracks={tracks}
          selectedClipId={selectedClipId}
          setSelectedClipId={setSelectedClipId}
          currentTime={currentTime}
          pixelsPerSecond={pixelsPerSecond}
          totalDuration={totalDuration}
          scrollX={scrollX}
          scrollY={scrollY}
          onClipUpdate={handleClipUpdate}
        />
      </div>
    </div>
  );
};

export default Timeline;
