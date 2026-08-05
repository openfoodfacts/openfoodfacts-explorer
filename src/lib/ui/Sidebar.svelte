<script lang="ts">
	import { onMount } from 'svelte';
	import type { Component, ComponentType } from 'svelte';
	import { _ } from '$lib/i18n';
	import IconMdiChevronRight from '@iconify-svelte/mdi/chevron-right';

	export interface SidebarSection {
		id: string;
		label: string;
		icon?: Component | ComponentType;
		style?: 'warning' | 'primary';
		isCollapsed?: () => boolean;
		onToggle?: (open?: boolean) => void;
	}

	type Props = {
		sections: SidebarSection[];
		activeSection?: string;
		scrollHeaderOffset?: number;
		hidden?: boolean;
		headerActionLabel?: string;
		onHeaderAction?: () => void;
		onSectionClick?: (id: string) => void;
		type?: 'product' | 'edit';
	};

	let {
		sections,
		activeSection = $bindable(''),
		scrollHeaderOffset = 120,
		hidden = $bindable(false),
		headerActionLabel,
		onHeaderAction,
		onSectionClick,
		type = 'product'
	}: Props = $props();

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

	function suppressObserver(duration = 1000) {
		ignoreObserver = true;
		clearTimeout(observerTimeout);
		observerTimeout = setTimeout(() => {
			ignoreObserver = false;
		}, duration);
	}

	export function handleCollapseToggle(id: string) {
		suppressObserver();
		activeSection = id;
	}

	export function scrollToSection(id: string, onBeforeScroll?: () => void) {
		const el = document.getElementById(id);
		if (el) {
			suppressObserver();

			if (onBeforeScroll) {
				onBeforeScroll();
			}

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
			for (let i = 0; i < sections.length; i++) {
				const section = sections[i];
				const el = document.getElementById(section.id);
				if (!el) {
					continue;
				}

				const rect = el.getBoundingClientRect();
				const threshold = i > 0 && isPreviousCollapsed ? 60 : scrollHeaderOffset;

				if (rect.top <= threshold) {
					currentSection = section.id;
				} else {
					break;
				}

				isPreviousCollapsed = section.isCollapsed ? section.isCollapsed() : false;
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
		'hidden h-full lg:block',
		hidden ? 'lg:hidden' : '',
		type === 'product' ? 'lg:pt-28' : ''
	]}
>
	<aside class="sticky top-24 max-h-[calc(100vh-140px)] w-50 overflow-y-auto pr-2">
		{#if headerActionLabel && onHeaderAction}
			<div class="mb-4 flex items-center justify-end px-1">
				<button
					type="button"
					onclick={onHeaderAction}
					class="cursor-pointer text-xs font-medium text-primary/70 underline transition-colors select-none hover:text-primary"
				>
					{headerActionLabel}
				</button>
			</div>
		{/if}
		<nav
			bind:this={navElement}
			aria-label={$_('product.sidebar_navigation', { default: 'Product sections' })}
			class="relative flex flex-col gap-1 border-l-2 border-base-300 pl-4 text-sm"
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
				<button
					type="button"
					data-section={section.id}
					aria-controls={section.id}
					aria-current={activeSection === section.id ? 'true' : 'false'}
					onclick={() => handleSectionClick(section.id)}
					class={[
						'group relative flex cursor-pointer items-center py-2 text-left transition-all duration-200 outline-none select-none',
						activeSection === section.id
							? section.style === 'warning'
								? 'font-semibold text-warning'
								: 'font-semibold text-primary'
							: section.style === 'warning'
								? 'text-warning/70 hover:text-warning'
								: 'text-base-content/60 hover:text-primary'
					]}
				>
					{#if section.icon}
						{@const Icon = section.icon}
						<Icon class="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
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
		class="group fixed top-1/2 left-0 z-50 hidden h-24 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-r-xl border border-l-0 border-base-300 bg-base-200 text-base-content/70 shadow-md transition-all duration-300 outline-none hover:w-7 hover:border-primary hover:bg-primary hover:text-primary-content lg:flex"
		title={$_('product.sidebar.show', { default: 'Show Sidebar' })}
	>
		<IconMdiChevronRight class="h-4 w-4 transition-transform duration-200 group-hover:scale-125" />
	</button>
{/if}
