# EcoSort Heroes - Assistant Guide

## Project Overview
EcoSort Heroes is a 3D educational game for children aged 5-10 to learn waste sorting and clean energy principles.

## Commands
- **Dev Server**: `npm run dev` (runs at http://localhost:3000)
- **Build**: `npm run build` (typechecks with `tsc` and bundles with `vite build`)
- **Preview**: `npm run preview`
- **Graphify**: `npm run graphify`
- **Graphify Viz**: `npm run graphify:viz`

## Architecture & Code Standards
- **ASD-STE100 Rules**: All in-game text and documentation must follow [`.agents/rules/ste.md`](file:///.agents/rules/ste.md). In-game mascot dialogue must be 8 words or fewer per sentence.
- **3D Graphics**: Three.js handles the 3D scene, dynamic town power lighting, and physics throw curves.
- **Adaptive Spawner**: Located in `src/services/spawner.ts`. Adapts to player mistakes without punishing errors.
- **AWS Backend**: Serverless architecture defined in `template.yaml` (API Gateway, DynamoDB, Lambda, Bedrock mascot integration).
- **Graphify Knowledge Graph**: Located in `graphify-out/`. Always consult `graph.json` or run `graphify query "<question>"` when navigating complex architecture.
