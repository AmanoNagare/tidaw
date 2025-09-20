import React, { useCallback, useEffect, useRef, useState } from "react";
import PianoRoll, { type Note } from "./daw/Piano";
import { ShareableMap } from "shared-memory-datastructures";
import { ongen } from "./Demo.ongenmanager";
import rawNotes from "./daw/melodies.json"; // typed as any by default
import NotesJsonViewer from "./NotesJsonViewer";

// Basic resizable 3-way split layout:
//  - Fixed height top bar
//  - Remaining area: left panel (resizable width) and right side (fills rest)
//  - Right side split horizontally into top and bottom (resizable height)

const TOP_BAR_HEIGHT = 56; // px fixed
const MIN_LEFT_WIDTH = 160; // px
// Max left width now dynamic: 2/3 of available width. Keep a hard ceiling fallback.
const HARD_MAX_LEFT_WIDTH = 1200; // safety upper bound
const MIN_RIGHT_SECTION_HEIGHT = 120; // px

const clamp = (v: number, min: number, max: number) =>
	Math.min(Math.max(v, min), max);

const App: React.FC = () => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [leftWidth, setLeftWidth] = useState<number>(() => {
		const stored = localStorage.getItem("layout:leftWidth");
		return stored ? parseFloat(stored) : 280;
	});
	const [rightTopHeight, setRightTopHeight] = useState<number>(() => {
		const stored = localStorage.getItem("layout:rightTopHeight");
		return stored ? parseFloat(stored) : 300;
	});

	// Transport / playback state
	const [isPlaying, setIsPlaying] = useState(false);
	const [playheadSeconds, setPlayheadSeconds] = useState(0); // UI state (mirrors shared)
	// Currently sounding note id (for lightweight highlighting without per-frame list rerender)
	const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
	const BPM = 120; // simple constant tempo (future: make adjustable)

	// Melody data
	type RawNote = { pitch: number; start: number; length: number };
	const [notes, setNotes] = useState<Note[]>(() =>
		(rawNotes as RawNote[]).map((v) => ({
			id: crypto.randomUUID(),
			pitch: Number(v.pitch),
			start: Number(v.start),
			length: Number(v.length),
		}))
	);
	// Derived maximum beat for seek bar (add small tail padding)
	const maxEndBeat = notes.reduce((m, n) => Math.max(m, n.start + n.length), 0);

	// Audio / shared memory refs (mirrors Demo.tsx but embedded here)
	const audioStuff = useRef<{
		worker: Worker | null;
		sharedState: ShareableMap<string, number | string>;
		transportState: ShareableMap<string, number>; // playhead etc.
		audioContext: AudioContext | null;
		setupDone: boolean;
	}>({
		worker: null,
		sharedState: new ShareableMap<string, number | string>(),
		transportState: new ShareableMap<string, number>(),
		audioContext: null,
		setupDone: false,
	});

	const ensureAudioSetup = useCallback(async () => {
		if (audioStuff.current.setupDone) return;
		const ctx = new (window.AudioContext ||
			// @ts-expect-error safari
			window.webkitAudioContext)();
		audioStuff.current.audioContext = ctx;
		const sampleRate = ctx.sampleRate;
		const bufferSize = sampleRate * 0.1 * 2; // 0.1s * 2ch
		const sab = new SharedArrayBuffer(
			bufferSize * Float32Array.BYTES_PER_ELEMENT
		);
		const pointersSAB = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2);
		await ctx.audioWorklet.addModule(
			new URL("./Demo.workletmodule.ts", import.meta.url)
		);
		const workletNode = new AudioWorkletNode(ctx, "demo-processor", {
			processorOptions: { sab, pointersSAB },
			numberOfOutputs: 1,
			outputChannelCount: [2],
		});
		workletNode.connect(ctx.destination);
		const worker = new Worker(new URL("./Demo.worker.ts", import.meta.url), {
			type: "module",
		});
		worker.postMessage({
			sab,
			sampleRate,
			sharedMemory: audioStuff.current.sharedState.toTransferableState(),
			pointersSAB,
		});
		// Initialize default oscillator params
		const sineWaveFrequency = ongen.sineWaveOscillator.parameters[0];
		const sineWaveAmplitude = ongen.sineWaveOscillator.parameters[1];
		const sineWaveActive = ongen.sineWaveOscillator.parameters[2];
		audioStuff.current.sharedState.set(sineWaveFrequency, 440);
		audioStuff.current.sharedState.set(sineWaveAmplitude, 0);
		audioStuff.current.sharedState.set(sineWaveActive, 0);
		audioStuff.current.worker = worker;
		audioStuff.current.setupDone = true;
	}, []);

	// Persist notes JSON into shared state whenever they change (for potential worker-side usage later)
	useEffect(() => {
		if (!audioStuff.current.setupDone) return; // still store once setup
		try {
			audioStuff.current.sharedState.set("notesJson", JSON.stringify(notes));
		} catch {
			/* ignore */
		}
	}, [notes]);

	// Volume (0..1) and pitch shift (-12..12 semitones) shared state
	const [volume, setVolume] = useState<number>(() => {
		const v = localStorage.getItem("control:volume");
		return v ? parseFloat(v) : 0.8;
	});
	const [pitchShift, setPitchShift] = useState<number>(() => {
		const p = localStorage.getItem("control:pitchShift");
		return p ? parseFloat(p) : 0;
	});

	useEffect(() => {
		localStorage.setItem("control:volume", String(volume));
	}, [volume]);
	useEffect(() => {
		localStorage.setItem("control:pitchShift", String(pitchShift));
	}, [pitchShift]);

	// Scheduling refs
	const playbackStartRef = useRef<number | null>(null);
	const triggeredRef = useRef<Set<string>>(new Set());
	const activeNoteRef = useRef<Note | null>(null);
	const lastDisplayedRef = useRef(0); // throttle UI playhead state updates

	// Convert MIDI to frequency
	const midiToFreq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

	// Main playhead + scheduler loop
	useEffect(() => {
		if (!isPlaying) return;
		let raf: number;
		let stopped = false;
		const sortedNotes = [...notes].sort((a, b) => a.start - b.start);
		const loop = () => {
			if (stopped) return;
			const now = performance.now();
			if (playbackStartRef.current == null) playbackStartRef.current = now;
			const elapsedMs = now - playbackStartRef.current;
			const secs = elapsedMs / 1000;
			const currentBeat = secs * (BPM / 60);
			// Throttle UI playhead state updates (~30fps)
			if (secs - lastDisplayedRef.current >= 1 / 30) {
				lastDisplayedRef.current = secs;
				setPlayheadSeconds(secs);
				try {
					audioStuff.current.transportState.set("playheadSeconds", secs);
				} catch {
					/* ignore */
				}
			}

			// Trigger any notes whose start has been reached and not yet triggered
			for (const n of sortedNotes) {
				if (!triggeredRef.current.has(n.id) && currentBeat >= n.start) {
					triggeredRef.current.add(n.id);
					activeNoteRef.current = n;
					setActiveNoteId(n.id);
					const freqKey = ongen.sineWaveOscillator.parameters[0];
					const ampKey = ongen.sineWaveOscillator.parameters[1];
					const activeKey = ongen.sineWaveOscillator.parameters[2];
					const baseFreq = midiToFreq(n.pitch);
					const shifted = baseFreq * Math.pow(2, pitchShift / 12);
					const amp = 0.5 * volume;
					if (audioStuff.current.setupDone) {
						audioStuff.current.sharedState.set(freqKey, shifted);
						audioStuff.current.sharedState.set(ampKey, amp);
						audioStuff.current.sharedState.set(activeKey, 1);
					}
				}
			}
			// Handle release
			if (activeNoteRef.current) {
				const n = activeNoteRef.current;
				const endBeat = n.start + n.length;
				if (currentBeat >= endBeat) {
					const ampKey = ongen.sineWaveOscillator.parameters[1];
					const activeKey = ongen.sineWaveOscillator.parameters[2];
					if (audioStuff.current.setupDone) {
						audioStuff.current.sharedState.set(ampKey, 0);
						audioStuff.current.sharedState.set(activeKey, 0);
					}
					activeNoteRef.current = null;
					setActiveNoteId(null);
				}
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => {
			stopped = true;
			cancelAnimationFrame(raf);
		};
	}, [isPlaying, notes, pitchShift, volume]);

	// On play toggled (resume from current playhead position)
	const togglePlay = useCallback(async () => {
		if (!isPlaying) {
			await ensureAudioSetup();
			triggeredRef.current.clear();
			activeNoteRef.current = null;
			playbackStartRef.current = performance.now() - playheadSeconds * 1000;
			const currentBeat = playheadSeconds * (BPM / 60);
			for (const n of notes)
				if (n.start < currentBeat) triggeredRef.current.add(n.id);
		} else {
			// Pausing: force oscillator off immediately
			const ampKey = ongen.sineWaveOscillator.parameters[1];
			const activeKey = ongen.sineWaveOscillator.parameters[2];
			if (audioStuff.current.setupDone) {
				audioStuff.current.sharedState.set(ampKey, 0);
				audioStuff.current.sharedState.set(activeKey, 0);
			}
			activeNoteRef.current = null;
			setActiveNoteId(null);
		}
		setIsPlaying((p) => !p);
	}, [isPlaying, ensureAudioSetup, playheadSeconds, notes]);

	// Seek to beat helper (updates internal scheduling state)
	const seekToBeat = useCallback(
		(beat: number) => {
			const secs = (beat * 60) / BPM;
			setPlayheadSeconds(secs);
			triggeredRef.current.clear();
			activeNoteRef.current = null;
			playbackStartRef.current = performance.now() - secs * 1000;
			for (const n of notes) if (n.start < beat) triggeredRef.current.add(n.id);
		},
		[notes]
	);

	// If user edits notes mid-play we won't rewind old triggers; future improvement.

	// Persist sizes
	useEffect(() => {
		localStorage.setItem("layout:leftWidth", String(leftWidth));
	}, [leftWidth]);
	useEffect(() => {
		localStorage.setItem("layout:rightTopHeight", String(rightTopHeight));
	}, [rightTopHeight]);

	const resizingRef = useRef<null | {
		type: "vertical" | "horizontal";
		start: number;
		initial: number;
	}>(null);

	const onMouseMove = useCallback((e: MouseEvent) => {
		if (!resizingRef.current) return;
		if (!containerRef.current) return;
		const { type, start, initial } = resizingRef.current;
		if (type === "vertical") {
			const delta = e.clientX - start;
			setLeftWidth(() => {
				const raw = initial + delta;
				const maxDynamic = containerRef.current
					? Math.min(
							(containerRef.current.clientWidth * 2) / 3,
							HARD_MAX_LEFT_WIDTH
					  )
					: HARD_MAX_LEFT_WIDTH;
				return clamp(raw, MIN_LEFT_WIDTH, maxDynamic);
			});
		} else if (type === "horizontal") {
			const delta = e.clientY - start;
			setRightTopHeight(() => {
				const raw = initial + delta;
				const totalHeight = containerRef.current!.clientHeight - TOP_BAR_HEIGHT;
				const maxTop = totalHeight - MIN_RIGHT_SECTION_HEIGHT - 8; // subtract divider + min bottom
				return clamp(raw, MIN_RIGHT_SECTION_HEIGHT, maxTop);
			});
		}
	}, []);

	const endResize = useCallback(() => {
		resizingRef.current = null;
		document.body.style.userSelect = "";
		document.body.style.cursor = "";
	}, []);

	const startVerticalResize = useCallback(
		(e: React.MouseEvent) => {
			resizingRef.current = {
				type: "vertical",
				start: e.clientX,
				initial: leftWidth,
			};
			document.body.style.userSelect = "none";
			document.body.style.cursor = "col-resize";
		},
		[leftWidth]
	);

	const startHorizontalResize = useCallback(
		(e: React.MouseEvent) => {
			resizingRef.current = {
				type: "horizontal",
				start: e.clientY,
				initial: rightTopHeight,
			};
			document.body.style.userSelect = "none";
			document.body.style.cursor = "row-resize";
		},
		[rightTopHeight]
	);

	useEffect(() => {
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", endResize);
		window.addEventListener("mouseleave", endResize);

		const handleWindowResize = () => {
			if (!containerRef.current) return;
			setLeftWidth((prev) => {
				const maxDynamic = Math.min(
					(containerRef.current!.clientWidth * 2) / 3,
					HARD_MAX_LEFT_WIDTH
				);
				return clamp(prev, MIN_LEFT_WIDTH, maxDynamic);
			});
		};
		window.addEventListener("resize", handleWindowResize);
		handleWindowResize(); // initial clamp if needed
		return () => {
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", endResize);
			window.removeEventListener("mouseleave", endResize);
			window.removeEventListener("resize", handleWindowResize);
		};
	}, [onMouseMove, endResize]);

	return (
		<div
			ref={containerRef}
			className="h-full flex flex-col select-none text-neutral-800 bg-[#f5f7f9]"
		>
			<div
				className="flex items-center border border-black/10 bg-[#ffd9d6] px-4 shrink-0"
				style={{ height: TOP_BAR_HEIGHT }}
			>
				<div className="text-lg font-bold text-[#7a2e24]">TiDAW</div>
				<div className="ml-auto flex items-center gap-4">
					<button
						className="px-4 py-2 text-sm font-semibold tracking-wide bg-[#faecea] hover:bg-[#f7dedb] active:bg-[#f2ceca] border border-black/20 text-[#442522] select-none"
						style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.15)" }}
						onClick={togglePlay}
					>
						{isPlaying ? "Pause" : "Play"}
					</button>
					{(() => {
						const seekTotalBeats = Math.max(8, Math.ceil(maxEndBeat + 4));
						return (
							<div className="flex flex-col gap-1 text-xs font-mono text-[#66413d] opacity-80 min-w-[260px]">
								<div className="flex items-center justify-between">
									<span>{isPlaying ? "Playing" : "Stopped"}</span>
									<span>{playheadSeconds.toFixed(2)}s</span>
									<span>Beat {(playheadSeconds * (BPM / 60)).toFixed(2)}</span>
								</div>
								<div className="flex items-center gap-2">
									<input
										type="range"
										min={0}
										max={seekTotalBeats}
										step={0.01}
										value={playheadSeconds * (BPM / 60)}
										onChange={(e) => seekToBeat(parseFloat(e.target.value))}
										className="flex-1 accent-[#d66] cursor-pointer"
									/>
									<span className="w-10 text-right">{seekTotalBeats}</span>
								</div>
							</div>
						);
					})()}
				</div>
			</div>
			<div className="flex flex-1 min-h-0 relative">
				<div
					className="flex flex-col border border-black/10 bg-[#d6ecff]"
					style={{
						width: leftWidth,
						minWidth: MIN_LEFT_WIDTH,
						maxWidth: containerRef.current
							? Math.min(
									(containerRef.current.clientWidth * 2) / 3,
									HARD_MAX_LEFT_WIDTH
							  )
							: HARD_MAX_LEFT_WIDTH,
					}}
				>
					<div className="flex-1 min-h-0 overflow-hidden">
						<div className="h-full w-full overflow-hidden flex flex-col">
							<PianoRoll
								notes={notes}
								onChange={setNotes}
								playheadBeat={playheadSeconds * (BPM / 60)}
								onSeekRequest={(beat) => {
									// clamp negative and large seeks
									const safe = Math.max(0, beat);
									seekToBeat(safe);
								}}
							/>
						</div>
					</div>
				</div>
				<div
					className="flex-none w-[6px] cursor-col-resize bg-black/10 hover:bg-black/30 transition-colors relative group"
					onMouseDown={startVerticalResize}
				>
					<div className="absolute inset-0 opacity-40 pointer-events-none bg-[repeating-linear-gradient(90deg,#0003_0_2px,transparent_2px_4px)]" />
				</div>
				<div className="flex flex-col flex-1 min-w-0 min-h-0">
					<div
						className="border border-black/10 bg-[#e5ffd6] flex flex-col p-4 gap-6"
						style={{
							height: rightTopHeight,
							minHeight: MIN_RIGHT_SECTION_HEIGHT,
						}}
					>
						<div className="flex flex-col gap-2">
							<label className="text-[11px] font-semibold tracking-wide text-[#314a2d] uppercase">
								Volume{" "}
								<span className="ml-1 text-[10px] font-normal">
									{(volume * 100).toFixed(0)}%
								</span>
							</label>
							<div className="h-8 flex items-center">
								<input
									type="range"
									min={0}
									max={1}
									step={0.01}
									value={volume}
									onChange={(e) => setVolume(parseFloat(e.target.value))}
									className="w-full accent-[#78c59f] cursor-pointer slider-thumb-thick"
								/>
							</div>
						</div>
						<div className="flex flex-col gap-2">
							<label className="text-[11px] font-semibold tracking-wide text-[#314a2d] uppercase">
								Pitch Shift{" "}
								<span className="ml-1 text-[10px] font-normal">
									{pitchShift >= 0 ? "+" : ""}
									{pitchShift} st
								</span>
							</label>
							<div className="h-8 flex items-center">
								<input
									type="range"
									min={-12}
									max={12}
									step={1}
									value={pitchShift}
									onChange={(e) => setPitchShift(parseInt(e.target.value))}
									className="w-full accent-[#78a9c5] cursor-pointer slider-thumb-thick"
								/>
							</div>
						</div>
					</div>
					<div
						className="flex-none h-[6px] cursor-row-resize bg-black/10 hover:bg-black/30 transition-colors relative group"
						onMouseDown={startHorizontalResize}
					>
						<div className="absolute inset-0 opacity-40 pointer-events-none bg-[repeating-linear-gradient(90deg,#0003_0_2px,transparent_2px_4px)]" />
					</div>
					<div className="flex-1 min-h-0 overflow-hidden border border-black/10 bg-[#f8f1d6] flex flex-col p-2">
						<NotesJsonViewer
							notes={notes}
							activeNoteId={activeNoteId}
							isPlaying={isPlaying}
							onSeek={(beat) => seekToBeat(beat)}
							bpm={BPM}
							pitchShift={pitchShift}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default App;
