// Utility functions for Timeline

import {
  PIXELS_PER_SECOND_BASE,
  FRAMES_PER_SECOND,
  BEAT_SUBDIVISIONS,
} from "./constants";

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * FRAMES_PER_SECOND);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
};

export const calculateTimelineWidth = (
  totalDuration: number,
  pixelsPerSecond: number
): number => {
  return totalDuration * pixelsPerSecond;
};

export const calculatePixelsPerSecond = (zoom: number): number => {
  return PIXELS_PER_SECOND_BASE * zoom;
};

export const snapToGridTime = (
  time: number,
  snapToGrid: boolean,
  beatsPerSecond: number = 1
): number => {
  if (!snapToGrid) return time;
  const beatDuration = 1 / beatsPerSecond;
  const subdivision = beatDuration / BEAT_SUBDIVISIONS;
  return Math.round(time / subdivision) * subdivision;
};

export const convertPixelsToTime = (
  pixels: number,
  pixelsPerSecond: number
): number => {
  return pixels / pixelsPerSecond;
};

export const convertTimeToPixels = (
  time: number,
  pixelsPerSecond: number
): number => {
  return time * pixelsPerSecond;
};

export const clampTime = (
  time: number,
  minTime: number = 0,
  maxTime?: number
): number => {
  if (maxTime !== undefined) {
    return Math.max(minTime, Math.min(maxTime, time));
  }
  return Math.max(minTime, time);
};

export const clampDuration = (
  duration: number,
  minDuration: number,
  maxDuration?: number
): number => {
  if (maxDuration !== undefined) {
    return Math.max(minDuration, Math.min(maxDuration, duration));
  }
  return Math.max(minDuration, duration);
};
