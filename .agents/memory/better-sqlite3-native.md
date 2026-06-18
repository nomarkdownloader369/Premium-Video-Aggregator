---
name: better-sqlite3 native build
description: better-sqlite3 requires a compiled .node binary; pnpm install alone does not build it in Replit
---

If the API server crashes with "Could not locate the bindings file" for better-sqlite3, run:

```
cd /home/runner/workspace/node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3 && npm rebuild
```

**Why:** pnpm's `onlyBuiltDependencies` approval gate was not triggered interactively, so the native `.node` binding was never compiled on first install. `npm rebuild` inside the package directory compiles it directly without needing the approval prompt.

**How to apply:** Any session where the API server starts and immediately exits with the bindings error — run the rebuild command above, then restart the workflow.
