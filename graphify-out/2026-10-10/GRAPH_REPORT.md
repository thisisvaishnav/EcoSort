# Graph Report - EcoSort  (2026-10-10)

## Corpus Check
- 106 files · ~1,187,007 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .example 1, .glb 1)

## Summary
- 473 nodes · 927 edges · 40 communities (17 shown, 23 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d54a079f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- WorldPage.tsx
- progress.js
- package.json
- App.tsx
- compilerOptions
- AudioService
- GLTFBuilder
- ECC Skills Integration
- createItemMesh.ts
- WorldCanvas.tsx
- vitest
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
- devDependencies
- scripts
- dependencies

## God Nodes (most connected - your core abstractions)
1. `three` - 35 edges
2. `createItemMesh()` - 26 edges
3. `react` - 20 edges
4. `ItemData` - 19 edges
5. `ItemMeshOptions` - 17 edges
6. `lucide-react` - 16 edges
7. `WorldPage()` - 16 edges
8. `compilerOptions` - 16 edges
9. `WorldCanvas()` - 15 edges
10. `MapItemInstance` - 15 edges

## Surprising Connections (you probably didn't know these)
- `ECC Skills Integration` --references--> `Architecture Skill`  [EXTRACTED]
  AGENTS.md → .agents/skills/architecture/SKILL.md
- `ECC Skills Integration` --references--> `Click-Path Audit Skill`  [EXTRACTED]
  AGENTS.md → .agents/skills/click-path-audit/SKILL.md
- `ECC Skills Integration` --references--> `TDD Workflow Skill`  [EXTRACTED]
  AGENTS.md → .agents/skills/tdd-workflow/SKILL.md
- `ECC Skills Integration` --references--> `Verification Loop Skill`  [EXTRACTED]
  AGENTS.md → .agents/skills/verification-loop/SKILL.md
- `EcoSort Heroes Full Plan` --references--> `ASD-STE100 Rules`  [EXTRACTED]
  PLAN.md → .agents/rules/ste.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Visual Design & Aesthetics** — agents_skills_frontend_design, agents_skills_fiction, agents_skills_lingo, agents_skills_bento [EXTRACTED 0.90]
- **Quality Assurance & Verification Flow** — agents_skills_tdd_workflow, agents_skills_verification_loop, agents_skills_ai_regression_testing, agents_skills_click_path_audit [INFERRED 0.85]

## Communities (40 total, 23 thin omitted)

### Community 0 - "WorldPage.tsx"
Cohesion: 0.07
Nodes (46): lucide-react, react, AVATARS, AvatarSelectModal(), AvatarSelectModalProps, EcopediaModal(), EcopediaModalProps, EcoSortGame() (+38 more)

### Community 1 - "progress.js"
Cohesion: 0.07
Nodes (24): bedrock, { BedrockRuntimeClient, InvokeModelCommand }, corsHeaders, client, corsHeaders, ddbDocClient, { DynamoDBClient }, { DynamoDBDocumentClient, PutCommand, QueryCommand } (+16 more)

### Community 2 - "package.json"
Cohesion: 0.12
Nodes (15): name, private, type, version, autoprefixer, cannon-es, canvas-confetti, jsdom (+7 more)

### Community 3 - "App.tsx"
Cohesion: 0.17
Nodes (11): react-dom, App(), HERO_ADVENTURES, HeroAdventure, LandingPage(), LandingPageProps, TAGLINE_WORDS, NAV_LINKS (+3 more)

### Community 4 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 7 - "ECC Skills Integration"
Cohesion: 0.18
Nodes (10): AI Regression Testing Skill, Architecture Skill, Bento Design System, Click-Path Audit Skill, Fiction Design System, Frontend Design Skill, Lingo Design System, TDD Workflow Skill (+2 more)

### Community 8 - "createItemMesh.ts"
Cohesion: 0.14
Nodes (26): three, createItemMesh(), createBananaPeel3D(), createBattery3D(), createBreadSlice3D(), createCardboardBox3D(), createEggShell3D(), createFoodPlate3D() (+18 more)

### Community 9 - "WorldCanvas.tsx"
Cohesion: 0.10
Nodes (28): createBacksplashTexture(), createBinIconTexture(), createBinLabelTexture(), createCheckeredTexture(), createFridgeDoorTexture(), createHomeKitchenScene(), createParquetFloorTexture(), createWindowBackdropTexture() (+20 more)

### Community 10 - "vitest"
Cohesion: 0.25
Nodes (3): vite, @vitejs/plugin-react, vitest

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
Nodes (6): DEFAULT_MAP_ITEM_PLACEMENTS, MapItemInstance, MapItemManager, MapItemManagerOptions, MapItemConfig, MapItemState

### Community 36 - "PART B — Visual system"
Cohesion: 0.06
Nodes (34): A1. Intake, A2. Page structure, A3. Layout selection, A4. Conversion rules, A5. Copywriting, A6. Build order, A7. SEO and AEO, A8. Pitfalls (+26 more)

### Community 37 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, autoprefixer, jsdom, postcss, tailwindcss, @types/canvas-confetti, @types/react, @types/react-dom (+5 more)

### Community 38 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, graphify, graphify:hook, graphify:viz, preview, test (+1 more)

### Community 39 - "dependencies"
Cohesion: 0.29
Nodes (7): dependencies, cannon-es, canvas-confetti, lucide-react, react, react-dom, three

## Knowledge Gaps
- **176 isolated node(s):** `{ BedrockRuntimeClient, InvokeModelCommand }`, `bedrock`, `corsHeaders`, `{ DynamoDBClient }`, `{ DynamoDBDocumentClient, PutCommand, QueryCommand }` (+171 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 224 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `three` connect `createItemMesh.ts` to `WorldPage.tsx`, `package.json`, `MapItemInstance`, `WorldCanvas.tsx`, `vitest`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **What connects `{ BedrockRuntimeClient, InvokeModelCommand }`, `bedrock`, `corsHeaders` to the rest of the system?**
  _176 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `WorldPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0730282375851996 - nodes in this community are weakly interconnected._
- **Why does `react` connect `WorldPage.tsx` to `WorldCanvas.tsx`, `package.json`, `App.tsx`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Should `progress.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06653225806451613 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `WorldPage.tsx` to `WorldCanvas.tsx`, `package.json`, `App.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._