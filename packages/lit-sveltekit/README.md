# @openfoodfacts/lit-sveltekit

Experimental SvelteKit integration for rendering selected Lit web components on the server and hydrating them in the browser.

> This is a private workspace package. It is not published or ready for installation from a package registry.

## Features

- Generate typed Svelte wrappers from a component package's Custom Elements Manifest.
- Opt individual components into declarative shadow DOM SSR with the wrapper-only `ssr` prop, which defaults to `false`.
- Hydrate the rendered components in the browser while leaving the rest of the app's rendering universal.

## Usage

Add the Vite plugin and point it at each component package's `custom-elements.json` manifest. `componentPrefix` is optional and prefixes generated wrapper names.

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { litSvelteWrapperPlugin } from '@openfoodfacts/lit-sveltekit/vite';

export default defineConfig({
	plugins: [
		litSvelteWrapperPlugin([
			{
				manifestPath: 'node_modules/@example/components/custom-elements.json',
				componentPrefix: 'Example'
			}
		]),
		sveltekit()
	]
});
```

Import generated wrappers from `virtual:lit-svelte/components`:

```svelte
<script lang="ts">
	import { ExampleProductCard } from 'virtual:lit-svelte/components';

	let product = $state({ product_name: 'Example product' });
</script>

<ExampleProductCard {product} ssr class="product-card" />
```

Register the component bundle with the server handle and load it in the browser. `loadLitComponents` loads Lit's hydration support before importing the component definitions.

```ts
// src/hooks.server.ts
import { sequence } from '@sveltejs/kit/hooks';
import { createLitSsrHandle } from '@openfoodfacts/lit-sveltekit/sveltekit/server';

const litSsrHandle = createLitSsrHandle({
	registrationKey: '@example/components',
	registerComponents: () => import('@example/components')
});

export const handle = sequence(litSsrHandle);
```

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { loadLitComponents } from '@openfoodfacts/lit-sveltekit/sveltekit/client';

	onMount(() => loadLitComponents(() => import('@example/components')));
</script>
```

## Package exports

| Import path                                     | Export                                          |
| ----------------------------------------------- | ----------------------------------------------- |
| `@openfoodfacts/lit-sveltekit/vite`             | `litSvelteWrapperPlugin(sources)`               |
| `@openfoodfacts/lit-sveltekit/sveltekit/server` | `createLitSsrHandle(options)`                   |
| `@openfoodfacts/lit-sveltekit/sveltekit/client` | `loadLitComponents(importComponents, options?)` |

Generated wrappers and their declarations are written under the consuming app's `.svelte-kit/generated/lit-svelte/` directory.

## Requirements and limitations

- The consuming app must provide compatible `@lit-labs/ssr`, `@lit-labs/ssr-client`, `@sveltejs/kit`, `lit`, `svelte`, and `vite` peer dependencies.
- Component packages should publish a Custom Elements Manifest and TypeScript declarations that register their tags in `HTMLElementTagNameMap`. Keep Lit external in published component bundles so the server and browser can resolve compatible Lit modules.
- Props used for SSR must be JSON-serializable. When serialization or Lit SSR fails, the element falls back to client rendering.
- `ssr` is reserved by the wrapper and is not passed through as a custom-element property. SSR is disabled unless the wrapper receives `ssr` or `ssr={true}`.
- Only properties declared in the component's Lit `elementProperties` map are assigned. Unknown properties are ignored; browser property assignment waits for component registration. Standard host attributes and event handlers are handled separately.
- Explicit custom-event mapping and forwarding Svelte children into Lit slots are not implemented yet.
- Lit SSR is part of Lit Labs and remains experimental. Its current limitations include unsupported async component work and support for Lit components that use shadow DOM. Check the [Lit SSR status](https://lit.dev/docs/ssr/overview/) and the [browser requirements for declarative shadow DOM](https://lit.dev/docs/ssr/client-usage/) before choosing a production browser matrix.

## Development

This package is linked to the Explorer app with `workspace:*`. From the repository root, run:

```sh
pnpm install
pnpm check
pnpm build
```
