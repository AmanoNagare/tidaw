export interface Track {
  id: string;
  name: string;
  color: string;
  muted: boolean;
  solo: boolean;
  volume: number; // 0-100
  pan: number; // -100 to 100
  input: string;
  output: string;
}

export interface Clip {
  id: string;
  name: string;
  startTime: number; // seconds
  duration: number; // seconds
  color: string;
  volume: number; // 0-200 (can go above 100%)
  pitch: number; // -24 to 24 semitones
  fadeIn: number; // seconds
  fadeOut: number; // seconds
  reverse: boolean;
}

export interface Effect {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  parameters: { [key: string]: number }; // 0-1 normalized values
}

export interface MasterSettings {
  volume: number; // 0-100
  pan: number; // -100 to 100
  limiter: boolean;
  limiterThreshold: number; // dB
  sampleRate: number; // Hz
  bufferSize: number; // samples
}

export type SourceType = "track" | "clip" | "effect" | "master" | null;

export interface PropertyProps {
  height: number; // percentage
  className?: string;
}
