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
}

// Helper constants
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];
const isBlack = (semi: number) => !WHITE_KEYS.includes(semi % 12);

export const PianoRoll: React.FC<PianoRollProps> = ({
	notes,
	onChange,
	basePitch = 60, // C4
	octaves = 3,
	initialBeats = 16,
	beatWidth = 48,
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
									: "bg-[#f5f9ff] text-[#334255] border-y border-black/10")
							}
							style={{ height: rowHeight, position: "relative" }}
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
			>
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
									top: y + 2,
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
