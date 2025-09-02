import * as React from "react";
import { ShareableMap } from "shared-memory-datastructures";
import { ongen } from "./Demo.ongenmanager";

// デモ用のシンプルなオーディオプレーヤー
export default function App() {
	const [setup, setSetup] = React.useState(false);
	const [playing, setPlaying] = React.useState(false);
	const [frequency, setFrequency] = React.useState(50);

	const audioStuff = React.useRef({
		worker: null as Worker | null,
		sharedState: new ShareableMap<string, number>(),
		audioContext: null as AudioContext | null,
	});

	async function setupAudio() {
		audioStuff.current.audioContext = new (window.AudioContext ||
			// @ts-expect-error Safariブラウザは webkitAudioContext を使う
			window.webkitAudioContext)();

		const sampleRate = audioStuff.current.audioContext.sampleRate;
		const bufferSize = sampleRate * 0.1 * 2; // 0.1秒、2チャンネル
		const sab = new SharedArrayBuffer(
			bufferSize * Float32Array.BYTES_PER_ELEMENT
		); // 共有メモリ

		const pointersSAB = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2);

		await audioStuff.current.audioContext.audioWorklet.addModule(
			new URL("./Demo.workletmodule.ts", import.meta.url)
		);

		const workletNode = new AudioWorkletNode(
			audioStuff.current.audioContext,
			"demo-processor",
			{
				processorOptions: { sab, pointersSAB },
				numberOfOutputs: 1,
				outputChannelCount: [2],
			}
		);

		workletNode.connect(audioStuff.current.audioContext.destination);

		audioStuff.current.worker = new Worker(
			new URL("./Demo.worker.ts", import.meta.url),
			{
				type: "module",
			}
		);

		audioStuff.current.worker.postMessage({
			sab,
			sampleRate,
			sharedMemory: audioStuff.current.sharedState.toTransferableState(),
			pointersSAB,
		});
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-900">
			{!setup && (
				<button
					className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
					onClick={async () => {
						await setupAudio();
						setSetup(true);
					}}
				>
					Setup Audio
				</button>
			)}
			<button
				className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
				onClick={() => {
					const sineWaveActive = ongen.sineWaveOscillator.parameters[2];
					audioStuff.current.sharedState.set(sineWaveActive, playing ? 0 : 1);
					setPlaying(!playing);
				}}
			>
				{playing ? "Pause" : "Play"}
			</button>
			<input
				type="range"
				min="0"
				max="20000"
				className="w-40 accent-blue-600"
				value={frequency}
				onChange={(e) => {
					const v = Number(e.target.value);
					setFrequency(v);
					const sineWaveFrequency = ongen.sineWaveOscillator.parameters[0];
					audioStuff.current.sharedState.set(sineWaveFrequency, v);
				}}
			/>
			<span className="text-white">{frequency}</span>
		</div>
	);
}
