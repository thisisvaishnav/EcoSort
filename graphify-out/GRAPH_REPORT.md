# Graph Report - EcoSort  (2026-10-09)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 202 nodes · 334 edges · 20 communities (11 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 2,948 input · 215 output

## Community Hubs (Navigation)
- progress.js
- EcoSortGame.tsx
- package.json
- game.ts
- compilerOptions
- AudioService
- ItemData
- devDependencies
- react
- compilerOptions
- dependencies
- ASD-STE100 Rules
- Amplify Build Configuration
- Game Entry Point

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `AudioService` - 15 edges
3. `react` - 15 edges
4. `EcoSortGame()` - 14 edges
5. `lucide-react` - 12 edges
6. `ItemData` - 11 edges
7. `AdaptiveSpawner` - 9 edges
8. `BinType` - 8 edges
9. `ALL_BINS` - 8 edges
10. `scripts` - 7 edges

## Surprising Connections (you probably didn't know these)
- `EcoSort Heroes Project Guidelines` --references--> `ASD-STE100 Rules`  [EXTRACTED]
  AGENTS.md → .agents/rules/ste.md
- `EcoSort Heroes Full Plan` --references--> `ASD-STE100 Rules`  [EXTRACTED]
  PLAN.md → .agents/rules/ste.md
- `AvatarSelectModalProps` --references--> `PlayerProfile`  [EXTRACTED]
  src/components/game/AvatarSelectModal.tsx → src/types/game.ts
- `LevelEndModalProps` --references--> `ItemData`  [EXTRACTED]
  src/components/game/LevelEndModal.tsx → src/types/game.ts
- `EcoSortGame()` --calls--> `AdaptiveSpawner`  [EXTRACTED]
  src/components/game/EcoSortGame.tsx → src/services/spawner.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **STE Compliance Scope** — agents_rules_ste_md, plan_md, index_html [EXTRACTED 0.90]

## Communities (20 total, 9 thin omitted)

### Community 0 - "progress.js"
Cohesion: 0.07
Nodes (24): bedrock, { BedrockRuntimeClient, InvokeModelCommand }, corsHeaders, client, corsHeaders, ddbDocClient, { DynamoDBClient }, { DynamoDBDocumentClient, PutCommand, QueryCommand } (+16 more)

### Community 1 - "EcoSortGame.tsx"
Cohesion: 0.16
Nodes (18): lucide-react, EcopediaModal(), EcopediaModalProps, EcoSortGameProps, EnergyMeterHUD(), EnergyMeterHUDProps, LevelSelectModal(), LevelSelectModalProps (+10 more)

### Community 2 - "package.json"
Cohesion: 0.08
Nodes (23): name, private, scripts, build, dev, graphify, graphify:hook, graphify:viz (+15 more)

### Community 3 - "game.ts"
Cohesion: 0.20
Nodes (10): AVATARS, AvatarSelectModal(), AvatarSelectModalProps, GAME_ITEMS, LEVEL_QUIZZES, apiService, SaveProgressPayload, LevelConfig (+2 more)

### Community 4 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 6 - "ItemData"
Cohesion: 0.21
Nodes (9): canvas-confetti, three, LevelEndModal(), LevelEndModalProps, ThreeScene(), ThreeSceneProps, AdaptiveSpawner, BinType (+1 more)

### Community 7 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, autoprefixer, postcss, tailwindcss, @types/canvas-confetti, @types/react, @types/react-dom, @types/three (+3 more)

### Community 8 - "react"
Cohesion: 0.36
Nodes (6): react, App(), LandingPage(), Navbar(), NavbarProps, TeacherDashboard()

### Community 9 - "compilerOptions"
Cohesion: 0.25
Nodes (7): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 10 - "dependencies"
Cohesion: 0.29
Nodes (7): dependencies, cannon-es, canvas-confetti, lucide-react, react, react-dom, three

### Community 11 - "ASD-STE100 Rules"
Cohesion: 0.50
Nodes (4): EcoSort Heroes Project Guidelines, ASD-STE100 Rules, EcoSort Heroes Full Plan, SAM Infrastructure Template

## Knowledge Gaps
- **90 isolated node(s):** `EcopediaModalProps`, `EcoSortGameProps`, `EnergyMeterHUDProps`, `LevelSelectModalProps`, `MascotDialogueProps` (+85 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 110 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `EcoSortGame.tsx`, `package.json`, `game.ts`, `ItemData`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **What connects `EcopediaModalProps`, `EcoSortGameProps`, `EnergyMeterHUDProps` to the rest of the system?**
  _90 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `progress.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06653225806451613 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `EcoSortGame.tsx` to `react`, `package.json`, `game.ts`, `ItemData`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Why does `AudioService` connect `AudioService` to `EcoSortGame.tsx`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._