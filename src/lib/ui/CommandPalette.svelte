<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { _ } from '$lib/i18n';
	import { commandPaletteOpen } from '$lib/stores/commandPalette';
	import { SvelteMap } from 'svelte/reactivity';
	import {
		addKeyboardListener,
		initKeyboardListeners,
		matchesShortcut,
		removeKeyboardListener
	} from '$lib/keyboard';
	import { searchCommands } from '$lib/commands';
	import { getCommandCtx } from '$lib/stores/commandPalette';
	import type { Command, CommandCategory } from '$lib/commands/types';

	let query = $state('');
	let selectedIndex = $state(0);
	let isExecuting = $state(false);
	let mode = $state<'commands' | 'sub-input'>('commands');
	let subInputValue = $state('');
	let activeSubInputCommand: Command | null = $state(null);
	let searchInput: HTMLInputElement | null = $state(null);
	let subInput: HTMLInputElement | null = $state(null);
	let panelEl: HTMLDivElement | null = $state(null);
	let previousFocusedElement: HTMLElement | null = $state(null);

	const commandCtx = getCommandCtx();
	let allCommands = $derived.by(() => commandCtx.getCommands());
	let filteredCommands = $derived.by(() => searchCommands(allCommands, query));
	let groupedCommands = $derived.by(() => {
		const groups = new SvelteMap<CommandCategory, Command[]>();
		for (const command of filteredCommands) {
			const bucket = groups.get(command.category);
			if (bucket) {
				bucket.push(command);
			} else {
				groups.set(command.category, [command]);
			}
		}
		return groups;
	});

	let commandIndexMap = $derived.by(() => {
		const map = new SvelteMap<string, number>();
		filteredCommands.forEach((command, index) => map.set(command.id, index));
		return map;
	});

	function resetPalette() {
		query = '';
		selectedIndex = 0;
		mode = 'commands';
		subInputValue = '';
		activeSubInputCommand = null;
	}

	function scrollSelectedIntoView() {
		if (!browser) return;
		requestAnimationFrame(() => {
			document.getElementById(`cmd-item-${selectedIndex}`)?.scrollIntoView({ block: 'nearest' });
		});
	}

	async function executeCommand(command: Command | undefined) {
		if (!command || isExecuting) return;
		if (command.requiresInput) {
			mode = 'sub-input';
			activeSubInputCommand = command;
			subInputValue = '';
			requestAnimationFrame(() => subInput?.focus());
			return;
		}
		isExecuting = true;
		try {
			await command.action();
		} finally {
			isExecuting = false;
			commandPaletteOpen.set(false);
		}
	}

	async function executeSubInput() {
		if (!activeSubInputCommand || isExecuting) return;
		const value = subInputValue.trim();
		if (!value) return;
		isExecuting = true;
		try {
			await activeSubInputCommand.action(value);
		} finally {
			isExecuting = false;
			commandPaletteOpen.set(false);
		}
	}

	function handleInputKeydown(e: KeyboardEvent) {
		const total = filteredCommands.length;

		if (e.key === 'ArrowDown') {
			if (total === 0) return;
			e.preventDefault();
			selectedIndex = (selectedIndex + 1) % total;
			scrollSelectedIntoView();
			return;
		}

		if (e.key === 'ArrowUp') {
			if (total === 0) return;
			e.preventDefault();
			selectedIndex = (selectedIndex - 1 + total) % total;
			scrollSelectedIntoView();
			return;
		}

		if (e.key === 'Home') {
			if (total === 0) return;
			e.preventDefault();
			selectedIndex = 0;
			scrollSelectedIntoView();
			return;
		}

		if (e.key === 'End') {
			if (total === 0) return;
			e.preventDefault();
			selectedIndex = total - 1;
			scrollSelectedIntoView();
			return;
		}

		if (e.key === 'Enter') {
			if (total === 0) return;
			e.preventDefault();
			void executeCommand(filteredCommands[selectedIndex]);
			return;
		}

		if (e.key === 'Escape') {
			e.preventDefault();
			commandPaletteOpen.set(false);
		}
	}

	function handleSubInputKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			void executeSubInput();
			return;
		}

		if (e.key === 'Escape') {
			e.preventDefault();
			mode = 'commands';
			activeSubInputCommand = null;
			subInputValue = '';
			requestAnimationFrame(() => searchInput?.focus());
		}
	}

	function handlePanelKeydown(e: KeyboardEvent) {
		if (!browser) return;
		if (e.key !== 'Tab' || !panelEl) return;
		const focusable = Array.from(
			panelEl.querySelectorAll<HTMLElement>('input, button, [tabindex]:not([tabindex="-1"])')
		).filter((el) => !el.hasAttribute('disabled'));
		if (focusable.length === 0) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (e.shiftKey) {
			if (document.activeElement === first) {
				e.preventDefault();
				last.focus();
			}
		} else {
			if (document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	$effect(() => {
		if (!browser) return;

		if ($commandPaletteOpen) {
			if (document.activeElement instanceof HTMLElement) {
				previousFocusedElement = document.activeElement;
			}
			resetPalette();
			requestAnimationFrame(() => searchInput?.focus());
		} else {
			if (previousFocusedElement?.isConnected) {
				previousFocusedElement.focus();
			}
			previousFocusedElement = null;
		}
	});

	$effect(() => {
		const _ = filteredCommands;
		if ($commandPaletteOpen && mode === 'commands') {
			selectedIndex = 0;
		}
	});

	$effect(() => {
		if (!browser || !$commandPaletteOpen) return;
		if (mode === 'sub-input') {
			requestAnimationFrame(() => subInput?.focus());
		}
	});

	$effect(() => {
		if (!browser || !$commandPaletteOpen) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previous;
		};
	});

	onMount(() => {
		initKeyboardListeners();

		const handler = (e: KeyboardEvent) => {
			if (e.repeat) return;
			const isCtrlK = matchesShortcut(e, ['ctrl', 'k']);
			const isCmdK = matchesShortcut(e, ['meta', 'k']);
			if (isCtrlK || isCmdK) {
				e.preventDefault();
				e.stopPropagation();
				commandPaletteOpen.update((open) => !open);
			}
		};

		addKeyboardListener(handler);

		return () => {
			removeKeyboardListener(handler);
		};
	});
</script>

{#if $commandPaletteOpen}
	<div
		class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
		aria-hidden="true"
		onclick={() => commandPaletteOpen.set(false)}
	></div>

	<div
		bind:this={panelEl}
		class="border-base-300 bg-base-100 fixed top-[10vh] left-1/2 z-50 w-[calc(100%-1rem)] max-w-lg -translate-x-1/2 rounded-2xl border shadow-xl outline-none"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		aria-label={$_('command_palette', { default: 'Command palette' })}
		onclick={(e) => e.stopPropagation()}
		onkeydown={handlePanelKeydown}
	>
		<div class="border-base-200 flex items-center gap-3 border-b px-4 py-3">
			<svg
				class="text-base-content/60 h-4 w-4"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<circle cx="11" cy="11" r="8" />
				<path d="m21 21-4.3-4.3" />
			</svg>
			<input
				class="text-base-content placeholder:text-base-content/50 w-full bg-transparent text-sm focus:outline-none"
				bind:this={searchInput}
				bind:value={query}
				onkeydown={handleInputKeydown}
				role="combobox"
				aria-expanded={filteredCommands.length > 0}
				aria-controls="cmd-listbox"
				aria-activedescendant={filteredCommands.length > 0
					? `cmd-item-${selectedIndex}`
					: undefined}
				autocomplete="off"
				spellcheck={false}
				placeholder={$_('command_palette.placeholder', { default: 'Type a command' })}
			/>
			<span
				class="border-base-300 bg-base-200 text-base-content/70 rounded border px-2 py-0.5 text-xs"
			>
				Esc
			</span>
		</div>

		{#if mode === 'commands'}
			<div id="cmd-listbox" role="listbox" class="max-h-80 overflow-y-auto py-2">
				{#if filteredCommands.length === 0}
					<div class="text-base-content/70 px-4 py-6 text-sm">
						No commands match "{query}".
					</div>
				{:else}
					{#each Array.from(groupedCommands) as [category, commands] (category)}
						<div
							class="text-base-content/50 px-4 pt-3 pb-1 text-xs tracking-wider uppercase"
							aria-hidden="true"
						>
							{category}
						</div>
						{#each commands as command (command.id)}
							{@const flatIndex = commandIndexMap.get(command.id) ?? 0}
							<div
								id={`cmd-item-${flatIndex}`}
								role="option"
								aria-selected={flatIndex === selectedIndex}
								tabindex="0"
								class={`mx-2 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition ${
									flatIndex === selectedIndex ? 'bg-base-200' : 'hover:bg-base-200/70'
								}`}
								onclick={(e) => {
									e.preventDefault();
									void executeCommand(command);
								}}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										void executeCommand(command);
									}
								}}
								onmouseenter={() => {
									selectedIndex = flatIndex;
								}}
							>
								<div class="min-w-0">
									<div class="text-base-content text-sm font-medium">
										{command.title}
									</div>
									<div class="text-base-content/60 text-xs">{command.description}</div>
								</div>
								{#if command.requiresInput}
									<span
										class="text-base-content/50 ml-4 text-[10px] font-semibold tracking-wide uppercase"
									>
										Enter to type
									</span>
								{:else if command.shortcut?.length}
									<div class="ml-4 flex gap-1">
										{#each command.shortcut as key (key)}
											<kbd
												class="border-base-300 bg-base-200 text-base-content/70 rounded border px-1.5 py-0.5 text-[10px] font-semibold"
											>
												{key}
											</kbd>
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					{/each}
				{/if}
			</div>
		{:else}
			<div class="px-4 py-4">
				<div class="text-base-content/50 text-xs tracking-wider uppercase">
					{activeSubInputCommand?.title}
				</div>
				<input
					class="border-base-300 bg-base-100 text-base-content placeholder:text-base-content/50 mt-2 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
					bind:this={subInput}
					bind:value={subInputValue}
					onkeydown={handleSubInputKeydown}
					placeholder={activeSubInputCommand?.inputPlaceholder ?? 'Type and press Enter...'}
					autocomplete="off"
					spellcheck={false}
				/>
				<div class="text-base-content/60 mt-2 text-xs">Enter to confirm · Esc to go back</div>
			</div>
		{/if}

		<div
			class="border-base-200 text-base-content/60 flex items-center justify-between border-t px-4 py-2 text-xs"
		>
			{#if mode === 'commands'}
				<div class="flex gap-3">
					<span>Up/Down navigate</span>
					<span>Enter select</span>
					<span>Esc close</span>
				</div>
			{:else}
				<div class="flex gap-3">
					<span>Enter confirm</span>
					<span>Esc go back</span>
				</div>
			{/if}
			{#if isExecuting}
				<span class="text-base-content/70 animate-pulse">Running...</span>
			{/if}
		</div>
	</div>
{/if}
