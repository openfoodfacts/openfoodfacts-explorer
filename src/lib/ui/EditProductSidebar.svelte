<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import { _ } from '$lib/i18n';
	import { preferences } from '$lib/settings';
	import { getPermissionsCtx } from '$lib/stores/user';

	import IconMdiTranslate from '@iconify-svelte/mdi/translate';
	import IconMdiImageMultiple from '@iconify-svelte/mdi/image-multiple';
	import IconMdiInformation from '@iconify-svelte/mdi/information';
	import IconMdiFormatListBulleted from '@iconify-svelte/mdi/format-list-bulleted';
	import IconMdiNutrition from '@iconify-svelte/mdi/nutrition';
	import IconMdiTagMultiple from '@iconify-svelte/mdi/tag-multiple';
	import IconMdiPackageVariant from '@iconify-svelte/mdi/package-variant';
	import IconMdiCommentText from '@iconify-svelte/mdi/comment-text';
	import IconMdiShieldAccount from '@iconify-svelte/mdi/shield-account';

	const icons = {
		languages: IconMdiTranslate,
		images: IconMdiImageMultiple,
		'basic-info': IconMdiInformation,
		ingredients: IconMdiFormatListBulleted,
		nutrition: IconMdiNutrition,
		prices: IconMdiTagMultiple,
		packaging: IconMdiPackageVariant,
		comment: IconMdiCommentText,
		'moderator-tools': IconMdiShieldAccount
	} as const;

	const permissions = getPermissionsCtx();

	let activeSection = $state('languages');
	let navElement = $state<HTMLElement>();
	let indicatorTop = $state(0);
	let indicatorHeight = $state(0);

	$effect(() => {
		if (activeSection && navElement) {
			const activeBtn = navElement.querySelector(
				`[data-section="${activeSection}"]`
			) as HTMLElement;
			if (activeBtn) {
				indicatorTop = activeBtn.offsetTop;
				indicatorHeight = activeBtn.offsetHeight;
			}
		}
	});

	interface SidebarSection {
		id: string;
		label: string;
		icon?: Component;
	}

	interface Props {
		sections?: SidebarSection[];
	}

	let { sections }: Props = $props();

	const defaultSections = $derived.by(() => {
		const list: SidebarSection[] = [
			{ id: 'languages', label: $_('product.edit.sections.languages', { default: 'Languages' }) },
			{ id: 'images', label: $_('product.edit.sections.images', { default: 'Images' }) },
			{
				id: 'basic-info',
				label: $_('product.edit.sections.basic_info', { default: 'Basic Info' })
			},
			{
				id: 'ingredients',
				label: $_('product.edit.sections.ingredients', { default: 'Ingredients' })
			},
			{ id: 'nutrition', label: $_('product.edit.sections.nutrition', { default: 'Nutrition' }) },
			{ id: 'prices', label: $_('product.edit.sections.prices', { default: 'Prices' }) },
			{ id: 'packaging', label: $_('product.edit.sections.packaging', { default: 'Packaging' }) },
			{ id: 'comment', label: $_('product.edit.sections.comment', { default: 'Comment' }) }
		];

		if (permissions.isModerator && $preferences.moderator) {
			list.push({
				id: 'moderator-tools',
				label: $_('product.edit.sections.moderator_tools', { default: 'Moderator Tools' })
			});
		}

		return list;
	});

	const sidebarSections = $derived.by(() => {
		const baseList: SidebarSection[] = sections || defaultSections;
		return baseList.map((item) => ({
			...item,
			icon: item.icon || icons[item.id as keyof typeof icons]
		}));
	});

	let ignoreObserver = false;
	let observerTimeout: ReturnType<typeof setTimeout>;

	function scrollToSection(id: string) {
		const el = document.getElementById(id);
		if (el) {
			const checkbox = el.querySelector('input[type="checkbox"]') as HTMLInputElement;

			// Lock scroll observer during manual selection & animations
			ignoreObserver = true;
			clearTimeout(observerTimeout);
			observerTimeout = setTimeout(() => {
				ignoreObserver = false;
			}, 1000);

			// If already active, toggle collapse state
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

			// Scroll and ensure active
			const headerOffset = 100;
			const elementPosition = el.getBoundingClientRect().top + window.scrollY;
			const offsetPosition = elementPosition - headerOffset;

			window.scrollTo({
				top: offsetPosition,
				behavior: 'smooth'
			});

			activeSection = id;
		}
	}

	function toggleAllSections() {
		// Lock sidebar during global toggle
		ignoreObserver = true;
		clearTimeout(observerTimeout);
		observerTimeout = setTimeout(() => {
			ignoreObserver = false;
		}, 1000);

		$preferences.editing.expandAllSections = !$preferences.editing.expandAllSections;
		const checkboxes = sidebarSections
			.map((section) => {
				const el = document.getElementById(section.id);
				return el ? el.querySelector('.collapse-arrow > input[type="checkbox"]') : null;
			})
			.filter(Boolean) as HTMLInputElement[];

		checkboxes.forEach((cb) => {
			cb.checked = $preferences.editing.expandAllSections;
			cb.dispatchEvent(new Event('change'));
		});
	}

	export function handleCollapseToggle(id: string) {
		// Lock sidebar during collapse transition
		ignoreObserver = true;
		clearTimeout(observerTimeout);
		observerTimeout = setTimeout(() => {
			ignoreObserver = false;
		}, 1000);

		activeSection = id;
	}

	function updateActiveSection() {
		if (ignoreObserver) return;

		let currentSection = sidebarSections[0]?.id || '';
		let isPreviousCollapsed = false;

		const isAtBottom =
			window.scrollY > 0 &&
			window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;

		if (isAtBottom) {
			currentSection = sidebarSections[sidebarSections.length - 1]?.id || '';
		} else {
			for (let i = 0; i < sidebarSections.length; i++) {
				const section = sidebarSections[i];
				const el = document.getElementById(section.id);
				if (el) {
					const rect = el.getBoundingClientRect();

					const threshold = i > 0 && isPreviousCollapsed ? 60 : 120;

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

		const timer = setTimeout(() => {
			updateActiveSection();
		}, 300);

		return () => {
			clearTimeout(timer);
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<div class="hidden lg:block 2xl:absolute 2xl:right-full 2xl:mr-8 2xl:top-0 2xl:h-full">
	<aside class="sticky top-24 w-60 max-h-[calc(100vh-140px)] overflow-y-auto pr-2">
		<div class="flex items-center justify-end mb-4 px-1">
			<button
				type="button"
				onclick={toggleAllSections}
				class="text-xs text-primary/70 hover:text-primary transition-colors cursor-pointer select-none underline font-medium"
			>
				{$preferences.editing.expandAllSections
					? $_('product.edit.sidebar.collapse_all', { default: 'Collapse All' })
					: $_('product.edit.sidebar.expand_all', { default: 'Expand All' })}
			</button>
		</div>
		<nav
			bind:this={navElement}
			aria-label={$_('product.edit.sidebar_navigation', { default: 'Product edit sections' })}
			class="relative border-l-2 border-base-300 flex flex-col gap-1 pl-4 text-sm"
		>
			<!-- Active indicator line with smooth sliding transition -->
			{#if indicatorHeight > 0}
				<div
					aria-hidden="true"
					class="absolute -left-0.5 w-0.5 bg-primary rounded-full transition-all duration-300 ease-in-out"
					style="top: {indicatorTop}px; height: {indicatorHeight}px;"
				></div>
			{/if}
			{#each sidebarSections as section (section.id)}
				{@const IconComponent = section.icon}
				<button
					type="button"
					data-section={section.id}
					aria-controls={section.id}
					aria-current={activeSection === section.id ? 'true' : 'false'}
					onclick={() => scrollToSection(section.id)}
					class="group flex items-center py-2 text-left relative transition-all duration-200 outline-none select-none hover:text-primary cursor-pointer {activeSection ===
					section.id
						? 'text-primary font-semibold'
						: 'text-base-content/60'}"
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
