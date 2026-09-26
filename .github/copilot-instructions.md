# OpenFoodFacts Explorer — Copilot Instructions

Read [`AGENTS.md`](../AGENTS.md) at the repo root first. It is the canonical and comprehensive agent guide covering project structure, commands, contributing rules, and UI conventions.

---

## Copilot-Specific Notes

These notes apply specifically to GitHub Copilot's editor agent, which may cancel or timeout long-running shell commands:

- **NEVER CANCEL** a running build, install, lint, check, or format command — they take 20–60 seconds and cancelling leaves the environment in a broken state.
- Use explicit timeouts: **60+ minutes** for `pnpm build` and `pnpm install`; **30+ minutes** for `pnpm lint`, `pnpm check`, and `pnpm format`.
- The Husky pre-commit hook runs `pnpm format:changed` automatically on `git commit` — do not skip it.
