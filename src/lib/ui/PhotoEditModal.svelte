<script lang="ts">
	import { untrack } from 'svelte';

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

	type Props = {
		isOpen: boolean;
		imageUrl: string;
		imageAlt: string;
		onClose: () => void;
		onSave: (data: EditData) => void;
	};

	const RESIZE_HANDLES = ['n-resize', 'e-resize', 's-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'sw-resize'];

	let { isOpen, imageUrl, imageAlt, onClose, onSave }: Props = $props();

	let modal: HTMLDialogElement;
	let cropperImage = $state<any>();
	let cropperSelection = $state<any>();
	let rotationAngle = $state(0);
	let isInitialized = $state(false);
	let cropperLoaded = $state(false);
	let isMounted = $state(false);
	let cropEnabled = $state(false);
	let initTimeout: ReturnType<typeof setTimeout> | null = null;

	const canPerformActions = $derived(isMounted && isInitialized);
	const cropModeStatus = $derived(cropEnabled ? 'Drag to move, corners to resize' : 'Click and drag to start cropping');

	// Client-side mounting detection
	$effect(() => {
		untrack(() => {
			isMounted = true;
		});
	});

	$effect(() => {
		if (!isMounted) return;

		if (isOpen && !isInitialized) {
			openModal();
		} else if (!isOpen && isInitialized) {
			closeModal();
		}
	});

	$effect(() => {
		if (!isMounted || !isOpen || cropperLoaded) return;
		loadCropper();
	});

	// Cleanup effect
	$effect(() => {
		return () => {
			cleanupCropper();
		};
	});

	async function loadCropper(): Promise<void> {
		if (cropperLoaded) return;

		try {
			await import('cropperjs');
			cropperLoaded = true;
		} catch (error) {
			console.error('Failed to load cropperjs:', error);
			throw new Error('Failed to load image editing library');
		}
	}

	function openModal(): void {
		modal?.showModal();
		initializeCropper();
	}

	function closeModal(): void {
		modal?.close();
		cleanupCropper();
	}

	async function initializeCropper(): Promise<void> {
		if (isInitialized) return;

		if (!cropperLoaded) {
			await loadCropper();
		}

		clearInitTimeout();

		initTimeout = setTimeout(() => {
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
		}, 200);
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
		
		setTimeout(() => {
			try {
				cropperSelection.setAttribute('initial-coverage', '0.5');
				cropperSelection.$reset();
				cropperSelection.$center();
			} catch (error) {
				console.warn('Error initializing crop selection:', error);
			}
		}, 10);
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
		} catch (error) {
			console.error('Error rotating left:', error);
		}
	}

	function handleRotateRight(): void {
		if (!canPerformActions || !cropperImage) return;

		try {
			cropperImage.$rotate('90deg');
			rotationAngle = (rotationAngle + 90) % 360;
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
		} catch (error) {
			console.error('Error zooming in:', error);
		}
	}

	function handleZoomOut(): void {
		if (!canPerformActions || !cropperImage) return;

		try {
			cropperImage.$zoom(-0.1);
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
		modal?.close();
		cleanupCropper();
		onClose();
	}

	function handleModalClick(event: MouseEvent): void {
		if (event.target === modal) {
			handleClose();
		}
	}
</script>

<dialog bind:this={modal} class="modal" onclick={handleModalClick} aria-labelledby="modal-title" aria-modal="true">
	<div class="modal-box w-full max-w-4xl">
		<header class="mb-4 flex items-center justify-between">
			<h3 id="modal-title" class="text-lg font-bold">Edit Photo</h3>
			<button
				type="button"
				class="btn btn-sm btn-circle btn-ghost"
				onclick={handleClose}
				aria-label="Close modal"
			>
				<span class="icon-[mdi--close] h-5 w-5" aria-hidden="true"></span>
			</button>
		</header>

		<section class="bg-base-200 mb-4 max-h-96 overflow-hidden rounded border" aria-label="Image editing area">
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
						aria-label="Crop selection area"
					>
						<cropper-grid
							role="grid"
							covered
							class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[length:33.33%_33.33%] opacity-15"
							aria-hidden="true"
						></cropper-grid>
						<cropper-crosshair 
							centered 
							class="pointer-events-none absolute"
							aria-hidden="true"
						></cropper-crosshair>
						
						<cropper-handle
							action="move"
							theme-color="rgba(255, 255, 255, 0.35)"
							class="absolute z-[5] h-full w-full cursor-move rounded-none border-none bg-transparent"
							onpointerdown={enableCropping}
							aria-label="Move crop selection"
						></cropper-handle>

						<!-- Resize handles -->
						{#each RESIZE_HANDLES as action}
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
				<div class="text-base-content/50 flex h-96 items-center justify-center" role="status" aria-live="polite">
					<div class="text-center">
						<div class="loading loading-spinner loading-lg mb-2" aria-hidden="true"></div>
						<p>Loading image editor...</p>
					</div>
				</div>
			{/if}
		</section>

		<section class="mb-4" aria-label="Image editing controls">
			<div class="flex flex-wrap justify-center gap-2">
				<div class="join" role="group" aria-label="Rotation controls">
					<button
						type="button"
						class="btn btn-sm join-item"
						onclick={handleRotateLeft}
						disabled={!canPerformActions}
						title="Rotate left 90°"
						aria-label="Rotate image left by 90 degrees"
					>
						<span class="icon-[mdi--rotate-left] h-4 w-4" aria-hidden="true"></span>
						<span class="hidden sm:inline">Rotate Left</span>
					</button>
					<button
						type="button"
						class="btn btn-sm join-item"
						onclick={handleRotateRight}
						disabled={!canPerformActions}
						title="Rotate right 90°"
						aria-label="Rotate image right by 90 degrees"
					>
						<span class="icon-[mdi--rotate-right] h-4 w-4" aria-hidden="true"></span>
						<span class="hidden sm:inline">Rotate Right</span>
					</button>
				</div>

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
		</section>

		{#if canPerformActions}
			<section class="bg-base-200 mb-4 rounded p-3 text-sm" aria-label="Current editing status">
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
			</section>
		{/if}

		<footer class="flex justify-end gap-2">
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
		</footer>
	</div>
</dialog>
