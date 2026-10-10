# Web Components Documentation

This project uses Lit-based web components provided by the `@openfoodfacts/openfoodfacts-webcomponents` library to render interactive widgets and edit UI sections.

## Installation & Setup

1. **Dependency**: Registered in `package.json` under `dependencies`:
   - `@openfoodfacts/openfoodfacts-webcomponents`
   - `@webcomponents/webcomponentsjs` (for polyfill loader support)

2. **Loading**: Web components are dynamically imported on the client-side within the `onMount` lifecycle of [layout.svelte](../src/routes/%2Blayout.svelte):

   ```typescript
   onMount(async () => {
   	await import('@openfoodfacts/openfoodfacts-webcomponents');
   });
   ```

3. **Global Configuration**:
   The component `<off-webcomponents-configuration>` is declared once in [layout.svelte](../src/routes/%2Blayout.svelte) to configure global settings:

   ```html
   <off-webcomponents-configuration
       bind:this={config}
       language-code={$preferences.lang ?? getLocale()?.split('-')[0]?.toLowerCase() ?? 'en'}
       assets-images-path="/assets/webcomponents"
       robotoff-configuration={JSON.stringify({
           dryRun: dev,
           apiUrl: ROBOTOFF_URL + '/api/v1',
           imgUrl: IMAGE_HOST + '/images/products'
       })}
   >
   </off-webcomponents-configuration>
   ```

---

## Used Web Components

### 1. `<off-webcomponents-configuration>`

- **Description**: Configures global variables for all other Open Food Facts web components (such as language, assets base path, and Robotoff API details).
- **Location**: Used in [layout.svelte](../src/routes/%2Blayout.svelte).
- **Key attributes**:
  - `language-code`: Sets the interface language.
  - `assets-images-path`: Directory path for component asset images.
  - `robotoff-configuration`: A JSON string containing settings for Robotoff interactions.

### 2. `<robotoff-contribution-message>`

- **Description**: Displays interactive question/contribution cards from Robotoff (Open Food Facts' AI engine) to gather user annotations for a product.
- **Location**: Used in [page.svelte](../src/routes/products/%5Bbarcode%5D/%2Bpage.svelte).
- **Key attributes**:
  - `product-code`: The barcode of the product.
  - `is-logged-in`: Boolean determining if the current user is authenticated.

### 3. `<folksonomy-editor>`

- **Description**: Renders the Folksonomy editor panel, letting users edit custom, informal, or community properties for a product.
- **Location**: Used in [page.svelte](../src/routes/products/%5Bbarcode%5D/%2Bpage.svelte).
- **Key attributes**:
  - `page-type`: Set to `"edit"`.
  - `product-code`: The barcode of the product.
  - `auth-token`: The user's OAuth access token.
