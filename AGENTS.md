# EcoSort Heroes - Project Guidelines

This project follows the global guidelines and specific project rules.

## Project Rules
- **ASD-STE100 Rules**: Located at [`.agents/rules/ste.md`](file:///.agents/rules/ste.md). All UI copy, mascot dialogue, feedback, and documentation must adhere to ASD-STE100 guidelines.
- **Tech Stack**: Three.js, Vite, AWS (Amplify Hosting, Lambda, DynamoDB, Polly, S3).
- **ECC Skills Integration**:
  - Key ECC skills are bundled directly inside [`.agents/skills/`](file:///.agents/skills/).
  - Always check and invoke relevant skills for engineering tasks before writing implementation code:
    - **Architecture & System Design**: Use [`architecture`](file:///.agents/skills/architecture) / [`system-design`](file:///.agents/skills/system-design) when designing components, APIs, or AWS data flows.
    - **Test-Driven Development**: Use [`tdd-workflow`](file:///.agents/skills/tdd-workflow) and [`testing-strategy`](file:///.agents/skills/testing-strategy) for game loop, spawner probability, and physics verification.
    - **Frontend & Visual Aesthetics**: Use [`landing-page-design`](file:///.agents/skills/landing-page-design) / [`frontend-design`](file:///.agents/skills/frontend-design) / [`design-taste-frontend`](file:///.agents/skills/design-taste-frontend) and style skills ([`fiction`](file:///.agents/skills/fiction), [`lingo`](file:///.agents/skills/lingo), [`bento`](file:///.agents/skills/bento)) for child-friendly game UI and landing page.
    - **Code Quality & Verification**: Run [`code-review`](file:///.agents/skills/code-review) and [`verification-loop`](file:///.agents/skills/verification-loop) before completing major modules.
    - **Debugging & Audit**: Use [`debug`](file:///.agents/skills/debug) and [`click-path-audit`](file:///.agents/skills/click-path-audit).

