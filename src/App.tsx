import React, { useCallback, useEffect, useRef, useState } from "react";
import PianoRoll, { type Note } from "./daw/Piano";

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

	// Transport / playback simple state (play/pause only placeholder)
	const [isPlaying, setIsPlaying] = useState(false);

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

	// Melody data (shared parent state). Notes: id, pitch (MIDI), start (beats), length (beats)
	const [notes, setNotes] = useState<Note[]>(() => [
		// Example starter motif
		{ id: crypto.randomUUID(), pitch: 60, start: 0, length: 1 }, // C4
		{ id: crypto.randomUUID(), pitch: 62, start: 1, length: 1 }, // D4
		{ id: crypto.randomUUID(), pitch: 64, start: 2, length: 2 }, // E4
	]);

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
						onClick={() => setIsPlaying((p) => !p)}
					>
						{isPlaying ? "Pause" : "Play"}
					</button>
					<div className="text-xs font-mono text-[#66413d] opacity-70">
						{isPlaying ? "Playing" : "Stopped"}
					</div>
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
							<PianoRoll notes={notes} onChange={setNotes} />
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
					<div className="flex-1 min-h-0 overflow-auto border border-black/10 bg-[#f8f1d6] flex flex-col p-3 gap-2">
						<div className="font-mono text-[11px] leading-tight whitespace-pre overflow-auto max-h-auto">
							{JSON.stringify(notes, null, 2)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default App;
