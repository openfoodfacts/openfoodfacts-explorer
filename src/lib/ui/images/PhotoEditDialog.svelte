<script lang="ts">
	import { untrack } from 'svelte';
	import 'cropperjs';
	import type { ProductImage } from '$lib/api';
	import { getToastCtx } from '$lib/stores/toasts';
	import { _ } from '$lib/i18n';

	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiRotateLeft from '@iconify-svelte/mdi/rotate-left';
	import IconMdiMagnifyMinus from '@iconify-svelte/mdi/magnify-minus';
	import IconMdiMagnifyPlus from '@iconify-svelte/mdi/magnify-plus';
	import IconMdiRestore from '@iconify-svelte/mdi/restore';
	import IconMdiRotateRight from '@iconify-svelte/mdi/rotate-right';
	import IconMdiImageRemove from '@iconify-svelte/mdi/image-remove';
	import IconMdiFlag from '@iconify-svelte/mdi/flag';
	import IconMdiCheck from '@iconify-svelte/mdi/check';

	type CropData = {
		x: number;
		y: number;
		width: number;
		height: number;
		rotate: number;
		scaleX: number;
		scaleY: number;
	};

	type TransformData = {
		scaleX: number;
		scaleY: number;
	};

	type EditData = {
		cropData: CropData;
		rotationAngle: number;
	};

	type CropperImage = {
		$center: () => void;
		$resetTransform: () => void;
		$rotate: (angle: string) => void;
		$zoom: (delta: number) => void;
		$getTransform: () => number[];
		closest: (selector: string) => Element | null;
		getBoundingClientRect: () => DOMRect;
	};

	type CropperSelection = {
		$center: () => void;
		$reset: () => void;
		setAttribute: (name: string, value: string) => void;
		x: number;
		y: number;
		width: number;
		height: number;
	};

	type Props = {
		image: ProductImage;
		reportImageUrl: string;
		onSave: (data: EditData) => void;
		onImageUnselected: () => void;
		onClose?: () => void;
	};

	let { image, reportImageUrl, onClose, onSave, onImageUnselected }: Props = $props();

	const toast = getToastCtx();

	export function openImage(imageData: ProductImage): void {
		image = imageData;
		modal.showModal();
	}

	const RESIZE_HANDLES = [
		'n-resize',
		'e-resize',
		's-resize',
		'w-resize',
		'ne-resize',
		'nw-resize',
		'se-resize',
		'sw-resize'
	];

	let modal: HTMLDialogElement;
	let cropperImage = $state<CropperImage | null>(null);
	let cropperSelection = $state<CropperSelection | null>(null);
	let rotationAngle = $state(0);
	let isInitialized = $state(false);
	let isMounted = $state(false);
	let cropEnabled = $state(false);
	let imageNaturalDimensions = $state<{ width: number; height: number } | null>(null);

	const canPerformActions = $derived(isMounted && isInitialized && imageNaturalDimensions !== null);
	const cropModeStatus = $derived(
		cropEnabled
			? $_('product.edit.images.crop_drag_to_move', { default: 'Drag to move, corners to resize' })
			: $_('product.edit.images.crop_click_to_start', {
					default: 'Click or drag to start cropping'
				})
	);

	// Client-side mounting detection
	$effect(() => {
		untrack(() => {
			isMounted = true;
			preloadImageDimensions();
		});
	});

	// Cleanup effect
	$effect(() => {
		return () => {
			cleanupCropper();
		};
	});

	async function preloadImageDimensions(): Promise<void> {
		if (!image?.url) {
			console.error('No image URL provided for dimension preloading');
			return;
		}

		try {
			const img = new Image();
			img.src = image.url;

			await new Promise<void>((resolve, reject) => {
				img.onload = () => {
					imageNaturalDimensions = {
						width: img.naturalWidth,
						height: img.naturalHeight
					};
					resolve();
				};
				img.onerror = () => reject(new Error('Failed to load image'));
			});
		} catch (error) {
			console.error('Critical error preloading image dimensions:', error);
			// Reset to null to ensure we don't have stale data
			imageNaturalDimensions = null;
		}
	}

	export function openModal(): void {
		modal?.showModal();
		initializeCropper();
	}

	export function closeModal(): void {
		modal?.close();
		cleanupCropper();
	}

	async function initializeCropper(): Promise<void> {
		if (isInitialized) return;

		untrack(() => {
			if (!cropperImage) {
				console.warn('Cropper image not available for initialization');
				return;
			}

			try {
				cropperImage.$center();

				if (cropperSelection) {
					cropperSelection.$center();
				}

				isInitialized = true;
			} catch (error) {
				console.warn('Error during cropper initialization:', error);
				isInitialized = true;
			}
		});
	}

	function resetCropperState(): void {
		try {
			cropperImage?.$resetTransform?.();
			cropperImage?.$center?.();
			cropperSelection?.$reset?.();
			cropperSelection?.$center?.();
		} catch (error) {
			console.warn('Error during cropper state reset:', error);
		}

		rotationAngle = 0;
		cropEnabled = false;
	}

	function cleanupCropper(): void {
		resetCropperState();
		isInitialized = false;
	}

	function enableCropping(): void {
		if (cropEnabled || !cropperSelection) return;

		cropEnabled = true;
		cropperSelection.setAttribute('initial-coverage', '0');
	}

	function getTransformData(): TransformData {
		if (!cropperImage) {
			return { scaleX: 1, scaleY: 1 };
		}

		try {
			const transformMatrix = cropperImage.$getTransform();
			return {
				scaleX: transformMatrix[0] || 1,
				scaleY: transformMatrix[3] || 1
			};
		} catch (error) {
			console.warn('Error getting transform data:', error);
			return { scaleX: 1, scaleY: 1 };
		}
	}

	function handleRotateLeft(): void {
		if (!canPerformActions || !cropperImage) return;

		try {
			cropperImage.$rotate('-90deg');
			rotationAngle = (rotationAngle - 90 + 360) % 360;
			adjustSelectionAfterTransform();
		} catch (error) {
			console.error('Error rotating left:', error);
		}
	}

	function handleRotateRight(): void {
		if (!canPerformActions || !cropperImage) return;

		try {
			cropperImage.$rotate('90deg');
			rotationAngle = (rotationAngle + 90) % 360;
			adjustSelectionAfterTransform();
		} catch (error) {
			console.error('Error rotating right:', error);
		}
	}

	function handleReset(): void {
		if (!canPerformActions) return;
		resetCropperState();
	}

	function handleZoomIn(): void {
		if (!canPerformActions || !cropperImage) return;

		try {
			cropperImage.$zoom(0.1);
			adjustSelectionAfterTransform();
		} catch (error) {
			console.error('Error zooming in:', error);
		}
	}

	function handleZoomOut(): void {
		if (!canPerformActions || !cropperImage) return;

		try {
			cropperImage.$zoom(-0.1);
			adjustSelectionAfterTransform();
		} catch (error) {
			console.error('Error zooming out:', error);
		}
	}

	function createEmptyCropData(transformData: TransformData): CropData {
		return {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			rotate: rotationAngle,
			...transformData
		};
	}

	function createCropDataFromSelection(transformData: TransformData): CropData | null {
		if (!cropperSelection || !cropperImage || !imageNaturalDimensions) {
			return null;
		}

		const selection = {
			x: cropperSelection.x,
			y: cropperSelection.y,
			width: cropperSelection.width,
			height: cropperSelection.height
		};

		if (selection.width <= 0 || selection.height <= 0) {
			return null;
		}

		const { width: naturalWidth, height: naturalHeight } = imageNaturalDimensions;

		// Get display dimensions
		const imageRect = cropperImage.getBoundingClientRect();
		if (imageRect.width <= 0 || imageRect.height <= 0) {
			console.error('Invalid display image dimensions');
			return null;
		}

		// Get canvas for relative positioning
		const cropperCanvas = cropperImage.closest('cropper-canvas');
		if (!cropperCanvas) {
			console.error('Cropper canvas not found');
			return null;
		}

		const canvasRect = cropperCanvas.getBoundingClientRect();

		// Calculate coordinate transformation: canvas → image → natural
		const imageOffsetX = imageRect.left - canvasRect.left;
		const imageOffsetY = imageRect.top - canvasRect.top;

		const relativeX = selection.x - imageOffsetX;
		const relativeY = selection.y - imageOffsetY;

		const scaleX = naturalWidth / imageRect.width;
		const scaleY = naturalHeight / imageRect.height;

		const naturalX = relativeX * scaleX;
		const naturalY = relativeY * scaleY;
		const naturalW = selection.width * scaleX;
		const naturalH = selection.height * scaleY;

		// Clamp coordinates to image bounds
		const clampedX = Math.max(0, Math.min(naturalX, naturalWidth));
		const clampedY = Math.max(0, Math.min(naturalY, naturalHeight));
		const clampedW = Math.max(0, Math.min(naturalW, naturalWidth - clampedX));
		const clampedH = Math.max(0, Math.min(naturalH, naturalHeight - clampedY));

		return {
			x: Math.round(clampedX),
			y: Math.round(clampedY),
			width: Math.round(clampedW),
			height: Math.round(clampedH),
			rotate: rotationAngle,
			...transformData
		};
	}

	function handleSave(): void {
		if (!canPerformActions || !cropperImage) {
			console.warn('Cropper not ready for saving');
			return;
		}

		// Ensure image dimensions are available before processing
		if (!imageNaturalDimensions) {
			console.error('Image dimensions not available - cannot save crop data');
			toast.error($_('product.edit.images.toast.not_loaded'));
			return;
		}

		const transformData = getTransformData();

		if (!cropEnabled || !cropperSelection) {
			const cropData = createEmptyCropData(transformData);
			onSave({ cropData, rotationAngle });
			return;
		}

		const cropData = createCropDataFromSelection(transformData);

		if (!cropData) {
			toast.warning($_('product.edit.images.toast.invalid_crop'));
			return;
		}

		onSave({ cropData, rotationAngle });
	}

	/** Called when the user closes the dialog via button or backdrop click */
	function handleDialogClose(): void {
		closeModal();
		onClose?.();
	}

	function getImageBounds() {
		if (!cropperImage) return null;

		try {
			const cropperCanvas = cropperImage.closest('cropper-canvas');
			if (!cropperCanvas) return null;

			const cropperCanvasRect = cropperCanvas.getBoundingClientRect();
			const cropperImageRect = cropperImage.getBoundingClientRect();

			return {
				x: cropperImageRect.left - cropperCanvasRect.left,
				y: cropperImageRect.top - cropperCanvasRect.top,
				width: cropperImageRect.width,
				height: cropperImageRect.height
			};
		} catch (error) {
			console.warn('Error getting image bounds:', error);
			return null;
		}
	}

	function constrainSelectionToBounds(selection: {
		x: number;
		y: number;
		width: number;
		height: number;
	}): boolean {
		const imageBounds = getImageBounds();
		if (!imageBounds) return true; // Allow if we can't determine bounds

		const isWithinBounds =
			selection.x >= imageBounds.x &&
			selection.y >= imageBounds.y &&
			selection.x + selection.width <= imageBounds.x + imageBounds.width &&
			selection.y + selection.height <= imageBounds.y + imageBounds.height;

		return isWithinBounds;
	}

	function adjustSelectionAfterTransform(): void {
		if (!cropperSelection || !cropEnabled) return;

		try {
			const currentSelection = {
				x: cropperSelection.x || 0,
				y: cropperSelection.y || 0,
				width: cropperSelection.width || 0,
				height: cropperSelection.height || 0
			};

			if (!constrainSelectionToBounds(currentSelection)) {
				const imageBounds = getImageBounds();
				if (imageBounds && cropperSelection) {
					const maxWidth = Math.min(imageBounds.width * 0.8, currentSelection.width);
					const maxHeight = Math.min(imageBounds.height * 0.8, currentSelection.height);

					const newX = imageBounds.x + (imageBounds.width - maxWidth) / 2;
					const newY = imageBounds.y + (imageBounds.height - maxHeight) / 2;

					cropperSelection.x = newX;
					cropperSelection.y = newY;
					cropperSelection.width = maxWidth;
					cropperSelection.height = maxHeight;
				}
			}
		} catch (error) {
			console.warn('Error adjusting selection after transform:', error);
		}
	}

	function handleSelectionChange(event: CustomEvent): void {
		if (!cropperImage || !canPerformActions) return;

		try {
			const selection = event.detail;

			// Enable cropping when a selection is first created
			if (!cropEnabled && selection.width > 0 && selection.height > 0) {
				cropEnabled = true;
			}

			if (!constrainSelectionToBounds(selection)) {
				event.preventDefault();
			}
		} catch (error) {
			console.warn('Error handling selection change:', error);
		}
	}

	function handleImageTransform(): void {
		if (!canPerformActions) return;
		adjustSelectionAfterTransform();
	}

	function handleModalClick(event: MouseEvent): void {
		if (event.target === modal) {
			handleDialogClose();
		}
	}
