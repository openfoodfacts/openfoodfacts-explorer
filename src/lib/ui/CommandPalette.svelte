<script lang="ts">
	import { tick } from 'svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { Dialog } from 'bits-ui';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiCog from '@iconify-svelte/mdi/cog';
	import IconMdiHome from '@iconify-svelte/mdi/home';
	import IconMdiKeyboardReturn from '@iconify-svelte/mdi/keyboard-return';
	import IconMdiMagnify from '@iconify-svelte/mdi/magnify';
	import IconMdiRefresh from '@iconify-svelte/mdi/refresh';
	import IconMdiBarcode from '@iconify-svelte/mdi/barcode';
	import IconMdiPencil from '@iconify-svelte/mdi/pencil';
	import IconMdiShareVariant from '@iconify-svelte/mdi/share-variant';
	import IconMdiContentCopy from '@iconify-svelte/mdi/content-copy';
	import IconMdiTrashCanOutline from '@iconify-svelte/mdi/trash-can-outline';

	import {
		createCommandRegistry,
		searchCommands,
		type Command,
		type CommandCategory
	} from '$lib/commands/index';
	import {
		closeCommandPalette,
		commandPaletteOpen,
		openCommandPalette,
		toggleCommandPalette
	} from '$lib/stores/commandPalette';
	import { getToastCtx } from '$lib/stores/toasts';
	import { getProductContextFromRoute } from '$lib/utils/routes';

	let query = $state('');
	let selectedIndex = $state(0);
	let isExecuting = $state(false);
	let searchInput: HTMLInputElement;
	let previousFocusedElement: HTMLElement | null = null;

	const paletteTitleId = 'command-palette-title';
	const paletteDescriptionId = 'command-palette-description';
	const groupOrder: CommandCategory[] = ['Navigation', 'Product', 'Utility', 'Miscellaneous'];

	const toast = getToastCtx();
	const notify = {
		success: (message: string) => toast.success(message),
		error: (message: string) => toast.error(message),
		info: (message: string) => toast.info(message)
	};

	let productContext = $derived(getProductContextFromRoute(page));
	let commands = $derived(createCommandRegistry({ ...productContext, notify }));

	function getDefaultSuggestions() {
		return commands
			.filter((command) => command.contextual)
			.concat(commands.filter((command) => !command.contextual))
			.slice(0, 8);
	}

	function getFilteredCommands() {
		const trimmed = query.trim();
		if (trimmed === '') return getDefaultSuggestions();
		return searchCommands(commands, trimmed);
	}

	let filteredCommands = $derived(getFilteredCommands());
	let selectedCommand = $derived(filteredCommands[selectedIndex] ?? filteredCommands[0]);
	let groupedCommands = $derived(
		groupOrder
			.map((category) => ({
				category,
				commands: filteredCommands.filter(
					(command) => (command.category ?? 'Miscellaneous') === category
				)
			}))
			.filter((group) => group.commands.length > 0)
	);

	function isEditableTarget(target: EventTarget | null) {
		if (!(target instanceof HTMLElement)) return false;

		const tagName = target.tagName.toLowerCase();
		return (
			target.isContentEditable ||
			tagName === 'input' ||
			tagName === 'textarea' ||
			tagName === 'select'
		);
	}

	function isCommandPaletteShortcut(event: KeyboardEvent) {
		return (event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k';
	}

	function claimShortcut(event: KeyboardEvent) {
		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation();
	}

	function setOpen(open: boolean) {
		commandPaletteOpen.set(open);
	}

	function resetPalette() {
		query = '';
		selectedIndex = 0;
		isExecuting = false;
	}

	async function focusSearchInput() {
		await tick();
		searchInput?.focus();
	}

	$effect(() => {
		if ($commandPaletteOpen) {
			if (document.activeElement instanceof HTMLElement) {
				previousFocusedElement = document.activeElement;
			}
			resetPalette();
			focusSearchInput();
		} else {
			document.body.style.overflow = '';
			if (previousFocusedElement?.isConnected) {
				previousFocusedElement.focus();
			}
		}
	});

	$effect(() => {
		if (!$commandPaletteOpen) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});

	$effect(() => {
		const len = filteredCommands.length;
		if (len === 0) {
			selectedIndex = 0;
			return;
		}
		if (selectedIndex >= len) selectedIndex = len - 1;
		if (selectedIndex < 0) selectedIndex = 0;
	});

	onMount(() => {
		// Register global shortcuts once with component lifecycle cleanup.
		function handleGlobalKeydown(event: KeyboardEvent) {
			if (isCommandPaletteShortcut(event)) {
				claimShortcut(event);
				toggleCommandPalette();
				return;
			}

			if (event.key === '/' && !isEditableTarget(event.target)) {
				claimShortcut(event);
				openCommandPalette();
			}
		}

		document.addEventListener('keydown', handleGlobalKeydown, { capture: true });

		return () => {
			document.removeEventListener('keydown', handleGlobalKeydown, { capture: true });
		};
	});

	function moveSelection(direction: 1 | -1) {
		if (filteredCommands.length === 0) return;

		selectedIndex = (selectedIndex + direction + filteredCommands.length) % filteredCommands.length;
	}

	async function runCommand(command: Command | undefined) {
		if (!command || isExecuting) return;

		isExecuting = true;
		try {
			await command.action();
			closeCommandPalette();
			await tick();
			resetPalette();
		} catch (error) {
			console.error('Command failed:', error);
			notify.error('Command failed');
			isExecuting = false;
		}
	}

	function handleInputKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				moveSelection(1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				moveSelection(-1);
				break;
			case 'Home':
				event.preventDefault();
				selectedIndex = 0;
				break;
			case 'End':
				event.preventDefault();
				selectedIndex = Math.max(filteredCommands.length - 1, 0);
				break;
			case 'Enter':
				event.preventDefault();
				if (filteredCommands.length > 0 && selectedCommand) runCommand(selectedCommand);
				break;
			case 'Escape':
				event.preventDefault();
				closeCommandPalette();
				break;
		}
	}

	function getCommandIcon(commandId: string) {
		switch (commandId) {
			case 'go-home':
				return IconMdiHome;
			case 'go-to-settings':
				return IconMdiCog;
			case 'reload-page':
				return IconMdiRefresh;
			case 'open-product-by-barcode':
			case 'copy-barcode':
				return IconMdiBarcode;
			case 'edit-product':
				return IconMdiPencil;
			case 'share-product':
				return IconMdiShareVariant;
			case 'clear-cache':
				return IconMdiTrashCanOutline;
			case 'open-product-details':
				return IconMdiContentCopy;
			default:
				return IconMdiMagnify;
		}
	}
