# 🌐 Web Developer Guide

This is the frontend dashboard for the `action-bot` factory, built with **Next.js 16** and **Tailwind CSS**.

## 🧪 Testing

We use **Vitest** for unit testing. It is fast and integrates well with the Next.js/React ecosystem.

### Run Tests
```bash
# Within apps/web
pnpm run test
```

### Writing Tests
Create `*.spec.ts` or `*.test.tsx` files. Use standard Vitest/Jest-like syntax (`describe`, `it`, `expect`). For component testing, we recommend using `@testing-library/react`.

## 🏗️ Architecture

- **App Router**: Uses Next.js 16 app directory structure.
- **SWR**: Used for client-side data fetching and revalidation.
- **SSE**: Connected to the API for real-time factory updates.
- **UI Components**: Shared components are located in `@repo/ui`.

## 🚦 Features

- **Jobs Board**: Monitor real-time video production.
- **New Generation**: Modal to trigger AI workflows.
- **Job Details**: Inspect scripts, scenes, and download final videos.

---
*Maintained by the Auto-Short Team*
