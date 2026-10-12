# Anti-Pattern Catalog

Use when reviewing existing code. For each: the symptom you can observe, how to detect it, and the fix.

## Contents
1. God Component
2. Duplicated world/feature logic
3. React ↔ Three.js tight coupling
4. Nested setTimeout cutscenes
5. Procedural canvas textures for static content
6. No shared design system
7. Generated files in git

---

## 1. God Component
**Symptom:** One change request ("change when the truck departs", "restyle a subtitle") forces edits in 3–5 files at once. Merge conflicts and large commits are frequent.
**Detect:** Files over ~300 lines; a single component that owns canvas lifecycle + input + physics + scoring + narrative phases + modals.
**Fix:** Extract in this order: (1) modals into shared presentational components, (2) game logic into a store/state machine, (3) scene code behind an event-emitting controller. The page component should end up only composing these.

## 2. Duplicated world/feature logic
**Symptom:** Parallel component families such as `MissionResultsModal` vs `MeadowsResultsModal`, `MascotDialogue` vs `NarrativeBanner`, `CleanlinessMeter` vs `ContaminationMeter`. Every styling change is repeated by hand.
**Detect:** Filenames sharing a prefix per world/level; near-identical components differing by a few props or strings.
**Fix:** Merge each pair into one parameterized component. Move per-world differences (copy, colors, bins, phases) into a `WorldDefinition` config. Delete the duplicates.

## 3. React ↔ Three.js tight coupling
**Symptom:** React state setters and imperative scene calls (`sceneRef.current?.showTruckBins(...)`) are coordinated manually. The scene can't be tested without mounting React and WebGL.
**Detect:** `sceneRef.current?.` calls spread across many handlers; state setters called from inside scene code.
**Fix:** Give the scene a controller with `on(event, handler)`. Scene emits (`pickup`, `bin_hit`); the store subscribes and updates state; React renders from the store. The scene receives commands through one small, typed API.

## 4. Nested setTimeout cutscenes
**Symptom:** Sequences like 4500ms → 6500ms → 3000ms → 4500ms. If the user navigates away, pauses, or rotates the phone mid-cutscene, callbacks still fire.
**Detect:** `setTimeout` inside `setTimeout`; timers with no cleanup in `useEffect` return; no way to skip.
**Fix:** A timeline runner that takes an ordered list of steps, is cancellable via an abort signal, supports skip-to-end, and is called with cleanup on unmount, pause, and orientation change. Unit-test the step order with fake timers.

## 5. Procedural canvas textures for static content
**Symptom:** Functions like `makePaverTexture()`, `makeBinIconTexture()`, `makeWallTex()` draw with `ctx.fillRect`/`ctx.fillText` and upload a fresh `CanvasTexture` per scene. Higher GPU memory, extra texture binds, and icon/font changes require rewriting draw code.
**Detect:** Multiple `new THREE.CanvasTexture(` calls; the same icon drawn in more than one scene.
**Fix:** Replace static icons/labels with SVG/PNG sprites or a texture atlas, cached and shared across scenes. Keep canvas textures only for content that changes at runtime (e.g. a live score on a billboard).

## 6. No shared design system
**Symptom:** The same long Tailwind string repeated across files. Switching style (dark glass → retro paper) takes a manual sweep.
**Detect:** grep for a distinctive class string and count the hits.
**Fix:** Create primitives (`RetroCard`, `RetroButton`, `RetroModal`, `RetroMeter`) backed by design tokens. Replace the inline strings; future restyles become a one-file change.

## 7. Generated files in git
**Symptom:** A 20-line UI fix shows thousands of changed lines in files like `graphify-out/graph.json` or `manifest.json`.
**Detect:** `git diff --stat` dominated by generated JSON; build/cache folders tracked.
**Fix:** Add the folder to `.gitignore`, run `git rm -r --cached <folder>` to stop tracking it, and regenerate in CI if it's needed there.