</script>

<Dialog.Root open={$commandPaletteOpen} onOpenChange={setOpen}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] transition-opacity" />
		<Dialog.Content
			class="bg-base-100 rounded-box border-base-300 fixed top-3 left-1/2 z-50 flex max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1rem)] max-w-2xl -translate-x-1/2 flex-col overflow-hidden border shadow-2xl outline-none sm:top-[12vh] sm:max-h-[76vh] sm:w-[calc(100vw-1.5rem)]"
			aria-labelledby={paletteTitleId}
			aria-describedby={paletteDescriptionId}
		>
			<div class="border-base-300 flex items-center gap-3 border-b px-4 py-3">
				<IconMdiMagnify class="text-base-content/70 h-5 w-5 shrink-0" aria-hidden="true" />
				<div class="min-w-0 flex-1">
					<Dialog.Title id={paletteTitleId} class="sr-only">Command palette</Dialog.Title>
					<Dialog.Description id={paletteDescriptionId} class="sr-only">
						Search commands, navigate pages, and run utility actions.
					</Dialog.Description>
					<input
						bind:this={searchInput}
						bind:value={query}
						type="text"
						class="placeholder:text-base-content/45 h-10 w-full bg-transparent text-base outline-none"
						placeholder="Search commands..."
						autocomplete="off"
						spellcheck="false"
						role="combobox"
						aria-autocomplete="list"
						aria-expanded={$commandPaletteOpen}
						aria-controls="command-palette-listbox"
						aria-activedescendant={selectedCommand
							? `command-palette-option-${selectedCommand.id}`
							: undefined}
						onkeydown={handleInputKeydown}
						oninput={() => {
							selectedIndex = 0;
						}}
					/>
				</div>
				<button
					type="button"
					class="btn btn-ghost btn-square btn-sm"
					aria-label="Close command palette"
					onclick={closeCommandPalette}
				>
					<IconMdiClose class="h-5 w-5" aria-hidden="true" />
				</button>
			</div>

			<div class="overflow-y-auto p-2">
				{#if filteredCommands.length === 0}
					<div class="px-3 py-8 text-center">
						<p class="text-base-content/80 text-sm font-medium">No commands found</p>
						<p class="text-base-content/55 mt-1 text-xs">
							Try searching for settings, search, barcode, or cache.
						</p>
					</div>
				{:else}
					<ul
						id="command-palette-listbox"
						role="listbox"
						aria-label="Available commands"
						class="flex flex-col gap-3"
					>
						{#each groupedCommands as group (group.category)}
							<li role="presentation">
								<div
									class="text-base-content/50 px-3 pb-1 text-[0.7rem] font-semibold tracking-wide uppercase"
								>
									{group.category}
								</div>
								<ul class="flex flex-col gap-1">
									{#each group.commands as command (command.id)}
										{@const commandIndex = filteredCommands.findIndex(
											(item) => item.id === command.id
										)}
										{@const Icon = getCommandIcon(command.id)}
										<li role="presentation">
											<button
												id={`command-palette-option-${command.id}`}
												type="button"
												role="option"
												aria-selected={selectedIndex === commandIndex}
												class={[
													'hover:bg-base-200 focus:bg-base-200 rounded-box flex min-h-14 w-full items-center gap-3 px-3 py-3 text-left transition-colors outline-none',
													selectedIndex === commandIndex ? 'bg-base-200 ring-primary/40 ring-1' : ''
												]}
												onmouseenter={() => {
													selectedIndex = commandIndex;
												}}
												onclick={() => runCommand(command)}
											>
												<span
													class="bg-base-300 text-base-content/75 rounded-box flex h-9 w-9 shrink-0 items-center justify-center"
												>
													<Icon class="h-5 w-5" aria-hidden="true" />
												</span>
												<span class="min-w-0 flex-1">
													<span class="block truncate font-medium">{command.title}</span>
													{#if command.description}
														<span class="text-base-content/55 block truncate text-xs">
															{command.description}
														</span>
													{/if}
												</span>
												{#if command.shortcut?.length}
													<span class="hidden items-center gap-1 sm:flex" aria-hidden="true">
														{#each command.shortcut as key (key)}
															<kbd class="kbd kbd-sm">{key}</kbd>
														{/each}
													</span>
												{/if}
											</button>
										</li>
									{/each}
								</ul>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<div
				class="text-base-content/60 border-base-300 hidden items-center justify-between border-t px-4 py-2 text-xs sm:flex"
				aria-hidden="true"
			>
				<span class="flex items-center gap-1">
					<kbd class="kbd kbd-xs">Up</kbd>
					<kbd class="kbd kbd-xs">Down</kbd>
					to navigate
				</span>
				<span class="flex items-center gap-1">
					<IconMdiKeyboardReturn class="h-4 w-4" />
					to run
				</span>
				<span class="flex items-center gap-1">
					<kbd class="kbd kbd-xs">Esc</kbd>
					to close
				</span>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
