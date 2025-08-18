<script lang="ts">
	import { _ } from '$lib/i18n';
	import { onMount } from 'svelte';

	let helpModal: HTMLDialogElement;

	// Define shortcuts: { combo, description, action }
	export type Shortcut = {
		combo: string;
		description: string;
		action: () => void;
	};

	let { shortcuts: shortcutsProps }: { shortcuts: Shortcut[] } = $props();

	let shortcuts = $derived([
		...shortcutsProps,
		{
			combo: 'Ctrl+Shift+?',
			description: 'Show this help modal',
			action: () => helpModal.showModal()
		}
	]);

	// Parse event to combo string
	function getCombo(event: KeyboardEvent): string {
		let combo = '';
		if (event.ctrlKey) combo += 'Ctrl+';
		if (event.shiftKey) combo += 'Shift+';
		if (event.altKey) combo += 'Alt+';
		if (event.metaKey) combo += 'Meta+';
		combo += event.key.length === 1 ? event.key.toUpperCase() : event.key;
		return combo;
	}

	onMount(() => {
		const keyDownListener = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && helpModal.open) {
				helpModal.close();
			}
			const combo = getCombo(event);
			shortcuts.forEach((shortcut) => {
				if (combo === shortcut.combo.replace('?', '?')) {
					shortcut.action();
				}
			});
		};

		window.addEventListener('keydown', keyDownListener);
		return () => {
			window.removeEventListener('keydown', keyDownListener);
		};
	});
</script>

<!-- Open the modal using ID.showModal() method -->
<dialog id="my_modal_1" class="modal" bind:this={helpModal}>
	<div class="modal-box">
		<h3 class="text-lg font-bold">Keyboard Shortcuts</h3>
		<ul class="py-4">
			{#each shortcuts as shortcut (shortcut.combo)}
				{@const keys = shortcut.combo.split('+')}
				<li>
					{#each keys as key, i (i)}
						{#if i > 0}
							+
						{/if}
						<kbd class="kbd">{key}</kbd>
					{/each}
					: {shortcut.description}
				</li>
			{/each}
		</ul>
		<div class="modal-action">
			<form method="dialog">
				<button class="btn">Close</button>
			</form>
		</div>
	</div>
</dialog>
