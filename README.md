# DeskCharm

A tiny interactive charm that hangs from the top of your desktop. Grab it, drag it, throw it — watch it swing with real physics.

## Architecture

```
Electron Main Process
├── Window management (transparent, frameless, always-on-top)
├── System tray integration
├── Settings persistence (electron-store)
├── IPC bridge (typed, centralized)
└── Application lifecycle

React Renderer
├── Canvas-based physics rendering
├── Charm/rope rendering system
├── Mouse interaction (grab, drag, throw)
├── Settings UI
└── Context menu

Matter.js Physics
├── Gravity simulation
├── Pendulum constraint
├── Velocity capping
├── Mouse constraint for interaction
└── Energy damping
```

## Tech Stack

- **Electron** — Desktop shell with transparent window
- **React** — UI rendering
- **TypeScript** — Strict type safety
- **Vite** — Fast dev server and bundler
- **Matter.js** — 2D physics engine
- **Canvas** — Hardware-accelerated charm rendering
- **Zustand** — Lightweight state management
- **Tailwind CSS** — Utility-first styling
- **Lucide React** — Icon library
- **electron-store** — Persistent settings

## Development

```bash
# Install dependencies
npm install

# Start development (Vite + Electron)
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build

# Package for distribution
npm run package
```

## Physics

The charm uses a Matter.js pendulum simulation:

1. **Anchor** — Fixed point at the top of the canvas
2. **Rope** — Constraint connecting anchor to charm body
3. **Charm** — Physics body with mass, friction, and damping
4. **Gravity** — Pulls the charm downward
5. **Mouse constraint** — Lets the user grab and throw

All physics parameters are centralized in `src/renderer/physics/PhysicsConfig.ts`.

## Adding a New Charm

Edit `src/shared/types/charm.ts`:

```typescript
{ id: 'star', name: 'Star', emoji: '⭐', color: '#eab308', scale: 1, mass: 1 }
```

## Adding a New Rope Style

Edit `src/shared/types/rope.ts`:

```typescript
{ id: 'silver', name: 'Silver Cord', color: '#94a3b8', width: 2, opacity: 1 }
```

## Project Structure

```
src/
  main/           # Electron main process
    main.ts       # Window creation, lifecycle
    preload.ts    # Typed IPC bridge
    ipc.ts        # IPC handlers
    store.ts      # electron-store persistence
    tray.ts       # System tray
  renderer/       # React renderer
    App.tsx       # Root component
    main.tsx      # Entry point
    index.css     # Global styles
    components/   # UI components
    physics/      # Matter.js integration
    store/        # Zustand state
  shared/         # Shared between main/renderer
    types/        # Type definitions
    ipc-channels.ts
```

## Supported Platforms

- Windows (primary)
- macOS
- Linux (untested)

## License

MIT
