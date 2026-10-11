# Graph Report - EcoSort  (2026-10-11)

## Corpus Check
- 205 files · ~885,005 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .example 1, .webmanifest 1)

## Summary
- 1033 nodes · 2090 edges · 89 communities (50 shown, 39 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 85 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0023e670`
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
- three
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
- worlds/types.ts
- PART B — Visual system
- WorldPage.tsx
- 🏘️ Migsun Vilasa — New World Implementation Plan
- scripts
- dependencies
- MapItemGalleryModal.tsx
- societyManifestContract.test.ts
- createMeadowsItemManager
- locomotion.test.ts
- 4. Phase Status & Implementation Checklist
- items.ts
- manifest.ts
- societyWave1Integration.test.ts
- game.ts
- Phase3Controller.tsx
- audio.ts
- societyScene.ts
- ask_eco.js
- vite.config.ts
- world/types.ts
- Status: Agent 0 (Architect)
- meadowsScene.ts
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
- TeacherDashboard.tsx
- test-polly.mjs
- locomotion.ts
- createMigsunScene
- Status: Agent D (Phase 1: Clean The Waste)
- App.tsx
- Status: Agent E (Phase 2: Install Dustbins)
- Status: Agent F (Phase 3: Teach Residents & Dashboard)
- WorldCanvas
- 3. Implementation Phases (Step-by-Step)
- Level 1 (Migsun Vilasa) Component Reuse Inventory
- Phase1Controller.tsx
- MissionResultsModal.tsx
- Phase 1 — Level Config & Scene Foundation (Day 1)
- Phase 2 — Character Introduction & Dialogue System (Day 2)
- 7. Technical Notes
- Phase 5 — Eco Lens Cause-Effect Scanning (Day 5)
- Phase 8 — Level Complete & Polish (Day 7)
- WorldCanvas.tsx

## God Nodes (most connected - your core abstractions)
1. `react` - 54 edges
2. `three` - 51 edges
3. `AudioService` - 45 edges
4. `BinType` - 43 edges
5. `lucide-react` - 40 edges
6. `createItemMesh()` - 35 edges
7. `WorldPage()` - 31 edges
8. `WorldCanvas()` - 26 edges
9. `createMeadowsScene()` - 25 edges
10. `vitest` - 24 edges

## Surprising Connections (you probably didn't know these)
- `1.3 Litter Scatter System` --references--> `createItemMesh()`  [INFERRED]
  LEVEL1_WASTE_DETECTIVE_PLAN.md → src/components/world/items/createItemMesh.ts
- `1.1 Add `residual` bin type` --references--> `BinType`  [INFERRED]
  LEVEL1_WASTE_DETECTIVE_PLAN.md → src/types/game.ts
- `2.2 Bin Mapping for Level 1: Waste Detective` --references--> `BinType`  [INFERRED]
  LEVEL1_WASTE_DETECTIVE_PLAN.md → src/types/game.ts
- `✅ Phase 3: Meadows HUD & Controls` --references--> `joystickToMoveDir()`  [INFERRED]
  MEADOWS_WORLD_PLAN.md → src/components/world/locomotion.ts
- `2. Component Verification & Reuse Matrix` --references--> `BinType`  [INFERRED]
  docs/agents/REUSE_INVENTORY.md → src/types/game.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Visual Design & Aesthetics** — agents_skills_frontend_design, agents_skills_fiction, agents_skills_lingo, agents_skills_bento [EXTRACTED 0.90]
- **Quality Assurance & Verification Flow** — agents_skills_tdd_workflow, agents_skills_verification_loop, agents_skills_ai_regression_testing, agents_skills_click_path_audit [INFERRED 0.85]

## Communities (89 total, 39 thin omitted)

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
Nodes (5): 4.3 Audio and Sound Effects, 8.2 Sound Effects to Add, AudioService, writeStoredNumber(), stopMusicLoop()

### Community 7 - "ECC Skills Integration"
Cohesion: 0.18
Nodes (10): AI Regression Testing Skill, Architecture Skill, Bento Design System, Click-Path Audit Skill, Fiction Design System, Frontend Design Skill, Lingo Design System, TDD Workflow Skill (+2 more)

### Community 8 - "three"
Cohesion: 0.07
Nodes (41): three, MapItemPreview(), MapItemPreviewProps, disposeObject3D(), createItemMesh(), disposeItemMesh(), DEFAULT_MAP_ITEM_PLACEMENTS, MapItemInstance (+33 more)

### Community 9 - "createLitterScatter"
Cohesion: 0.12
Nodes (7): createLitterScatter(), dispose(), placeItem(), LitterScatterSystem, ScatteredItem, shuffle(), BOUNDS

### Community 10 - "react"
Cohesion: 0.12
Nodes (25): lucide-react, react, CountdownTimer(), CountdownTimerProps, EnergyMeterHUDProps, ContaminationMeter(), ContaminationMeterProps, EcoLensAbilityButton() (+17 more)

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
Cohesion: 0.11
Nodes (19): SocietyMapResult, BIN_CARDS, EducationalCard, Phase2ControllerProps, Phase2State, Phase2Step, BinSpotCandidate, CameraAnchor (+11 more)

### Community 36 - "PART B — Visual system"
Cohesion: 0.06
Nodes (34): A1. Intake, A2. Page structure, A3. Layout selection, A4. Conversion rules, A5. Copywriting, A6. Build order, A7. SEO and AEO, A8. Pitfalls (+26 more)

### Community 37 - "WorldPage.tsx"
Cohesion: 0.15
Nodes (20): CleanlinessMeter(), CleanlinessMeterProps, EcoLensButton(), EcoLensButtonProps, EcoLensOverlay(), EcoLensOverlayProps, EcoSortGame(), EcoSortGameProps (+12 more)

### Community 38 - "🏘️ Migsun Vilasa — New World Implementation Plan"
Cohesion: 0.17
Nodes (11): 0. Vision Summary, 1. What Already Exists (Reusable), 2. Architecture: Game Phase State Machine, 4. File Change Summary, 5. Implementation Order & Milestones, 6. Data File: `migsunData.ts`, 8. Dependency Graph, 🏘️ Migsun Vilasa — New World Implementation Plan (+3 more)

### Community 39 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, graphify, graphify:hook, graphify:viz, preview, test (+2 more)

### Community 40 - "dependencies"
Cohesion: 0.25
Nodes (8): dependencies, @aws-sdk/client-bedrock-runtime, @aws-sdk/client-polly, canvas-confetti, lucide-react, react, react-dom, three

### Community 41 - "MapItemGalleryModal.tsx"
Cohesion: 0.19
Nodes (11): EcopediaModal(), EcopediaModalProps, QuizModal(), QuizModalProps, MapItemCard(), MapItemCardProps, MapItemGalleryModal(), MapItemGalleryModalProps (+3 more)

### Community 42 - "societyManifestContract.test.ts"
Cohesion: 0.16
Nodes (8): isSocietyWorldEnabled(), setSocietyWorldEnabled(), getAvailableWorlds(), getWorldById(), WORLD_REGISTRY, buildSocietyMapPlaceholder(), getSocietyPropsCatalog(), WorldRegistryEntry

### Community 45 - "4. Phase Status & Implementation Checklist"
Cohesion: 0.12
Nodes (15): 1. Overview & Vision, 2. Spatial & Scene Architecture, 3. HUD & Control System, 4. Phase Status & Implementation Checklist, Control Dynamics, Core Objectives, Green Meadows Rescue (Level 7) — Architectural & Implementation Plan, Key Elements (+7 more)

### Community 46 - "items.ts"
Cohesion: 0.26
Nodes (6): LevelSelectModal(), LevelSelectModalProps, GAME_ITEMS, GAME_LEVELS, LEVEL_QUIZZES, LevelConfig

### Community 47 - "manifest.ts"
Cohesion: 0.40
Nodes (4): SOCIETY_MANIFEST, initializePhase1State(), initializePhase2State(), initializePhase3State()

### Community 49 - "game.ts"
Cohesion: 0.18
Nodes (12): LevelEndModalProps, BIN_OPTIONS, MeadowsBinModal(), MeadowsBinModalProps, MEADOWS_CONTAMINATION_SPEECHES, MEADOWS_PHASE5_ITEMS, MEADOWS_WRONG_BIN_HINTS, MeadowsGroundItem (+4 more)

### Community 50 - "Phase3Controller.tsx"
Cohesion: 0.15
Nodes (11): SOCIETY_AUDIO_IDS, SOCIETY_AUDIO_KEYS, SOCIETY_VOICE_MANIFEST, SocietyVoiceManifestItem, SOCIETY_CONTENT, SOCIETY_STRINGS, SocietyHotspotContent, SocietyResidentQuiz (+3 more)

### Community 51 - "audio.ts"
Cohesion: 0.05
Nodes (49): Modified Files (6), vitest, CallStage, MeadowsPhoneModal(), MeadowsPhoneModalProps, BinLocationChoice(), BinLocationChoiceProps, CharacterIntroOverlay() (+41 more)

### Community 52 - "societyScene.ts"
Cohesion: 0.20
Nodes (9): BIN_COLORS, createSocietyScene(), makeBinIconTexture(), makeConcreteTex(), makeWallTex(), SocietySceneResult, TIP_LABELS, PinnedLitterSpot (+1 more)

### Community 53 - "ask_eco.js"
Cohesion: 0.33
Nodes (3): bedrock, { BedrockRuntimeClient, InvokeModelCommand }, corsHeaders

### Community 55 - "world/types.ts"
Cohesion: 0.24
Nodes (9): LEVEL_STATIONS, createProceduralCity(), ProceduralCityResult, WARM_GLOW_COLOR, CameraOrbitState, LevelStation, LocomotionState, WorldMode (+1 more)

### Community 56 - "Status: Agent 0 (Architect)"
Cohesion: 0.50
Nodes (3): Completed Deliverables, Exit Gate Verification, Status: Agent 0 (Architect)

### Community 57 - "meadowsScene.ts"
Cohesion: 0.10
Nodes (24): LearningCardData, MEADOWS_LEARNING_CARDS(), MeadowsLearningCardsModal(), MeadowsLearningCardsModalProps, COL, createBush(), createDamagedLamp(), createDeadTree() (+16 more)

### Community 58 - "SocietyWorld.tsx"
Cohesion: 0.12
Nodes (8): createSocietyMap(), Phase2Controller(), Phase3Controller(), createSocietyProps(), SocietyPropsResult, SocietyMissionNumber, SocietyWorld(), SocietyWorldProps

### Community 59 - "Society World Map Layout & Anchor Specification"
Cohesion: 0.33
Nodes (5): 1. Spatial Zones & Layout Concept, 2. Master Anchor Table, 3. Bin Spot Candidates (Shared Rule Verification), 4. Visual State Progression, Society World Map Layout & Anchor Specification

### Community 70 - "TeacherDashboard.tsx"
Cohesion: 0.19
Nodes (8): AVATARS, AvatarSelectModalProps, MascotDialogue(), MascotDialogueProps, apiService, SaveProgressPayload, PlayerProfile, TeacherReportStats

### Community 71 - "test-polly.mjs"
Cohesion: 0.15
Nodes (5): corsHeaders, polly, { PollyClient, SynthesizeSpeechCommand }, __dirname, __filename

### Community 72 - "locomotion.ts"
Cohesion: 0.33
Nodes (6): createLocomotionEngine(), isTypingTarget(), JoystickMoveDir, joystickToMoveDir(), LocomotionEngine, PlayerCharacter

### Community 73 - "createMigsunScene"
Cohesion: 0.20
Nodes (6): 4.1 Plant Revival Animation, 4.2 Bin Location Choice — `BinLocationChoice.tsx`, 4.3 Dustbin Education Cards — `DustbinCardOverlay.tsx`, Phase 4 — Area Restoration & Dustbin Installation (Day 4), createMigsunScene(), removePests()

### Community 75 - "App.tsx"
Cohesion: 0.13
Nodes (18): react-dom, App(), RouteFallback(), TeacherDashboard, WorldPage, calculateMeadowsStars(), formatTimeTaken(), getContaminationLabel() (+10 more)

### Community 78 - "WorldCanvas"
Cohesion: 0.33
Nodes (7): createPlayerCharacter(), createThirdPersonCamera(), pinchPitchDelta(), pinchZoomDelta(), ThirdPersonCameraSystem, WorldCanvas(), lookPoint

### Community 79 - "3. Implementation Phases (Step-by-Step)"
Cohesion: 0.22
Nodes (9): 3.1 Sort Choice Modal — `SortChoiceModal.tsx`, 3.2 Sorting Gameplay (Reuse Existing System), 3.3 Garbage Truck Arrival with "Gadi Wala Aaya" Song, 3. Implementation Phases (Step-by-Step), 6.1 Health Dashboard Component — `HealthDashboard.tsx`, 7.1 Teach-a-Resident System — `TeachResident.tsx`, Phase 3 — Mission 1: Clean the Waste (Day 3), Phase 6 — Neighbourhood Health Dashboard (Day 5–6) (+1 more)

### Community 80 - "Level 1 (Migsun Vilasa) Component Reuse Inventory"
Cohesion: 0.33
Nodes (5): 1. Executive Summary, 2. Component Verification & Reuse Matrix, 3. Architecture Constraints & Conventions, Level 1 (Migsun Vilasa) Component Reuse Inventory, triggerPlantRevival()

### Community 81 - "Phase1Controller.tsx"
Cohesion: 0.29
Nodes (6): Phase1Controller(), Phase1ControllerProps, SAMPLE_ITEMS, Phase1LitterItem, Phase1State, Phase1Step

### Community 82 - "MissionResultsModal.tsx"
Cohesion: 0.28
Nodes (8): getRating(), MissionError, MissionResultsModal(), MissionResultsModalProps, Rating, RATING_CONFIG, StatCard(), StatCardProps

### Community 83 - "Phase 1 — Level Config & Scene Foundation (Day 1)"
Cohesion: 0.50
Nodes (4): 1.1 Add Migsun Vilasa Level to `levels.ts`, 1.2 Add `MIGSUN` Scene Type, 1.3 Create Migsun Scene — `migsunScene.ts`, Phase 1 — Level Config & Scene Foundation (Day 1)

### Community 84 - "Phase 2 — Character Introduction & Dialogue System (Day 2)"
Cohesion: 0.50
Nodes (4): 2.1 Character Intro Overlay — `CharacterIntroOverlay.tsx`, 2.2 Mission Select Panel — `MissionSelectPanel.tsx`, 2.3 Kai Front-Facing Pose, Phase 2 — Character Introduction & Dialogue System (Day 2)

### Community 85 - "7. Technical Notes"
Cohesion: 0.50
Nodes (4): 7. Technical Notes, Accessibility, Mobile / Touch, Performance

### Community 86 - "Phase 5 — Eco Lens Cause-Effect Scanning (Day 5)"
Cohesion: 0.67
Nodes (3): 5.1 Extend Eco Lens for Environmental Scans, 5.2 Eco Lens Scan UI — `EcoLensScanOverlay.tsx`, Phase 5 — Eco Lens Cause-Effect Scanning (Day 5)

### Community 87 - "Phase 8 — Level Complete & Polish (Day 7)"
Cohesion: 0.67
Nodes (3): 8.1 Level Complete Screen — `MigsunLevelComplete.tsx`, 8.3 Camera Choreography, Phase 8 — Level Complete & Polish (Day 7)

### Community 88 - "WorldCanvas.tsx"
Cohesion: 0.29
Nodes (8): MeadowsItemManager, MeadowsSceneResult, BIN_COLORS, MigsunSceneResult, EnvMode, WorldCanvasProps, useCoarsePointer(), useIsPortrait()

## Knowledge Gaps
- **331 isolated node(s):** `build-android.sh script`, `{ BedrockRuntimeClient, InvokeModelCommand }`, `bedrock`, `corsHeaders`, `{ PollyClient, SynthesizeSpeechCommand }` (+326 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 468 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `package.json`, `worlds/types.ts`, `WorldPage.tsx`, `TeacherDashboard.tsx`, `three`, `MapItemGalleryModal.tsx`, `App.tsx`, `items.ts`, `game.ts`, `MissionResultsModal.tsx`, `audio.ts`, `Phase1Controller.tsx`, `Phase3Controller.tsx`, `WorldCanvas.tsx`, `meadowsScene.ts`, `SocietyWorld.tsx`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `BinType` (e.g. with `2. Component Verification & Reuse Matrix` and `1.1 Add `residual` bin type`) actually correct?**
  _`BinType` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `build-android.sh script`, `{ BedrockRuntimeClient, InvokeModelCommand }`, `bedrock` to the rest of the system?**
  _331 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `progress.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07389162561576355 - nodes in this community are weakly interconnected._
- **Why does `three` connect `three` to `package.json`, `worlds/types.ts`, `WorldPage.tsx`, `locomotion.ts`, `createLitterScatter`, `WorldCanvas`, `manifest.ts`, `game.ts`, `audio.ts`, `societyScene.ts`, `world/types.ts`, `WorldCanvas.tsx`, `meadowsScene.ts`, `SocietyWorld.tsx`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `BinType` connect `game.ts` to `Level 1: Waste Detective — Implementation Plan`, `worlds/types.ts`, `WorldPage.tsx`, `MapItemGalleryModal.tsx`, `Level 1 (Migsun Vilasa) Component Reuse Inventory`, `Phase1Controller.tsx`, `MissionResultsModal.tsx`, `audio.ts`, `societyScene.ts`, `Phase3Controller.tsx`, `world/types.ts`, `WorldCanvas.tsx`, `meadowsScene.ts`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._