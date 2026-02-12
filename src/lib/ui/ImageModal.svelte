<script lang="ts">
	import { IMAGE_REPORT_URL } from '$lib/const';
	import { userInfo } from '$lib/stores/user';
	import { resolve } from '$app/paths';
	import { _ } from 'svelte-i18n';
	import ResizableImage from './ResizableImage.svelte';

	import IconMdiMagnifyPlusOutline from '@iconify-svelte/mdi/magnify-plus-outline';
	import IconMdiMagnifyMinusOutline from '@iconify-svelte/mdi/magnify-minus-outline';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiRotateLeft from '@iconify-svelte/mdi/rotate-left';
	import IconMdiRotateRight from '@iconify-svelte/mdi/rotate-right';
	import IconMdiFlagOutline from '@iconify-svelte/mdi/flag-outline';
	import IconMdiPencilOutline from '@iconify-svelte/mdi/pencil-outline';

	type ImageState = { url: string; alt?: string; imageid?: number; productCode?: string };
	let image: ImageState | undefined = $state();

	let dialog: HTMLDialogElement | undefined = $state();
	let zoomLevel = $state(1);
	let translation = $state({ x: 0, y: 0 });
	const MAX_ZOOM = 3;

	let rotation = $state(0);

	export function displayImage(url: string, alt?: string, imageid?: number, productCode?: string) {
		image = { url, alt, imageid, productCode };

		zoomLevel = 1;
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
		zoomLevel = 1;
	}

	function zoomIn(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		zoomLevel = Math.min(zoomLevel + 0.5, MAX_ZOOM);
	}

	function zoomOut(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		zoomLevel = Math.max(zoomLevel - 0.5, 1);
	}

	function resetZoom(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		zoomLevel = 1;
		translation = { x: 0, y: 0 };
	}

	function rotateRight() {
		rotation = rotation + 90;
	}

	function rotateLeft() {
		rotation = rotation - 90;
	}
</script>

<dialog
	class="border-base-300 bg-base-100 h-screen max-h-screen w-screen max-w-screen border p-0 shadow-lg md:inset-0 md:m-auto md:h-[90vh] md:w-[90vw] md:rounded-xl"
	bind:this={dialog}
	onclose={() => (image = undefined)}
	onclick={(e) => {
		if (e.target === dialog) {
			close();
		}
	}}
>
	<div class="relative flex h-full w-full flex-col">
		<div class="h-full w-full p-5">
			{#if image}
				<ResizableImage
					src={image.url}
					alt={image.alt ?? 'Image'}
					bind:zoom={zoomLevel}
					bind:rotation
					bind:translation
					maxzoom={10}
				/>
			{/if}
		</div>
		<div class="absolute right-2 z-10 flex h-full flex-col items-center justify-center gap-2">
			<button
				class="btn btn-circle btn-md bg-base-100/80 hover:bg-base-100"
				onclick={zoomIn}
				title="Zoom In"
				aria-label="Zoom In"
				disabled={zoomLevel >= MAX_ZOOM}
			>
				<IconMdiMagnifyPlusOutline class="h-6 w-6" />
			</button>
			<button
				class="btn bg-base-100/80 hover:bg-base-100 text-md text-base-content px-2 py-2 font-medium"
				onclick={resetZoom}
			>
				{zoomLevel.toFixed(1)} x
			</button>
			<button
				class="btn btn-circle btn-md bg-base-100/80 hover:bg-base-100"
				onclick={zoomOut}
				title="Zoom Out"
				aria-label="Zoom Out"
				disabled={zoomLevel <= 1}
			>
				<IconMdiMagnifyMinusOutline class="h-6 w-6" />
			</button>
		</div>

		<div class="absolute top-2 right-2 z-10">
			<button
				class="btn btn-circle btn-md bg-base-100/80 hover:bg-base-100"
				onclick={(e) => {
					e.stopPropagation();
					close();
				}}
				title="Close"
				aria-label="Close image"
			>
				<IconMdiClose class="h-6 w-6" />
			</button>
		</div>

		<div class="absolute bottom-2 z-10 flex w-full justify-between gap-2 px-4 md:justify-end">
			<button
				class="btn btn-circle btn-md bg-base-100/80 hover:bg-base-100"
				onclick={rotateLeft}
				title="Rotate Left"
				aria-label="Rotate Left"
			>
				<IconMdiRotateLeft class="h-6 w-6" />
			</button>
			<button
				class="btn btn-circle btn-md bg-base-100/80 hover:bg-base-100"
				onclick={rotateRight}
				title="Rotate Right"
				aria-label="Rotate Right"
			>
				<IconMdiRotateRight class="h-6 w-6" />
			</button>
		</div>

		<div class="absolute bottom-2 left-2 z-10">
			{#if image?.alt}
				<div
					class="bg-base-100/80 text-base-content rounded-md px-3 py-1 text-sm font-medium shadow-md backdrop-blur-sm"
				>
					{image.alt}
				</div>
			{/if}
		</div>

		<div class="absolute top-2 left-2 z-10 flex gap-2">
			{#if image?.productCode}
				<!-- Edit button -->
				{#if $userInfo}
					<a
						class="btn btn-sm bg-primary/90 hover:bg-primary text-primary-content gap-2"
						href={resolve('/products/[barcode]/edit', { barcode: image.productCode })}
					>
						<IconMdiPencilOutline class="h-5 w-5" />
						<span>{$_('product.buttons.edit', { default: 'Edit' })}</span>
					</a>
				{/if}

				<!-- Flag/Report button -->
				{#if image?.imageid}
					<a
						class="btn btn-sm bg-base-100/80 hover:bg-base-100 gap-2"
						href={IMAGE_REPORT_URL(image.productCode, image.imageid)}
						target="_blank"
						rel="noopener"
					>
						<IconMdiFlagOutline class="h-5 w-5" />
						<span>{$_('product.buttons.report_issue', { default: 'Report' })}</span>
					</a>
				{/if}
			{/if}
		</div>
	</div>
</dialog>

<style>
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
