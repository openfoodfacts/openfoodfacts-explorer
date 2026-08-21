<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Component, ComponentType, Snippet } from 'svelte';
	import { _ } from '$lib/i18n';
	import IconMdiChevronRight from '@iconify-svelte/mdi/chevron-right';

	export interface SidebarSectionBase {
		id: string;
		label: string;
		icon?: Component | ComponentType;
		style?: 'warning' | 'primary';
		isCollapsed?: () => boolean;
		onToggle?: (open?: boolean) => void;
	}

	type SidebarSectionAction =
		| {
				href: string;
				onClick?: never;
		  }
		| {
				href?: never;
				onClick: () => void;
		  };

	export type SidebarSection = SidebarSectionBase & SidebarSectionAction;

	type Props = {
		sections?: SidebarSection[];
		activeSection?: string;
		scrollHeaderOffset?: number;
		hidden?: boolean;
		headerActionLabel?: string;
		onHeaderAction?: () => void;
		type?: 'product' | 'edit' | 'search';
		title?: string;
		header?: Snippet;
		children?: Snippet;
	};

	let {
		sections = [],
		activeSection = $bindable(''),
		scrollHeaderOffset = 120,
		hidden = $bindable(false),
		headerActionLabel,
		onHeaderAction,
		type = 'product',
		title,
		header,
		children
	}: Props = $props();

	let navElement = $state<HTMLElement>();
	let indicatorTop = $state(0);
	let indicatorHeight = $state(0);

	function updateIndicator() {
		if (!navElement || !activeSection) {
			indicatorTop = 0;
			indicatorHeight = 0;
			return;
		}

		const activeBtn = Array.from(navElement.querySelectorAll<HTMLElement>('[data-section]')).find(
			(button) => button.dataset.section === activeSection
		);

		if (!activeBtn) {
			indicatorTop = 0;
			indicatorHeight = 0;
			return;
		}

		indicatorTop = activeBtn.offsetTop;
		indicatorHeight = activeBtn.offsetHeight;
	}

	$effect(() => {
		const sectionIds = sections.map((section) => section.id);
		const nextActiveSection = sectionIds.includes(activeSection)
			? activeSection
			: (sectionIds[0] ?? '');

		if (activeSection !== nextActiveSection) {
			activeSection = nextActiveSection;
		}

		if (navElement) {
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

	function handleSectionClick(section: SidebarSection) {
		if (section.onClick) {
			section.onClick();
		} else {
			scrollToSection(section.id);
		}
	}

	function getSectionClass(section: SidebarSection) {
		return [
			'group relative flex cursor-pointer items-center py-2 text-left transition-all duration-200 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
			activeSection === section.id
				? section.style === 'warning'
					? 'font-semibold text-warning'
					: 'font-semibold text-primary'
				: section.style === 'warning'
					? 'text-warning/70 hover:text-warning'
					: 'text-base-content/60 hover:text-primary'
		];
	}

	async function handleAnchorClick(
		event: MouseEvent,
		section: Extract<SidebarSection, { href: string }>
	) {
		if (
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey ||
			!section.href.startsWith('#')
		) {
			return;
		}

		const targetId = decodeURIComponent(section.href.slice(1));
		if (!document.getElementById(targetId)) return;

		event.preventDefault();
		await goto(section.href, { noScroll: true });
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
				const isCollapsed = section.isCollapsed ? section.isCollapsed() : false;
				if (!el) {
					isPreviousCollapsed = isCollapsed;
					continue;
				}

				const rect = el.getBoundingClientRect();
				const threshold = i > 0 && isPreviousCollapsed ? 60 : scrollHeaderOffset;

				if (rect.top <= threshold) {
					currentSection = section.id;
				} else {
					break;
				}

				isPreviousCollapsed = isCollapsed;
			}
		}

		if (currentSection && activeSection !== currentSection) {
			activeSection = currentSection;
		}
	}

	onMount(() => {
		let ticking = false;
		const resizeObserver = new ResizeObserver(updateIndicator);
		if (navElement) {
			resizeObserver.observe(navElement);
		}

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
			clearTimeout(observerTimeout);
			resizeObserver.disconnect();
			window.removeEventListener('scroll', handleScroll);
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
	<aside class="sticky top-24 flex max-h-[calc(100vh-140px)] w-50 flex-col pr-2 xl:w-60">
		{#if header}
			<div class="mb-3 shrink-0 px-1">
				{@render header()}
			</div>
		{:else if (headerActionLabel && onHeaderAction) || title}
			<div class="mb-4 flex shrink-0 items-center justify-between px-1">
				{#if title}
					<span class="text-xs font-bold tracking-wider text-base-content/70 uppercase">
						{title}
					</span>
				{:else}
					<div></div>
				{/if}
				{#if headerActionLabel && onHeaderAction}
					<button
						type="button"
						onclick={onHeaderAction}
						class="cursor-pointer text-xs font-medium text-primary/70 underline transition-colors select-none hover:text-primary"
					>
						{headerActionLabel}
					</button>
				{/if}
			</div>
		{/if}
		<nav
			bind:this={navElement}
			aria-label={type === 'edit'
				? $_('product.edit.sidebar_navigation', { default: 'Product edit sections' })
				: type === 'search'
					? $_('search.filters_sidebar_title', { default: 'Search filters' })
					: $_('product.sidebar_navigation', { default: 'Product sections' })}
			class="relative flex flex-1 [scrollbar-width:none] flex-col gap-1 overflow-y-auto border-l-2 border-base-300 pl-3 text-sm [&::-webkit-scrollbar]:hidden"
		>
			{#if children}
				{@render children()}
			{:else}
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
					{#if section.href}
						<a
							href={section.href}
							onclick={(event) => handleAnchorClick(event, section)}
							data-section={section.id}
							aria-controls={section.id}
							aria-current={activeSection === section.id ? 'location' : undefined}
							class={getSectionClass(section)}
						>
							{#if section.icon}
								{@const Icon = section.icon}
								<Icon
									aria-hidden="true"
									class="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110"
								/>
							{/if}
							<span>{section.label}</span>
						</a>
					{:else}
						<button
							type="button"
							data-section={section.id}
							aria-controls={section.id}
							aria-current={activeSection === section.id ? 'location' : undefined}
							onclick={() => handleSectionClick(section)}
							class={getSectionClass(section)}
						>
							{#if section.icon}
								{@const Icon = section.icon}
								<Icon
									aria-hidden="true"
									class="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110"
								/>
							{/if}
							<span>{section.label}</span>
						</button>
					{/if}
				{/each}
			{/if}
		</nav>
	</aside>
</div>

{#if (type === 'product' || type === 'search') && hidden}
	<button
		type="button"
		onclick={() => (hidden = false)}
		class="group fixed top-1/2 left-0 z-50 hidden h-24 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-r-xl border border-l-0 border-base-300 bg-base-200 text-base-content/70 shadow-md transition-all duration-300 outline-none hover:w-7 hover:border-primary hover:bg-primary hover:text-primary-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:flex"
		title={$_('product.sidebar.show', { default: 'Show Sidebar' })}
		aria-label={$_('product.sidebar.show', { default: 'Show Sidebar' })}
	>
		<IconMdiChevronRight
			aria-hidden="true"
			class="h-4 w-4 transition-transform duration-200 group-hover:scale-125"
		/>
	</button>
{/if}
