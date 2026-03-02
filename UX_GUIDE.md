# UX Contributing Guide

This document outlines the UI/UX patterns, design system conventions, and best practices used in this project. Following these guidelines helps keep our interface consistent, accessible, and easy to maintain.

> **Disclaimer:** These are guidelines, not hard rules. Maintainers may request additional design changes or tweaks on a case-by-case basis during PR review.

---

## Table of Contents

1. [Design System Overview](#1-design-system-overview)
2. [Component Patterns](#2-component-patterns)
3. [Internationalization (i18n)](#3-internationalization-i18n)
4. [Accessibility (a11y)](#4-accessibility-a11y)
5. [Responsive Design](#5-responsive-design)
6. [Design Resources](#6-design-resources)

---

## 1. Design System Overview

Our UI is built on a modern stack:

- **[Tailwind CSS v4](https://tailwindcss.com/)** — Utility-first CSS framework
- **[DaisyUI v5](https://daisyui.com/)** — Semantic component classes (e.g., `btn`, `card`, `alert`)
- **[SvelteKit](https://kit.svelte.dev/)** — Full-stack Svelte framework
- **[Iconify (@iconify-svelte)](https://icon-sets.iconify.design/mdi/)** — Icon library (primarily Material Design Icons)

### Themes & Colors

We define custom **Light** and **Dark** themes in [`src/app.css`](src/app.css). The palette uses warm, natural tones to reflect our food-focused mission.

| Token               | Semantic Role                  | Light Mode               | Dark Mode              |
| ------------------- | ------------------------------ | ------------------------ | ---------------------- |
| `primary`           | Main actions, brand identity   | `#201a17` (Dark Brown)   | `#faf7f5` (Off-White)  |
| `primary-content`   | Text on primary background     | `#faf7f5`                | `#201a17`              |
| `secondary`         | Supporting actions, navigation | `#52443d` (Medium Brown) | `#ebc3a8` (Warm Beige) |
| `secondary-content` | Text on secondary background   | `#faf7f5`                | `#201a17`              |
| `base-100`          | Page / card backgrounds        | `#faf7f5`                | `#201a17`              |
| `base-200`          | Secondary backgrounds          | `#f3f0ee`                | `#2d2724`              |
| `base-300`          | Borders, dividers, highlights  | `#ebe8e6`                | `#3a332f`              |

> **Note:** Always use DaisyUI semantic tokens (`bg-primary`, `text-base-content`) instead of hard-coded hex values. This ensures automatic dark mode support.

### Border Radius

The project uses generous rounding for a soft, friendly feel:

- **Selectors & Fields:** `1rem` (set via `--radius-selector` and `--radius-field`)
- **Inner Boxes:** `0.5rem` (set via `--radius-box`)

## 2. Component Patterns

### Buttons

We follow a strict hierarchy to guide user attention. Always use the lowest-emphasis button that fits the context.

| Priority | DaisyUI Class       | When to Use                                   | Real Example                         |
| -------- | ------------------- | --------------------------------------------- | ------------------------------------ |
| Highest  | `btn btn-primary`   | Main call-to-action ("Add Product", "Save")   | Homepage hero, Add Product CTA       |
| High     | `btn btn-secondary` | Supporting action ("Search", "Next Step")     | SearchBar "Go" button, Edit form nav |
| Medium   | `btn btn-outline`   | Tertiary action ("Cancel", "Back", "Log out") | Login/Logout, Return to Home         |
| Low      | `btn btn-soft`      | Gentle emphasis without strong borders        | Search page sort/filter toggles      |
| Lowest   | `btn btn-ghost`     | Minimal emphasis ("Close", "Dismiss")         | Toast close, Settings link           |

#### Button Sizes

Use sizing classes to match the context:

| Size    | Class    | Usage                             |
| ------- | -------- | --------------------------------- |
| Small   | `btn-sm` | Inline actions, tags, compact UIs |
| Default | `btn`    | Standard buttons                  |
| Large   | `btn-lg` | Hero sections, prominent CTAs     |

#### Icon + Label Buttons

For buttons with both an icon and text, use `gap-2` to maintain consistent spacing:

```svelte
<button class="btn btn-primary gap-2">
	<IconMdiPencil class="h-5 w-5" />
	<span>{$_('action.edit', { default: 'Edit' })}</span>
</button>
```

#### Icon-Only Buttons

Use `btn-circle` or `btn-square`. **Always** add `aria-label` for accessibility:

```svelte
<button class="btn btn-circle btn-ghost" aria-label={$_('action.close', { default: 'Close' })}>
	<IconMdiClose class="h-6 w-6" aria-hidden="true" />
</button>
```

#### Grouped Buttons (Join)

Use the `join` pattern when buttons are part of a connected group (e.g., a search bar, pagination):

```svelte
<div class="join">
	<input class="input join-item input-bordered" placeholder="Search..." />
	<button class="btn btn-secondary join-item">Go</button>
</div>
```

### Cards

Use `card` with `bg-base-100` and `shadow-xl` for content containers. Use `card-body` for padded inner content:

```svelte
<div class="card bg-base-100 w-full shadow-xl">
	<div class="card-body">
		<h2 class="card-title">Card Title</h2>
		<p>Card content goes here.</p>
		<div class="card-actions justify-end">
			<button class="btn btn-primary">{$_('action.save', { default: 'Save' })}</button>
		</div>
	</div>
</div>
```

### Toasts & Alerts

Use DaisyUI's `alert` component for notifications. The project uses Svelte's `fly` transition for smooth entrance/exit:

```svelte
<!-- Alert types: alert-success, alert-error, alert-warning, alert-info -->
<div class="alert alert-success shadow-lg" role="alert" aria-live="polite">
	<IconMdiCheckCircle class="h-5 w-5" aria-hidden="true" />
	<span>Operation completed successfully!</span>
</div>
```

### Pill-Shaped Tags

For tag-like links (e.g., in the Footer's "Discover our Project" section), use `rounded-full`:

```svelte
<a
	href="/about"
	class="bg-secondary-content text-primary rounded-full px-4 py-2 transition-opacity hover:opacity-80"
>
	{$_('footer.discover.about', { default: 'About Us' })}
</a>
```

## 3. Internationalization (i18n)

We use [`svelte-i18n`](https://github.com/kaisermann/svelte-i18n) to support multiple languages.

### Setup

```svelte
<script>
	import { _ } from '$lib/i18n';
</script>
```

Translation files are located in `src/lib/i18n/messages/`. The project aims to cover all languages available across the Open Food Facts ecosystem — if you'd like to contribute a translation, add a new locale file there.

### Best Practices

1. **Always provide a default value.** This ensures the UI remains functional even when a translation key is missing or the locale bundle hasn't loaded yet.

   ```svelte
   <!-- Recommended: always provide a default -->
   <span>{$_('product.buttons.edit', { default: 'Edit' })}</span>

   <!-- Avoid: no fallback, may render the raw key -->
   <span>{$_('product.buttons.edit')}</span>
   ```

2. **Use dot-separated, nested keys** for logical grouping.

   ```
   # Recommended
   product.buttons.edit
   search.placeholder

   # Avoid
   edit_button
   searchPlaceholder
   ```

3. **Adding a new translation key:**
   - Add the key and English text to `src/lib/i18n/messages/en-US.json`.
   - (Optional) Add translations to other locale files (e.g., `it-IT.json`).
   - Use the key in your component with a `{ default: '...' }` fallback.

## 4. Accessibility (a11y)

We aim to make Open Food Facts accessible to everyone. Before submitting a PR, review the checklist below.

- **Icon-only buttons** have an `aria-label` describing the action.
- **Decorative icons** use `aria-hidden="true"` so screen readers skip them.
- **Images** have a descriptive `alt` attribute (or `alt=""` if purely decorative).
- **Semantic HTML** is used correctly:
  - `<button>` for actions (submitting forms, toggling state, opening modals).
  - `<a>` for navigation (changing the URL, linking to external pages).
- **Dynamic notifications** (Toasts) use `role="alert"` and `aria-live="polite"`.
- **Interactive elements** are keyboard-accessible (focusable and operable via `Enter`/`Space`).
- **External links** use `target="_blank"` with `rel="noopener"` for security.

### Good Examples from the Codebase

```svelte
<!-- Footer: social link with aria-label -->
<a href="https://github.com/openfoodfacts" target="_blank" aria-label="GitHub">
	<IconMdiGithub class="h-6 w-6" />
</a>

<!-- Toast: role and aria-live for screen reader announcements -->
<div class="alert alert-success" role="alert" aria-live="polite">
	<IconMdiCheckCircle class="h-5 w-5" aria-hidden="true" />
	<span>Changes saved!</span>
</div>

<!-- SearchBar: accessible input -->
<input
	type="text"
	class="input join-item input-bordered w-full"
	placeholder={$_('search.placeholder')}
	aria-label={$_('search.placeholder')}
/>
```

## 5. Responsive Design

We use a **Mobile-First** approach. Design for small screens first, then progressively enhance for larger viewports.

### Breakpoints

DaisyUI / Tailwind CSS breakpoints used in this project:

| Prefix    | Min Width | Typical Use              |
| --------- | --------- | ------------------------ |
| (default) | 0px       | Mobile styles            |
| `sm:`     | 640px     | Small tablets            |
| `md:`     | 768px     | Tablets / small desktops |
| `lg:`     | 1024px    | Desktops                 |
| `2xl:`    | 1536px    | Wide screens             |

### Common Patterns

| Pattern              | Classes                  | What It Does                                     |
| -------------------- | ------------------------ | ------------------------------------------------ |
| Hide on mobile       | `hidden md:block`        | Hidden by default, visible on tablets and up     |
| Full width on mobile | `w-full sm:w-auto`       | Takes full width on small screens, auto on wider |
| Stack → Row          | `flex-col md:flex-row`   | Vertical stack on mobile, horizontal on desktop  |
| Responsive padding   | `px-4 md:px-10 lg:px-36` | Padding increases with screen size (see Footer)  |
| Mobile-only full     | `max-sm:w-full`          | Full width only on very small screens            |

## 6. Design Resources

### Internal

- **[Contributing Guide](CONTRIBUTING.md)** — Code contribution workflow, branching, and PR guidelines.

### External

- **[Open Food Facts Design Repo](https://github.com/openfoodfacts/openfoodfacts-design)** — Brand guidelines, logos, illustrations, and high-level design plan.
- **Figma:**
  - [Explorer Mockups (WIP)](<https://www.figma.com/design/pgWZAEX1ZoTt0f7Azek4AV/Open-Food-Facts-Explorer-(next-gen-frontend)?node-id=1-53>) — Homepage, Search, Product page, Edit mode, Facets.
  - [Current Website Design](https://www.figma.com/design/Qg9URUyrjHgYmnDHXRsTTB/Current-Website-design?m=auto&t=RokuCr1uXrGFMhTB-6) — Reference designs for the legacy website.

_This guide is a living document. If you spot something missing or outdated, feel free to open a PR to improve it._
