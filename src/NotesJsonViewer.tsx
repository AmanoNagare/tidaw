import React, { useEffect, useMemo, useRef } from "react";

// Re-using Note type from Piano (import local to avoid deep coupling)
export interface ViewerNote {
	id: string;
	pitch: number; // midi
	start: number; // beats
	length: number; // beats
}

interface NotesJsonViewerProps {
	notes: ViewerNote[];
	// Two mutually exclusive ways to supply active note highlighting:
	// 1. Provide playheadBeat (component derives active note)
	// 2. Provide activeNoteId (direct highlight) - takes precedence if present
	playheadBeat?: number;
	activeNoteId?: string | null;
	isPlaying: boolean;
	onSeek?: (beat: number) => void;
	bpm: number; // to compute frequency/time convenience info
	pitchShift: number;
}

// Utility: midi -> freq
const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const noteNames = [
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
const midiToName = (m: number) => {
	const n = noteNames[m % 12];
	const oct = Math.floor(m / 12) - 1; // MIDI standard
	return `${n}${oct}`;
};

const pad = (v: number, digits = 2) => v.toString().padStart(digits, "0");

export const NotesJsonViewer: React.FC<NotesJsonViewerProps> = ({
	notes,
	playheadBeat,
	activeNoteId,
	isPlaying,
	onSeek,
	bpm,
	pitchShift,
}) => {
	// Determine active note if not explicitly provided (simple: playhead within [start, start+length))
	const derivedActive = useMemo(() => {
		if (activeNoteId !== undefined) return activeNoteId;
		if (playheadBeat == null) return null;
		return (
			notes.find(
				(n) => playheadBeat >= n.start && playheadBeat < n.start + n.length
			)?.id || null
		);
	}, [notes, playheadBeat, activeNoteId]);

	const containerRef = useRef<HTMLDivElement | null>(null);
	const activeRowRef = useRef<HTMLDivElement | null>(null);

	// Simple auto-scroll: center the current note when it changes (no highlight styling)
	useEffect(() => {
		if (!isPlaying) return;
		if (activeRowRef.current) {
			try {
				activeRowRef.current.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
			} catch {
				/* ignore */
			}
		}
	}, [derivedActive, isPlaying]);

	// Precompute enhanced info lines.
	const rows = useMemo(() => {
		return notes
			.slice()
			.sort((a, b) => a.start - b.start || a.pitch - b.pitch)
			.map((n, idx) => {
				const end = n.start + n.length;
				const freq = midiToFreq(n.pitch) * Math.pow(2, pitchShift / 12);
				const seconds = (n.start * 60) / bpm;
				const endSeconds = (end * 60) / bpm;
				return { n, idx, end, freq, seconds, endSeconds };
			});
	}, [notes, bpm, pitchShift]);

	return (
		<div className="flex flex-col h-full">
			<div className="text-[10px] font-semibold tracking-wide uppercase text-[#6b561a] mb-1 opacity-70">
				Notes
			</div>
			<div
				ref={containerRef}
				className="flex-1 overflow-auto rounded border border-black/10 bg-[#fffceb] font-mono text-[11px] leading-tight pr-1"
			>
				<div className="sticky top-0 z-10 bg-[#f4e9b7] border-b border-black/10 px-2 py-1 flex gap-4 text-[10px] font-semibold">
					<span className="w-8">#</span>
					<span className="w-12">Pitch</span>
					<span className="w-12">Name</span>
					<span className="w-14 text-right">Start</span>
					<span className="w-14 text-right">Len</span>
					<span className="w-14 text-right">End</span>
					<span className="w-16 text-right">Hz*</span>
					<span className="w-20 text-right">t (s)</span>
				</div>
				{rows.map(({ n, idx, end, freq, seconds, endSeconds }) => {
					const isActive = n.id === derivedActive;
					return (
						<div
							key={n.id}
							ref={isActive ? activeRowRef : null}
							onClick={() => onSeek?.(n.start)}
							className={
								"flex items-center gap-4 cursor-pointer px-2 py-[3px] border-b border-black/5 transition-colors " +
								(idx % 2 === 0
									? "bg-[#fffdf4] hover:bg-[#fff3cf]"
									: "bg-[#fff8dd] hover:bg-[#ffefc3]")
							}
							title="Click to seek playhead to this note's start"
						>
							<span className="w-8 text-[10px] opacity-60">{pad(idx)}</span>
							<span className="w-12">{n.pitch}</span>
							<span className="w-12">{midiToName(n.pitch)}</span>
							<span className="w-14 text-right tabular-nums">
								{n.start.toFixed(2)}
							</span>
							<span className="w-14 text-right tabular-nums">
								{n.length.toFixed(2)}
							</span>
							<span className="w-14 text-right tabular-nums">
								{end.toFixed(2)}
							</span>
							<span className="w-16 text-right tabular-nums">
								{freq.toFixed(1)}
							</span>
							<span className="w-20 text-right tabular-nums">
								{seconds.toFixed(2)}-{endSeconds.toFixed(2)}
							</span>
						</div>
					);
				})}
				<div className="px-2 py-2 text-[10px] opacity-60">
					* Hz reflects current pitchShift. Total notes: {rows.length}
				</div>
			</div>
		</div>
	);
};

export default NotesJsonViewer;
