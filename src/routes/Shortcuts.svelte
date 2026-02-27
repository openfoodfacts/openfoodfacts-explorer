<script lang="ts">
	import { _ } from '$lib/i18n';
	import { onMount } from 'svelte';
	let helpModal: HTMLDialogElement;

	// Define shortcuts: { combo, description, action }
	export type Shortcut = {
		description: string;
		action: () => void;
	};

	let { shortcuts }: { shortcuts: Map<string, Shortcut> } = $props();

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
			shortcuts.forEach((shortcut, key) => {
				if (combo === key.replace('?', '?')) {
					shortcut.action();
				}
			});
		};

		window.addEventListener('keydown', keyDownListener);
		return () => {
			window.removeEventListener('keydown', keyDownListener);
		};
	});

	export function show() {
		helpModal.showModal();
	}
</script>

<!-- Open the modal using ID.showModal() method -->
<dialog id="my_modal_1" class="modal" bind:this={helpModal}>
	<div class="modal-box">
		<h3 class="mb-4 text-lg font-bold">Keyboard Shortcuts</h3>

		<div class="grid grid-cols-2 gap-2">
			{#each shortcuts as [combo, shortcut] (combo)}
				<span class="font-mono">
					{#each combo.split('+') as key, i (key)}
						{#if i > 0}<span class="mx-1">+</span>{/if}<kbd class="kbd">{key}</kbd>
					{/each}
				</span>

				<span class="ml-2">{shortcut.description}</span>
			{/each}
		</div>

		<div class="modal-action">
			<form method="dialog">
				<button class="btn">Close</button>
			</form>
		</div>
	</div>
</dialog>
