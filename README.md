# EcoSort Heroes (3D)

> **"Sort the waste. Power the town."**

EcoSort Heroes is an educational 3D web game designed for children aged 5 to 10. Players learn waste categorization and circular economy principles through tactile, physics-based item sorting in Three.js. As players correctly classify waste, their actions feed clean biogas and recycling facilities that illuminate and power a 3D town skyline in real time.

---

## 🚀 Key Features

1. **Interactive 3D Game World**:
   - Built with Three.js featuring dynamic lighting, shadows, and low-poly environments.
   - 3D low-poly bins with distinct physical shapes, lids, icons, and colors.
   - Procedural 3D waste items (organic apples & bananas, recyclable cans & bottles, hazardous batteries, e-waste phones, reusable jars).
   - Dynamic 3D town in the background that lights up as the clean energy meter fills.

2. **Core Game Loop & Adaptive Mechanics**:
   - Touch and pointer drag-and-throw aiming physics with trajectory prediction.
   - **Adaptive Spawner**: Tracks player mistakes, re-presents missed items more often, avoids immediate repetition, and balances bin representation per batch.
   - **Scoring & Multipliers**: +10 pts for correct throws, streak multipliers for 3+ consecutive correct throws, and non-punishing feedback for errors.
   - **Star Rating**: 3 stars (≥90% accuracy), 2 stars (≥70%), 1 star (completion).

3. **Mascot & Voice Guidance (ASD-STE100 Compliant)**:
   - "Eco" mascot delivers short, supportive, 8-word explanations using browser Web Speech synthesis and Amazon Polly hooks.
   - "Ask Eco" AI assistant powered by Amazon Bedrock for child-safe natural language questions (e.g. "Can I recycle a pizza box?").

4. **13-Section Landing Page**:
   - Clear, accessible copy written in ASD-STE100 Simplified Technical English.
   - Sections: Hero, The Problem, How It Works, Meet the Bins, Clean Energy, Adaptive Learning, Levels Preview, Meet the Mascot, For Teachers & Parents, Measured Impact, FAQ, and Call to Action.

5. **Teacher & Parent Learning Analytics**:
   - Classroom dashboard displaying student counts, average scores, category accuracy breakdowns, top items needing practice, and pre/post-test impact metrics.
   - Full child privacy compliance (COPPA): stores only pseudonymous nicknames and game statistics; no PII, real names, or photos.

6. **AWS Serverless Cloud Infrastructure**:
   - **AWS Amplify Hosting**: Continuous deployment configuration (`amplify.yml`).
   - **AWS SAM CLI / LocalStack**: Serverless CloudFormation template (`template.yaml`).
   - **Amazon DynamoDB**: Key-value stores for `EcoSortProgress` and `EcoSortReports`.
   - **AWS Lambda & API Gateway**: RESTful microservices for progress saving, reporting, and Bedrock AI mascot queries.

7. **Graphify Knowledge Graph Integration**:
   - Fully integrated with [Graphify Labs](https://github.com/Graphify-Labs/graphify).
   - Knowledge graph visualization (`graphify-out/graph.html`) and audit report (`graphify-out/GRAPH_REPORT.md`).
   - Automatic post-commit and post-checkout git hooks (`graphify hook install`).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, canvas-confetti.
- **3D & Physics**: Three.js, Cannon-es, Web Audio API procedural sound synthesizers, Web Speech API.
- **Backend / Cloud**: AWS SAM, Node.js 20 Lambda handlers, Amazon DynamoDB, Amazon Bedrock, Amazon Polly, AWS Amplify.
- **Architecture & Tooling**: Graphify Labs Knowledge Graph (AST + Semantic analysis).

---

## 📦 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- npm or pnpm
- Python 3.10+ (for Graphify CLI)

### 1. Installation
```bash
# Install frontend and build dependencies
npm install

# Install backend dependencies (optional, for SAM packaging)
cd backend && npm install && cd ..
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 🧠 Graphify Commands

This project uses Graphify to map codebase dependencies, symbols, and architecture:

```bash
# Extract and update knowledge graph
npm run graphify

# Export interactive HTML graph visualization
npm run graphify:viz

# Reinstall git hooks
npm run graphify:hook

# Query the codebase knowledge graph
graphify query "How does the adaptive item spawner work?"
```

---

## ☁️ AWS Deployment

### Frontend (AWS Amplify)
Connect this repository to AWS Amplify Hosting. The included [`amplify.yml`](file:///amplify.yml) will automatically run `npm ci` and `npm run build`, deploying the `dist/` directory.

### Backend (AWS SAM / LocalStack)
```bash
# Build serverless application
sam build

# Test locally with LocalStack
sam local start-api

# Deploy to AWS Cloud
sam deploy --guided
```

---

## 📜 ASD-STE100 Writing Guidelines

All user-facing copy, mascot lines, and documentation follow Simplified Technical English rules:
- One idea per sentence.
- In-game mascot dialogue: 8 words or fewer per sentence.
- Instructions: 20 words or fewer.
- Descriptions: 25 words or fewer.
- Always active voice and simple present tense.
- For complete specification, see [`.agents/rules/ste.md`](file:///.agents/rules/ste.md).

---

## 📄 License
MIT License. Built for the Hackathon.
