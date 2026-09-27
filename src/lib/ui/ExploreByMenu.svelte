<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import IconMdiChevronDown from '@iconify-svelte/mdi/chevron-down';
	import { _ } from '$lib/i18n';
	import { OPEN_PRICES_BASE_URL } from '$lib/const';

	type Props = {
		mobile?: boolean;
		onNavigate?: () => void;
	};

	let { mobile = false, onNavigate = () => {} }: Props = $props();
	let menu: HTMLDetailsElement;

	$effect(() => {
		const pathname = page.url.pathname;
		if (pathname && menu) menu.open = false;
	});

	const links = [
		{
			href: resolve('/facets'),
			labelKey: 'navigation.browse_products_by',
			defaultLabel: 'Browse products by…'
		},
		{
			href: resolve('/folksonomy'),
			labelKey: 'navigation.custom_properties',
			defaultLabel: 'Custom properties'
		},
		{
			href: `${OPEN_PRICES_BASE_URL}/explore`,
			labelKey: 'navigation.explore_prices',
			defaultLabel: 'Explore prices',
			external: true
		}
	];

	function closeMenu() {
		menu.open = false;
		onNavigate();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && menu?.open) {
			menu.open = false;
			menu.querySelector<HTMLElement>('summary')?.focus();
		}
	}

	function handleWindowClick(event: MouseEvent) {
		if (menu?.open && event.target instanceof Node && !menu.contains(event.target)) {
			menu.open = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} onclick={handleWindowClick} />

<details bind:this={menu} class={mobile ? 'w-full' : 'dropdown dropdown-end'}>
	<summary
		class={mobile
			? 'btn w-full link list-none justify-center btn-outline'
			: 'flex cursor-pointer list-none items-center gap-1 font-medium text-secondary-content hover:underline'}
	>
		<span>{$_('navigation.explore_by', { default: 'Explore by' })}</span>
		<IconMdiChevronDown class="h-5 w-5" aria-hidden="true" />
	</summary>
	<ul
		class={mobile
			? 'menu mt-2 w-full rounded-box border border-base-300 bg-base-100 p-2 shadow-xl'
			: 'menu dropdown-content z-50 mt-2 w-60 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl'}
	>
		{#each links as link (link.href)}
			<li>
				<a
					href={link.href}
					target={link.external ? '_blank' : undefined}
					rel={link.external ? 'noopener noreferrer' : undefined}
					onclick={closeMenu}
					class="flex gap-2 px-4 py-2 hover:bg-base-200 hover:text-base-content active:bg-primary active:text-primary-content"
				>
					{$_(link.labelKey, { default: link.defaultLabel })}
				</a>
			</li>
		{/each}
	</ul>
</details>
