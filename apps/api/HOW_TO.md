# 📖 API Developer Guide

Welcome to the `action-bot` API! This service is built with **NestJS** and manages the orchestration of AI video generation.

## 🧪 Testing

We use **Jest** for unit testing. All business logic in services and endpoints in controllers should be covered.

### Run Tests
```bash
# Within apps/api
pnpm run test
```

### Adding New Tests
Create a file named `*.spec.ts` matching the file you want to test. Use `Test.createTestingModule` to setup the environment and mock dependencies like `DatabaseService` (Prisma) or external services.

## 🏗️ Architecture

- **Controllers**: Define the REST/SSE endpoints.
- **Services**: Contain business logic and interact with the database or orchestrator.
- **Database**: Handled by `@repo/database` (Prisma).
- **Orchestrator**: Handled by `@repo/orchestrator` (Programmatic execution).

## 🚀 Key Endpoints

- `GET /jobs`: List all production jobs.
- `POST /jobs/generate`: Trigger new AI workflow.
- `GET /jobs/sse`: Live status stream.
- `GET /scripts`: View AI-generated scripts.

---
*Maintained by the Auto-Short Team*
