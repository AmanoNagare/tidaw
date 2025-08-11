export interface Clip {
  id: string;
  name: string;
  startTime: number;
  duration: number;
  color: string;
}

export interface Track {
  id: string;
  name: string;
  color: string;
  muted: boolean;
  solo: boolean;
  volume: number;
  clips: Clip[];
}
