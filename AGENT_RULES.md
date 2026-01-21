# 🤖 AGENT_RULES.md - Auto-Short-Factory

> **CRITICAL INSTRUCTION FOR AGENTS:**
> Read this file BEFORE making any code changes. These rules are strictly enforced to maintain a production-grade, Clean Architecture codebase.

---

## 1. 🏗️ Architectural Guidelines

### 1.1 Clean Architecture & Separation of Concerns
-   **Dependency Rule:** Dependencies point INWARDS. Core entities (Database Models, Types) must not depend on outer layers (API, Orchestrator).
-   **Services:** Logic resides in `services/`. Controllers/routes simply call services.
    -   *Good:* `Orchestrator` -> `VideoEngineService` -> `FfmpegWrapper`
-   **Shared Packages:** Reusable logic moves to `packages/`.
    -   `@repo/database`: ONLY database logic.
    -   `@repo/config`: ONLY environment and constants.
    -   `@repo/types`: Shared interfaces and Zod schemas.

### 1.2 Monorepo Structure (Turborepo)
-   **Apps (`apps/`)**: Deployable applications (Orchestrator, AI Service).
-   **Packages (`packages/`)**: Shared libraries.
-   **Workspace Protocol**: Always use `workspace:*` for internal dependencies.

### 1.3 📂 BEST Directory Structure (Standard)
Every service/app should follow this standardized layout:

```text
root/
├── src/
│   ├── config/         # Environment & constants
│   ├── services/       # Business logic (Pure classes)
│   ├── models/         # Data structures / Zod schemas / Pydantic models
│   ├── utils/          # Helper functions (stateless)
│   └── index.ts (or main.py) # Entry point
├── test/               # Unit & Integration tests
├── package.json        # Dependencies
└── tsconfig.json       # Type configuration
```

---

## 2. 💻 Coding Standards & Naming

### 2.1 🏷️ File Naming Conventions
**TypeScript / Node.js:**
-   **Pattern**: `kebab-case.suffix.ts`
-   **Services**: `video-engine.service.ts`
-   **Controllers**: `video.controller.ts`
-   **Types/Interfaces**: `video.types.ts`
-   **Utilities**: `string-utils.ts`
-   **Classes**: Export matches filename (e.g., `VideoEngineService` in `video-engine.service.ts`)

**Python:**
-   **Pattern**: `snake_case.py`
-   **Modules**: `gemini_client.py`
-   **Classes**: `PascalCase` inside the file (e.g., `GeminiClient`)

### 2.2 General Rules
-   **Formatting**: Strictly follow `.prettierrc.json`. Run `pnpm format` on file creation.
-   **Linting**: Zero-tolerance for linter warnings. Fix, don't ignore (unless absolutely necessary with justification).
-   **Naming**:
    -   Files: `kebab-case.ts` (e.g., `video-engine.service.ts`)
    -   Classes: `PascalCase` (e.g., `VideoEngineService`)
    -   Variables/Functions: `camelCase`
    -   Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_ATTEMPTS`)

### 2.2 TypeScript / Node.js
-   **Strict Typing**: **NEVER** use `any`. Use `unknown` if unsure, then validate.
-   **Interfaces**: Define interfaces/types in `@repo/types` if shared.
-   **Async/Await**: Prefer `async/await` over `.then()`. Always handle errors with `try/catch`.
-   **Exports**: Use named exports. Avoid `export default`.
-   **Imports**: Use absolute imports from packages (e.g., `import { prisma } from '@repo/database'`).

### 2.3 Python (AI & Video Services)
-   **Type Hinting**: Required for all function arguments and returns.
    ```python
    def generate_script(request: GeminiRequest) -> VideoScript:
    ```
-   **Pydantic**: Use Pydantic models for data validation and schema definitions.
-   **Virtual Env**: Always operate within the service-specific `venv` or dependency context.
-   **Error Handling**: Raise explicit, custom exceptions.

---

## 3. 🛡️ Data & State Management

### 3.1 Database (Prisma)
-   **Schema Control**: modifying `schema.prisma` requires running `pnpm db:generate`.
-   **Schema Name**: Explicitly use `@@schema("auto-short-factory")`.
-   **Migrations**: Use `db:push` for prototyping, strictly migrate for production (future).
-   **Access**: All DB access goes through `@repo/database` client singleton.

### 3.2 Logging & Auditing
-   **Dual Logging Strategy**:
    1.  **Console**: Structured logs for debugging (Colorized).
    2.  **Google Sheets**: Business-critical metrics (ID, Topic, URL, Duration).
-   **Service**: Use `GoogleSheetsService` for external logging. Do not bake HTTP calls into business logic.

---

## 4. 🤖 AI & Automation Specifics

### 4.1 AI Integration (Gemini)
-   **Key Rotation**: **MANDATORY**. Use `GEMINI_API_*` pattern.
-   **Auto-Discovery**: Client must dynamically load all matching env vars.
-   **Retry Logic**: Implement exponential backoff or round-robin key switching on quota exhaustion.
-   **Safety**: Never commit API keys. Use `.env.local`.

### 4.2 Video Processing
-   **Path Handling**: Use absolute paths for FFmpeg.
-   **Cleanup**: Services must clean up temp files (`/temp`) after processing.
-   **Validation**: Verify output file existence and size > 0 before returning success.

---

## 5. 🚀 Deployment & CI/CD
-   **Environment Variables**: Validation via `zod` in `@repo/config` is required on startup.
-   **Health Checks**: All services must expose a health check method/endpoint.
-   **Secrets**: Production secrets must mirror `.env.example` structure.
