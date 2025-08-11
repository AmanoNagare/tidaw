# TIDAW Source Structure

This is the main source directory for the TIDAW application. Here's the basic structure:

## Directory Structure

```
src/
├── _Screens/           # Main application screens and layouts
│   ├── MainLayout.tsx  # Main application layout component
│   ├── index.ts        # Screen exports
│   ├── PianoRoll/      # Piano roll editor implementation
│   │   ├── PianoRoll.tsx       # Main piano roll component
│   │   ├── PianoGrid.tsx       # Piano grid visualization
│   │   ├── PianoKeys.tsx       # Piano keys sidebar
│   │   ├── NoteRenderer.tsx    # Note rendering logic
│   │   ├── PianoRollHeader.tsx # Piano roll header
│   │   ├── PianoRollFooter.tsx # Piano roll footer
│   │   ├── constants.ts        # Piano roll constants
│   │   ├── types.ts           # Piano roll type definitions
│   │   ├── utils.ts           # Piano roll utilities
│   │   ├── wasmApi.ts         # WebAssembly API integration
│   │   └── index.ts           # Piano roll exports
│   ├── Property/       # Property panel implementation
│   │   ├── Property.tsx        # Main property component
│   │   ├── PropertySelector.tsx # Property type selector
│   │   ├── ClipProperties.tsx  # Clip property controls
│   │   ├── EffectProperties.tsx # Effect property controls
│   │   ├── MasterProperties.tsx # Master property controls
│   │   ├── TrackProperties.tsx # Track property controls
│   │   ├── types.ts           # Property type definitions
│   │   ├── wasmApi.ts         # WebAssembly API integration
│   │   ├── README.md          # Property documentation
│   │   └── index.ts           # Property exports
│   ├── StatusBar/      # Status bar implementation
│   │   ├── StatusBar.tsx       # Main status bar component
│   │   ├── TempoControl.tsx    # Tempo control widget
│   │   ├── TimeDisplay.tsx     # Time display widget
│   │   ├── TransportControls.tsx # Play/pause/stop controls
│   │   ├── UtilityControls.tsx # Utility control buttons
│   │   ├── VolumeControl.tsx   # Volume control widget
│   │   ├── types.ts           # Status bar type definitions
│   │   ├── wasmApi.ts         # WebAssembly API integration
│   │   ├── README.md          # Status bar documentation
│   │   └── index.ts           # Status bar exports
│   └── Timeline/       # Timeline implementation
│       ├── Timeline.tsx        # Main timeline component
│       ├── TimelineGrid.tsx    # Timeline grid visualization
│       ├── TimelineHeader.tsx  # Timeline header
│       ├── TrackHeaders.tsx    # Track header controls
│       ├── constants.ts        # Timeline constants
│       ├── types.ts           # Timeline type definitions
│       ├── utils.ts           # Timeline utilities
│       ├── wasmApi.ts         # WebAssembly API integration
│       └── index.ts           # Timeline exports
├── components/         # Reusable UI components
│   ├── Button.tsx      # Basic button component
│   ├── Header.tsx      # Header component
│   └── index.ts        # Component exports
├── hooks/              # Custom React hooks
│   ├── useToggle.ts    # Toggle state hook
│   └── index.ts        # Hook exports
├── types/              # TypeScript type definitions
│   └── index.ts        # Common types
├── utils/              # Utility functions
│   ├── helpers.ts      # Helper functions
│   └── index.ts        # Utility exports
├── App.tsx             # Main App component
├── main.tsx            # Application entry point
├── index.css           # Global styles
└── vite-env.d.ts       # Vite environment types
```

## Getting Started

1. The `main.tsx` file is the entry point of your application
2. `App.tsx` contains the main App component
3. The `_Screens/` directory contains the main application screens:
   - `MainLayout.tsx` - The overall application layout
   - `PianoRoll/` - Piano roll editor for MIDI note editing
   - `Property/` - Property panels for various audio elements
   - `StatusBar/` - Status bar with transport controls and displays
   - `Timeline/` - Timeline view for arranging tracks and clips
4. Reusable UI components are organized in the `components/` directory
5. Custom hooks go in the `hooks/` directory
6. Utility functions are in the `utils/` directory
7. TypeScript types are defined in the `types/` directory
8. Each screen module includes its own types, utilities, and WebAssembly API integration

## Next Steps

The application structure is now well-organized with dedicated screen modules. You can continue development by:

1. **Enhancing existing screens**: Each screen module (`PianoRoll`, `Property`, `StatusBar`, `Timeline`) has its own components and can be developed independently
2. **Adding state management**: Implement global state management (Context API, Zustand, or Redux) to coordinate between screens
3. **Implementing audio processing**: Utilize the WebAssembly API integrations (`wasmApi.ts`) in each module for audio processing
4. **Adding new features**: Create new components within existing screen modules or add new screen modules
5. **Improving UI/UX**: Enhance the reusable components in the `components/` directory
6. **Adding more utilities**: Extend the `utils/` and `hooks/` directories with additional functionality

Each screen module follows a consistent structure with:

- Main component file (e.g., `PianoRoll.tsx`)
- Supporting components (headers, footers, specialized widgets)
- Type definitions (`types.ts`)
- Utilities (`utils.ts` and/or `constants.ts`)
- WebAssembly API integration (`wasmApi.ts`)
- Module exports (`index.ts`)

The example/ folder contains the previous implementation for reference.
