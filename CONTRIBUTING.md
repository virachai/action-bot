# 🤝 Contributing to Auto-Short-Factory

Thank you for your interest in contributing! This project follows a specific monorepo architecture and set of standards to ensure scalability and quality.

## 🚀 Development Workflow

1.  **Fork & Clone**:
    ```bash
    git clone https://github.com/your-repo/auto-short-factory.git
    cd auto-short-factory
    pnpm install
    ```

2.  **Create a Branch**:
    Use the format `type/description`.
    *   `feat/add-youtube-upload`
    *   `fix/ffmpeg-memory-leak`
    *   `docs/update-readme`

3.  **Make Changes**:
    *   Follow the [Agent Rules](./AGENT_RULES.md).
    *   Ensure all tests pass: `pnpm run test`.
    *   Ensure no lint errors: `pnpm run lint`.

4.  **Submit Pull Request**:
    *   Describe your changes clearly.
    *   Link to any relevant issues.

---

## 📏 Coding Standards

### Core Philosophy
*   **Clean Architecture**: Dependencies point inwards.
*   **Types First**: Define interfaces in `@repo/types` before writing logic.
*   **Strict Mode**: No `any`. No linter warnings ignored.

### Style Guide
*   **Language**: TypeScript (Node.js) & Python (AI/Video).
*   **Formatter**: Prettier (run `pnpm format`).
*   **Naming**:
    *   TypeScript: `kebab-case` files, `PascalCase` classes.
    *   Python: `snake_case` files, `PascalCase` classes.

---

## 📝 Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

*   `feat`: A new feature
*   `fix`: A bug fix
*   `docs`: Documentation only changes
*   `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
*   `refactor`: A code change that neither fixes a bug nor adds a feature
*   `perf`: A code change that improves performance
*   `test`: Adding missing tests or correcting existing tests
*   `chore`: Changes to the build process or auxiliary tools

**Example**:
```text
feat(orchestrator): add redis rate limiting middleware
```

---

## 🧪 Testing

*   **Unit Tests**: Required for all new services/utilities.
*   **Integration Tests**: Recommended for DB and API interactions.
*   **Manual Testing**: Verify video output in `apps/video-engine/output/` before submitting.
