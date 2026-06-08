<script lang="ts" generics="T extends Record<string, string | number | boolean | null | undefined>">
	import { _ } from '$lib/i18n';
	import IconMdiPlus from '@iconify-svelte/mdi/plus';
	import type { ComponentType } from 'svelte';

	interface Props {
		items: T[];
		searchKeys: (keyof T)[];
		placeholder: string;
		onselect: (item: T) => void;
		buttonTitle?: string;
		buttonAriaLabel?: string;
		Icon?: ComponentType;
	}

	let {
		items,
		searchKeys,
		placeholder,
		onselect,
		buttonTitle = 'Add',
		buttonAriaLabel = 'Add',
		Icon = IconMdiPlus
	}: Props = $props();

	let searchQuery = $state('');
	let autoCompleteIndex = $state(-1);
	let showInput = $state(false);

	let filteredItems = $derived(
		searchQuery.length === 0
			? []
			: items
					.filter((item: T) =>
						searchKeys.some((key: keyof T) => {
							const val = item[key];
							return (
								typeof val === 'string' && val.toLowerCase().includes(searchQuery.toLowerCase())
							);
						})
					)
					.slice(0, 10)
	);

	$effect(() => {
		const _ = searchQuery;
		autoCompleteIndex = -1;
	});

	function focusInput(element: HTMLInputElement) {
		element.focus();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			let selected = null;
			if (autoCompleteIndex !== -1 && filteredItems[autoCompleteIndex]) {
				selected = filteredItems[autoCompleteIndex];
			} else if (filteredItems.length > 0) {
				selected = filteredItems[0];
			}

			if (selected) {
				onselect(selected);
				searchQuery = '';
				autoCompleteIndex = -1;
				showInput = false;
			}
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (autoCompleteIndex === -1) {
				autoCompleteIndex = 0;
			} else if (autoCompleteIndex < filteredItems.length - 1) {
				autoCompleteIndex += 1;
			}
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (autoCompleteIndex === -1) {
				autoCompleteIndex = filteredItems.length - 1;
			} else if (autoCompleteIndex > 0) {
				autoCompleteIndex -= 1;
			}
		} else if (event.key === 'Escape') {
			searchQuery = '';
			autoCompleteIndex = -1;
			showInput = false;
		}
	}
</script>

{#if !showInput}
	<button
		type="button"
		class="btn btn-primary btn-sm btn-circle ml-2"
		onclick={() => (showInput = true)}
		title={buttonTitle}
		aria-label={buttonAriaLabel}
	>
		<Icon class="h-5 w-5" />
	</button>
{:else}
	<div class="dropdown relative ml-2 grow max-w-xs">
		<label class="input input-sm flex items-center gap-2 w-full">
			<Icon class="h-4 w-4 opacity-70" />
			<input
				type="text"
				{placeholder}
				bind:value={searchQuery}
				onkeydown={handleKeyDown}
				onblur={() => {
					setTimeout(() => {
						showInput = false;
						searchQuery = '';
					}, 200);
				}}
				use:focusInput
				class="grow text-xs sm:text-sm"
			/>
		</label>
		{#if searchQuery.length > 0 && filteredItems.length > 0}
			<div
				class="dropdown-content bg-base-200 z-10 mt-1 w-full rounded-md shadow-lg border border-base-300 focus:outline-none"
			>
				<ul class="divide-base-100 divide-y max-h-60 overflow-y-auto">
					{#each filteredItems as item, idx (item.code || idx)}
						<li>
							<button
								type="button"
								class="bg-base-100 text-base-content hover:bg-primary hover:text-primary-content focus:bg-primary focus:text-primary-content w-full px-4 py-2 text-left text-xs sm:text-sm transition-colors duration-150 cursor-pointer"
								class:bg-primary={autoCompleteIndex === idx}
								class:text-primary-content={autoCompleteIndex === idx}
								onclick={(e) => {
									e.preventDefault();
									onselect(item);
									searchQuery = '';
									autoCompleteIndex = -1;
									showInput = false;
								}}
							>
								<span>{item.locale || item.name} ({item.en})</span>
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
{/if}
