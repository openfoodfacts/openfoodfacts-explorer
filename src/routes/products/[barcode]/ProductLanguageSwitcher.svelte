<script lang="ts">
	import { _ } from '$lib/i18n';
	import { getLanguageName } from '$lib/languages';
	import { getProductLanguages, PRODUCT_LANGUAGE_PARAM } from '$lib/productLanguage';
	import { page } from '$app/state';

	import IconMdiTranslate from '@iconify-svelte/mdi/translate';
	import IconMdiCheck from '@iconify-svelte/mdi/check';

	type Props = {
		languagesCodes: Record<string, number> | null | undefined;
		lc: string;
	};
	let { languagesCodes, lc }: Props = $props();

	let languages = $derived(getProductLanguages(languagesCodes));

	function languageHref(code: string): string {
		const url = new URL(page.url);
		url.searchParams.set(PRODUCT_LANGUAGE_PARAM, code);
		return `${url.pathname}${url.search}`;
	}

	let details = $state<HTMLDetailsElement>();
</script>

{#if languages.length > 1}
	<details class="dropdown dropdown-center md:dropdown-start" bind:this={details}>
		<summary
			class="btn btn-secondary btn-sm md:btn-md"
			title={$_('product.language_switcher.label', { default: 'Product language' })}
			aria-label={$_('product.language_switcher.label', { default: 'Product language' })}
		>
			<IconMdiTranslate class="h-5 w-5" aria-hidden="true" />
			<span>{getLanguageName(lc)}</span>
		</summary>
		<ul
			class="menu dropdown-content z-10 mt-2 max-h-80 w-56 flex-nowrap overflow-y-auto rounded-box bg-base-100 p-2 shadow-lg"
		>
			<li class="menu-title">
				{$_('product.language_switcher.available', { default: 'Available languages' })}
			</li>
			{#each languages as code (code)}
				<li>
					<a
						href={languageHref(code)}
						class:menu-active={code === lc}
						aria-current={code === lc ? 'true' : undefined}
						hreflang={code}
						data-sveltekit-noscroll
						onclick={() => details?.removeAttribute('open')}
					>
						<span class="flex-1">{getLanguageName(code)}</span>
						{#if code === lc}
							<IconMdiCheck class="h-4 w-4" aria-hidden="true" />
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</details>
{/if}
