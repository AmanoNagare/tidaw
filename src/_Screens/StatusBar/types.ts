export interface TransportState {
  isPlaying: boolean;
  isRecording: boolean;
  currentTime: string;
}

export interface TempoState {
  tempo: number;
}

export interface VolumeState {
  volume: number;
}

export interface UtilityState {
  isLooping: boolean;
  isMetronomeEnabled: boolean;
}

export interface TransportControlsProps {
  isPlaying: boolean;
  isRecording: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onRecord: () => void;
  onRewind: () => void;
}

export interface TimeDisplayProps {
  currentTime: string;
}

export interface TempoControlProps {
  tempo: number;
  onTempoChange: (tempo: number) => void;
}

export interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export interface UtilityControlsProps {
  isLooping: boolean;
  isMetronomeEnabled: boolean;
  onToggleLoop: () => void;
  onToggleMetronome: () => void;
}
