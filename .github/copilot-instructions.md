# OpenFoodFacts Explorer

OpenFoodFacts Explorer is a modern SvelteKit frontend application for the Open Food Facts database. It provides a responsive, mobile-first interface for browsing, searching, and editing food product information.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap and Build

**CRITICAL: Always copy environment file FIRST before running any other commands:**

- `cp .env.example .env`

**Install dependencies:**

- `pnpm install --frozen-lockfile` -- takes 30 seconds to complete. NEVER CANCEL. Set timeout to 60+ minutes.

**Build for production:**

- `pnpm build` -- takes 20 seconds to complete. NEVER CANCEL. Set timeout to 60+ minutes.

**Validate code quality:**

- `pnpm check` -- TypeScript checking, takes 10 seconds. NEVER CANCEL. Set timeout to 30+ minutes.
- `pnpm lint` -- Prettier + ESLint validation, takes 15 seconds. NEVER CANCEL. Set timeout to 30+ minutes.

### Development Server

**Run the development server:**

- `pnpm dev` -- starts Vite dev server on http://localhost:5173/
- Takes ~3 seconds to start. Server runs indefinitely until stopped.
- **IMPORTANT:** External API calls to OpenFoodFacts may fail in sandboxed environments (expected behavior)

### Code Formatting

**Auto-format code:**

- `pnpm format` -- formats all files with Prettier, takes 5 seconds. NEVER CANCEL. Set timeout to 30+ minutes.
- Pre-commit hook automatically runs `pnpm format:changed` via Husky

## Validation

**Manual validation is REQUIRED since there are no automated tests.**

### Core Application Validation

1. **ALWAYS run the development server and verify basic functionality:**
   - Navigation works (header menu, footer links)
   - Settings page loads at `/settings`
   - Search interface is functional (even if external API calls fail)
   - UI components render correctly with no console errors

2. **Expected behaviors in sandboxed environments:**
   - External API calls to OpenFoodFacts APIs may fail with fetch errors - this is EXPECTED
   - "Internal Error" messages may appear due to blocked external network requests
   - Core UI and navigation should work perfectly despite API failures

3. **Complete validation workflow:**
   - Copy environment file: `cp .env.example .env`
   - Install dependencies: `pnpm install --frozen-lockfile`
   - Run TypeScript check: `pnpm check`
   - Run linting: `pnpm lint`
   - Build application: `pnpm build`
   - Start dev server: `pnpm dev`
   - Navigate to http://localhost:5173/ and verify UI loads
   - Test navigation to /settings page
   - Verify no console errors related to code (API fetch errors are expected)

### Pre-commit Validation

**ALWAYS run these commands before committing changes:**

- `pnpm format` -- ensures code formatting
- `pnpm lint` -- validates code style and correctness
- `pnpm check` -- validates TypeScript
- **NOTE:** Husky pre-commit hook automatically runs formatting

## Key Project Areas

### Source Code Structure

```
/src/
├── routes/           # SvelteKit pages and API endpoints
├── lib/             # Reusable components and utilities
│   ├── api/         # External API integration code
│   ├── ui/          # UI components and forms
│   ├── i18n/        # Internationalization files
│   └── stores/      # Svelte stores for state management
├── params/          # SvelteKit parameter validation
└── app.html         # Main HTML template
```

### Important Files

- `package.json` -- Project dependencies and scripts
- `vite.config.ts` -- Vite build configuration
- `svelte.config.js` -- SvelteKit configuration
- `eslint.config.mjs` -- ESLint configuration
- `tsconfig.json` -- TypeScript configuration
- `.env.example` -- Environment variables template

### Key Components

- `/src/routes/products/[barcode]/` -- Product detail pages
- `/src/routes/search/` -- Search functionality
- `/src/routes/settings/` -- User preferences
- `/src/lib/ui/edit-product-steps/` -- Product editing forms
- `/src/lib/knowledgepanels/` -- Knowledge panel components

## Technology Stack

### Core Technologies

- **SvelteKit** -- Full-stack web framework
- **TypeScript** -- Type-safe JavaScript
- **Vite** -- Build tool and dev server
- **pnpm** -- Package manager (v10.14.0+ required)

### Styling & UI

- **TailwindCSS** -- Utility-first CSS framework
- **DaisyUI** -- TailwindCSS component library
- **PostCSS** -- CSS processing

### Code Quality

- **ESLint** -- JavaScript/TypeScript linting
- **Prettier** -- Code formatting
- **Husky** -- Git hooks
- **svelte-check** -- Svelte-specific TypeScript checking

### External APIs

- OpenFoodFacts API -- Product database
- Folksonomy API -- Product attributes
- Prices API -- Price information
- Search API -- Product search

## Common Issues & Solutions

### Network/API Issues

- **Problem:** "Internal Error" or fetch failures
- **Cause:** External API calls blocked in sandboxed environments
- **Solution:** This is expected behavior - focus on UI/code functionality

### Build Issues

- **Problem:** Build failures after dependency changes
- **Solution:** Delete `node_modules` and `pnpm-lock.yaml`, then `pnpm install`

### Environment Issues

- **Problem:** Application won't start or missing environment variables
- **Solution:** Ensure `.env` file exists: `cp .env.example .env`

### Code Quality Issues

- **Problem:** CI failing on lint/format checks
- **Solution:** Run `pnpm format && pnpm lint` locally before committing

## Frequently Run Commands

### Package Manager Commands

```bash
# Install dependencies (frozen lockfile for CI)
pnpm install --frozen-lockfile

# Install dependencies (update lockfile)
pnpm install

# Add new dependency
pnpm add <package-name>

# Add dev dependency
pnpm add -D <package-name>
```

### Common File Locations

```
Repository Root:
├── .github/workflows/ci.yml    # GitHub Actions CI
├── .husky/pre-commit          # Git pre-commit hook
├── .env.example              # Environment template
├── package.json              # Project configuration
├── README.md                 # Project documentation
├── CONTRIBUTING.md           # Contribution guidelines
└── src/                      # Source code directory
```

### Development Workflow

1. Copy environment: `cp .env.example .env`
2. Install deps: `pnpm install --frozen-lockfile`
3. Start dev server: `pnpm dev`
4. Make changes and test manually
5. Format code: `pnpm format`
6. Validate: `pnpm lint && pnpm check`
7. Build: `pnpm build`
8. Commit (pre-commit hook runs automatically)

## CRITICAL Reminders

- **NEVER CANCEL** builds or long-running commands - they may take 20-60+ seconds
- **ALWAYS** copy `.env.example` to `.env` before running commands
- **NO AUTOMATED TESTS** exist - manual validation is required
- **EXTERNAL API FAILURES** are expected in sandboxed environments
- **PRE-COMMIT HOOKS** automatically format code via Husky
- Use **explicit timeouts** of 60+ minutes for builds and 30+ minutes for other commands
