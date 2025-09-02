import type { ShareableMap } from "shared-memory-datastructures";

export const ongen = {
	sineWaveOscillator: {
		wasm: null as import("../wasm-lib/pkg/wasm_lib").SineOscillator | null,
		wasmModule: null as null | typeof import("../wasm-lib/pkg/wasm_lib.js"),
		wasmInitialized: false,
		loadWasm: async function () {
			if (!this.wasmModule) {
				this.wasmModule = await import("../wasm-lib/pkg/wasm_lib.js");
			}
			if (!this.wasmInitialized) {
				const wasmUrl = new URL(
					"../wasm-lib/pkg/wasm_lib_bg.wasm",
					import.meta.url
				).href;
				await (
					this.wasmModule as typeof import("../wasm-lib/pkg/wasm_lib.js")
				).default(wasmUrl);
				this.wasmInitialized = true;
			}
			return this.wasmModule;
		},
		parameters: ["sineWaveFrequency", "sineWaveAmplitude", "sineWaveActive"],
		process: async function (
			sampleRate: number,
			sharedMemory: ShareableMap<string, number>,
			length: number
		) {
			if (!sharedMemory.get("sineWaveActive")) return;
			if (!this.wasm) {
				const wasmModule = await this.loadWasm();
				const SineOscillator = wasmModule.SineOscillator;
				this.wasm = new SineOscillator(sampleRate);
			}
			const frequency = sharedMemory.get("sineWaveFrequency") || 440;
			const amplitude = sharedMemory.get("sineWaveAmplitude") || 0.5;
			return this.wasm.process(length, frequency, amplitude);
		},
	},
};
