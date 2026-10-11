# Graph Report - EcoSort  (2026-10-11)

## Corpus Check
- 146 files · ~679,252 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .example 1, .webmanifest 1)

## Summary
- 781 nodes · 1595 edges · 57 communities (33 shown, 24 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 62 edges (avg confidence: 0.89)
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
- MigsunGameController.tsx
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
- migsunScene.ts
- WorldPage.tsx
- locomotion.test.ts
- react
- 4. Phase Status & Implementation Checklist
- WorldCanvas.tsx
- world/types.ts
- meadowsScene.ts
- societyScene.ts
- lucide-react
- locomotion.ts
- audio
- ask_eco.js
- @vitejs/plugin-react
- App.tsx
- BinType

## God Nodes (most connected - your core abstractions)
1. `three` - 45 edges
2. `react` - 41 edges
3. `AudioService` - 37 edges
4. `lucide-react` - 31 edges
5. `createItemMesh()` - 31 edges
6. `WorldPage()` - 28 edges
7. `BinType` - 26 edges
8. `WorldCanvas()` - 25 edges
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
- `✅ Phase 3: Meadows HUD & Controls` --references--> `joystickToMoveDir()`  [INFERRED]
  MEADOWS_WORLD_PLAN.md → src/components/world/locomotion.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Visual Design & Aesthetics** — agents_skills_frontend_design, agents_skills_fiction, agents_skills_lingo, agents_skills_bento [EXTRACTED 0.90]
- **Quality Assurance & Verification Flow** — agents_skills_tdd_workflow, agents_skills_verification_loop, agents_skills_ai_regression_testing, agents_skills_click_path_audit [INFERRED 0.85]

## Communities (57 total, 24 thin omitted)

### Community 0 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, autoprefixer, jsdom, postcss, tailwindcss, @types/canvas-confetti, @types/react, @types/react-dom (+5 more)

### Community 1 - "progress.js"
Cohesion: 0.08
Nodes (21): client, corsHeaders, ddbDocClient, { DynamoDBClient }, { DynamoDBDocumentClient, PutCommand, QueryCommand }, client, corsHeaders, ddbDocClient (+13 more)

### Community 2 - "package.json"
Cohesion: 0.12
Nodes (15): @aws-sdk/client-bedrock-runtime, name, private, type, version, autoprefixer, canvas-confetti, jsdom (+7 more)

### Community 3 - "Level 1: Waste Detective — Implementation Plan"
Cohesion: 0.05
Nodes (41): 1.1 Add `residual` bin type, 1.2 Create Society Scene, 1.3 Litter Scatter System, 1.4 Pick-up Mechanic, 1.5 Update Level 1 Config, 1. Current State Analysis, 2.1 Countdown Timer, 2.1 Scene Strategy (+33 more)

### Community 4 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 5 - "AudioService"
Cohesion: 0.07
Nodes (19): 4.3 Audio and Sound Effects, 8.2 Sound Effects to Add, react-dom, SetStoredBoolean, usePersistentBoolean(), AudioService, readStoredBoolean(), readStoredNumber() (+11 more)

### Community 7 - "ECC Skills Integration"
Cohesion: 0.18
Nodes (10): AI Regression Testing Skill, Architecture Skill, Bento Design System, Click-Path Audit Skill, Fiction Design System, Frontend Design Skill, Lingo Design System, TDD Workflow Skill (+2 more)

### Community 8 - "createItemMesh.ts"
Cohesion: 0.11
Nodes (35): three, MapItemPreview(), MapItemPreviewProps, disposeObject3D(), createItemMesh(), disposeItemMesh(), createBananaPeel3D(), createBattery3D() (+27 more)

### Community 9 - "createLitterScatter"
Cohesion: 0.14
Nodes (6): createLitterScatter(), dispose(), placeItem(), LitterScatterSystem, ScatteredItem, shuffle()

### Community 10 - "MigsunGameController.tsx"
Cohesion: 0.09
Nodes (31): 4. File Change Summary, Modified Files (6), New Files (12), BinLocationChoice(), BinLocationChoiceProps, CharacterIntroOverlay(), CharacterIntroOverlayProps, DustbinCardOverlay() (+23 more)

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
Cohesion: 0.15
Nodes (6): DEFAULT_MAP_ITEM_PLACEMENTS, MapItemInstance, MapItemManager, MapItemManagerOptions, MapItemConfig, MapItemState

### Community 36 - "PART B — Visual system"
Cohesion: 0.06
Nodes (34): A1. Intake, A2. Page structure, A3. Layout selection, A4. Conversion rules, A5. Copywriting, A6. Build order, A7. SEO and AEO, A8. Pitfalls (+26 more)

### Community 37 - "game.ts"
Cohesion: 0.22
Nodes (8): QuizModal(), QuizModalProps, GAME_ITEMS, GAME_LEVELS, LEVEL_QUIZZES, LevelConfig, QuizQuestion, TeacherReportStats

### Community 38 - "🏘️ Migsun Vilasa — New World Implementation Plan"
Cohesion: 0.05
Nodes (41): 0. Vision Summary, 1.1 Add Migsun Vilasa Level to `levels.ts`, 1.2 Add `MIGSUN` Scene Type, 1.3 Create Migsun Scene — `migsunScene.ts`, 1. What Already Exists (Reusable), 2.1 Character Intro Overlay — `CharacterIntroOverlay.tsx`, 2.2 Mission Select Panel — `MissionSelectPanel.tsx`, 2.3 Kai Front-Facing Pose (+33 more)

### Community 39 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, graphify, graphify:hook, graphify:viz, preview, test (+1 more)

### Community 40 - "dependencies"
Cohesion: 0.29
Nodes (7): dependencies, @aws-sdk/client-bedrock-runtime, canvas-confetti, lucide-react, react, react-dom, three

### Community 41 - "migsunScene.ts"
Cohesion: 0.18
Nodes (6): BIN_COLORS, createMigsunScene(), MigsunSceneResult, SocietySceneResult, PinnedLitterSpot, WorldCanvasProps

### Community 42 - "WorldPage.tsx"
Cohesion: 0.15
Nodes (20): CleanlinessMeter(), CleanlinessMeterProps, EcoLensButton(), EcoLensButtonProps, EcoLensOverlay(), EcoLensOverlayProps, EcoSortGame(), EcoSortGameProps (+12 more)

### Community 44 - "react"
Cohesion: 0.14
Nodes (22): react, CountdownTimer(), CountdownTimerProps, EcoLensAbilityButton(), EcoLensAbilityButtonProps, LevelBadge(), LevelBadgeProps, MeadowHud() (+14 more)

### Community 45 - "4. Phase Status & Implementation Checklist"
Cohesion: 0.13
Nodes (14): 1. Overview & Vision, 2. Spatial & Scene Architecture, 3. HUD & Control System, 4. Phase Status & Implementation Checklist, Control Dynamics, Core Objectives, Green Meadows Rescue (Level 7) — Architectural & Implementation Plan, Key Elements (+6 more)

### Community 46 - "WorldCanvas.tsx"
Cohesion: 0.32
Nodes (9): createPlayerCharacter(), createThirdPersonCamera(), pinchPitchDelta(), pinchZoomDelta(), ThirdPersonCameraSystem, EnvMode, resolveEnvMode(), WorldCanvas() (+1 more)

### Community 47 - "world/types.ts"
Cohesion: 0.22
Nodes (10): LEVEL_STATIONS, MeadowsSceneResult, createProceduralCity(), ProceduralCityResult, WARM_GLOW_COLOR, CameraOrbitState, LevelStation, LocomotionState (+2 more)

### Community 48 - "meadowsScene.ts"
Cohesion: 0.29
Nodes (9): COL, createMeadowsScene(), hashNoise(), makeNameTexture(), makePaverTexture(), MEADOWS_PATH_HALF_WIDTH, MEADOWS_PATH_Z_END, MEADOWS_PATH_Z_START (+1 more)

### Community 49 - "societyScene.ts"
Cohesion: 0.14
Nodes (9): vitest, BIN_COLORS, createSocietyScene(), makeBinIconTexture(), makeConcreteTex(), makeWallTex(), TIP_LABELS, SOCIETY_SPAWN (+1 more)

### Community 50 - "lucide-react"
Cohesion: 0.13
Nodes (17): lucide-react, EcopediaModal(), EcopediaModalProps, EnergyMeterHUDProps, LevelSelectModal(), LevelSelectModalProps, getRating(), MissionResultsModal() (+9 more)

### Community 51 - "locomotion.ts"
Cohesion: 0.33
Nodes (6): createLocomotionEngine(), isTypingTarget(), JoystickMoveDir, joystickToMoveDir(), LocomotionEngine, PlayerCharacter

### Community 52 - "audio"
Cohesion: 0.16
Nodes (9): AVATARS, AvatarSelectModalProps, MascotDialogue(), MascotDialogueProps, HealthDashboardProps, apiService, SaveProgressPayload, audio (+1 more)

### Community 53 - "ask_eco.js"
Cohesion: 0.33
Nodes (3): bedrock, { BedrockRuntimeClient, InvokeModelCommand }, corsHeaders

### Community 55 - "App.tsx"
Cohesion: 0.20
Nodes (12): App(), RouteFallback(), TeacherDashboard, WorldPage, HERO_ADVENTURES, HeroAdventure, LandingPage(), LandingPageProps (+4 more)

### Community 56 - "BinType"
Cohesion: 0.22
Nodes (8): LevelEndModal(), LevelEndModalProps, MissionError, MapItemCardProps, MapItemGalleryModalProps, AdaptiveSpawner, BinType, ItemData

## Knowledge Gaps
- **271 isolated node(s):** `{ BedrockRuntimeClient, InvokeModelCommand }`, `bedrock`, `corsHeaders`, `{ DynamoDBClient }`, `{ DynamoDBDocumentClient, PutCommand, QueryCommand }` (+266 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 349 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `package.json`, `game.ts`, `AudioService`, `createItemMesh.ts`, `WorldPage.tsx`, `MigsunGameController.tsx`, `WorldCanvas.tsx`, `lucide-react`, `audio`, `App.tsx`, `BinType`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **What connects `{ BedrockRuntimeClient, InvokeModelCommand }`, `bedrock`, `corsHeaders` to the rest of the system?**
  _271 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `progress.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07977207977207977 - nodes in this community are weakly interconnected._
- **Why does `BinType` connect `BinType` to `Level 1: Waste Detective — Implementation Plan`, `game.ts`, `migsunScene.ts`, `MigsunGameController.tsx`, `WorldPage.tsx`, `WorldCanvas.tsx`, `world/types.ts`, `societyScene.ts`, `lucide-react`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `Level 1: Waste Detective — Implementation Plan` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._