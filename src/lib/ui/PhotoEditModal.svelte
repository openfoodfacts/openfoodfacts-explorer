<script lang="ts">
	import { untrack } from 'svelte';

	type Props = {
		isOpen: boolean;
		imageUrl: string;
		imageAlt: string;
		onClose: () => void;
		onSave: (data: { cropData: CropData; rotationAngle: number }) => void;
	};

	type CropData = {
		x: number;
		y: number;
		width: number;
		height: number;
		rotate: number;
		scaleX: number;
		scaleY: number;
	};

	let { isOpen, imageUrl, imageAlt, onClose, onSave }: Props = $props();

	let modal: HTMLDialogElement;
	let cropperImage = $state<any>();
	let cropperSelection = $state<any>();
	let rotationAngle = $state(0);
	let isInitialized = $state(false);
	let cropperLoaded = $state(false);
	let isMounted = $state(false);
	let initTimeout: ReturnType<typeof setTimeout> | null = null;

	// Client-side mounting detection
	$effect(() => {
		untrack(() => {
			isMounted = true;
		});
	});

	$effect(() => {
		if (!isMounted) return;

		if (isOpen && !isInitialized) {
			modal?.showModal();
			initializeCropper();
		} else if (!isOpen && isInitialized) {
			modal?.close();
			resetCropper();
			isInitialized = false;
		}
	});

	$effect(() => {
		if (!isMounted) return;

		if (isOpen && !cropperLoaded) {
			loadCropper();
		}
	});

	async function loadCropper() {
		if (cropperLoaded) return;

		try {
			await import('cropperjs');
			cropperLoaded = true;
		} catch (error) {
			console.error('Failed to load cropperjs:', error);
		}
	}

	async function initializeCropper() {
		if (isInitialized) return;

		if (!cropperLoaded) {
			await loadCropper();
		}

		if (initTimeout) {
			clearTimeout(initTimeout);
		}

		initTimeout = setTimeout(() => {
			untrack(() => {
				if (cropperImage) {
					try {
						cropperImage.$center();

						if (cropperSelection) {
							cropperSelection.$center();
						}

						isInitialized = true;
					} catch (error) {
						console.warn('Error centering image:', error);
						isInitialized = true;
					}
				}
			});
		}, 200);
	}

	function resetCropperState() {
		if (cropperImage) {
			try {
				cropperImage.$resetTransform();
				cropperImage.$center();
			} catch (error) {
				console.warn('Error resetting transform:', error);
			}
		}

		if (cropperSelection) {
			try {
				cropperSelection.$reset();
				cropperSelection.$center();
			} catch (error) {
				console.warn('Error resetting selection:', error);
			}
		}

		rotationAngle = 0;
	}

	function resetCropper() {
		if (initTimeout) {
			clearTimeout(initTimeout);
			initTimeout = null;
		}

		resetCropperState();
		isInitialized = false;
	}

	function handleRotateLeft() {
		if (!cropperImage || !isInitialized) return;

		cropperImage.$rotate('-90deg');
		rotationAngle = (rotationAngle - 90 + 360) % 360;
	}

	function handleRotateRight() {
		if (!cropperImage || !isInitialized) return;

		cropperImage.$rotate('90deg');
		rotationAngle = (rotationAngle + 90) % 360;
	}

	function handleReset() {
		if (!isInitialized) return;

		resetCropperState();
	}

	function handleZoomIn() {
		if (!cropperImage || !isInitialized) return;
		cropperImage.$zoom(0.1);
	}

	function handleZoomOut() {
		if (!cropperImage || !isInitialized) return;
		cropperImage.$zoom(-0.1);
	}

	function handleSave() {
		if (!cropperSelection || !cropperImage || !isInitialized) {
			console.warn('Cropper not ready for saving');
			return;
		}

		try {
			const selectionX = cropperSelection.x || 0;
			const selectionY = cropperSelection.y || 0;
			const selectionWidth = cropperSelection.width || 0;
			const selectionHeight = cropperSelection.height || 0;

			if (selectionWidth <= 0 || selectionHeight <= 0) {
				alert('Please select a valid crop area.');
				return;
			}

			const transformMatrix = cropperImage.$getTransform();

			const cropData: CropData = {
				x: Math.round(selectionX),
				y: Math.round(selectionY),
				width: Math.round(selectionWidth),
				height: Math.round(selectionHeight),
				rotate: rotationAngle,
				scaleX: transformMatrix[0],
				scaleY: transformMatrix[3]
			};

			onSave({
				cropData,
				rotationAngle
			});
		} catch (error) {
			console.error('Error getting crop data:', error);
		}
	}

	function handleClose() {
		modal?.close();
		resetCropper();
		onClose();
	}

	function handleModalClick(event: MouseEvent) {
		if (event.target === modal) {
			handleClose();
		}
	}

	$effect(() => {
		return () => {
			resetCropper();
		};
	});
</script>

