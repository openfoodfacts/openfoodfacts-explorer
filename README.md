<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-dark.png?refresh_github_cache=1">
  <source media="(prefers-color-scheme: light)" srcset="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-light.png?refresh_github_cache=1">
  <img height="48" src="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-light.svg">
</picture>
<br>

# Open Food Facts explorer: the modern JS frontend to Open Food Facts

## Features

- Uses the [official Open Food Facts NodeJS SDK](https://github.com/openfoodfacts/openfoodfacts-nodejs)
- Basic editing
- Product page display, including Knowledge Panels support
- Search
- Login support (simple login)
- Folksonomy Engine Support

## Roadmap

- Image editing
- Image upload
- Support for [Open Prices](https://prices.openfoodfacts.org/)
- Support for [Search-A-Licious](https://search.openfoodfacts.org/docs) (including facets)

## Developing

This project uses pnpm. If you have corepack enabled, you should be able to directly use `pnpm` commands. Otherwise, you can install pnpm with `npm install -g pnpm`.

First, install dependencies:

```bash
pnpm install
```

### Environment Variables Setup

Before running the project, set up the environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file as needed to configure your development environment.

Then start the development server:

```bash
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `pnpm run preview`.
