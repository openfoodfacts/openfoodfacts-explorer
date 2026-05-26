# Agent Guide — Open Food Facts Explorer

This is the canonical guide for AI agents working on this repository.
**Read this file before doing anything else.**

> Humans contributing code should read [CONTRIBUTING.md](CONTRIBUTING.md) instead.
> This file is intentionally structured for machine consumption.

---

## Project Overview

Open Food Facts Explorer is a **SvelteKit** frontend for the Open Food Facts database.
It provides a responsive, mobile-first interface for browsing, searching, and editing food product data.

**Stack:** SvelteKit · TypeScript · Vite · TailwindCSS v4 · DaisyUI v5 · pnpm · svelte-i18n · Iconify

---

## Bootstrap

Run these commands in order every time you start work in a fresh environment:

```bash
cp .env.example .env
pnpm install --frozen-lockfile
```

---

## Key Commands

| Command       | Purpose                                     | Approx. time       |
| ------------- | ------------------------------------------- | ------------------ |
| `pnpm dev`    | Start dev server at <http://localhost:5173> | ~3s (runs forever) |
| `pnpm build`  | Production build                            | ~20s               |
| `pnpm check`  | TypeScript + Svelte type check              | ~10s               |
| `pnpm lint`   | Prettier + ESLint                           | ~15s               |
| `pnpm format` | Auto-format all files                       | ~5s                |

> External API calls to OpenFoodFacts will fail in sandboxed environments — this is expected. Focus on UI and code correctness.

---

## Pre-PR Validation (mandatory)

Before opening any pull request, run all of the following and fix every error:

```bash
pnpm format
pnpm lint
pnpm check
pnpm build
```

No PR should be opened with lint errors, type errors, or build failures.

---

## Source Structure

```text
src/
├── routes/           # SvelteKit pages and API endpoints
├── lib/
│   ├── api/          # External API integration (OFF, Folksonomy, Prices, Search)
│   ├── ui/           # Reusable Svelte components and forms
│   ├── i18n/         # svelte-i18n messages and setup
│   └── stores/       # Svelte stores for state management
├── params/           # SvelteKit parameter matchers
└── app.html          # HTML shell
```

**Key areas:**

| Path                             | Purpose                    |
| -------------------------------- | -------------------------- |
| `src/routes/products/[barcode]/` | Product detail pages       |
| `src/routes/search/`             | Search                     |
| `src/routes/settings/`           | User preferences           |
| `src/lib/ui/edit-product-steps/` | Product editing forms      |
| `src/lib/knowledgepanels/`       | Knowledge panel components |

---

## Contributing Rules

### Issues

- **Features require an issue before you start.** If no issue exists for a feature, create one first.
- If the issue is underspecified, post a comment asking for clarification before writing any code.
- If the issue is clear but you have implementation questions, ask before starting.
- Bug fixes, docs changes, and refactors may be submitted without a prior issue.

### Branches & Commits

- Branch off `main`.
- Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/): `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, etc.

### Pull Requests

- **If your PR addresses an issue, link it** using a closing keyword: `Fixes: #N` or `Closes: #N`.
- **Always fill in the PR template completely** — every section, including the LLM disclosure.
- In the LLM disclosure section, state your agent name, model version, and how it was used (agentic / autocomplete / review).
- **Always disclose that you are an AI agent** both on the issue (when claiming it) and in the PR.
- Do not open a PR with failing lint, type errors, or build failures.

### UI & Design

- **Read [DESIGN.md](DESIGN.md) before writing any UI code.** It defines the component patterns, colour tokens, button hierarchy, and responsive conventions.
- Always use DaisyUI semantic tokens (`bg-primary`, `text-base-content`) — never hardcode hex values.
- Follow the button priority hierarchy defined in DESIGN.md.

### Internationalisation

- **All user-facing strings must go through svelte-i18n.**
- Always provide a `default` fallback: `$_('some.key', { default: 'Fallback text' })`.
- Add new keys to `src/lib/i18n/messages/en-US.json` first.

---

## Common Issues

| Problem                             | Cause                            | Fix                                                  |
| ----------------------------------- | -------------------------------- | ---------------------------------------------------- |
| `Internal Error` or fetch failures  | External APIs blocked in sandbox | Expected — ignore for UI work                        |
| Build fails after dependency change | Stale lockfile                   | `rm -rf node_modules pnpm-lock.yaml && pnpm install` |
| App won't start                     | Missing `.env`                   | `cp .env.example .env`                               |
| CI fails on lint/format             | Unformatted code                 | `pnpm format && pnpm lint`                           |

---

## What This Project Does Not Have

- **No automated tests.** Validate manually by running the dev server and checking that navigation, search UI, and settings page work without console errors.
- **No test runner.** Do not attempt to run `pnpm test`.