<dialog bind:this={modal} class="modal" onclick={handleModalClick}>
	<div class="modal-box w-full max-w-4xl">
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-lg font-bold">Edit Photo</h3>
			<button
				type="button"
				class="btn btn-sm btn-circle btn-ghost"
				onclick={handleClose}
				aria-label="Close"
			>
				<span class="icon-[mdi--close] h-5 w-5"></span>
			</button>
		</div>

		<!-- Image container -->
		<div class="bg-base-200 mb-4 max-h-96 overflow-hidden rounded border">
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
					<cropper-shade></cropper-shade>
					<cropper-handle action="select" plain></cropper-handle>
					<cropper-selection
						bind:this={cropperSelection}
						initial-coverage="0.5"
						movable
						resizable
						class="absolute cursor-move border-2 border-white bg-transparent shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
					>
						<cropper-grid
							role="grid"
							covered
							class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[length:33.33%_33.33%] opacity-15"
						></cropper-grid>
						<cropper-crosshair centered class="pointer-events-none absolute"></cropper-crosshair>
						<cropper-handle
							action="move"
							theme-color="rgba(255, 255, 255, 0.35)"
							class="absolute z-[5] h-full w-full cursor-move rounded-none border-none bg-transparent"
						></cropper-handle>
						<cropper-handle
							action="n-resize"
							class="absolute z-10 h-[10px] w-[10px] cursor-ns-resize rounded-sm border border-gray-300 bg-white"
						></cropper-handle>
						<cropper-handle
							action="e-resize"
							class="absolute z-10 h-[10px] w-[10px] cursor-ew-resize rounded-sm border border-gray-300 bg-white"
						></cropper-handle>
						<cropper-handle
							action="s-resize"
							class="absolute z-10 h-[10px] w-[10px] cursor-ns-resize rounded-sm border border-gray-300 bg-white"
						></cropper-handle>
						<cropper-handle
							action="w-resize"
							class="absolute z-10 h-[10px] w-[10px] cursor-ew-resize rounded-sm border border-gray-300 bg-white"
						></cropper-handle>
						<cropper-handle
							action="ne-resize"
							class="absolute z-10 h-[10px] w-[10px] cursor-nesw-resize rounded-sm border border-gray-300 bg-white"
						></cropper-handle>
						<cropper-handle
							action="nw-resize"
							class="absolute z-10 h-[10px] w-[10px] cursor-nwse-resize rounded-sm border border-gray-300 bg-white"
						></cropper-handle>
						<cropper-handle
							action="se-resize"
							class="absolute z-10 h-[10px] w-[10px] cursor-nwse-resize rounded-sm border border-gray-300 bg-white"
						></cropper-handle>
						<cropper-handle
							action="sw-resize"
							class="absolute z-10 h-[10px] w-[10px] cursor-nesw-resize rounded-sm border border-gray-300 bg-white"
						></cropper-handle>
					</cropper-selection>
				</cropper-canvas>
			{:else}
				<!-- Fallback during SSR/initial load -->
				<div class="text-base-content/50 flex h-96 items-center justify-center">
					<div class="text-center">
						<div class="loading loading-spinner loading-lg mb-2"></div>
						<p>Loading image editor...</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- Control buttons -->
		<div class="mb-4 flex flex-wrap justify-center gap-2">
			<div class="join">
				<button
					type="button"
					class="btn btn-sm join-item"
					onclick={handleRotateLeft}
					disabled={!isInitialized}
					title="Rotate left 90°"
				>
					<span class="icon-[mdi--rotate-left] h-4 w-4"></span>
					<span class="hidden sm:inline">Rotate Left</span>
				</button>
				<button
					type="button"
					class="btn btn-sm join-item"
					onclick={handleRotateRight}
					disabled={!isInitialized}
					title="Rotate right 90°"
				>
					<span class="icon-[mdi--rotate-right] h-4 w-4"></span>
					<span class="hidden sm:inline">Rotate Right</span>
				</button>
			</div>

			<div class="join">
				<button
					type="button"
					class="btn btn-sm join-item"
					onclick={handleZoomOut}
					disabled={!isInitialized}
					title="Zoom out"
				>
					<span class="icon-[mdi--magnify-minus] h-4 w-4"></span>
					<span class="hidden sm:inline">Zoom Out</span>
				</button>
				<button
					type="button"
					class="btn btn-sm join-item"
					onclick={handleZoomIn}
					disabled={!isInitialized}
					title="Zoom in"
				>
					<span class="icon-[mdi--magnify-plus] h-4 w-4"></span>
					<span class="hidden sm:inline">Zoom In</span>
				</button>
			</div>

			<button
				type="button"
				class="btn btn-sm btn-outline"
				onclick={handleReset}
				disabled={!isInitialized}
				title="Reset to original"
			>
				<span class="icon-[mdi--restore] h-4 w-4"></span>
				<span class="hidden sm:inline">Reset</span>
			</button>
		</div>

		<!-- Info display -->
		{#if isInitialized}
			<div class="bg-base-200 mb-4 rounded p-3 text-sm">
				<div class="grid grid-cols-2 gap-2 text-xs">
					<div><strong>Rotation:</strong> {rotationAngle}°</div>
					<div><strong>Tool:</strong> Drag to move, corners to resize</div>
				</div>
			</div>
		{/if}

		<!-- Action buttons -->
		<div class="flex justify-end gap-2">
			<button type="button" class="btn btn-outline" onclick={handleClose}>Cancel</button>
			<button type="button" class="btn btn-primary" onclick={handleSave} disabled={!isInitialized}>
				<span class="icon-[mdi--check] h-4 w-4"></span>
				Save Changes
			</button>
		</div>
	</div>
</dialog>
