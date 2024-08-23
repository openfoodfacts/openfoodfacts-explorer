<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-dark.png?refresh_github_cache=1">
  <source media="(prefers-color-scheme: light)" srcset="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-light.png?refresh_github_cache=1">
  <img height="48" src="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-light.svg">
</picture>
<br>

# Open Food Facts explorer: the modern JS frontend to Open Food Facts

## Features

- Uses the official Open Food Facts NodeJS SDK
- Basic editing
- Product page display, including Knowledge Panels support
- Search
- Login support (simple login)
- Folksonomy Engine Support

## Roadmap

- Image editing
- Image upload
- Support for Open Prices
- Support for Search-A-Licious (including facets)

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.
