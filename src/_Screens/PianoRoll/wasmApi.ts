import type { Note } from "./types";

/**
 * WASM API Interface - Placeholder functions that will call WASM module
 *
 * This file contains all the functions that will eventually interface with the WASM module
 * for managing piano roll data, audio processing, and state management.
 *
 * The JavaScript side acts only as a user interface and sends commands to the WASM side.
 */

// ============================================================================
// NOTE MANAGEMENT
// ============================================================================

/**
 * Creates a new note in the WASM state
 * @param note - The note to create
 * @returns Promise<boolean> - Success status
 */
export const createNote = async (
  note: Omit<Note, "id">
): Promise<string | null> => {
  // TODO: Call WASM function to create note
  console.log("WASM: Creating note", note);

  // Placeholder implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      const id = Date.now().toString();
      console.log(`WASM: Note created with ID: ${id}`);
      resolve(id);
    }, 10);
  });
};

/**
 * Updates an existing note in the WASM state
 * @param noteId - The ID of the note to update
 * @param updates - Partial note data to update
 * @returns Promise<boolean> - Success status
 */
export const updateNote = async (
  noteId: string,
  updates: Partial<Note>
): Promise<boolean> => {
  // TODO: Call WASM function to update note
  console.log("WASM: Updating note", noteId, updates);

  // Placeholder implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`WASM: Note ${noteId} updated successfully`);
      resolve(true);
    }, 10);
  });
};

/**
 * Deletes a note from the WASM state
 * @param noteId - The ID of the note to delete
 * @returns Promise<boolean> - Success status
 */
export const deleteNote = async (noteId: string): Promise<boolean> => {
  // TODO: Call WASM function to delete note
  console.log("WASM: Deleting note", noteId);

  // Placeholder implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`WASM: Note ${noteId} deleted successfully`);
      resolve(true);
    }, 10);
  });
};

/**
 * Deletes multiple notes from the WASM state
 * @param noteIds - Array of note IDs to delete
 * @returns Promise<boolean> - Success status
 */
export const deleteNotes = async (noteIds: string[]): Promise<boolean> => {
  // TODO: Call WASM function to delete multiple notes
  console.log("WASM: Deleting notes", noteIds);

  // Placeholder implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`WASM: ${noteIds.length} notes deleted successfully`);
      resolve(true);
    }, 10);
  });
};

/**
 * Gets all notes from the WASM state
 * @returns Promise<Note[]> - Array of all notes
 */
export const getAllNotes = async (): Promise<Note[]> => {
  // TODO: Call WASM function to get all notes
  console.log("WASM: Getting all notes");

  // Placeholder implementation - return some sample notes
  return new Promise((resolve) => {
    setTimeout(() => {
      const sampleNotes: Note[] = [
        {
          id: "1",
          pitch: 60,
          start: 1,
          duration: 1,
          velocity: 100,
          selected: false,
        }, // C4
        {
          id: "2",
          pitch: 64,
          start: 2,
          duration: 0.5,
          velocity: 80,
          selected: false,
        }, // E4
        {
          id: "3",
          pitch: 67,
          start: 3,
          duration: 2,
          velocity: 90,
          selected: false,
        }, // G4
      ];
      console.log(`WASM: Retrieved ${sampleNotes.length} notes`);
      resolve(sampleNotes);
    }, 10);
  });
};

// ============================================================================
// AUDIO PLAYBACK
// ============================================================================

/**
 * Plays a preview of a MIDI note
 * @param pitch - MIDI note number (0-127)
 * @param velocity - Note velocity (0-127)
 * @param duration - Note duration in seconds
 */
export const playNotePreview = async (
  pitch: number,
  velocity: number = 100,
  duration: number = 0.5
): Promise<void> => {
  // TODO: Call WASM function to play note preview
  console.log(
    `WASM: Playing note preview - Pitch: ${pitch}, Velocity: ${velocity}, Duration: ${duration}`
  );

  // Placeholder implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`WASM: Note preview finished`);
      resolve();
    }, duration * 1000);
  });
};

/**
 * Stops all currently playing notes
 */
export const stopAllNotes = async (): Promise<void> => {
  // TODO: Call WASM function to stop all notes
  console.log("WASM: Stopping all notes");

  // Placeholder implementation
  return Promise.resolve();
};

// ============================================================================
// SELECTION MANAGEMENT
// ============================================================================

/**
 * Selects notes in the WASM state
 * @param noteIds - Array of note IDs to select
 * @param clearPrevious - Whether to clear previous selection
 * @returns Promise<boolean> - Success status
 */
export const selectNotes = async (
  noteIds: string[],
  clearPrevious: boolean = true
): Promise<boolean> => {
  // TODO: Call WASM function to update note selection
  console.log(
    "WASM: Selecting notes",
    noteIds,
    "Clear previous:",
    clearPrevious
  );

  // Placeholder implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`WASM: ${noteIds.length} notes selected`);
      resolve(true);
    }, 10);
  });
};

/**
 * Clears all note selections in the WASM state
 * @returns Promise<boolean> - Success status
 */
export const clearSelection = async (): Promise<boolean> => {
  // TODO: Call WASM function to clear selection
  console.log("WASM: Clearing note selection");

  // Placeholder implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("WASM: Selection cleared");
      resolve(true);
    }, 10);
  });
};

// ============================================================================
// PIANO ROLL STATE
// ============================================================================

/**
 * Updates the piano roll zoom level in WASM state
 * @param zoom - New zoom level
 * @returns Promise<boolean> - Success status
 */
export const updateZoom = async (zoom: number): Promise<boolean> => {
  // TODO: Call WASM function to update zoom
  console.log("WASM: Updating zoom to", zoom);

  // Placeholder implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`WASM: Zoom updated to ${zoom}`);
      resolve(true);
    }, 10);
  });
};

/**
 * Updates the piano roll scroll position in WASM state
 * @param scrollX - Horizontal scroll position
 * @param scrollY - Vertical scroll position
 * @returns Promise<boolean> - Success status
 */
export const updateScrollPosition = async (
  scrollX: number,
  scrollY: number
): Promise<boolean> => {
  // TODO: Call WASM function to update scroll position
  console.log("WASM: Updating scroll position", { scrollX, scrollY });

  // Placeholder implementation
  return Promise.resolve(true);
};
