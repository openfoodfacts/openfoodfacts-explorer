<script lang="ts">
	import { tick } from 'svelte';
	import { _ } from '#lib/i18n/index.js';
	import InputAutocomplete from './InputAutocomplete.svelte';

	type Props = {
		label: string;
		options: { code: string; label: string }[];
		value: string;
		onchange: (value: string) => void;
	};

	let { label, options, value, onchange }: Props = $props();
	const id = $props.id();
	let dialog: HTMLDialogElement;
	let open = $state(false);
	let selectedLabel = $derived(options.find((option) => option.code === value)?.label ?? value);

	async function openDialog() {
		open = true;
		await tick();
		dialog.showModal();
		dialog.querySelector('input')?.focus();
	}
</script>

<button
	type="button"
	class="select-bordered select w-full text-left"
	aria-label={`${label}: ${selectedLabel}`}
	aria-haspopup="dialog"
	aria-controls={id}
	onclick={openDialog}
>
	{selectedLabel}
</button>

<dialog
	bind:this={dialog}
	{id}
	class="modal"
	aria-labelledby={`${id}-title`}
	onclose={() => (open = false)}
>
	<div class="modal-box">
		<h3 id={`${id}-title`} class="text-lg font-bold">{label}</h3>
		{#if open}
			<InputAutocomplete
				items={options}
				searchKeys={['code', 'label']}
				placeholder={$_('settings.search_options', {
					default: 'Search {label}',
					values: { label }
				})}
				noResultsMessage={$_('settings.no_matching_options', { default: 'No matching options' })}
				inline
				onselect={(option) => {
					onchange(option.code);
					dialog.close();
				}}
			/>
		{/if}
		<form method="dialog" class="modal-action">
			<button class="btn btn-outline">{$_('common.cancel', { default: 'Cancel' })}</button>
		</form>
	</div>
</dialog>
