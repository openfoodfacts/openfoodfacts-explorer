<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from '$lib/i18n';
	import { isConfigured as isPriceConfigured } from '$lib/api/prices';
	import { isConfigured as isFolksonomyConfigured } from '$lib/api/folksonomy';
	import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';

	import IconMdiInformation from '@iconify-svelte/mdi/information';
	import IconMdiNutrition from '@iconify-svelte/mdi/nutrition';
	import IconMdiLeaf from '@iconify-svelte/mdi/leaf';
	import IconMdiTagMultiple from '@iconify-svelte/mdi/tag-multiple';
	import IconMdiDatabase from '@iconify-svelte/mdi/database';
	import IconMdiLabel from '@iconify-svelte/mdi/label';
	import IconMdiBarcode from '@iconify-svelte/mdi/barcode';
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';
	import IconMdiFormatListBulleted from '@iconify-svelte/mdi/format-list-bulleted';
	import IconMdiHeartPulse from '@iconify-svelte/mdi/heart-pulse';
	import IconMdiFlag from '@iconify-svelte/mdi/flag';
	import IconMdiChevronRight from '@iconify-svelte/mdi/chevron-right';

	interface SidebarSection {
		id: string;
		label: string;
		icon?: typeof IconMdiInformation;
	}

	type Props = {
		product: Product;
		showBarcode: boolean;
		hasPrices: boolean;
		sections?: SidebarSection[];
		hidden?: boolean;
	};

	let { product, showBarcode, hasPrices, hidden = $bindable(false), sections }: Props = $props();

	const defaultSections = $derived.by(() => {
		const list: SidebarSection[] = [];

		list.push({
			id: 'overview',
			label: $_('product.sections.product', { default: 'Product' }),
			icon: IconMdiInformation
		});

		list.push({
			id: 'attributes',
			label: $_('product.sections.attributes', { default: 'Attributes' }),
			icon: IconMdiNutrition
		});

		if (product.knowledge_panels?.health_card) {
			list.push({
				id: 'health_card',
				label: $_('product.sections.health', { default: 'Health' }),
				icon: IconMdiHeartPulse
			});
		}

		if (product.knowledge_panels?.environment_card) {
			list.push({
				id: 'environment_card',
				label: $_('product.sections.environment', { default: 'Environment' }),
				icon: IconMdiLeaf
			});
		}

		if (product.knowledge_panels?.report_problem_card) {
			list.push({
				id: 'report_problem_card',
				label: $_('product.sections.report_problem', { default: 'Report a Problem' }),
				icon: IconMdiFlag
			});
		}

		if (product.knowledge_panels?.contribution_card) {
			list.push({
				id: 'contribution_card',
				label: $_('product.sections.contribution', { default: 'Contribution' }),
				icon: IconMdiHelpCircleOutline
			});
		}

		if (product.knowledge_panels?.product_card) {
			list.push({
				id: 'product_card',
				label: $_('product.sections.product_information', { default: 'Product information' }),
				icon: IconMdiFormatListBulleted
			});
		}

		if (isPriceConfigured() && hasPrices) {
			list.push({
				id: 'prices',
				label: $_('product.sections.prices', { default: 'Prices' }),
				icon: IconMdiTagMultiple
			});
		}

		if (showBarcode && product.code != null) {
			list.push({
				id: 'barcode-info',
				label: $_('product.sections.barcode_info', { default: 'Barcode information' }),
				icon: IconMdiBarcode
			});
		}

		list.push({
			id: 'data-sources',
			label: $_('product.sections.data_sources', { default: 'Data Sources' }),
			icon: IconMdiDatabase
		});

		if (isFolksonomyConfigured()) {
			list.push({
				id: 'folksonomy',
				label: $_('product.sections.folksonomy', { default: 'Folksonomy' }),
				icon: IconMdiLabel
			});
		}

		return list;
	});

	let activeSections = $derived(sections ?? defaultSections);

	const SCROLL_HEADER_OFFSET = 120;

	let activeSection = $state('overview');
	let navElement = $state<HTMLElement>();
	let indicatorTop = $state(0);
	let indicatorHeight = $state(0);

	function updateIndicator() {
		if (activeSection && navElement) {
			const activeBtn = navElement.querySelector(
				`[data-section="${activeSection}"]`
			) as HTMLElement;
			if (activeBtn) {
				indicatorTop = activeBtn.offsetTop;
				indicatorHeight = activeBtn.offsetHeight;
			}
		}
	}

	$effect(() => {
		if (activeSection && navElement) {
			updateIndicator();
		}
	});

	let ignoreObserver = false;
	let observerTimeout: ReturnType<typeof setTimeout>;

	function scrollToSection(id: string) {
		const el = document.getElementById(id);
		if (el) {
			// Lock scroll observer during manual selection & animations
			ignoreObserver = true;
			clearTimeout(observerTimeout);
			observerTimeout = setTimeout(() => {
				ignoreObserver = false;
			}, 1000);

			// Scroll and ensure active
			const elementPosition = el.getBoundingClientRect().top + window.scrollY;
			const offsetPosition = elementPosition - SCROLL_HEADER_OFFSET;

			window.scrollTo({
				top: offsetPosition,
				behavior: 'smooth'
			});

			activeSection = id;
		}
	}

	function updateActiveSection() {
		if (ignoreObserver) return;

		let currentSection = activeSections[0]?.id || '';

		const isAtBottom =
			window.scrollY > 0 &&
			window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;

		if (isAtBottom) {
			currentSection = activeSections[activeSections.length - 1]?.id || '';
		} else {
			for (let i = 0; i < activeSections.length; i++) {
				const section = activeSections[i];
				const el = document.getElementById(section.id);
				if (el) {
					const rect = el.getBoundingClientRect();
					if (rect.top <= SCROLL_HEADER_OFFSET) {
						currentSection = section.id;
					} else {
						break;
					}
				}
			}
		}

		if (currentSection && activeSection !== currentSection) {
			activeSection = currentSection;
		}
	}

	onMount(() => {
		let ticking = false;

		function handleScroll() {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					updateActiveSection();
					ticking = false;
				});
				ticking = true;
			}
		}

		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', updateIndicator, { passive: true });

		const timer = setTimeout(() => {
			updateActiveSection();
		}, 300);

		return () => {
			clearTimeout(timer);
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', updateIndicator);
		};
	});
