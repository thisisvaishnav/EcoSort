# Level 1 (Migsun Vilasa) Component Reuse Inventory

> **Document Type:** Wave 0 Architecture Baseline & Reuse Inventory  
> **Author:** Agent 0 (Architect)  
> **Date:** October 2026  
> **Specification:** Based on Society World: Parallel Implementation Plan & Eco Hero Kai Build Specification

---

## 1. Executive Summary

This inventory verifies all existing Level 1 components against the parallel implementation plan. In accordance with **Golden Rule 1 ("Level 1 is frozen")**, all shared components are consumed as read-only dependencies without modifying existing behavior. Any society-specific customization is injected via the frozen **World Manifest contract** (`src/worlds/types.ts`) or local adapters.

---

## 2. Component Verification & Reuse Matrix

| Component | Level 1 Source / Location | Verification Status | Society Integration Decision |
| :--- | :--- | :--- | :--- |
| **Kai 3D Model & Rig** | `public/models/kai.glb` | Verified available | **Reuse as is**. No duplication in repository. |
| **Player Locomotion & Physics** | `src/components/world/locomotion.ts`, `playerCharacter.ts` | Verified standalone engine | **Reuse**. Collision geometries supplied by Society World Manifest. |
| **Follow & Cinematic Camera** | `src/components/world/thirdPersonCamera.ts` | Verified orbit / follow camera system | **Reuse**. Society supplies fixed anchors (`introCamera`, `cinematicCamera`). |
| **Touch & Keyboard Controls** | `src/hooks/useMobileInput.ts`, `VirtualJoystick.tsx` | Verified joystick / WASD / pointer | **Reuse**. No changes required. |
| **HUD & Overlays** | `CleanlinessMeter.tsx`, `CountdownTimer.tsx`, `MissionPanel.tsx` | Verified UI components | **Reuse**. Society HUD mounts shared components. |
| **Four Bins Standard** | `src/data/bins.ts` (`ALL_BINS`, `BinType`) | Verified standard definition | **Reuse exactly**. 4 bins: Green (wet), Blue (dry), Red (hazardous), Black (residual). No forked bin data. |
| **Bin Cards System** | `src/data/migsunData.ts` (`DUSTBIN_CARDS`), `DustbinCardOverlay.tsx` | Verified card data & modal | **Reuse**. Society uses standard 4-bin cards, voice lines, and practice quizzes. |
| **Waste Items & Sacks** | `src/data/items.ts`, `MapItemManager.ts`, `createItemMesh.ts` | Verified procedural 3D items & assets | **Reuse**. Standard item pool filtered by active bins; 4 sacks positioned via manifest. |
| **Timer & Arrival Progress** | `src/hooks/useCountdownTimer.ts`, `CountdownTimer.tsx` | Verified 120s timer logic | **Reuse**. Configured for 120 seconds with soft fail. |
| **Garbage Van & Jingle** | `src/components/world/migsunScene.ts`, `public/audio/` | Verified van mesh generation & jingle | **Reuse**. Reuses van mesh, jingle audio, and animation hooks. |
| **Revival Particle Effects** | `src/components/world/migsunScene.ts` (`triggerPlantRevival`) | Verified bloom & particle systems | **Reuse**. Society anchors provide plant coordinates (`plantSlots`). |
| **Eco Lens System** | `src/systems/ecoLens.ts`, `EcoLensScanOverlay.tsx` | Verified energy & scanning mechanism | **Reuse**. Society supplies 4 hotspot coordinates & cards in manifest. |
| **Resident Engine** | `src/components/game/migsun/HealthDashboard.tsx`, `migsunData.ts` | Verified resident interaction loop | **Reuse engine**. Society provides 8 resident profiles in Society manifest. |
| **Scoring & Dashboards** | `src/components/game/migsun/HealthDashboard.tsx` | Verified calculation logic | **Reuse**. Same scoring formulas and star ratings. |
| **Audio Manager** | `src/services/audio.ts`, `uiAudio.ts` | Verified Web Audio engine | **Reuse**. Society adds optional background track and voice lines prefixed with `society_`. |
| **Voice Pipeline** | AWS Polly integration scripts (`scripts/generate-audio.js`) | Verified script exists | **Reuse**. Run for new English voice lines only. |
| **i18n & Language Lock** | English-only world policy | Verified | **Locked to English**. Society suppresses Hindi toggle and loads only English strings. |
| **Save & Persistence** | `localStorage` / `apiService.ts` | Verified key storage | **Namespaced**. Society uses `ecohero:society:*` keys to isolate state from Level 1. |
| **Map & Scene Geometry** | `none` | Clean slate | **NEW (Agent B)**: Provided in `src/worlds/society/map/`. |
| **Society Manifest & Data** | `none` | Clean slate | **NEW (Agent 0 & Agent B/G)**: Frozen contract in `src/worlds/society/manifest.ts`. |
| **World Registry Entry** | `none` | Clean slate | **NEW (Agent 0 / Agent A)**: `src/worlds/registry.ts`. |

---

## 3. Architecture Constraints & Conventions

1. **Path Prefix Isolation**:
   - Source code: `src/worlds/society/**`
   - 3D Models: `public/models/society/**`
   - Audio Assets: `public/audio/en/society/**`
   - String Keys: `society.*`
   - Audio Keys: `society_*`
   - CSS Classes: `soc-*`
   - LocalStorage Keys: `ecohero:society:*`
2. **Frozen Level 1 Baseline**:
   - Zero edits to Level 1 files or content.
   - Any shared modification must proceed through a Shared Change Request to Agent A (`docs/agents/requests/`).
