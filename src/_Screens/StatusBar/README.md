# StatusBar Module

The StatusBar module provides comprehensive transport controls for the DAW interface. It's designed with a modular architecture where each component handles specific functionality.

## Architecture

### Main Component

- **StatusBar.tsx** - Main container component that manages state and orchestrates child components

### Sub-Components

- **TransportControls.tsx** - Play, pause, stop, record, and rewind buttons
- **TimeDisplay.tsx** - Current playback time display
- **TempoControl.tsx** - BPM input control
- **VolumeControl.tsx** - Master volume slider
- **UtilityControls.tsx** - Loop and metronome toggle buttons

### Support Files

- **types.ts** - TypeScript interfaces and type definitions
- **wasmApi.ts** - WASM integration layer with placeholder functions

## WASM Integration

The StatusBar module is designed to work with a WASM backend for actual audio processing and DAW functionality. All user interactions are passed through the `wasmApi.ts` layer, which provides:

### Transport Functions

- `playAudio()` - Start playback
- `pauseAudio()` - Pause playback
- `stopAudio()` - Stop playback and reset position
- `startRecording()` - Begin recording
- `stopRecording()` - End recording
- `rewindToStart()` - Reset to beginning

### State Management

- `getTransportState()` - Get current transport state
- `getCurrentPlaybackTime()` - Get current position
- `setPlaybackPosition()` - Set playback position

### Audio Control

- `setTempo()` / `getTempo()` - Tempo management
- `setMasterVolume()` / `getMasterVolume()` - Volume control
- `toggleLoop()` - Loop mode control
- `toggleMetronome()` - Metronome control

## Usage

```tsx
import StatusBar from "./StatusBar";

// Basic usage
<StatusBar className="my-custom-class" />;

// The component handles all internal state and WASM communication
```

## Development Notes

- All WASM functions are currently placeholders that log to console
- State is initialized from WASM on component mount
- Each user interaction triggers the appropriate WASM call
- Error handling is implemented for all WASM communications
- Components use proper TypeScript typing throughout

## Future Implementation

When implementing the actual WASM integration:

1. Replace placeholder functions in `wasmApi.ts` with actual WASM calls
2. Implement proper error handling for WASM communication failures
3. Add real-time state synchronization if needed
4. Consider adding loading states for async operations
