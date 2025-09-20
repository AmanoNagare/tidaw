import React, { useEffect, useMemo, useRef, useState } from "react";

// Types
export interface Note {
	id: string;
	pitch: number; // MIDI number (inclusive range we'll use)
	start: number; // in beats
	length: number; // in beats
}

export interface PianoRollProps {
	notes: Note[];
	onChange(notes: Note[]): void;
	/** Lowest MIDI pitch (inclusive). Default C4 (60). */
	basePitch?: number;
	/** Minimum octaves to show. Component may auto-increase to fill available vertical space. */
	octaves?: number;
	/** Initial minimum beats to allocate horizontally before dynamic expansion. */
	initialBeats?: number;
	/** Pixels per beat (acts as a zoom level). */
	beatWidth?: number;
	/** Current playhead position in beats (optional). */
	playheadBeat?: number;
	/** Optional callback to request external seek when user wheel-scrolls. */
	onSeekRequest?: (beat: number) => void;
}

// Helper constants
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];
const isBlack = (semi: number) => !WHITE_KEYS.includes(semi % 12);

export const PianoRoll: React.FC<PianoRollProps> = ({
	notes,
	onChange,
	basePitch = 40, // C4
	octaves = 3,
	initialBeats = 16,
	beatWidth = 48,
	playheadBeat,
	onSeekRequest,
}) => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const rowHeight = 20; // px per semitone row

	// Auto-fit octaves to container height: measure and compute required octaves so rows fill the panel.
	// We never go below the provided `octaves` value; only expand if extra vertical space exists.
	const [fittedOctaves, setFittedOctaves] = useState(octaves);
	useEffect(() => {
		if (!containerRef.current) return;
		const resize = () => {
			if (!containerRef.current) return;
			const h = containerRef.current.clientHeight;
			const possible = Math.max(octaves, Math.ceil(h / (rowHeight * 12))); // if container taller, increase octaves
			setFittedOctaves(possible);
		};
		resize();
		window.addEventListener("resize", resize);
		return () => window.removeEventListener("resize", resize);
	}, [octaves]);

	const totalSemis = fittedOctaves * 12;
	const highest = basePitch + totalSemis - 1;
	const pianoRef = useRef<HTMLDivElement | null>(null);
	const gridRef = useRef<HTMLDivElement | null>(null);
	const playheadRef = useRef<HTMLDivElement | null>(null);
	const playheadDragRef = useRef<null | { grabbing: boolean }>(null);
	const [dragging, setDragging] = useState<null | {
		mode: "create" | "move";
		noteId?: string;
		originStart: number;
		originLength: number;
		pitch: number;
	}>(null);

	// Build pitch rows top->bottom
	const pitches = useMemo(() => {
		const arr: number[] = [];
		for (let p = highest; p >= basePitch; p--) arr.push(p);
		return arr;
	}, [highest, basePitch]);

	// Dynamic width: grows with content. Ensure at least `initialBeats`; add small tail padding for new notes.
	const maxEnd = notes.reduce((m, n) => Math.max(m, n.start + n.length), 0);
	const dynamicBeats = Math.max(initialBeats, Math.ceil(maxEnd + 4));
	const totalWidth = dynamicBeats * beatWidth;

	const pitchToY = (pitch: number) => (highest - pitch) * rowHeight;

	const snap = (beat: number) => {
		const grid = 0.25; // quarter beat (16th note) snap
		return Math.round(beat / grid) * grid;
	};

	// Pointer → beat conversion accounts for horizontal scrollLeft so notes are placed correctly after scrolling.
	const handlePointerDown = (e: React.PointerEvent, pitch: number) => {
		if (!gridRef.current) return;
		const rect = gridRef.current.getBoundingClientRect();
		// Compensate for horizontal scroll
		const scrollLeft = gridRef.current.scrollLeft;
		const x = e.clientX - rect.left + scrollLeft;
		const beat = snap(x / beatWidth);
		if (e.button === 2) return; // context (removal handled on note blocks)

		// Determine if clicking existing note for move
		const hit = notes.find(
			(n) => pitch === n.pitch && beat >= n.start && beat <= n.start + n.length
		);
		if (hit) {
			setDragging({
				mode: "move",
				noteId: hit.id,
				originStart: hit.start,
				originLength: hit.length,
				pitch,
			});
		} else {
			// create new note (1 beat initial)
			const newNote: Note = {
				id: crypto.randomUUID(),
				pitch,
				start: beat,
				length: 1,
			};
			onChange([...notes, newNote]);
			setDragging({
				mode: "create",
				noteId: newNote.id,
				originStart: beat,
				originLength: 1,
				pitch,
			});
		}
	};

	// While dragging, continuously map pointer X + scrollLeft to snapped beat.
	const handlePointerMove = (e: React.PointerEvent) => {
		if (!dragging) return;
		if (!gridRef.current) return;
		const rect = gridRef.current.getBoundingClientRect();
		const scrollLeft = gridRef.current.scrollLeft;
		const x = e.clientX - rect.left + scrollLeft;
		const beat = snap(x / beatWidth);

		onChange(
			notes.map((n) => {
				if (n.id !== dragging.noteId) return n;
				if (dragging.mode === "create") {
					const newLength = Math.max(0.25, beat - dragging.originStart);
					return { ...n, length: newLength };
				} else {
					// move
					const delta = beat - dragging.originStart;
					return {
						...n,
						start: Math.max(0, dragging.originStart + delta),
						pitch: dragging.pitch,
					};
				}
			})
		);
	};

	const handlePointerUp = () => setDragging(null);

	const handleContextOnNote = (e: React.MouseEvent, id: string) => {
		e.preventDefault();
		onChange(notes.filter((n) => n.id !== id));
	};

	// Keep playhead element aligned during scroll when active
	useEffect(() => {
		if (!gridRef.current || !playheadRef.current) return;
		if (playheadBeat == null) return;
		const x = playheadBeat * beatWidth;
		playheadRef.current.style.transform = `translateX(${x}px)`;
		// Auto-scroll: if playhead is beyond right edge, reposition so it appears ~10% from left
		const g = gridRef.current;
		const leftVisible = g.scrollLeft;
		const rightVisible = leftVisible + g.clientWidth;
		if (x > rightVisible - 20) {
			const target = Math.max(0, x - g.clientWidth * 0.1);
			g.scrollTo({ left: target });
		}
	}, [playheadBeat, beatWidth]);

	// Drag handlers for playhead
	useEffect(() => {
		if (!gridRef.current || !onSeekRequest) return;
		const g = gridRef.current;
		function onMove(e: PointerEvent) {
			if (!playheadDragRef.current?.grabbing) return;
			const rect = g.getBoundingClientRect();
			const x = e.clientX - rect.left + g.scrollLeft;
			const beat = x / beatWidth;
			onSeekRequest?.(Math.max(0, beat));
		}
		function onUp() {
			if (playheadDragRef.current) playheadDragRef.current.grabbing = false;
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		}
		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerup", onUp);
		return () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", onUp);
		};
	}, [onSeekRequest, beatWidth]);

	// Wheel seek: horizontal (shift+wheel OR trackpad), vertical wheel maps to +/- beats
	const handleWheel = (e: React.WheelEvent) => {
		if (!onSeekRequest) return;
		if (playheadBeat == null) return;
		// Prevent the container from scrolling vertically (we only have horizontal anyway)
		e.preventDefault();
		// Determine delta beats. Use wheel deltaX or deltaY depending on gesture.
		const deltaPx =
			Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
		// Invert so wheel down moves forward
		const direction = deltaPx > 0 ? 1 : -1;
		const magnitude = Math.min(240, Math.abs(deltaPx));
		// Scale: 120 wheel units ~ 1 beat (tweakable)
		const deltaBeats = (magnitude / 120) * direction;
		const next = Math.max(0, playheadBeat + deltaBeats);
		onSeekRequest(next);
	};

	// Looping: when the external playhead (playheadBeat) passes the end of all notes,
	// automatically wrap back to 0. We consider the melody end to be the maximum end
	// (start + length) of any note. Add a small epsilon so floating point rounding
	// during playback doesn't prematurely trigger the loop.
	const lastNoteEnd = useMemo(
		() => notes.reduce((m, n) => Math.max(m, n.start + n.length), 0),
		[notes]
	);
	const loopGuardRef = useRef<number | null>(null);
	useEffect(() => {
		if (!onSeekRequest) return; // no seeking possible
		if (playheadBeat == null) return; // no playhead being driven
		if (lastNoteEnd <= 0) return; // nothing to loop
		// Only loop if we've genuinely passed (>) the end.
		const epsilon = 1e-4;
		if (playheadBeat > lastNoteEnd + epsilon) {
			// Guard against spamming seek requests if parent updates are asynchronous.
			if (
				loopGuardRef.current === null ||
				playheadBeat > loopGuardRef.current
			) {
				loopGuardRef.current = playheadBeat; // record the point we looped from
				onSeekRequest(0);
				// Scroll viewport back to beginning so user immediately sees restart.
				if (gridRef.current) {
					gridRef.current.scrollTo({ left: 0 });
				}
			}
		} else if (playheadBeat < lastNoteEnd - 1) {
			// Reset guard once we are clearly before the end again (gives a little hysteresis)
			loopGuardRef.current = null;
		}
	}, [playheadBeat, lastNoteEnd, onSeekRequest]);

	return (
		<div
			ref={containerRef}
			className="flex h-full w-full select-none"
			onPointerUp={handlePointerUp}
			onPointerLeave={handlePointerUp}
			onPointerMove={handlePointerMove}
		>
			{/* Piano */}
			<div
				ref={pianoRef}
				className="flex flex-col border-r border-black/20 bg-[#e7eef7]"
				style={{ width: 72 }}
			>
				{pitches.map((p) => {
					const semi = p % 12;
					const black = isBlack(semi);
					return (
						<div
							key={p}
							className={
								"flex items-center pr-1 justify-end text-[10px] font-medium box-border " +
								(black
									? "bg-[#5b6d82] text-white"
									: "bg-[#f5f9ff] text-[#334255]")
							}
							style={{
								height: rowHeight + 4,
								position: "relative",
								borderBottom: "1px solid rgba(30,55,90,0.15)",
							}}
						>
							{!black && <span>{noteName(p)}</span>}
							<button
								onPointerDown={(e) =>
									handlePointerDown(e as React.PointerEvent, p)
								}
								className="absolute inset-0 w-full h-full"
								style={{ cursor: "pointer", background: "transparent" }}
							/>
						</div>
					);
				})}
			</div>
			{/* Scrollable grid */}
			<div
				className="relative flex-1 overflow-x-auto overflow-y-hidden"
				ref={gridRef}
				onContextMenu={(e) => e.preventDefault()}
				onWheel={handleWheel}
			>
				{/* Playhead overlay (positioned via transform for performance) */}
				{playheadBeat != null && (
					<div
						ref={playheadRef}
						className="absolute top-0 h-full w-px bg-red-500 z-20 group/playhead"
						style={{ left: 0, cursor: "ew-resize" }}
						onPointerDown={(e) => {
							if (e.button !== 0) return;
							playheadDragRef.current = { grabbing: true };
							document.body.style.cursor = "ew-resize";
							document.body.style.userSelect = "none";
						}}
					>
						{/* Handle knob */}
						<div
							className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-sm bg-red-500 shadow pointer-events-none"
							style={{
								boxShadow: "0 0 0 1px #fff,0 0 2px 1px rgba(0,0,0,0.4)",
							}}
						/>
					</div>
				)}
				<div
					style={{
						width: totalWidth,
						height: rowHeight * totalSemis,
						position: "relative",
					}}
				>
					{/* Grid background */}
					{pitches.map((p) => {
						const y = pitchToY(p);
						const semi = p % 12;
						const black = isBlack(semi);
						return (
							<div
								key={p}
								className="absolute left-0 w-full"
								style={{
									top: y,
									height: rowHeight,
									background: black ? "#d0d9e6" : "#eef4fa",
									borderBottom: "1px solid rgba(30,55,90,0.15)",
								}}
								onPointerDown={(e) =>
									handlePointerDown(e as React.PointerEvent, p)
								}
							/>
						);
					})}
					{/* Vertical beat lines */}
					{Array.from({ length: dynamicBeats + 1 }).map((_, i) => (
						<div
							key={i}
							className="absolute top-0 h-full"
							style={{
								width: 1,
								left: i * beatWidth,
								background:
									i % 4 === 0 ? "rgba(40,60,90,0.5)" : "rgba(40,60,90,0.18)",
							}}
						/>
					))}
					{/* Notes */}
					{notes.map((n) => {
						const y = pitchToY(n.pitch);
						return (
							<div
								key={n.id}
								onPointerDown={(e) => {
									if (e.button === 2) return; // context removal handled separately
									// start move
									setDragging({
										mode: "move",
										noteId: n.id,
										originStart: n.start,
										originLength: n.length,
										pitch: n.pitch,
									});
								}}
								onContextMenu={(e) => handleContextOnNote(e, n.id)}
								className="absolute rounded-none text-[10px] flex items-center justify-center font-medium text-[#1e2c3d] shadow-sm"
								style={{
									top: y + 1,
									height: rowHeight - 4,
									left: n.start * beatWidth,
									width: Math.max(4, n.length * beatWidth - 2),
									cursor:
										dragging?.noteId === n.id
											? dragging.mode === "move"
												? "grabbing"
												: "ew-resize"
											: "grab",
									border: "1px solid rgba(40,60,90,0.35)",
									background: "linear-gradient(180deg,#b6e6d9,#a0ddcf)",
								}}
								title={noteName(n.pitch)}
							>
								{noteName(n.pitch)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

// Simple note name helper (assumes sharps)
function noteName(midi: number): string {
	const names = [
		"C",
		"C#",
		"D",
		"D#",
		"E",
		"F",
		"F#",
		"G",
		"G#",
		"A",
		"A#",
		"B",
	];
	const name = names[midi % 12];
	const octave = Math.floor(midi / 12) - 1; // MIDI standard
	return name + octave;
}

export default PianoRoll;
