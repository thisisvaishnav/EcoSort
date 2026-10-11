# Graph Report - EcoSort  (2026-10-11)

## Corpus Check
- 151 files · ~680,918 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 1, .pkg 1)

## Summary
- 800 nodes · 1643 edges · 54 communities (29 shown, 25 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 64 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a252b7d6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- devDependencies
- progress.js
- package.json
- Level 1: Waste Detective — Implementation Plan
- compilerOptions
- AudioService
- GLTFBuilder
- ECC Skills Integration
- createItemMesh.ts
- createLitterScatter
- react
- compilerOptions
- EcoSort Heroes Full Plan
- Architecture Decision Records Skill
- Clean Design System
- ECC Guide Skill
- Amplify Build Configuration
- Bento Design System
- Code Review Skill
- Debug Skill
- Fiction Design System
- Lingo Design System
- System Design Skill
- Testing Strategy Skill
- EcoSort Heroes
- PART B — Visual system
- MapItemInstance
- PART B — Visual system
- game.ts
- 🏘️ Migsun Vilasa — New World Implementation Plan
- scripts
- dependencies
- createMigsunScene
- locomotion.test.ts
- WorldPage.tsx
- 4. Phase Status & Implementation Checklist
- WorldCanvas.tsx
- BinType
- meadowsScene.ts
- societyScene.ts
- locomotion.ts
- Plan: Browser Performance Optimization (load time + framerate)
- ask_eco.js
- vitest
- .verify-main.cjs

## God Nodes (most connected - your core abstractions)
1. `three` - 46 edges
2. `react` - 43 edges
3. `AudioService` - 37 edges
4. `lucide-react` - 33 edges
5. `createItemMesh()` - 31 edges
6. `WorldPage()` - 28 edges
7. `WorldCanvas()` - 26 edges
8. `BinType` - 26 edges
9. `ItemMeshOptions` - 20 edges
10. `ItemData` - 19 edges

## Surprising Connections (you probably didn't know these)
- `1.3 Litter Scatter System` --references--> `createItemMesh()`  [INFERRED]
  LEVEL1_WASTE_DETECTIVE_PLAN.md → src/components/world/items/createItemMesh.ts
- `1.1 Add `residual` bin type` --references--> `BinType`  [INFERRED]
  LEVEL1_WASTE_DETECTIVE_PLAN.md → src/types/game.ts
- `2.2 Bin Mapping for Level 1: Waste Detective` --references--> `BinType`  [INFERRED]
  LEVEL1_WASTE_DETECTIVE_PLAN.md → src/types/game.ts
- `✅ Phase 1: Configuration & Routing` --references--> `resolveEnvMode()`  [INFERRED]
  MEADOWS_WORLD_PLAN.md → src/components/world/WorldCanvas.tsx
- `Tasks (executed)` --references--> `WorldCanvas()`  [INFERRED]
  .claude/PRPs/plans/browser-performance-optimization.plan.md → src/components/world/WorldCanvas.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Visual Design & Aesthetics** — agents_skills_frontend_design, agents_skills_fiction, agents_skills_lingo, agents_skills_bento [EXTRACTED 0.90]
- **Quality Assurance & Verification Flow** — agents_skills_tdd_workflow, agents_skills_verification_loop, agents_skills_ai_regression_testing, agents_skills_click_path_audit [INFERRED 0.85]

## Communities (54 total, 25 thin omitted)

### Community 0 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, autoprefixer, jsdom, postcss, tailwindcss, @types/canvas-confetti, @types/react, @types/react-dom (+5 more)

### Community 1 - "progress.js"
Cohesion: 0.08
Nodes (21): client, corsHeaders, ddbDocClient, { DynamoDBClient }, { DynamoDBDocumentClient, PutCommand, QueryCommand }, client, corsHeaders, ddbDocClient (+13 more)

### Community 2 - "package.json"
Cohesion: 0.12
Nodes (16): @aws-sdk/client-bedrock-runtime, name, private, type, version, autoprefixer, canvas-confetti, jsdom (+8 more)

### Community 3 - "Level 1: Waste Detective — Implementation Plan"
Cohesion: 0.05
Nodes (41): 1.1 Add `residual` bin type, 1.2 Create Society Scene, 1.3 Litter Scatter System, 1.4 Pick-up Mechanic, 1.5 Update Level 1 Config, 1. Current State Analysis, 2.1 Countdown Timer, 2.1 Scene Strategy (+33 more)

### Community 4 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 5 - "AudioService"
Cohesion: 0.13
Nodes (5): 4.3 Audio and Sound Effects, 8.2 Sound Effects to Add, AudioService, writeStoredNumber(), stopMusicLoop()

### Community 7 - "ECC Skills Integration"
Cohesion: 0.18
Nodes (10): AI Regression Testing Skill, Architecture Skill, Bento Design System, Click-Path Audit Skill, Fiction Design System, Frontend Design Skill, Lingo Design System, TDD Workflow Skill (+2 more)

### Community 8 - "createItemMesh.ts"
Cohesion: 0.10
Nodes (36): three, MapItemPreview(), MapItemPreviewProps, disposeObject3D(), createItemMesh(), disposeItemMesh(), DEFAULT_MAP_ITEM_PLACEMENTS, createBananaPeel3D() (+28 more)

### Community 9 - "createLitterScatter"
Cohesion: 0.12
Nodes (7): createLitterScatter(), dispose(), placeItem(), LitterScatterSystem, ScatteredItem, shuffle(), BOUNDS

### Community 10 - "react"
Cohesion: 0.06
Nodes (54): 4. File Change Summary, Modified Files (6), New Files (12), lucide-react, react, EcopediaModalProps, EnergyMeterHUDProps, MascotDialogueProps (+46 more)

### Community 11 - "compilerOptions"
Cohesion: 0.25
Nodes (7): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 12 - "EcoSort Heroes Full Plan"
Cohesion: 0.67
Nodes (3): ASD-STE100 Rules, EcoSort Heroes Full Plan, SAM Infrastructure Template

### Community 34 - "PART B — Visual system"
Cohesion: 0.06
Nodes (34): A1. Intake, A2. Page structure, A3. Layout selection, A4. Conversion rules, A5. Copywriting, A6. Build order, A7. SEO and AEO, A8. Pitfalls (+26 more)

### Community 35 - "MapItemInstance"
Cohesion: 0.16
Nodes (5): MapItemInstance, MapItemManager, MapItemManagerOptions, MapItemConfig, MapItemState

### Community 36 - "PART B — Visual system"
Cohesion: 0.06
Nodes (34): A1. Intake, A2. Page structure, A3. Layout selection, A4. Conversion rules, A5. Copywriting, A6. Build order, A7. SEO and AEO, A8. Pitfalls (+26 more)

### Community 37 - "game.ts"
Cohesion: 0.07
Nodes (34): App(), RouteFallback(), TeacherDashboard, WorldPage, AVATARS, AvatarSelectModalProps, LevelEndModalProps, LevelSelectModalProps (+26 more)

### Community 38 - "🏘️ Migsun Vilasa — New World Implementation Plan"
Cohesion: 0.05
Nodes (41): 0. Vision Summary, 1.1 Add Migsun Vilasa Level to `levels.ts`, 1.2 Add `MIGSUN` Scene Type, 1.3 Create Migsun Scene — `migsunScene.ts`, 1. What Already Exists (Reusable), 2.1 Character Intro Overlay — `CharacterIntroOverlay.tsx`, 2.2 Mission Select Panel — `MissionSelectPanel.tsx`, 2.3 Kai Front-Facing Pose (+33 more)

### Community 39 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, graphify, graphify:hook, graphify:viz, preview, test (+1 more)

### Community 40 - "dependencies"
Cohesion: 0.29
Nodes (7): dependencies, @aws-sdk/client-bedrock-runtime, canvas-confetti, lucide-react, react, react-dom, three

### Community 44 - "WorldPage.tsx"
Cohesion: 0.07
Nodes (52): CleanlinessMeter(), CleanlinessMeterProps, CountdownTimer(), CountdownTimerProps, EcoLensButton(), EcoLensButtonProps, EcoLensOverlay(), EcoLensOverlayProps (+44 more)

### Community 45 - "4. Phase Status & Implementation Checklist"
Cohesion: 0.13
Nodes (14): 1. Overview & Vision, 2. Spatial & Scene Architecture, 3. HUD & Control System, 4. Phase Status & Implementation Checklist, Control Dynamics, Core Objectives, Green Meadows Rescue (Level 7) — Architectural & Implementation Plan, Key Elements (+6 more)

### Community 46 - "WorldCanvas.tsx"
Cohesion: 0.32
Nodes (10): createProceduralCity(), createThirdPersonCamera(), pinchPitchDelta(), pinchZoomDelta(), ThirdPersonCameraSystem, EnvMode, resolveEnvMode(), WorldCanvas() (+2 more)

### Community 47 - "BinType"
Cohesion: 0.16
Nodes (17): DustbinCardOverlayProps, LEVEL_STATIONS, MeadowsSceneResult, BIN_COLORS, MigsunSceneResult, ProceduralCityResult, WARM_GLOW_COLOR, SocietySceneResult (+9 more)

### Community 48 - "meadowsScene.ts"
Cohesion: 0.29
Nodes (9): COL, createMeadowsScene(), hashNoise(), makeNameTexture(), makePaverTexture(), MEADOWS_PATH_HALF_WIDTH, MEADOWS_PATH_Z_END, MEADOWS_PATH_Z_START (+1 more)

### Community 49 - "societyScene.ts"
Cohesion: 0.23
Nodes (7): BIN_COLORS, createSocietyScene(), makeBinIconTexture(), makeConcreteTex(), makeWallTex(), TIP_LABELS, SOCIETY_SPAWN

### Community 51 - "locomotion.ts"
Cohesion: 0.24
Nodes (8): createLocomotionEngine(), isTypingTarget(), JoystickMoveDir, joystickToMoveDir(), LocomotionEngine, createPlayerCharacter(), PlayerCharacter, lookPoint

### Community 52 - "Plan: Browser Performance Optimization (load time + framerate)"
Cohesion: 0.25
Nodes (7): Metadata, NOT Building, Plan: Browser Performance Optimization (load time + framerate), Risks accepted, Summary, Tasks (executed), Validation

### Community 53 - "ask_eco.js"
Cohesion: 0.33
Nodes (3): bedrock, { BedrockRuntimeClient, InvokeModelCommand }, corsHeaders

### Community 54 - "vitest"
Cohesion: 0.22
Nodes (3): vite, @vitejs/plugin-react, vitest

## Knowledge Gaps
- **277 isolated node(s):** `{ chromium }`, `{ BedrockRuntimeClient, InvokeModelCommand }`, `bedrock`, `corsHeaders`, `{ DynamoDBClient }` (+272 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 357 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AudioService` connect `AudioService` to `react`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **What connects `{ chromium }`, `{ BedrockRuntimeClient, InvokeModelCommand }`, `bedrock` to the rest of the system?**
  _277 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `progress.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07977207977207977 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `package.json`, `game.ts`, `createItemMesh.ts`, `WorldPage.tsx`, `WorldCanvas.tsx`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `BinType` connect `BinType` to `Level 1: Waste Detective — Implementation Plan`, `game.ts`, `react`, `WorldPage.tsx`, `WorldCanvas.tsx`, `societyScene.ts`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Should `Level 1: Waste Detective — Implementation Plan` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._