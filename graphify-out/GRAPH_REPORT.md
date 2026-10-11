# Graph Report - EcoSort  (2026-10-11)

## Corpus Check
- 208 files · ~887,860 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .example 1, .webmanifest 1)

## Summary
- 1057 nodes · 2138 edges · 91 communities (51 shown, 40 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 89 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ecdc1ef1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- devDependencies
- backend/package.json
- package.json
- Level 1: Waste Detective — Implementation Plan
- compilerOptions
- AudioService
- GLTFBuilder
- ECC Skills Integration
- three
- createLitterScatter
- MeadowHud.tsx
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
- game.ts
- societyManifestContract.test.ts
- createMeadowsItemManager
- locomotion.test.ts
- Green Meadows Rescue (Level 7) — Architectural & Implementation Plan
- items.ts
- manifest.ts
- societyWave1Integration.test.ts
- ItemData
- Phase3Controller.tsx
- migsunData.ts
- WorldCanvas.tsx
- ask_eco.js
- vite.config.ts
- react
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
- vitest
- test-polly.mjs
- MigsunGameController.tsx
- cloudwatch.js
- Status: Agent D (Phase 1: Clean The Waste)
- App.tsx
- Status: Agent E (Phase 2: Install Dustbins)
- Status: Agent F (Phase 3: Teach Residents & Dashboard)
- music.ts
- audio
- audio.ts
- LandingPage.tsx
- MissionResultsModal.tsx
- analytics.js
- EcoLensOverlay.tsx
- progress.js
- report.js
- MeadowsResultsModal.tsx
- meadowsItemManager.ts
- dependencies
- AvatarSelectModal.tsx

## God Nodes (most connected - your core abstractions)
1. `react` - 54 edges
2. `three` - 51 edges
3. `AudioService` - 45 edges
4. `BinType` - 43 edges
5. `lucide-react` - 40 edges
6. `createItemMesh()` - 35 edges
7. `WorldPage()` - 31 edges
8. `WorldCanvas()` - 26 edges
9. `createMeadowsScene()` - 26 edges
10. `vitest` - 25 edges

## Surprising Connections (you probably didn't know these)
- `1.3 Litter Scatter System` --references--> `createItemMesh()`  [INFERRED]
  LEVEL1_WASTE_DETECTIVE_PLAN.md → src/components/world/items/createItemMesh.ts
- `1.1 Add `residual` bin type` --references--> `BinType`  [INFERRED]
  LEVEL1_WASTE_DETECTIVE_PLAN.md → src/types/game.ts
- `2.2 Bin Mapping for Level 1: Waste Detective` --references--> `BinType`  [INFERRED]
  LEVEL1_WASTE_DETECTIVE_PLAN.md → src/types/game.ts
- `Modified Files (6)` --references--> `MigsunGameController()`  [INFERRED]
  MIGSUN_VILASA_PLAN.md → src/components/game/migsun/MigsunGameController.tsx
- `✅ Phase 1: Configuration & Routing` --references--> `resolveEnvMode()`  [INFERRED]
  MEADOWS_WORLD_PLAN.md → src/components/world/WorldCanvas.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Visual Design & Aesthetics** — agents_skills_frontend_design, agents_skills_fiction, agents_skills_lingo, agents_skills_bento [EXTRACTED 0.90]
- **Quality Assurance & Verification Flow** — agents_skills_tdd_workflow, agents_skills_verification_loop, agents_skills_ai_regression_testing, agents_skills_click_path_audit [INFERRED 0.85]

## Communities (91 total, 40 thin omitted)

### Community 0 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, autoprefixer, jsdom, postcss, tailwindcss, @types/canvas-confetti, @types/react, @types/react-dom (+5 more)

### Community 1 - "backend/package.json"
Cohesion: 0.25
Nodes (7): description, @aws-sdk/client-bedrock-runtime, @aws-sdk/client-polly, main, name, version, @aws-sdk/lib-dynamodb

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

### Community 8 - "three"
Cohesion: 0.07
Nodes (41): three, MapItemPreview(), MapItemPreviewProps, disposeObject3D(), createItemMesh(), disposeItemMesh(), DEFAULT_MAP_ITEM_PLACEMENTS, MapItemInstance (+33 more)

### Community 9 - "createLitterScatter"
Cohesion: 0.14
Nodes (6): createLitterScatter(), dispose(), placeItem(), LitterScatterSystem, ScatteredItem, shuffle()

### Community 10 - "MeadowHud.tsx"
Cohesion: 0.16
Nodes (19): CountdownTimer(), ContaminationMeter(), ContaminationMeterProps, EcoLensAbilityButton(), LevelBadge(), MeadowHud(), MeadowHudProps, MissionPanel() (+11 more)

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
Nodes (18): CleanlinessMeter(), CleanlinessMeterProps, EcopediaModal(), EcoSortGame(), EcoSortGameProps, LevelEndModal(), MascotDialogue(), MascotDialogueProps (+10 more)

### Community 38 - "🏘️ Migsun Vilasa — New World Implementation Plan"
Cohesion: 0.05
Nodes (41): 0. Vision Summary, 1.1 Add Migsun Vilasa Level to `levels.ts`, 1.2 Add `MIGSUN` Scene Type, 1.3 Create Migsun Scene — `migsunScene.ts`, 1. What Already Exists (Reusable), 2.1 Character Intro Overlay — `CharacterIntroOverlay.tsx`, 2.2 Mission Select Panel — `MissionSelectPanel.tsx`, 2.3 Kai Front-Facing Pose (+33 more)

### Community 39 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, graphify, graphify:hook, graphify:viz, preview, test (+2 more)

### Community 40 - "dependencies"
Cohesion: 0.25
Nodes (8): dependencies, @aws-sdk/client-bedrock-runtime, @aws-sdk/client-polly, canvas-confetti, lucide-react, react, react-dom, three

### Community 41 - "game.ts"
Cohesion: 0.21
Nodes (9): EcopediaModalProps, QuizModalProps, MapItemCard(), MapItemCardProps, MapItemGalleryModalProps, ALL_BINS, BinInfo, LevelConfig (+1 more)

### Community 42 - "societyManifestContract.test.ts"
Cohesion: 0.16
Nodes (8): isSocietyWorldEnabled(), setSocietyWorldEnabled(), getAvailableWorlds(), getWorldById(), WORLD_REGISTRY, buildSocietyMapPlaceholder(), getSocietyPropsCatalog(), WorldRegistryEntry

### Community 45 - "Green Meadows Rescue (Level 7) — Architectural & Implementation Plan"
Cohesion: 0.25
Nodes (7): 1. Overview & Vision, 2. Spatial & Scene Architecture, 3. HUD & Control System, Control Dynamics, Core Objectives, Green Meadows Rescue (Level 7) — Architectural & Implementation Plan, Key Elements

### Community 46 - "items.ts"
Cohesion: 0.36
Nodes (3): GAME_ITEMS, LEVEL_QUIZZES, BOUNDS

### Community 47 - "manifest.ts"
Cohesion: 0.24
Nodes (8): SOCIETY_MANIFEST, initializePhase1State(), Phase1ControllerProps, SAMPLE_ITEMS, Phase1State, Phase1Step, initializePhase2State(), initializePhase3State()

### Community 49 - "ItemData"
Cohesion: 0.25
Nodes (6): LevelEndModalProps, BIN_OPTIONS, MeadowsBinModal(), MeadowsBinModalProps, AdaptiveSpawner, ItemData

### Community 50 - "Phase3Controller.tsx"
Cohesion: 0.14
Nodes (11): SOCIETY_AUDIO_IDS, SOCIETY_AUDIO_KEYS, SOCIETY_VOICE_MANIFEST, SocietyVoiceManifestItem, SOCIETY_CONTENT, SOCIETY_STRINGS, SocietyHotspotContent, SocietyResidentQuiz (+3 more)

### Community 51 - "migsunData.ts"
Cohesion: 0.13
Nodes (17): BinLocationChoiceProps, CharacterIntroOverlayProps, DustbinCardOverlayProps, EcoLensScanOverlayProps, BIN_INSTALL_LOCATIONS, BinInstallLocation, DUSTBIN_CARDS, DustbinCardData (+9 more)

### Community 52 - "WorldCanvas.tsx"
Cohesion: 0.05
Nodes (55): 1. Executive Summary, 2. Component Verification & Reuse Matrix, 3. Architecture Constraints & Conventions, Level 1 (Migsun Vilasa) Component Reuse Inventory, 4. Phase Status & Implementation Checklist, ✅ Phase 1: Configuration & Routing, ✅ Phase 2: Scene Scaffolding, ✅ Phase 3: Meadows HUD & Controls (+47 more)

### Community 53 - "ask_eco.js"
Cohesion: 0.29
Nodes (6): bedrock, { BedrockRuntimeClient, InvokeModelCommand }, corsHeaders, handler(), { trackMascotInvocation, recordMetric }, trackMascotInvocation()

### Community 55 - "react"
Cohesion: 0.18
Nodes (10): lucide-react, react, CountdownTimerProps, EnergyMeterHUDProps, LevelBadgeProps, LearningCardData, MEADOWS_LEARNING_CARDS(), MeadowsLearningCardsModal() (+2 more)

### Community 56 - "Status: Agent 0 (Architect)"
Cohesion: 0.50
Nodes (3): Completed Deliverables, Exit Gate Verification, Status: Agent 0 (Architect)

### Community 57 - "meadowsScene.ts"
Cohesion: 0.12
Nodes (20): COL, createBush(), createDamagedLamp(), createDeadTree(), createFlowerPatch(), createGreenBench(), createGreeneryLamp(), createLushTree() (+12 more)

### Community 58 - "SocietyWorld.tsx"
Cohesion: 0.12
Nodes (9): createSocietyMap(), Phase1Controller(), Phase2Controller(), Phase3Controller(), createSocietyProps(), SocietyPropsResult, SocietyMissionNumber, SocietyWorld() (+1 more)

### Community 59 - "Society World Map Layout & Anchor Specification"
Cohesion: 0.33
Nodes (5): 1. Spatial Zones & Layout Concept, 2. Master Anchor Table, 3. Bin Spot Candidates (Shared Rule Verification), 4. Visual State Progression, Society World Map Layout & Anchor Specification

### Community 70 - "vitest"
Cohesion: 0.24
Nodes (5): vitest, apiService, SaveProgressPayload, ObservabilityMetrics, TeacherReportStats

### Community 72 - "MigsunGameController.tsx"
Cohesion: 0.22
Nodes (13): 4. File Change Summary, Modified Files (6), New Files (12), BinLocationChoice(), CharacterIntroOverlay(), DustbinCardOverlay(), EcoLensScanOverlay(), MigsunGameController() (+5 more)

### Community 73 - "cloudwatch.js"
Cohesion: 0.20
Nodes (12): { CloudWatchClient, PutMetricDataCommand }, getClient(), recordMetric(), trackSortEvent(), corsHeaders, handler(), polly, { PollyClient, SynthesizeSpeechCommand } (+4 more)

### Community 75 - "App.tsx"
Cohesion: 0.33
Nodes (8): App(), RouteFallback(), TeacherDashboard, WorldPage, LandingPage(), NAV_LINKS, Navbar(), NavbarProps

### Community 78 - "music.ts"
Cohesion: 0.21
Nodes (8): BAR_DURATION_SECONDS, CHORD_PROGRESSION, isMusicPlaying(), MELODY_PATTERNS, runScheduler(), scheduleBar(), startMusicLoop(), installGlobalUiAudio()

### Community 79 - "audio"
Cohesion: 0.18
Nodes (7): react-dom, CallStage, MeadowsPhoneModal(), MeadowsPhoneModalProps, HealthDashboardProps, audio, MockUtterance

### Community 80 - "audio.ts"
Cohesion: 0.27
Nodes (6): SetStoredBoolean, usePersistentBoolean(), readStoredBoolean(), readStoredNumber(), writeStoredBoolean(), writeStoredNumber()

### Community 81 - "LandingPage.tsx"
Cohesion: 0.24
Nodes (7): LevelSelectModal(), LevelSelectModalProps, HERO_ADVENTURES, HeroAdventure, LandingPageProps, TAGLINE_WORDS, GAME_LEVELS

### Community 82 - "MissionResultsModal.tsx"
Cohesion: 0.28
Nodes (8): getRating(), MissionError, MissionResultsModal(), MissionResultsModalProps, Rating, RATING_CONFIG, StatCard(), StatCardProps

### Community 83 - "analytics.js"
Cohesion: 0.22
Nodes (6): client, corsHeaders, ddbDocClient, { DynamoDBClient }, { DynamoDBDocumentClient, ScanCommand }, { NAMESPACE }

### Community 84 - "EcoLensOverlay.tsx"
Cohesion: 0.31
Nodes (7): EcoLensButton(), EcoLensButtonProps, EcoLensOverlay(), EcoLensOverlayProps, EcoLensAbilityButtonProps, EcoLensState, getLensUsesRemaining()

### Community 85 - "progress.js"
Cohesion: 0.25
Nodes (6): client, corsHeaders, ddbDocClient, { DynamoDBClient }, { DynamoDBDocumentClient, PutCommand, QueryCommand }, { recordMetric, trackSortEvent }

### Community 86 - "report.js"
Cohesion: 0.25
Nodes (7): client, corsHeaders, ddbDocClient, { DynamoDBClient }, { DynamoDBDocumentClient, ScanCommand }, { recordMetric }, @aws-sdk/client-dynamodb

### Community 87 - "MeadowsResultsModal.tsx"
Cohesion: 0.62
Nodes (5): calculateMeadowsStars(), formatTimeTaken(), getContaminationLabel(), MeadowsResultsModal(), MeadowsResultsModalProps

### Community 88 - "meadowsItemManager.ts"
Cohesion: 0.36
Nodes (6): MEADOWS_CONTAMINATION_SPEECHES, MEADOWS_PHASE5_ITEMS, MEADOWS_WRONG_BIN_HINTS, MeadowsGroundItem, MeadowsItemManager, MEADOWS_WASTE_PILE_CENTER

### Community 89 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, @aws-sdk/client-bedrock-runtime, @aws-sdk/client-cloudwatch, @aws-sdk/client-dynamodb, @aws-sdk/client-polly, @aws-sdk/lib-dynamodb

### Community 90 - "AvatarSelectModal.tsx"
Cohesion: 0.50
Nodes (3): AVATARS, AvatarSelectModalProps, PlayerProfile

## Knowledge Gaps
- **343 isolated node(s):** `build-android.sh script`, `{ DynamoDBClient }`, `{ DynamoDBDocumentClient, ScanCommand }`, `{ NAMESPACE }`, `client` (+338 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 479 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **40 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AudioService` connect `AudioService` to `audio.ts`, `music.ts`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `BinType` (e.g. with `2. Component Verification & Reuse Matrix` and `1.1 Add `residual` bin type`) actually correct?**
  _`BinType` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `build-android.sh script`, `{ DynamoDBClient }`, `{ DynamoDBDocumentClient, ScanCommand }` to the rest of the system?**
  _343 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `three` connect `three` to `package.json`, `worlds/types.ts`, `WorldPage.tsx`, `vitest`, `createLitterScatter`, `items.ts`, `manifest.ts`, `WorldCanvas.tsx`, `meadowsItemManager.ts`, `meadowsScene.ts`, `SocietyWorld.tsx`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `Level 1: Waste Detective — Implementation Plan` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._
- **Why does `BinType` connect `WorldCanvas.tsx` to `Level 1: Waste Detective — Implementation Plan`, `worlds/types.ts`, `WorldPage.tsx`, `MigsunGameController.tsx`, `game.ts`, `manifest.ts`, `ItemData`, `MissionResultsModal.tsx`, `migsunData.ts`, `EcoLensOverlay.tsx`, `Phase3Controller.tsx`, `meadowsScene.ts`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._