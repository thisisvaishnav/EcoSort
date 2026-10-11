# Graph Report - EcoSort  (2026-10-11)

## Corpus Check
- 196 files · ~693,354 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .example 1, .webmanifest 1)

## Summary
- 991 nodes · 1963 edges · 80 communities (41 shown, 39 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 67 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f08a3c95`
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
- BinType
- migsunData.ts
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
- worlds/types.ts
- PART B — Visual system
- react
- 🏘️ Migsun Vilasa — New World Implementation Plan
- scripts
- dependencies
- WorldPage.tsx
- societyManifestContract.test.ts
- locomotion.test.ts
- audio.ts
- 4. Phase Status & Implementation Checklist
- game.ts
- manifest.ts
- societyWave1Integration.test.ts
- meadowsScene.ts
- Phase3Controller.tsx
- Level 1 (Migsun Vilasa) Component Reuse Inventory
- lucide-react
- ask_eco.js
- vite.config.ts
- App.tsx
- Status: Agent 0 (Architect)
- WorldCanvas.tsx
- SocietyWorld.tsx
- Society World Map Layout & Anchor Specification
- Shared Change Requests
- Status: Agent A (Platform & Landing Page Integrator)
- Status: Agent B (Map & Scene)
- en/society/README.md
- models/society/README.md
- Status: Agent C (Props & Assets)
- Status: Agent G (Content & Audio)
- Status: Agent H (Android & Performance)
- Status: Agent I (QA & Release)
- build-android.sh
- MigsunGameController.tsx
- test-polly.mjs
- items.ts
- music.ts
- Status: Agent D (Phase 1: Clean The Waste)
- usePersistentBoolean.ts
- Status: Agent E (Phase 2: Install Dustbins)
- Status: Agent F (Phase 3: Teach Residents & Dashboard)
- MissionResultsModal.tsx
- vitest

## God Nodes (most connected - your core abstractions)
1. `three` - 48 edges
2. `react` - 47 edges
3. `AudioService` - 45 edges
4. `BinType` - 39 edges
5. `lucide-react` - 37 edges
6. `createItemMesh()` - 33 edges
7. `WorldPage()` - 28 edges
8. `WorldCanvas()` - 25 edges
9. `vitest` - 20 edges
10. `ItemMeshOptions` - 20 edges

## Surprising Connections (you probably didn't know these)
- `1.3 Litter Scatter System` --references--> `createItemMesh()`  [INFERRED]
  LEVEL1_WASTE_DETECTIVE_PLAN.md → src/components/world/items/createItemMesh.ts
- `1.1 Add `residual` bin type` --references--> `BinType`  [INFERRED]
  LEVEL1_WASTE_DETECTIVE_PLAN.md → src/types/game.ts
- `2.2 Bin Mapping for Level 1: Waste Detective` --references--> `BinType`  [INFERRED]
  LEVEL1_WASTE_DETECTIVE_PLAN.md → src/types/game.ts
- `✅ Phase 1: Configuration & Routing` --references--> `resolveEnvMode()`  [INFERRED]
  MEADOWS_WORLD_PLAN.md → src/components/world/WorldCanvas.tsx
- `✅ Phase 3: Meadows HUD & Controls` --references--> `joystickToMoveDir()`  [INFERRED]
  MEADOWS_WORLD_PLAN.md → src/components/world/locomotion.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Visual Design & Aesthetics** — agents_skills_frontend_design, agents_skills_fiction, agents_skills_lingo, agents_skills_bento [EXTRACTED 0.90]
- **Quality Assurance & Verification Flow** — agents_skills_tdd_workflow, agents_skills_verification_loop, agents_skills_ai_regression_testing, agents_skills_click_path_audit [INFERRED 0.85]

## Communities (80 total, 39 thin omitted)

### Community 0 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, autoprefixer, jsdom, postcss, tailwindcss, @types/canvas-confetti, @types/react, @types/react-dom (+5 more)

### Community 1 - "progress.js"
Cohesion: 0.07
Nodes (23): client, corsHeaders, ddbDocClient, { DynamoDBClient }, { DynamoDBDocumentClient, PutCommand, QueryCommand }, client, corsHeaders, ddbDocClient (+15 more)

### Community 2 - "package.json"
Cohesion: 0.12
Nodes (16): @aws-sdk/client-bedrock-runtime, @aws-sdk/client-polly, name, private, type, version, autoprefixer, canvas-confetti (+8 more)

### Community 3 - "Level 1: Waste Detective — Implementation Plan"
Cohesion: 0.05
Nodes (41): 1.1 Add `residual` bin type, 1.2 Create Society Scene, 1.3 Litter Scatter System, 1.4 Pick-up Mechanic, 1.5 Update Level 1 Config, 1. Current State Analysis, 2.1 Countdown Timer, 2.1 Scene Strategy (+33 more)

### Community 4 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 5 - "AudioService"
Cohesion: 0.11
Nodes (4): 4.3 Audio and Sound Effects, 8.2 Sound Effects to Add, AudioService, stopMusicLoop()

### Community 7 - "ECC Skills Integration"
Cohesion: 0.18
Nodes (10): AI Regression Testing Skill, Architecture Skill, Bento Design System, Click-Path Audit Skill, Fiction Design System, Frontend Design Skill, Lingo Design System, TDD Workflow Skill (+2 more)

### Community 8 - "createItemMesh.ts"
Cohesion: 0.07
Nodes (41): three, MapItemPreview(), MapItemPreviewProps, disposeObject3D(), createItemMesh(), disposeItemMesh(), DEFAULT_MAP_ITEM_PLACEMENTS, MapItemInstance (+33 more)

### Community 9 - "BinType"
Cohesion: 0.16
Nodes (14): DustbinCardOverlayProps, DustbinCardData, BinType, Phase1ControllerProps, SAMPLE_ITEMS, Phase1LitterItem, Phase1State, Phase1Step (+6 more)

### Community 10 - "migsunData.ts"
Cohesion: 0.15
Nodes (15): BinLocationChoiceProps, CharacterIntroOverlayProps, EcoLensScanOverlayProps, BIN_INSTALL_LOCATIONS, BinInstallLocation, DUSTBIN_CARDS, ECO_SCAN_TARGETS, EcoScanCauseEffect (+7 more)

### Community 11 - "compilerOptions"
Cohesion: 0.25
Nodes (7): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 12 - "EcoSort Heroes Full Plan"
Cohesion: 0.67
Nodes (3): ASD-STE100 Rules, EcoSort Heroes Full Plan, SAM Infrastructure Template

### Community 34 - "PART B — Visual system"
Cohesion: 0.06
Nodes (34): A1. Intake, A2. Page structure, A3. Layout selection, A4. Conversion rules, A5. Copywriting, A6. Build order, A7. SEO and AEO, A8. Pitfalls (+26 more)

### Community 35 - "worlds/types.ts"
Cohesion: 0.15
Nodes (13): SocietyMapResult, CameraAnchor, CollisionShape, EcoHotspotAnchor, ItemSpawnRegion, PlayerStartAnchor, ResidentAnchor, SackPositions (+5 more)

### Community 36 - "PART B — Visual system"
Cohesion: 0.06
Nodes (34): A1. Intake, A2. Page structure, A3. Layout selection, A4. Conversion rules, A5. Copywriting, A6. Build order, A7. SEO and AEO, A8. Pitfalls (+26 more)

### Community 37 - "react"
Cohesion: 0.13
Nodes (26): react, CountdownTimer(), CountdownTimerProps, EcoLensButtonProps, EcoLensOverlayProps, EcoLensAbilityButton(), EcoLensAbilityButtonProps, LevelBadge() (+18 more)

### Community 38 - "🏘️ Migsun Vilasa — New World Implementation Plan"
Cohesion: 0.05
Nodes (41): 0. Vision Summary, 1.1 Add Migsun Vilasa Level to `levels.ts`, 1.2 Add `MIGSUN` Scene Type, 1.3 Create Migsun Scene — `migsunScene.ts`, 1. What Already Exists (Reusable), 2.1 Character Intro Overlay — `CharacterIntroOverlay.tsx`, 2.2 Mission Select Panel — `MissionSelectPanel.tsx`, 2.3 Kai Front-Facing Pose (+33 more)

### Community 39 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, graphify, graphify:hook, graphify:viz, preview, test (+2 more)

### Community 40 - "dependencies"
Cohesion: 0.25
Nodes (8): dependencies, @aws-sdk/client-bedrock-runtime, @aws-sdk/client-polly, canvas-confetti, lucide-react, react, react-dom, three

### Community 41 - "WorldPage.tsx"
Cohesion: 0.16
Nodes (19): CleanlinessMeter(), CleanlinessMeterProps, EcoLensButton(), EcoLensOverlay(), EcopediaModal(), EcoSortGame(), EcoSortGameProps, LevelEndModal() (+11 more)

### Community 42 - "societyManifestContract.test.ts"
Cohesion: 0.15
Nodes (7): setSocietyWorldEnabled(), getAvailableWorlds(), getWorldById(), WORLD_REGISTRY, buildSocietyMapPlaceholder(), getSocietyPropsCatalog(), WorldRegistryEntry

### Community 44 - "audio.ts"
Cohesion: 0.15
Nodes (7): MEADOWS_INTRO_STEPS, MeadowsIntroOverlayProps, MeadowsPhoneModalProps, HealthDashboardProps, audio, writeStoredNumber(), MockUtterance

### Community 45 - "4. Phase Status & Implementation Checklist"
Cohesion: 0.13
Nodes (14): 1. Overview & Vision, 2. Spatial & Scene Architecture, 3. HUD & Control System, 4. Phase Status & Implementation Checklist, Control Dynamics, Core Objectives, Green Meadows Rescue (Level 7) — Architectural & Implementation Plan, Key Elements (+6 more)

### Community 46 - "game.ts"
Cohesion: 0.20
Nodes (11): LevelEndModalProps, QuizModalProps, MapItemCard(), MapItemCardProps, MapItemGalleryModal(), MapItemGalleryModalProps, ALL_BINS, AdaptiveSpawner (+3 more)

### Community 47 - "manifest.ts"
Cohesion: 0.40
Nodes (4): SOCIETY_MANIFEST, initializePhase1State(), initializePhase2State(), initializePhase3State()

### Community 49 - "meadowsScene.ts"
Cohesion: 0.18
Nodes (18): COL, createBush(), createDamagedLamp(), createDeadTree(), createFlowerPatch(), createGreenBench(), createGreeneryLamp(), createLushTree() (+10 more)

### Community 50 - "Phase3Controller.tsx"
Cohesion: 0.15
Nodes (11): SOCIETY_AUDIO_IDS, SOCIETY_AUDIO_KEYS, SOCIETY_VOICE_MANIFEST, SocietyVoiceManifestItem, SOCIETY_CONTENT, SOCIETY_STRINGS, SocietyHotspotContent, SocietyResidentQuiz (+3 more)

### Community 51 - "Level 1 (Migsun Vilasa) Component Reuse Inventory"
Cohesion: 0.33
Nodes (5): 1. Executive Summary, 2. Component Verification & Reuse Matrix, 3. Architecture Constraints & Conventions, Level 1 (Migsun Vilasa) Component Reuse Inventory, triggerPlantRevival()

### Community 52 - "lucide-react"
Cohesion: 0.16
Nodes (9): lucide-react, AVATARS, AvatarSelectModalProps, EnergyMeterHUDProps, MascotDialogueProps, apiService, SaveProgressPayload, PlayerProfile (+1 more)

### Community 53 - "ask_eco.js"
Cohesion: 0.33
Nodes (3): bedrock, { BedrockRuntimeClient, InvokeModelCommand }, corsHeaders

### Community 55 - "App.tsx"
Cohesion: 0.15
Nodes (15): react-dom, App(), RouteFallback(), SocietyWorld, TeacherDashboard, WorldPage, HERO_ADVENTURES, HeroAdventure (+7 more)

### Community 56 - "Status: Agent 0 (Architect)"
Cohesion: 0.50
Nodes (3): Completed Deliverables, Exit Gate Verification, Status: Agent 0 (Architect)

### Community 57 - "WorldCanvas.tsx"
Cohesion: 0.05
Nodes (47): LEVEL_STATIONS, createLitterScatter(), dispose(), placeItem(), LitterScatterSystem, ScatteredItem, shuffle(), createLocomotionEngine() (+39 more)

### Community 58 - "SocietyWorld.tsx"
Cohesion: 0.12
Nodes (9): createSocietyMap(), Phase1Controller(), Phase2Controller(), Phase3Controller(), createSocietyProps(), SocietyPropsResult, SocietyMissionNumber, SocietyWorld() (+1 more)

### Community 59 - "Society World Map Layout & Anchor Specification"
Cohesion: 0.33
Nodes (5): 1. Spatial Zones & Layout Concept, 2. Master Anchor Table, 3. Bin Spot Candidates (Shared Rule Verification), 4. Visual State Progression, Society World Map Layout & Anchor Specification

### Community 70 - "MigsunGameController.tsx"
Cohesion: 0.19
Nodes (14): 4. File Change Summary, Modified Files (6), New Files (12), BinLocationChoice(), CharacterIntroOverlay(), DustbinCardOverlay(), EcoLensScanOverlay(), MigsunGameController() (+6 more)

### Community 71 - "test-polly.mjs"
Cohesion: 0.15
Nodes (5): corsHeaders, polly, { PollyClient, SynthesizeSpeechCommand }, __dirname, __filename

### Community 72 - "items.ts"
Cohesion: 0.24
Nodes (6): EcopediaModalProps, LevelSelectModalProps, GAME_ITEMS, GAME_LEVELS, LEVEL_QUIZZES, LevelConfig

### Community 73 - "music.ts"
Cohesion: 0.24
Nodes (8): BAR_DURATION_SECONDS, CHORD_PROGRESSION, isMusicPlaying(), MELODY_PATTERNS, runScheduler(), scheduleBar(), startMusicLoop(), installGlobalUiAudio()

### Community 75 - "usePersistentBoolean.ts"
Cohesion: 0.32
Nodes (5): SetStoredBoolean, usePersistentBoolean(), readStoredBoolean(), readStoredNumber(), writeStoredBoolean()

### Community 79 - "MissionResultsModal.tsx"
Cohesion: 0.28
Nodes (8): getRating(), MissionError, MissionResultsModal(), MissionResultsModalProps, Rating, RATING_CONFIG, StatCard(), StatCardProps

## Knowledge Gaps
- **327 isolated node(s):** `build-android.sh script`, `{ BedrockRuntimeClient, InvokeModelCommand }`, `bedrock`, `corsHeaders`, `{ PollyClient, SynthesizeSpeechCommand }` (+322 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 454 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `package.json`, `MigsunGameController.tsx`, `items.ts`, `WorldPage.tsx`, `migsunData.ts`, `BinType`, `audio.ts`, `createItemMesh.ts`, `game.ts`, `MissionResultsModal.tsx`, `usePersistentBoolean.ts`, `Phase3Controller.tsx`, `lucide-react`, `App.tsx`, `WorldCanvas.tsx`, `SocietyWorld.tsx`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `BinType` (e.g. with `2. Component Verification & Reuse Matrix` and `1.1 Add `residual` bin type`) actually correct?**
  _`BinType` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `build-android.sh script`, `{ BedrockRuntimeClient, InvokeModelCommand }`, `bedrock` to the rest of the system?**
  _327 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `progress.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07389162561576355 - nodes in this community are weakly interconnected._
- **Why does `BinType` connect `BinType` to `Level 1: Waste Detective — Implementation Plan`, `worlds/types.ts`, `react`, `MigsunGameController.tsx`, `WorldPage.tsx`, `migsunData.ts`, `game.ts`, `MissionResultsModal.tsx`, `Phase3Controller.tsx`, `Level 1 (Migsun Vilasa) Component Reuse Inventory`, `WorldCanvas.tsx`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `AudioService` connect `AudioService` to `music.ts`, `usePersistentBoolean.ts`, `audio.ts`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._