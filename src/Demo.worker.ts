import {
	ShareableMap,
	type TransferableState,
} from "shared-memory-datastructures";

import { ongen } from "./Demo.ongenmanager";

function startWritingData(
	audioData: Float32Array,
	sharedMemory: TransferableState,
	pointers: Int32Array,
	sampleRate: number
) {
	const sharedState = ShareableMap.fromTransferableState<string, number>(
		sharedMemory
	);

	async function process() {
		const readPointer = Atomics.load(pointers, 0);
		const writePointer = Atomics.load(pointers, 1);

		const availableWrite =
			(readPointer - writePointer - 1 + audioData.length) % audioData.length;

		// if (sharedState.get("isPlaying") !== 1) {
		// 	setTimeout(process, 10);
		// 	return;
		// }

		const bytesToWrite = Math.min(availableWrite, 2048);

		if (bytesToWrite > 0) {
			const buffer = new Float32Array(bytesToWrite);

			for (const _ongen of Object.values(ongen)) {
				console.log("yeeee");
				const result = await _ongen.process(
					sampleRate,
					sharedState,
					bytesToWrite
				);
				if (!result) continue;
				for (let i = 0; i < result.length; i++) {
					buffer[i] += result[i];
				}
			}

			buffer.set(buffer);

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
	const { sab, sharedMemory, pointersSAB, sampleRate } = event.data;

	const audioData = new Float32Array(sab);
	const pointers = new Int32Array(pointersSAB);

	startWritingData(audioData, sharedMemory, pointers, sampleRate);
};
