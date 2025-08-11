# Property Panel Module

This module implements a comprehensive property panel for the DAW (Digital Audio Workstation) application. The original monolithic component has been broken down into modular, reusable components with WASM integration placeholders.

## Architecture

The Property panel is designed to handle different types of audio objects:

- **Tracks**: Audio/MIDI tracks with routing, volume, pan, mute/solo controls
- **Clips**: Audio clips with timing, pitch, volume, and fade controls
- **Effects**: Audio effects with parameters and enable/disable state
- **Master**: Global master bus settings and audio engine configuration

## File Structure

```
Property/
├── Property.tsx              # Main orchestrating component
├── PropertySelector.tsx      # Tab selector for property types
├── TrackProperties.tsx       # Track-specific controls
├── ClipProperties.tsx        # Clip-specific controls
├── EffectProperties.tsx      # Effect-specific controls
├── MasterProperties.tsx      # Master/global controls
├── types.ts                  # TypeScript interfaces
├── wasmApi.ts               # WASM API placeholder functions
├── index.ts                 # Module exports
└── README.md                # This file
```

## Components

### Property.tsx

Main component that:

- Manages state for all property types
- Handles loading states
- Routes to appropriate sub-components based on selection
- Integrates with WASM API for data loading

### PropertySelector.tsx

Tab selector component that:

- Renders buttons for each property type (Track, Clip, Effect, Master)
- Handles visual active state
- Emits selection changes to parent

### TrackProperties.tsx

Track property controls including:

- Track name and color
- Volume and pan sliders with visual feedback
- Input/output routing dropdowns
- Mute/Solo checkboxes
- WASM integration for real-time updates

### ClipProperties.tsx

Clip property controls including:

- Clip name and color
- Start time and duration
- Volume (0-200%) and pitch (-24 to +24 semitones)
- Fade in/out controls
- Reverse audio toggle
- WASM integration for audio processing updates

### EffectProperties.tsx

Effect property controls including:

- Effect name and type selection
- Enable/disable toggle
- Dynamic parameter controls with 0-1 normalized values
- Visual parameter feedback
- WASM integration for effect processing

### MasterProperties.tsx

Master settings including:

- Master volume and pan
- Limiter enable/disable and threshold
- Audio engine configuration (sample rate, buffer size)
- Audio status information display
- WASM integration for engine configuration

## WASM Integration

The `wasmApi.ts` file contains placeholder functions for all WASM interactions:

### Track API

- `updateTrackProperty()` - Update track properties
- `getTrackData()` - Retrieve track data
- `createTrack()` - Create new track

### Clip API

- `updateClipProperty()` - Update clip properties
- `getClipData()` - Retrieve clip data
- `createClip()` - Create new clip

### Effect API

- `updateEffectProperty()` - Update effect properties
- `updateEffectParameter()` - Update specific effect parameter
- `getEffectData()` - Retrieve effect data
- `createEffect()` - Create new effect

### Master API

- `updateMasterProperty()` - Update master settings
- `getMasterSettings()` - Retrieve master settings
- `updateAudioConfig()` - Update audio engine configuration

### Utility API

- `getAudioInputs()` - Get available audio inputs
- `getAudioOutputs()` - Get available audio outputs
- `getAvailableEffectTypes()` - Get available effect types

## Usage

```tsx
import Property from "./Property";

function App() {
  return <Property height={30} className="custom-property-panel" />;
}
```

## Implementation Notes

1. **Type Safety**: All components use TypeScript with strict typing
2. **WASM Ready**: All WASM functions are stubbed and ready for implementation
3. **Responsive**: UI adapts to different property types dynamically
4. **Real-time**: Changes are immediately sent to WASM layer
5. **Modular**: Each component can be used independently if needed
6. **Consistent**: All components follow the same visual design patterns

## Next Steps

1. Implement actual WASM module integration
2. Add real audio input/output enumeration
3. Add effect parameter validation and ranges
4. Implement undo/redo functionality
5. Add keyboard shortcuts for common operations
6. Add property presets and templates
