# Graph Report - EcoSort  (2026-10-09)

## Corpus Check
- 101 files · ~1,184,232 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .example 1, .glb 1)

## Summary
- 462 nodes · 890 edges · 37 communities (13 shown, 24 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a17473a4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- WorldPage.tsx
- progress.js
- package.json
- ItemData
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
- MapItemManager
- PART B — Visual system

## God Nodes (most connected - your core abstractions)
1. `three` - 30 edges
2. `createItemMesh()` - 21 edges
3. `react` - 20 edges
4. `ItemData` - 19 edges
5. `lucide-react` - 16 edges
6. `WorldPage()` - 16 edges
7. `compilerOptions` - 16 edges
8. `WorldCanvas()` - 15 edges
9. `MapItemInstance` - 15 edges
10. `MapItemManager` - 15 edges

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

## Communities (37 total, 24 thin omitted)

### Community 0 - "WorldPage.tsx"
Cohesion: 0.07
Nodes (42): lucide-react, react, react-dom, App(), AVATARS, AvatarSelectModal(), AvatarSelectModalProps, EcopediaModal() (+34 more)

### Community 1 - "progress.js"
Cohesion: 0.07
Nodes (24): bedrock, { BedrockRuntimeClient, InvokeModelCommand }, corsHeaders, client, corsHeaders, ddbDocClient, { DynamoDBClient }, { DynamoDBDocumentClient, PutCommand, QueryCommand } (+16 more)

### Community 2 - "package.json"
Cohesion: 0.04
Nodes (46): dependencies, cannon-es, canvas-confetti, lucide-react, react, react-dom, three, devDependencies (+38 more)

### Community 3 - "ItemData"
Cohesion: 0.15
Nodes (15): LevelEndModalProps, ThreeScene(), ThreeSceneProps, MapItemCard(), MapItemCardProps, MapItemGalleryModal(), MapItemGalleryModalProps, MapItemPreview() (+7 more)

### Community 4 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 7 - "ECC Skills Integration"
Cohesion: 0.18
Nodes (10): AI Regression Testing Skill, Architecture Skill, Bento Design System, Click-Path Audit Skill, Fiction Design System, Frontend Design Skill, Lingo Design System, TDD Workflow Skill (+2 more)

### Community 8 - "createItemMesh.ts"
Cohesion: 0.12
Nodes (26): three, createItemMesh(), DEFAULT_MAP_ITEM_PLACEMENTS, MapItemInstance, MapItemManagerOptions, createBananaPeel3D(), createBattery3D(), createFoodPlate3D() (+18 more)

### Community 9 - "WorldCanvas.tsx"
Cohesion: 0.13
Nodes (24): createBacksplashTexture(), createBinIconTexture(), createCheckeredTexture(), createFridgeDoorTexture(), createHomeKitchenScene(), createParquetFloorTexture(), createWindowBackdropTexture(), HomeKitchenSceneResult (+16 more)

### Community 10 - "vitest"
Cohesion: 0.24
Nodes (4): vitest, calculateCameraPitchForDistance(), clampCameraDistance(), resolveBoxCollision()

### Community 11 - "compilerOptions"
Cohesion: 0.25
Nodes (7): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 12 - "EcoSort Heroes Full Plan"
Cohesion: 0.67
Nodes (3): ASD-STE100 Rules, EcoSort Heroes Full Plan, SAM Infrastructure Template

### Community 34 - "PART B — Visual system"
Cohesion: 0.06
Nodes (34): A1. Intake, A2. Page structure, A3. Layout selection, A4. Conversion rules, A5. Copywriting, A6. Build order, A7. SEO and AEO, A8. Pitfalls (+26 more)

### Community 36 - "PART B — Visual system"
Cohesion: 0.06
Nodes (34): A1. Intake, A2. Page structure, A3. Layout selection, A4. Conversion rules, A5. Copywriting, A6. Build order, A7. SEO and AEO, A8. Pitfalls (+26 more)

## Knowledge Gaps
- **176 isolated node(s):** `{ BedrockRuntimeClient, InvokeModelCommand }`, `bedrock`, `corsHeaders`, `{ DynamoDBClient }`, `{ DynamoDBDocumentClient, PutCommand, QueryCommand }` (+171 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 224 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `three` connect `createItemMesh.ts` to `vitest`, `WorldCanvas.tsx`, `package.json`, `ItemData`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `{ BedrockRuntimeClient, InvokeModelCommand }`, `bedrock`, `corsHeaders` to the rest of the system?**
  _176 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `WorldPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07108478341355054 - nodes in this community are weakly interconnected._
- **Why does `react` connect `WorldPage.tsx` to `WorldCanvas.tsx`, `package.json`, `ItemData`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Should `progress.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06653225806451613 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `WorldPage.tsx` to `WorldCanvas.tsx`, `package.json`, `ItemData`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.041666666666666664 - nodes in this community are weakly interconnected._