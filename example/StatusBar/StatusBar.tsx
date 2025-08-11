import { useState } from "react";

const StatusBar = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [volume, setVolume] = useState(75);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime("00:00:00");
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
  };

  const handleRewind = () => {
    setCurrentTime("00:00:00");
  };

  return (
    <div className="glass rounded-xl p-4 flex items-center justify-between h-full border border-white/10 backdrop-blur-xl bg-gradient-to-r from-slate-800/50 to-gray-800/50 shadow-2xl panel-enter">
      {/* Transport Controls */}
      <div className="flex items-center space-x-3">
        {/* Rewind Button */}
        <button
          onClick={handleRewind}
          className="w-11 h-11 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-xl flex items-center justify-center transition-all duration-200 button-modern neon-glow border border-white/10 shadow-lg"
          title="Rewind"
        >
          <svg
            className="w-5 h-5 text-white drop-shadow-sm"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M11,18V6L6,12M13,6V18L18,12" />
          </svg>
        </button>

        {/* Stop Button */}
        <button
          onClick={handleStop}
          className="w-11 h-11 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-xl flex items-center justify-center transition-all duration-200 button-modern neon-glow border border-white/10 shadow-lg"
          title="Stop"
        >
          <svg
            className="w-5 h-5 text-white drop-shadow-sm"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="6" y="6" width="12" height="12" />
          </svg>
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 button-modern shadow-lg border border-white/20 ${
            isPlaying
              ? "bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 shadow-orange-500/30"
              : "bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-green-500/30"
          }`}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg
              className="w-7 h-7 text-white drop-shadow-md"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg
              className="w-7 h-7 text-white ml-1 drop-shadow-md"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <polygon points="8,5 19,12 8,19" />
            </svg>
          )}
        </button>

        {/* Record Button */}
        <button
          onClick={handleRecord}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 button-modern border border-white/10 shadow-lg ${
            isRecording
              ? "bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 animate-pulse shadow-red-500/50"
              : "bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 shadow-slate-500/20"
          }`}
          title="Record"
        >
          <div
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              isRecording ? "bg-white shadow-lg" : "bg-red-500"
            }`}
          ></div>
        </button>
      </div>

      {/* Time Display */}
      <div className="flex items-center space-x-4">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-green-500/30 shadow-lg">
          <span className="text-green-400 font-mono text-xl font-bold tracking-wider drop-shadow-md">
            {currentTime}
          </span>
        </div>
      </div>

      {/* Tempo and Controls */}
      <div className="flex items-center space-x-6">
        {/* Tempo */}
        <div className="flex items-center space-x-3">
          <span className="text-gray-300 text-sm font-medium">BPM:</span>
          <input
            type="number"
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
            className="w-18 h-9 bg-gradient-to-br from-slate-700 to-slate-800 text-white text-center rounded-lg border border-white/10 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 font-mono shadow-lg"
            min="60"
            max="200"
          />
        </div>

        {/* Master Volume */}
        <div className="flex items-center space-x-3">
          <svg
            className="w-5 h-5 text-gray-300"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18.01,19.86 21,16.28 21,12C21,7.72 18.01,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />
          </svg>
          <div className="relative">
            <input
              type="range"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-24 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              min="0"
              max="100"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume}%, #374151 ${volume}%, #374151 100%)`,
              }}
            />
          </div>
          <span className="text-gray-300 text-sm w-10 font-mono">
            {volume}%
          </span>
        </div>

        {/* Loop Button */}
        <button
          className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-lg flex items-center justify-center transition-all duration-200 button-modern border border-white/10 shadow-lg"
          title="Loop"
        >
          <svg
            className="w-4 h-4 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M17,17H7V14L3,18L7,22V19H19V13H17M7,7H17V10L21,6L17,2V5H5V11H7V7Z" />
          </svg>
        </button>

        {/* Metronome Button */}
        <button
          className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-lg flex items-center justify-center transition-all duration-200 button-modern border border-white/10 shadow-lg"
          title="Metronome"
        >
          <svg
            className="w-4 h-4 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6L16.5,10.5L15.08,11.92L12,8.84L8.92,11.92L7.5,10.5L12,6Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default StatusBar;
