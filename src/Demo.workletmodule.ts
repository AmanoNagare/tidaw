// これ↓は AudioWorklet 環境下で実行されるファイルであることを TypeScript に伝える（`npm install --save-dev @types/audioworklet`）
/// <reference lib="webworker" />

class SabPlayerProcessor extends AudioWorkletProcessor {
	sab: SharedArrayBuffer;
	audioData: Float32Array;
	pointersSAB: SharedArrayBuffer;
	pointersData: Int32Array;

	constructor(options: {
		processorOptions: {
			sab: SharedArrayBuffer;
			pointersSAB: SharedArrayBuffer;
		};
	}) {
		super();
		this.sab = options.processorOptions.sab;
		this.audioData = new Float32Array(this.sab);
		this.pointersSAB = options.processorOptions.pointersSAB;
		this.pointersData = new Int32Array(this.pointersSAB);
	}

	// 〜2ミリ秒毎に実行される
	process(_: Float32Array[][], outputs: Float32Array[][]) {
		const output = outputs[0];
		const leftChannel = output[0];
		const rightChannel = output[1];

		let readPointer = Atomics.load(this.pointersData, 0);
		const writePointer = Atomics.load(this.pointersData, 1);

		const availableRead =
			(writePointer - readPointer + this.audioData.length) %
			this.audioData.length;

		if (availableRead < leftChannel.length * 2) {
			return true;
		}

		for (let i = 0; i < leftChannel.length; i++) {
			leftChannel[i] = this.audioData[readPointer];
			rightChannel[i] =
				this.audioData[(readPointer + 1) % this.audioData.length];
			readPointer = (readPointer + 2) % this.audioData.length;
		}

		Atomics.store(this.pointersData, 0, readPointer);

		return true;
	}
}

registerProcessor("demo-processor", SabPlayerProcessor);