</script>

<div class="hidden lg:pt-28 h-full {hidden ? 'lg:hidden' : 'lg:block'}">
	<aside class="sticky top-24 w-50 max-h-[calc(100vh-140px)] overflow-y-auto pr-2">
		<div class="flex items-center justify-end mb-4 px-1">
			<button
				type="button"
				onclick={() => (hidden = true)}
				class="text-xs text-primary/70 hover:text-primary transition-colors cursor-pointer select-none underline font-medium flex items-center gap-1"
			>
				{$_('product.sidebar.hide', { default: 'Hide Sidebar' })}
			</button>
		</div>
		<nav
			bind:this={navElement}
			aria-label={$_('product.sidebar_navigation', { default: 'Product view sections' })}
			class="relative border-l-2 border-base-300 flex flex-col gap-1 pl-4 text-sm"
		>
			<!-- Active indicator line with smooth sliding transition -->
			{#if indicatorHeight > 0}
				<div
					aria-hidden="true"
					class="absolute -left-0.5 w-0.5 rounded-full transition-all duration-300 ease-in-out bg-primary"
					style="top: {indicatorTop}px; height: {indicatorHeight}px;"
				></div>
			{/if}

			{#each activeSections as section (section.id)}
				{@const IconComponent = section.icon}
				<button
					type="button"
					data-section={section.id}
					aria-controls={section.id}
					aria-current={activeSection === section.id ? 'true' : 'false'}
					onclick={() => scrollToSection(section.id)}
					class={[
						'group flex items-center py-2 text-left relative transition-all duration-200 outline-none select-none cursor-pointer',
						activeSection === section.id
							? 'text-primary font-semibold'
							: 'text-base-content/60 hover:text-primary'
					]}
				>
					{#if IconComponent}
						<IconComponent
							class="w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-110"
						/>
					{/if}
					<span>{section.label}</span>
				</button>
			{/each}
		</nav>
	</aside>
</div>

{#if hidden}
	<button
		type="button"
		onclick={() => (hidden = false)}
		class="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 h-24 w-5 items-center justify-center rounded-r-xl border border-l-0 border-base-300 bg-base-200 text-base-content/70 shadow-md hover:w-7 hover:bg-primary hover:text-primary-content hover:border-primary transition-all duration-300 group cursor-pointer outline-none"
		title={$_('product.sidebar.show', { default: 'Show Sidebar' })}
	>
		<IconMdiChevronRight class="w-4 h-4 transition-transform duration-200 group-hover:scale-125" />
	</button>
{/if}