</script>

<dialog
	bind:this={modal}
	class="modal"
	onclick={handleModalClick}
	aria-labelledby="modal-title"
	aria-modal="true"
>
	<div class="modal-box h-full w-full max-w-4xl md:h-auto">
		<div class="mb-4 flex items-center justify-between">
			<h3 id="modal-title" class="text-lg font-bold">
				{$_('product.edit.images.edit_photo', { default: 'Edit Photo' })}
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

		<div
			class="bg-base-200 mb-4 max-h-96 overflow-hidden rounded border"
			aria-label="Image editing area"
		>
			{#if isMounted}
				<cropper-canvas background class="ltr relative block h-96 w-full">
					<cropper-image
						bind:this={cropperImage}
						src={image.url}
						alt={image.alt}
						rotatable
						scalable
						translatable
						class="block max-h-full max-w-full"
						ontransform={handleImageTransform}
					></cropper-image>
					{#if cropEnabled}
						<cropper-shade></cropper-shade>
					{/if}
					<cropper-handle action="select" plain aria-label="Start cropping selection"
					></cropper-handle>
					<cropper-selection
						bind:this={cropperSelection}
						initial-coverage="0"
						movable
						resizable
						class="absolute cursor-move border-2 border-white bg-transparent shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
						style="display: {cropEnabled ? 'block' : 'none'}"
						onchange={handleSelectionChange}
						aria-label="Crop selection area"
					>
						<cropper-grid
							role="grid"
							covered
							class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[length:33.33%_33.33%] opacity-15"
							aria-hidden="true"
						></cropper-grid>
						<cropper-crosshair centered class="pointer-events-none absolute" aria-hidden="true"
						></cropper-crosshair>

						<cropper-handle
							action="move"
							theme-color="rgba(255, 255, 255, 0.35)"
							class="absolute z-[5] h-full w-full cursor-move rounded-none border-none bg-transparent"
							aria-label="Move crop selection"
						></cropper-handle>

						<!-- Resize handles -->
						{#each RESIZE_HANDLES as action (action)}
							<cropper-handle
								{action}
								class="absolute z-10 h-[10px] w-[10px] rounded-sm border border-gray-300 bg-white"
								onpointerdown={enableCropping}
								aria-label="Resize crop selection"
							></cropper-handle>
						{/each}
					</cropper-selection>
				</cropper-canvas>
			{:else}
				<!-- Loading fallback -->
				<div
					class="text-base-content/50 flex h-96 items-center justify-center"
					role="status"
					aria-live="polite"
				>
					<div class="text-center">
						<div class="loading loading-spinner loading-lg mb-2" aria-hidden="true"></div>
						<p>
							{$_('product.edit.images.loading_editor', { default: 'Loading image editor...' })}
						</p>
					</div>
				</div>
			{/if}
		</div>

		<div class="mb-4" aria-label="Image editing controls">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<!-- Left rotate button -->
				<button
					type="button"
					class="btn btn-sm"
					onclick={handleRotateLeft}
					disabled={!canPerformActions}
					title="Rotate left 90°"
					aria-label="Rotate image left by 90 degrees"
				>
					<IconMdiRotateLeft class="h-4 w-4" aria-hidden="true" />
					<span class="hidden sm:inline"
						>{$_('product.edit.images.rotate_left', { default: 'Rotate Left' })}</span
					>
				</button>

				<!-- Center controls -->
				<div class="flex gap-2">
					<div class="join" role="group" aria-label="Zoom controls">
						<button
							type="button"
							class="btn btn-sm join-item"
							onclick={handleZoomOut}
							disabled={!canPerformActions}
							title="Zoom out"
							aria-label="Zoom out of image"
						>
							<IconMdiMagnifyMinus class="h-4 w-4" aria-hidden="true" />
							<span class="hidden sm:inline"
								>{$_('product.edit.images.zoom_out', { default: 'Zoom Out' })}</span
							>
						</button>
						<button
							type="button"
							class="btn btn-sm join-item"
							onclick={handleZoomIn}
							disabled={!canPerformActions}
							title="Zoom in"
							aria-label="Zoom into image"
						>
							<IconMdiMagnifyPlus class="h-4 w-4" aria-hidden="true" />
							<span class="hidden sm:inline"
								>{$_('product.edit.images.zoom_in', { default: 'Zoom In' })}</span
							>
						</button>
					</div>

					<!-- Reset control -->
					<button
						type="button"
						class="btn btn-sm btn-outline"
						onclick={handleReset}
						disabled={!canPerformActions}
						title="Reset to original"
						aria-label="Reset image to original state"
					>
						<IconMdiRestore class="h-4 w-4" aria-hidden="true" />
						<span class="hidden sm:inline"
							>{$_('product.edit.images.reset', { default: 'Reset' })}</span
						>
					</button>
				</div>

				<!-- Right rotate button -->
				<button
					type="button"
					class="btn btn-sm"
					onclick={handleRotateRight}
					disabled={!canPerformActions}
					title="Rotate right 90°"
					aria-label="Rotate image right by 90 degrees"
				>
					<IconMdiRotateRight class="h-4 w-4" aria-hidden="true" />
					<span class="hidden sm:inline"
						>{$_('product.edit.images.rotate_right', { default: 'Rotate Right' })}</span
					>
				</button>
			</div>
		</div>

		{#if canPerformActions}
			<div class="bg-base-200 mb-4 rounded p-3 text-sm" aria-label="Current editing status">
				<div class="grid grid-cols-2 gap-2 text-xs">
					<div>
						<strong>{$_('product.edit.images.rotation', { default: 'Rotation' })}:</strong>
						<span aria-label="Current rotation angle">{rotationAngle}°</span>
					</div>
					<div>
						<strong>{$_('product.edit.images.tool', { default: 'Tool' })}:</strong>
						<span aria-label="Current tool mode">{cropModeStatus}</span>
					</div>
				</div>
			</div>
		{/if}

		<div class="flex justify-between gap-2">
			<div class="flex gap-2">
				<button
					type="button"
					class="btn btn-outline hover:btn-outline hover:btn-error"
					onclick={onImageUnselected}
					disabled={!canPerformActions}
					aria-label="Unselect this image"
				>
					<IconMdiImageRemove class="h-4 w-4" aria-hidden="true" />
					{$_('product.edit.images.unselect_image', { default: 'Unselect Image' })}
				</button>

				{#if reportImageUrl}
					<a
						href={reportImageUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-outline hover:btn-outline hover:btn-warning"
						aria-label="Report this image"
					>
						<IconMdiFlag class="h-4 w-4" aria-hidden="true" />
						{$_('product.edit.images.report_image', { default: 'Report Image' })}
					</a>
				{/if}
			</div>

			<div class="flex gap-2">
				<button
					type="button"
					class="btn btn-outline"
					onclick={handleDialogClose}
					aria-label="Cancel editing and close modal"
				>
					{$_('common.cancel', { default: 'Cancel' })}
				</button>
				<button
					type="button"
					class="btn btn-primary"
					onclick={handleSave}
					disabled={!canPerformActions}
					aria-label="Save changes and close modal"
				>
					<IconMdiCheck class="h-4 w-4" aria-hidden="true" />
					{$_('product.edit.images.save_changes', { default: 'Save Changes' })}
				</button>
			</div>
		</div>
	</div>
</dialog>
