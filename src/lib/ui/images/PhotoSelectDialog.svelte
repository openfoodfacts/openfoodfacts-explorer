<script lang="ts">
	import type { ProductImage } from '$lib/api';
	import { _ } from '$lib/i18n';
	import IconMdiClose from '@iconify-svelte/mdi/close';

	type Props = {
		images: ProductImage[];
		onSelect: (image: ProductImage) => void;
		onClose?: () => void;
	};

	let { images, onSelect, onClose }: Props = $props();

	let modal: HTMLDialogElement;

	export function openModal(): void {
		modal?.showModal();
	}

	function handleDialogClose(): void {
		modal?.close();
		onClose?.();
	}

	function handleImageSelect(image: ProductImage): void {
		modal?.close();
		onSelect(image);
	}
</script>

<dialog bind:this={modal} class="modal" aria-labelledby="select-image-title" aria-modal="true">
	<div class="modal-box w-full max-w-3xl">
		<div class="mb-4 flex items-center justify-between">
			<h3 id="select-image-title" class="text-lg font-bold">
				{$_('product.edit.images.select_image', { default: 'Select an Image' })}
			</h3>
			<button
				type="button"
				class="btn btn-sm btn-circle btn-ghost"
				onclick={handleDialogClose}
				aria-label="Close modal"
			>
				<IconMdiClose class="h-5 w-5" aria-hidden="true" />
			</button>
		</div>

		<div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
			{#each images as image (image.typeId + '-' + image.imgid)}
				<button
					type="button"
					class="group focus:ring-primary relative overflow-hidden rounded border focus:ring-2 focus:outline-none"
					onclick={() => handleImageSelect(image)}
					aria-label={image.alt || 'Select image'}
				>
					<img
						src={image.url}
						alt={image.alt}
						class="block h-40 w-full object-cover group-hover:opacity-80"
					/>
					<span class="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
						{image.alt}
					</span>
				</button>
			{/each}
		</div>

		<div class="flex justify-end gap-2">
			<button
				type="button"
				class="btn btn-outline"
				onclick={handleDialogClose}
				aria-label="Cancel and close"
			>
				{$_('common.cancel', { default: 'Cancel' })}
			</button>
		</div>
	</div>
</dialog>
