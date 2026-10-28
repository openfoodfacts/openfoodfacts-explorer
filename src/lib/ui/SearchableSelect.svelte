<script lang="ts">
	import { _ } from '#lib/i18n/index.js';

	type Props = {
		label: string;
		options: { code: string; label: string }[];
		value: string;
		onchange: (value: string) => void;
	};

	let { label, options, value, onchange }: Props = $props();
	const id = $props.id();
	let container: HTMLDivElement;
	let input: HTMLInputElement;
	let open = $state(false);
	let query = $state('');
	let activeIndex = $state(-1);
	let selectedLabel = $derived(options.find((option) => option.code === value)?.label ?? value);
	let filteredOptions = $derived(
		options.filter((option) =>
			`${option.label} ${option.code}`.toLowerCase().includes(query.trim().toLowerCase())
		)
	);

	$effect(() => {
		if (open && activeIndex >= 0) {
			document.getElementById(`${id}-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
		}
	});

	function closeMenu() {
		open = false;
		query = '';
		activeIndex = -1;
	}

	function selectOption(code: string) {
		onchange(code);
		input.focus();
		closeMenu();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.isComposing || event.keyCode === 229) return;

		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			open = true;
			if (filteredOptions.length) {
				activeIndex =
					event.key === 'ArrowDown'
						? Math.min(activeIndex + 1, filteredOptions.length - 1)
						: activeIndex < 0
							? filteredOptions.length - 1
							: Math.max(activeIndex - 1, 0);
			}
		} else if (event.key === 'Enter' && open) {
			event.preventDefault();
			const option = filteredOptions[activeIndex];
			if (option) selectOption(option.code);
		} else if (event.key === 'Escape' && open) {
			event.preventDefault();
			closeMenu();
		}
	}
</script>

<svelte:window
	onpointerdown={(event) => {
		if (open && !container.contains(event.target as Node)) closeMenu();
	}}
/>

<div
	bind:this={container}
	class="relative w-full"
	onfocusout={(event) => {
		if (!container.contains(event.relatedTarget as Node)) closeMenu();
	}}
>
	<input
		bind:this={input}
		type="text"
		role="combobox"
		class="input-bordered input w-full"
		aria-label={label}
		aria-autocomplete="list"
		aria-expanded={open}
		aria-controls={`${id}-options`}
		aria-activedescendant={open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
		autocomplete="off"
		placeholder={$_('settings.search_options', { default: 'Search {label}', values: { label } })}
		value={open ? query : selectedLabel}
		onfocus={() => (open = true)}
		onclick={() => (open = true)}
		oninput={(event) => {
			query = event.currentTarget.value;
			activeIndex = -1;
			open = true;
		}}
		onkeydown={handleKeyDown}
	/>
	{#if open}
		<div class="absolute z-20 mt-1 w-full rounded-box border border-base-300 bg-base-100 shadow-lg">
			<ul id={`${id}-options`} role="listbox" aria-label={label} class="max-h-60 overflow-y-auto">
				{#each filteredOptions as option, index (option.code)}
					<li role="presentation">
						<button
							type="button"
							role="option"
							id={`${id}-option-${index}`}
							aria-selected={option.code === value}
							tabindex="-1"
							class="w-full cursor-pointer px-4 py-2 text-left text-sm break-words hover:bg-base-200"
							class:bg-primary={activeIndex === index}
							class:text-primary-content={activeIndex === index}
							onclick={() => selectOption(option.code)}
						>
							{option.label}{option.code !== option.label ? ` - ${option.code}` : ''}
						</button>
					</li>
				{/each}
			</ul>
			{#if filteredOptions.length === 0}
				<p role="status" class="p-4 text-sm opacity-70">
					{$_('settings.no_matching_options', { default: 'No matching options' })}
				</p>
			{/if}
		</div>
	{/if}
</div>
