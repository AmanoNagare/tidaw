import React, { useState, useEffect, useRef } from "react";
import { AudioPlugin } from "./audio/AudioPlugin";

const Test: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [frequency, setFrequency] = useState(440.0);
  const sinePluginRef = useRef<AudioPlugin | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Effect to initialize the audio engine once
  useEffect(() => {
    const setupAudio = async () => {
      const context = new AudioContext();
      audioContextRef.current = context;

      const wasmUrl = new URL("../pkg/tidaw_wasm_bg.wasm", import.meta.url)
        .href;
      const workletUrl = new URL(
        "./audio/plugins/sine-processor.ts",
        import.meta.url
      ).href;

      await context.audioWorklet.addModule(workletUrl);

      const plugin = await AudioPlugin.create(
        context,
        "sine-processor",
        [{ name: "frequency", defaultValue: 440.0 }],
        wasmUrl
      );

      plugin.connect(context.destination);
      sinePluginRef.current = plugin;
      setIsInitialized(true);
      console.log("🚀 Sine plugin created and connected!");
    };

    setupAudio();
  }, []); // Empty dependency array ensures this runs only once

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFreq = parseFloat(e.target.value);
    setFrequency(newFreq);
    if (sinePluginRef.current) {
      sinePluginRef.current.setParameter("frequency", newFreq);
    }
  };

  const startAudioContext = () => {
    if (
      audioContextRef.current &&
      audioContextRef.current.state === "suspended"
    ) {
      audioContextRef.current.resume();
    }
  };

  return (
    <div>
      <h1>Real-time Sine Wave Generator</h1>
      {!isInitialized ? (
        <p>Loading Audio Engine...</p>
      ) : (
        <div>
          <button onClick={startAudioContext}>
            Start Audio (Click here first)
          </button>
          <div>
            <label>Frequency: {frequency.toFixed(2)} Hz</label>
            <input
              type="range"
              min="20"
              max="2000"
              step="1"
              value={frequency}
              onChange={handleFrequencyChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Test;
