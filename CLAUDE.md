# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev` (runs on port 3000)
- **Build:** `npm run build`
- **Type check:** `npm run lint` (runs `tsc --noEmit`)
- **Clean:** `npm run clean`

No test framework is configured.

## Environment

Requires at least one LLM API key in `.env.local`:
- `OPENAI_API_KEY` — OpenAI (default provider)
- `GEMINI_API_KEY` — Google Gemini (fallback)
- `LLM_PROVIDER` — Optional override: `"openai"` or `"gemini"`

## Architecture

**The First Symbol** is an interactive browser experience where a human collaborates with a lobster AI character to create a world across 4 sequential epochs. Built with React 19, Vite, Tailwind CSS v4, and TypeScript.

### Epoch Flow

The game progresses linearly: Title Screen -> Epoch 1 -> 2 -> 3 -> 4. Each epoch has two tasks (A and B). Transitions between epochs use a white flash animation and a "bridge" split-screen overlay (human visual on left, lobster data on right).

- **Epoch 1 (Chaos):** Find a pulsing signal, decode binary to "LIGHT", tune frequency bars
- **Epoch 2 (Language):** Name three shapes, choose a world rule, assign emotions via drag-and-drop
- **Epoch 3 (Perception):** Draw on an 8x8 pixel grid (timed 60s), assign elements to depth layers with parallax
- **Epoch 4 (Symbiosis):** Build an ecosystem by placing items, name the world, choose a motto, view genesis record scroll

### Key Files

- `src/App.tsx` — Root component, manages epoch state, game state accumulation, and epoch transitions
- `src/epochs/Epoch{1-4}.tsx` — Each epoch is self-contained with its own task state machines
- `src/mockData.ts` — All game content (dialogue, shapes, rules, items). Currently used directly; `TODO` comments mark where Gemini API calls should replace mock data
- `src/audio.ts` — Web Audio API engine: generative music (drone + random notes in C minor pentatonic), epoch-adaptive sound, and a `triggerGenesis()` finale sequence
- `src/components.tsx` — Shared UI: `LobsterChat` (typewriter text), `BridgeOverlay` (split-screen transition), `Background` (canvas renderer per epoch)
- `src/index.css` — Custom animations (`pulse-glow`, `flicker-*`, `flash-white`, `fade-in`, `scroll-up`) and component styles (`.pixel-btn`, `.pixel-input`, `.lobster-panel`, `.bridge-overlay`)

### Data Flow

Each epoch receives callbacks from App.tsx: `setLobsterMsg`, `triggerBridge`, `onComplete`, and `updateGameState`. Game state accumulates across epochs via `updateGameState` (shallow-merges nested objects) and is passed to Epoch4 for the final genesis record.

### Styling

Uses Tailwind CSS v4 (imported via `@import "tailwindcss"` in index.css). Global pixel font is "Press Start 2P". Custom CSS classes (`.pixel-btn`, `.pixel-input`) are used alongside Tailwind utilities. The `@` path alias maps to project root.
