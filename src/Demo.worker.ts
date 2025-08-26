import {
	ShareableMap,
	type TransferableState,
} from "shared-memory-datastructures";
import init, { SineOscillator } from "wasm-lib";

function startWritingData(
	audioData: Float32Array,
	sharedMemory: TransferableState,
	pointers: Int32Array,
	sineOscillator: SineOscillator
) {
	const sharedState = ShareableMap.fromTransferableState<string, number>(
		sharedMemory
	);

	function process() {
		const readPointer = Atomics.load(pointers, 0);
		const writePointer = Atomics.load(pointers, 1);

		const availableWrite =
			(readPointer - writePointer - 1 + audioData.length) % audioData.length;

		if (sharedState.get("isPlaying") !== 1) {
			setTimeout(process, 10);
			return;
		}

		const bytesToWrite = Math.min(availableWrite, 2048);

		if (bytesToWrite > 0) {
			const frequency = sharedState.get("frequency") || 440;
			const buffer = new Float32Array(bytesToWrite);

			buffer.set(sineOscillator.process(bytesToWrite, frequency, 1));

			let currentWritePointer = writePointer;
			for (let i = 0; i < bytesToWrite; i++) {
				audioData[currentWritePointer] = buffer[i];
				currentWritePointer = (currentWritePointer + 1) % audioData.length;
			}

			Atomics.store(pointers, 1, currentWritePointer);
		}

		setTimeout(process, 0);
	}

	process();
}

self.onmessage = async (event) => {
	const { sab, sharedMemory, sampleRate, pointersSAB } = event.data;

	const audioData = new Float32Array(sab);
	const pointers = new Int32Array(pointersSAB);

	await init(); // initialize WASM module
	const sineOscillator = new SineOscillator(sampleRate);

	startWritingData(audioData, sharedMemory, pointers, sineOscillator);
};
