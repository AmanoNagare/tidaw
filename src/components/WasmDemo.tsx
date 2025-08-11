import React, { useEffect, useState } from "react";

interface WasmModule {
  greet: (name: string) => void;
  add: (a: number, b: number) => number;
  AudioProcessor: {
    new (sampleRate: number, bufferSize: number): AudioProcessor;
  };
}

interface AudioProcessor {
  sample_rate: number;
  buffer_size: number;
  process_audio: (input: Float32Array) => Float32Array;
  generate_sine_wave: (frequency: number, duration: number) => Float32Array;
}

const WasmDemo: React.FC = () => {
  const [wasmModule, setWasmModule] = useState<WasmModule | null>(null);
  const [audioProcessor, setAudioProcessor] = useState<AudioProcessor | null>(
    null
  );
  const [output, setOutput] = useState<string>("");

  useEffect(() => {
    const loadWasm = async () => {
      try {
        // Import the WASM module
        const wasm = await import("../../pkg/tidaw_wasm.js");
        await wasm.default(); // Initialize the WASM module

        setWasmModule(wasm as unknown as WasmModule);

        // Create an audio processor instance
        const processor = new wasm.AudioProcessor(44100, 512);
        setAudioProcessor(processor as unknown as AudioProcessor);

        setOutput("WASM module loaded successfully!");
      } catch (error) {
        console.error("Failed to load WASM module:", error);
        setOutput(`Failed to load WASM module: ${error}`);
      }
    };

    loadWasm();
  }, []);

  const testAdd = () => {
    if (wasmModule) {
      const result = wasmModule.add(5, 3);
      setOutput(`5 + 3 = ${result}`);
    }
  };

  const testGreet = () => {
    if (wasmModule) {
      // Note: This will show a browser alert
      wasmModule.greet("TIDAW DAW");
    }
  };

  const testSineWave = () => {
    if (audioProcessor) {
      const sineWave = audioProcessor.generate_sine_wave(440, 1.0); // 440Hz for 1 second
      setOutput(
        `Generated sine wave with ${sineWave.length} samples at ${audioProcessor.sample_rate}Hz`
      );
    }
  };

  const testAudioProcess = () => {
    if (audioProcessor) {
      // Create a simple test input
      const input = new Float32Array(audioProcessor.buffer_size);
      for (let i = 0; i < input.length; i++) {
        input[i] = Math.sin(
          (2 * Math.PI * 440 * i) / audioProcessor.sample_rate
        );
      }

      const processed = audioProcessor.process_audio(input);
      setOutput(
        `Processed ${input.length} samples, output length: ${processed.length}`
      );
    }
  };

  if (!wasmModule) {
    return <div className="p-4">Loading WASM module...</div>;
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">WASM Demo</h2>

      <div className="space-y-4">
        <div>
          <button
            onClick={testAdd}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Test Add Function
          </button>
          <button
            onClick={testGreet}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Test Greet Function
          </button>
        </div>

        {audioProcessor && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Audio Processing</h3>
            <p className="text-sm text-gray-600 mb-2">
              Sample Rate: {audioProcessor.sample_rate}Hz, Buffer Size:{" "}
              {audioProcessor.buffer_size}
            </p>
            <button
              onClick={testSineWave}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Generate Sine Wave
            </button>
            <button
              onClick={testAudioProcess}
              className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
            >
              Process Audio
            </button>
          </div>
        )}

        <div className="bg-gray-100 p-3 rounded">
          <h3 className="font-semibold mb-1">Output:</h3>
          <p className="text-sm">{output}</p>
        </div>
      </div>
    </div>
  );
};

export default WasmDemo;
