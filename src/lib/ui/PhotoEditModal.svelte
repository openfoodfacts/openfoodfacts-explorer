<script lang="ts">
	import { untrack } from 'svelte';
	import 'cropperjs';
	import { getImageFieldName } from '$lib/utils';
	import { OpenFoodFacts } from '@openfoodfacts/openfoodfacts-nodejs';
	import type { Product } from '$lib/api';

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
		imageUrl: string;
		imageAlt: string;
		imageId?: number;
		onClose: () => void;
		onSave: (data: EditData) => void;
		product?: Product;
		photoType?: string;
		activeLanguageCode?: string;
		photoTypes?: Array<{ id: string; label: string }>;
		onImageUnselected?: () => void;
	};

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

	let {
		imageUrl,
		imageAlt,
		imageId,
		onClose,
		onSave,
		product,
		photoType,
		activeLanguageCode,
		photoTypes,
		onImageUnselected
	}: Props = $props();

	let modal: HTMLDialogElement;
	let cropperImage = $state<CropperImage | null>(null);
	let cropperSelection = $state<CropperSelection | null>(null);
	let rotationAngle = $state(0);
	let isInitialized = $state(false);
	let isMounted = $state(false);
	let cropEnabled = $state(false);
	let initTimeout: ReturnType<typeof setTimeout> | null = null;

	const canPerformActions = $derived(isMounted && isInitialized);
	const cropModeStatus = $derived(
		cropEnabled ? 'Drag to move, corners to resize' : 'Click and drag to start cropping'
	);
	const reportImageUrl = $derived.by(() => {
		if (!product?.code || !imageId) return null;
		return `https://nutripatrol.openfoodfacts.org/flag/image/?barcode=${product.code}&image_id=${imageId}&source=web&flavor=off`;
	});

	// Client-side mounting detection
	$effect(() => {
		untrack(() => {
			isMounted = true;
		});
	});

	// Cleanup effect
	$effect(() => {
		return () => {
			cleanupCropper();
		};
	});

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

		clearInitTimeout();

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
				isInitialized = true; // Set to true even if centering fails
			}
		});
	}

	function clearInitTimeout(): void {
		if (initTimeout) {
			clearTimeout(initTimeout);
			initTimeout = null;
		}
	}

	function resetCropperState(): void {
		const resetOperations = [
			() => cropperImage?.$resetTransform?.(),
			() => cropperImage?.$center?.(),
			() => cropperSelection?.$reset?.(),
			() => cropperSelection?.$center?.()
		];

		resetOperations.forEach((operation) => {
			try {
				operation();
			} catch (error) {
				console.warn('Error during cropper state reset:', error);
			}
		});

		rotationAngle = 0;
		cropEnabled = false;
	}

	function cleanupCropper(): void {
		clearInitTimeout();
		resetCropperState();
		isInitialized = false;
	}

	function enableCropping(): void {
		if (cropEnabled || !cropperSelection) return;

		cropEnabled = true;

		try {
			if (cropperSelection) {
				cropperSelection.setAttribute('initial-coverage', '0.5');
				cropperSelection.$reset();
				cropperSelection.$center();
			}
		} catch (error) {
			console.warn('Error initializing crop selection:', error);
		}
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
		if (!cropperSelection) return null;

		const selectionX = cropperSelection.x || 0;
		const selectionY = cropperSelection.y || 0;
		const selectionWidth = cropperSelection.width || 0;
		const selectionHeight = cropperSelection.height || 0;

		if (selectionWidth <= 0 || selectionHeight <= 0) {
			return null;
		}

		return {
			x: Math.round(selectionX),
			y: Math.round(selectionY),
			width: Math.round(selectionWidth),
			height: Math.round(selectionHeight),
			rotate: rotationAngle,
			...transformData
		};
	}

	function handleSave(): void {
		if (!canPerformActions || !cropperImage) {
			console.warn('Cropper not ready for saving');
			return;
		}

		const transformData = getTransformData();

		if (!cropEnabled || !cropperSelection) {
			const cropData = createEmptyCropData(transformData);
			onSave({ cropData, rotationAngle });
			return;
		}

		try {
			const cropData = createCropDataFromSelection(transformData);

			if (!cropData) {
				alert('Please select a valid crop area.');
				return;
			}

			onSave({ cropData, rotationAngle });
		} catch (error) {
			console.error('Error getting crop data:', error);
			alert('Error processing crop data. Please try again.');
		}
	}

	function handleClose(): void {
		closeModal();
		onClose();
	}

	async function handleImageUnselect(): Promise<void> {
		if (!product || !photoType || !activeLanguageCode || !photoTypes) {
			console.warn('Missing required data for image unselect');
			return;
		}

		const barcode = product.code;
		const imagefield = getImageFieldName(photoType, activeLanguageCode, photoTypes);

		try {
			const off = new OpenFoodFacts(fetch);
			const result = await off.unselectImage(barcode, imagefield);

			if (result.status === 'success' || result.status_code === 200) {
				console.log('Image unselected successfully:', result);
				if (onImageUnselected) {
					onImageUnselected();
				}
				handleClose();
			} else {
				console.warn('Image unselect failed:', result);
				alert('Failed to unselect image. Please try again.');
			}
		} catch (error) {
			console.error('Error unselecting image:', error);
			alert('Error unselecting image. Please try again.');
		}
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
			if (cropperSelection) {
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
			}
		} catch (error) {
			console.warn('Error adjusting selection after transform:', error);
		}
	}

	function handleSelectionChange(event: CustomEvent): void {
		if (!cropperImage || !canPerformActions) return;

		try {
			const selection = event.detail;

			if (!constrainSelectionToBounds(selection)) {
				event.preventDefault();
			}
		} catch (error) {
			console.warn('Error handling selection change:', error);
		}
	}

	function handleImageTransform(): void {
		if (!canPerformActions) return;

		try {
			adjustSelectionAfterTransform();
		} catch (error) {
			console.warn('Error handling image transform:', error);
		}
	}

	function handleModalClick(event: MouseEvent): void {
		if (event.target === modal) {
			handleClose();
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
			<h3 id="modal-title" class="text-lg font-bold">Edit Photo</h3>
			<button
				type="button"
				class="btn btn-sm btn-circle btn-ghost"
				onclick={handleClose}
				aria-label="Close modal"
			>
				<span class="icon-[mdi--close] h-5 w-5" aria-hidden="true"></span>
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
						src={imageUrl}
						alt={imageAlt}
						rotatable
						scalable
						translatable
						class="block max-h-full max-w-full"
						ontransform={handleImageTransform}
					></cropper-image>
					{#if cropEnabled}
						<cropper-shade></cropper-shade>
					{/if}
					<cropper-handle
						action="select"
						plain
						onpointerdown={enableCropping}
						aria-label="Start cropping selection"
					></cropper-handle>
					<cropper-selection
						bind:this={cropperSelection}
						initial-coverage="0"
						movable
						resizable
						class="absolute cursor-move border-2 border-white bg-transparent shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
						style="display: {cropEnabled ? 'block' : 'none'}"
						onpointerdown={enableCropping}
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
							onpointerdown={enableCropping}
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
						<p>Loading image editor...</p>
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
					<span class="icon-[mdi--rotate-left] h-4 w-4" aria-hidden="true"></span>
					<span class="hidden sm:inline">Rotate Left</span>
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
							<span class="icon-[mdi--magnify-minus] h-4 w-4" aria-hidden="true"></span>
							<span class="hidden sm:inline">Zoom Out</span>
						</button>
						<button
							type="button"
							class="btn btn-sm join-item"
							onclick={handleZoomIn}
							disabled={!canPerformActions}
							title="Zoom in"
							aria-label="Zoom into image"
						>
							<span class="icon-[mdi--magnify-plus] h-4 w-4" aria-hidden="true"></span>
							<span class="hidden sm:inline">Zoom In</span>
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
						<span class="icon-[mdi--restore] h-4 w-4" aria-hidden="true"></span>
						<span class="hidden sm:inline">Reset</span>
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
					<span class="icon-[mdi--rotate-right] h-4 w-4" aria-hidden="true"></span>
					<span class="hidden sm:inline">Rotate Right</span>
				</button>
			</div>
		</div>

		{#if canPerformActions}
			<div class="bg-base-200 mb-4 rounded p-3 text-sm" aria-label="Current editing status">
				<div class="grid grid-cols-2 gap-2 text-xs">
					<div>
						<strong>Rotation:</strong>
						<span aria-label="Current rotation angle">{rotationAngle}°</span>
					</div>
					<div>
						<strong>Tool:</strong>
						<span aria-label="Current tool mode">{cropModeStatus}</span>
					</div>
				</div>
			</div>
		{/if}

		<div class="flex justify-between gap-2">
			<div class="flex gap-2">
				{#if product && photoType && activeLanguageCode && photoTypes}
					<button
						type="button"
						class="btn btn-outline hover:btn-outline hover:btn-error"
						onclick={handleImageUnselect}
						disabled={!canPerformActions}
						aria-label="Unselect this image"
					>
						<span class="icon-[mdi--image-remove] h-4 w-4" aria-hidden="true"></span>
						Unselect Image
					</button>
				{/if}

				{#if reportImageUrl}
					<a
						href={reportImageUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-outline hover:btn-outline hover:btn-warning"
						aria-label="Report this image"
					>
						<span class="icon-[mdi--flag] h-4 w-4" aria-hidden="true"></span>
						Report Image
					</a>
				{/if}
			</div>

			<div class="flex gap-2">
				<button
					type="button"
					class="btn btn-outline"
					onclick={handleClose}
					aria-label="Cancel editing and close modal"
				>
					Cancel
				</button>
				<button
					type="button"
					class="btn btn-primary"
					onclick={handleSave}
					disabled={!canPerformActions}
					aria-label="Save changes and close modal"
				>
					<span class="icon-[mdi--check] h-4 w-4" aria-hidden="true"></span>
					Save Changes
				</button>
			</div>
		</div>
	</div>
</dialog>
