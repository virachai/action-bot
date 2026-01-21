# 🗺️ Auto-Short-Factory: Project Roadmap & Plan

> **Version:** 1.0.0 (Production-Ready)
> **Last Updated:** 2026-01-22
> **Status:** Active Development (Phase 9)

---

## 🏗️ 1. Architecture Overview

### 1.1 Core Components
The system follows a **Monorepo Architecture** (Turborepo) with strict separation of concerns (Clean Architecture).

| Component | Tech Stack | Responsibility | Status |
| :--- | :--- | :--- | :--- |
| **Orchestrator** | Node.js (TypeScript) | Workflow management (Job States, S3, DB) | ✅ Production |
| **AI Internal** | Python (Gemini) | Script generation, Prompt engineering | ✅ Production |
| **Video Engine** | Python (FFmpeg) | Media assembly, Captions, Rendering | ✅ Production |
| **Database** | Prisma (PostgreSQL) | Persistent storage (Jobs, Scripts, Assets) | ✅ Production |
| **API** | NestJS | REST API for dashboard & external access | 🚧 In Progress |
| **Web** | Next.js | Management Dashboard UI | 🚧 Planned |

### 1.2 Data Flow
1.  **Trigger**: User/Cron triggers `POST /generate-script`.
2.  **AI Gen**: Orchestrator calls AI Service (Gemini) -> Generates `Script` (JSON).
3.  **Persistence**: `Script` & `Topic` saved to `@repo/database`.
4.  **Processing**: `VideoJob` created (`PENDING`).
5.  **Assembly**: Video Engine assembles media (Images/Audio/Captions) -> S3.
6.  **Completion**: Job marked `COMPLETED` -> Logged to Google Sheets -> Notification.

---

## 📅 2. Implementation Roadmap

### Phase 1-7: Foundation (✅ Completed)
-   Monorepo setup (Turbo, TS Config, ESLint).
-   Core services implementation (AI, Video, Orchestrator).
-   CI/CD pipelines (GitHub Actions).
-   Basic documentation.

### Phase 8: Production Hardening (✅ Completed)
-   **Database**: Migrated to Prisma with `auto-short-factory` schema.
-   **Reliability**: Multi-key Gemini rotation & auto-retry logic.
-   **Observability**: Google Sheets logging integration.
-   **Standards**: `AGENT_RULES.md`, Prettier enforcement.

### Phase 9: API & Dashboard Integration (🚧 Current Focus)
**Goal**: Create a visual interface to manage the factory without code interaction.

-   [ ] **API Layer (`apps/api`)**
    -   Connect `NestJS` to `@repo/database`.
    -   Implement endpoints: `GET /jobs`, `GET /scripts`, `POST /retry/:id`.
    -   Add WebSocket/SSE for real-time progress updates.
-   [ ] **Dashboard (`apps/web`)**
    -   Connect `Next.js` to API.
    -   Build "Jobs Board" (Kanban/List view).
    -   Video Player for reviewing generated content.
-   [ ] **Deployment**
    -   Dockerize API & Web apps.
    -   Update CI/CD for full-stack deployment.

### Phase 10: Advanced Features (🔮 Future)
-   [ ] **Multi-Platform Upload**: Automated posting to TikTok/YouTube via APIs.
-   [ ] **AI Image Gen**: Integrate Midjourney/DALL-E for custom visuals (currently Stock/Placeholder).
-   [ ] **Voice Cloning**: Integrate ElevenLabs for premium narration.
-   [ ] **User Accounts**: Multi-tenant support for different creators.

---

## 🛠️ 3. Development Standards (Summary)
*See [AGENT_RULES.md](../AGENT_RULES.md) for full details.*

-   **Database**: Always use `@repo/database` client. Schema changes require migrations.
-   **Keys**: Use `GEMINI_API_*` pattern for AI keys.
-   **Logs**: Console (Debug) + Google Sheets (Audit).
-   **Structure**:
    ```text
    src/
    ├── config/   # Env constants
    ├── services/ # Business logic
    ├── models/   # Data schemas
    └── index.ts  # Entry point
    ```

---

## 📊 4. Key Metrics & Targets

| Metric | Target | Current |
| :--- | :--- | :--- |
| **Generation Time** | < 60s / video | ~45s |
| **Success Rate** | > 95% | ~98% |
| **AI Cost** | < $0.01 / video | ~$0.002 |
| **Quality** | 1080p 60fps | 1080p 30fps |
