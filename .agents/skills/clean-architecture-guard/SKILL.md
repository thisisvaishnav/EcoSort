---
name: clean-architecture-guard
description: Architecture guardrails for building or refactoring React + Three.js (WebGL) apps, games, and interactive 3D worlds so they stay modular, reusable, and easy to change. Use this skill whenever the user is planning, building, reviewing, or refactoring a React/Three.js project, a game with multiple maps/levels/worlds, a large component (300+ lines), cutscenes or timed sequences, modals/HUD/design-system work, or procedural canvas textures. Also use it when the user says things like "this file is getting huge", "I keep editing five files for one change", "add another map/level/world", "why are my commits so big", or asks for a pre-build checklist or architecture review, even if they don't mention architecture explicitly.
---

# Clean Architecture Guard

Guardrails distilled from a real project post-mortem (a React + Three.js educational game with "Meadows" and "Society" worlds). Almost every problem came from the same root: **new features were built by copying and entangling, not by reusing and separating.** Use this skill to avoid repeating that, either before building something new or when reviewing existing code.

## How to use this skill

1. **Starting a new feature or world:** run the Pre-Build Checklist below, and design to the 3-layer architecture before writing code.
2. **Reviewing or refactoring existing code:** scan for the anti-patterns in `references/anti-patterns.md`, report which ones are present with file/line evidence, then propose the smallest refactor that removes each one.
3. **Writing code:** follow the rules below as defaults. If the user's situation genuinely calls for breaking one, say so and explain the tradeoff rather than silently ignoring it.

The reasoning matters more than the rules. A rule like "split at 300 lines" is a proxy for "one file should have one reason to change." When the proxy and the reason disagree, follow the reason.

## Pre-Build Checklist

Ask these before writing any new feature. If an answer is "no" or "not sure", fix the plan first, because each is far cheaper to fix before the code exists.

1. **Duplication:** Does something similar already exist? Can it do this job with a config or parameter change instead of a new file?
2. **Data over code:** Can this be a config/data object rather than new logic?
3. **Separation:** Is game logic separated from rendering and from UI?
4. **Timers:** Is every timer/animation/sequence cancellable and cleaned up on unmount, pause, and orientation change?
5. **Styling:** Do styles come from shared components or design tokens, not inline class strings?
6. **Git hygiene:** Is any generated or build output about to be committed?

## The 3-Layer Architecture

Keep these layers separate. Dependencies point inward toward the logic layer; the UI and the renderer never talk to each other directly.

| Layer | Responsibility | Must NOT contain |
|---|---|---|
| **1. UI (presentational)** | Shared components: card, button, modal, meter, HUD | Game rules, Three.js calls |
| **2. Logic / state (headless)** | Game state machine or store (e.g. Zustand), scoring, phases, audio service | React components, Three.js objects |
| **3. Renderer (3D canvas)** | Scene, entities, props, animation; emits events | Game rules, React state setters |

Why this works: the logic layer can be unit-tested with no DOM and no WebGL context, and the other two layers become swappable. A change to scoring touches one layer, not four files.

## Rules

### Components and size
- Treat ~300 lines or more than one responsibility as the signal to split. A "WorldPage" that owns canvas lifecycle, input, physics, scoring, narrative phases, and every modal is the failure case.
- Page-level components should compose; they should not contain logic. Move logic into a store, hook, or engine module.

### Reusability: worlds as config
- Define each world/level/map as a configuration object, not a parallel set of components. For example:

```ts
interface WorldDefinition {
  id: string;
  name: string;
  theme: { primary: string; sky: string };
  tasks: TaskDefinition[];
  bins: BinType[];
  phases: PhaseSequence[];
  sceneBuilder: (scene: THREE.Scene) => SceneController;
}
```

- A new world should be a new `.ts` config file with **zero** changes to UI components or core game handlers. If adding a world forces edits elsewhere, the abstraction has a leak; fix the leak.
- One `<WorldHUD>` driven by the config, not `MeadowHud` + `SocietyHud`. Same for results modals, bin modals, task panels: parameterize, never clone.

### Design system
- Build atomic primitives once (`RetroCard`, `RetroButton` with variants, `RetroModal`, `RetroMeter`) and use design tokens for color, border, radius, and shadow.
- Repeating a string like `bg-[#FDFBF7] border-[2.5px] border-slate-900 rounded-3xl` across files means a restyle is a manual hunt across the codebase. Centralize it so a restyle is a one-line change.

### Scene and state coupling
- The Three.js scene should **emit events** (`scene.on('pickup', handler)`) and the store should listen. React should not reach into the scene with imperative calls like `sceneRef.current?.removeWasteByType(...)` scattered across handlers.
- Keep game state in one store or state machine, not many scattered `useState` calls that have to be kept in sync with the scene by hand.

### Cutscenes and timing
- Never chain nested `setTimeout` calls (e.g. 4500ms → 6500ms → 3000ms). They keep firing after the user navigates away, pauses, or rotates the phone, and they can't be skipped or tested.
- Use a declarative, cancellable timeline runner:

```ts
await timeline.run([
  { action: 'drive_truck_in', duration: 4.5 },
  { action: 'narrate', text: 'The truck is here...' },
  { action: 'spawn_bins' },
  { action: 'start_sorting' },
]);
```

- The runner must support cancel (called on unmount/pause/orientation change), skip, and unit testing without mounting React or WebGL.

### Assets and textures
- Prefer SVG/PNG sprites or texture atlases for icons, labels, and repeated surfaces, and share textures across scenes.
- Procedural canvas textures (`CanvasTexture` + `ctx.fillRect/fillText`) are for genuinely dynamic content only. Using them for static icons wastes GPU memory and makes a font or icon change a code rewrite instead of an asset edit.

### Git hygiene
- Add generated output (e.g. `graphify-out/`, build artifacts, caches) to `.gitignore` or generate it in CI. A 20-line UI fix that produces 5,000 lines of JSON diff buries the real change and invites merge conflicts.
- Keep commits small and single-purpose.

## Output format when reviewing existing code

Use this structure so the user can act on it:

```
## Findings
- [Anti-pattern name] — where it appears (file:line or description) — why it hurts here

## Recommended refactor (in order)
1. Smallest change first, with the expected payoff
2. ...

## Quick wins (under 30 minutes)
- e.g. add generated folder to .gitignore
```

Order refactors by payoff-to-effort. Quick wins (gitignore, extracting a shared `RetroCard`) usually come before big moves (introducing a store, building a timeline runner), and each step should leave the app working.

## When not to over-apply

Don't push this architecture on a small prototype or one-off demo. A 150-line single-scene toy doesn't need a store, an event emitter, and a world config. Apply the rules in proportion: the moment a second world, a second modal variant, or the first multi-step cutscene appears is when the abstraction starts paying for itself.

For the full catalog of anti-patterns with symptoms and detection tips, read `references/anti-patterns.md`.
