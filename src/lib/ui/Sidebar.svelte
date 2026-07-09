<script lang="ts">
	import { onMount } from 'svelte';
	import type { Component, ComponentType } from 'svelte';
	import { _ } from '$lib/i18n';
	import { preferences } from '$lib/settings';
	import { getPermissionsCtx } from '$lib/stores/user';
	import { isConfigured as isPriceConfigured } from '$lib/api/prices';
	import { isConfigured as isFolksonomyConfigured } from '$lib/api/folksonomy';
	import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';

	import IconMdiInformation from '@iconify-svelte/mdi/information';
	import IconMdiNutrition from '@iconify-svelte/mdi/nutrition';
	import IconMdiLeaf from '@iconify-svelte/mdi/leaf';
	import IconMdiHeartPulse from '@iconify-svelte/mdi/heart-pulse';
	import IconMdiFlag from '@iconify-svelte/mdi/flag';
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';
	import IconMdiFormatListBulleted from '@iconify-svelte/mdi/format-list-bulleted';
	import IconMdiTagMultiple from '@iconify-svelte/mdi/tag-multiple';
	import IconMdiBarcode from '@iconify-svelte/mdi/barcode';
	import IconMdiDatabase from '@iconify-svelte/mdi/database';
	import IconMdiLabel from '@iconify-svelte/mdi/label';
	import IconMdiChevronRight from '@iconify-svelte/mdi/chevron-right';
	import IconMdiTranslate from '@iconify-svelte/mdi/translate';
	import IconMdiImageMultiple from '@iconify-svelte/mdi/image-multiple';
	import IconMdiPackageVariant from '@iconify-svelte/mdi/package-variant';
	import IconMdiCommentText from '@iconify-svelte/mdi/comment-text';
	import IconMdiShieldAccount from '@iconify-svelte/mdi/shield-account';
	import IconMdiEarth from '@iconify-svelte/mdi/earth';

	export interface SidebarSection {
		id: string;
		label: string;
		icon?: Component | ComponentType;
		style?: 'warning' | 'primary';
	}

	type Props = {
		type: 'product' | 'edit';
		product?: Product;
		showBarcode?: boolean;
		hasPrices?: boolean;
		activeSection?: string;
		hidden?: boolean;
		onSectionClick?: (id: string) => void;
	};

	let {
		type,
		product,
		showBarcode = false,
		hasPrices = false,
		activeSection = $bindable(''),
		hidden = $bindable(false),
		onSectionClick
	}: Props = $props();

	const permissions = getPermissionsCtx();

	const sections = $derived.by(() => {
		if (type === 'product' && product) {
			const rawList: (SidebarSection | false | undefined | null)[] = [
				{
					id: 'overview',
					label: $_('product.sections.product', { default: 'Product' }),
					icon: IconMdiInformation
				},
				{
					id: 'attributes',
					label: $_('product.sections.attributes', { default: 'Attributes' }),
					icon: IconMdiNutrition
				},
				product.knowledge_panels?.health_card && {
					id: 'health_card',
					label: $_('product.sections.health', { default: 'Health' }),
					icon: IconMdiHeartPulse
				},
				product.knowledge_panels?.environment_card && {
					id: 'environment_card',
					label: $_('product.sections.environment', { default: 'Environment' }),
					icon: IconMdiLeaf
				},
				product.knowledge_panels?.report_problem_card && {
					id: 'report_problem_card',
					label: $_('product.sections.report_problem', { default: 'Report a Problem' }),
					icon: IconMdiFlag
				},
				product.knowledge_panels?.contribution_card && {
					id: 'contribution_card',
					label: $_('product.sections.contribution', { default: 'Contribution' }),
					icon: IconMdiHelpCircleOutline
				},
				product.knowledge_panels?.product_card && {
					id: 'product_card',
					label: $_('product.sections.product_information', { default: 'Product information' }),
					icon: IconMdiFormatListBulleted
				},
				isPriceConfigured() &&
					hasPrices && {
						id: 'prices',
						label: $_('product.sections.prices', { default: 'Prices' }),
						icon: IconMdiTagMultiple
					},
				showBarcode &&
					product.code != null && {
						id: 'barcode-info',
						label: $_('product.sections.barcode_info', { default: 'Barcode information' }),
						icon: IconMdiBarcode
					},
				{
					id: 'data-sources',
					label: $_('product.sections.data_sources', { default: 'Data Sources' }),
					icon: IconMdiDatabase
				},
				isFolksonomyConfigured() && {
					id: 'folksonomy',
					label: $_('product.sections.folksonomy', { default: 'Folksonomy' }),
					icon: IconMdiLabel
				}
			];
			return rawList.filter((item): item is SidebarSection => !!item);
		}

		if (type === 'edit') {
			const rawList: (SidebarSection | false | undefined | null)[] = [
				{
					id: 'languages',
					label: $_('product.edit.sections.languages', { default: 'Languages' }),
					icon: IconMdiTranslate
				},
				{
					id: 'images',
					label: $_('product.edit.sections.images', { default: 'Images' }),
					icon: IconMdiImageMultiple
				},
				{
					id: 'basic-info',
					label: $_('product.edit.sections.basic_info', { default: 'Basic Info' }),
					icon: IconMdiInformation
				},
				{
					id: 'origin-traceability',
					label: $_('product.edit.sections.origin_traceability', {
						default: 'Traceability & Origins'
					}),
					icon: IconMdiEarth
				},
				{
					id: 'ingredients',
					label: $_('product.edit.sections.ingredients', { default: 'Ingredients' }),
					icon: IconMdiFormatListBulleted
				},
				{
					id: 'nutrition',
					label: $_('product.edit.sections.nutrition', { default: 'Nutrition' }),
					icon: IconMdiNutrition
				},
				{
					id: 'prices',
					label: $_('product.edit.sections.prices', { default: 'Prices' }),
					icon: IconMdiTagMultiple
				},
				{
					id: 'packaging',
					label: $_('product.edit.sections.packaging', { default: 'Packaging' }),
					icon: IconMdiPackageVariant
				},
				{
					id: 'comment',
					label: $_('product.edit.sections.comment', { default: 'Comment' }),
					icon: IconMdiCommentText
				},
				permissions.isModerator &&
					$preferences.moderator && {
						id: 'moderator-tools',
						label: $_('product.edit.sections.moderator_tools', { default: 'Moderator Tools' }),
						icon: IconMdiShieldAccount,
						style: 'warning' as const
					}
			];
			return rawList.filter((item): item is SidebarSection => !!item);
		}

		return [];
	});

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

	export function handleCollapseToggle(id: string) {
		ignoreObserver = true;
		clearTimeout(observerTimeout);
		observerTimeout = setTimeout(() => {
			ignoreObserver = false;
		}, 1000);

		activeSection = id;
	}

	export function scrollToSection(id: string, onBeforeScroll?: () => void) {
		const el = document.getElementById(id);
		if (el) {
			ignoreObserver = true;
			clearTimeout(observerTimeout);
			observerTimeout = setTimeout(() => {
				ignoreObserver = false;
			}, 1000);

			if (onBeforeScroll) {
				onBeforeScroll();
			}

			const scrollHeaderOffset = type === 'edit' ? 100 : 120;
			const elementPosition = el.getBoundingClientRect().top + window.scrollY;
			const offsetPosition = elementPosition - scrollHeaderOffset;

			window.scrollTo({
				top: offsetPosition,
				behavior: 'smooth'
			});

			activeSection = id;
		}
	}

	function handleSectionClick(id: string) {
		if (onSectionClick) {
			onSectionClick(id);
		} else if (type === 'edit') {
			scrollToSection(id, () => {
				const el = document.getElementById(id);
				if (el) {
					const checkbox = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
					if (activeSection === id) {
						if (checkbox) {
							checkbox.checked = !checkbox.checked;
							checkbox.dispatchEvent(new Event('change'));
						}
					} else {
						if (checkbox && !checkbox.checked) {
							checkbox.checked = true;
							checkbox.dispatchEvent(new Event('change'));
						}
					}
				}
			});
		} else {
			scrollToSection(id);
		}
	}

	function updateActiveSection() {
		if (ignoreObserver) return;

		let currentSection = sections[0]?.id || '';
		let isPreviousCollapsed = false;

		const isAtBottom =
			window.scrollY > 0 &&
			window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;

		if (isAtBottom) {
			currentSection = sections[sections.length - 1]?.id || '';
		} else {
			const scrollHeaderOffset = type === 'edit' ? 100 : 120;
			for (let i = 0; i < sections.length; i++) {
				const section = sections[i];
				const el = document.getElementById(section.id);
				if (el) {
					const rect = el.getBoundingClientRect();

					const threshold = i > 0 && isPreviousCollapsed ? 60 : scrollHeaderOffset;

					if (rect.top <= threshold) {
						currentSection = section.id;
					} else {
						break;
					}

					const checkbox = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
					isPreviousCollapsed = checkbox ? !checkbox.checked : false;
				}
			}
		}

		if (currentSection && activeSection !== currentSection) {
			activeSection = currentSection;
		}
	}

	onMount(() => {
		if (!activeSection && sections.length > 0) {
			activeSection = sections[0].id;
		}

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

<div
	class={[
		'hidden lg:block h-full',
		hidden ? 'lg:hidden' : '',
		type === 'product' ? 'lg:pt-28' : ''
	]}
>
	<aside class="sticky top-24 w-50 max-h-[calc(100vh-140px)] overflow-y-auto pr-2">
		<div class="flex items-center justify-end mb-4 px-1">
			{#if type === 'product'}
				<button
					type="button"
					onclick={() => (hidden = true)}
					class="text-xs text-primary/70 hover:text-primary transition-colors cursor-pointer select-none underline font-medium flex items-center gap-1"
				>
					{$_('product.sidebar.hide', { default: 'Hide Sidebar' })}
				</button>
			{:else if type === 'edit'}
				<button
					type="button"
					onclick={() => {
						handleCollapseToggle(sections[0]?.id || '');
						$preferences.editing.expandAllSections = !$preferences.editing.expandAllSections;
						const checkboxes = sections
							.map((sec) => {
								const el = document.getElementById(sec.id);
								return el ? el.querySelector('.collapse-arrow > input[type="checkbox"]') : null;
							})
							.filter(Boolean) as HTMLInputElement[];

						checkboxes.forEach((cb) => {
							cb.checked = $preferences.editing.expandAllSections;
							cb.dispatchEvent(new Event('change'));
						});
					}}
					class="text-xs text-primary/70 hover:text-primary transition-colors cursor-pointer select-none underline font-medium"
				>
					{$preferences.editing.expandAllSections
						? $_('product.edit.sidebar.collapse_all', { default: 'Collapse All' })
						: $_('product.edit.sidebar.expand_all', { default: 'Expand All' })}
				</button>
			{/if}
		</div>
		<nav
			bind:this={navElement}
			aria-label={$_('product.sidebar_navigation', { default: 'Product sections' })}
			class="relative border-l-2 border-base-300 flex flex-col gap-1 pl-4 text-sm"
		>
			<!-- Active indicator line with smooth sliding transition -->
			{#if indicatorHeight > 0}
				<div
					aria-hidden="true"
					class={[
						'absolute -left-0.5 w-0.5 rounded-full transition-all duration-300 ease-in-out',
						sections.find((s) => s.id === activeSection)?.style === 'warning'
							? 'bg-warning'
							: 'bg-primary'
					]}
					style="top: {indicatorTop}px; height: {indicatorHeight}px;"
				></div>
			{/if}

			{#each sections as section (section.id)}
				{@const IconComponent = section.icon}
				<button
					type="button"
					data-section={section.id}
					aria-controls={section.id}
					aria-current={activeSection === section.id ? 'true' : 'false'}
					onclick={() => handleSectionClick(section.id)}
					class={[
						'group flex items-center py-2 text-left relative transition-all duration-200 outline-none select-none cursor-pointer',
						activeSection === section.id
							? section.style === 'warning'
								? 'text-warning font-semibold'
								: 'text-primary font-semibold'
							: section.style === 'warning'
								? 'text-warning/70 hover:text-warning'
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

{#if type === 'product' && hidden}
	<button
		type="button"
		onclick={() => (hidden = false)}
		class="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 h-24 w-5 items-center justify-center rounded-r-xl border border-l-0 border-base-300 bg-base-200 text-base-content/70 shadow-md hover:w-7 hover:bg-primary hover:text-primary-content hover:border-primary transition-all duration-300 group cursor-pointer outline-none"
		title={$_('product.sidebar.show', { default: 'Show Sidebar' })}
	>
		<IconMdiChevronRight class="w-4 h-4 transition-transform duration-200 group-hover:scale-125" />
	</button>
{/if}
