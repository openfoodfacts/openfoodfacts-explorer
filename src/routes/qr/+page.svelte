<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
	import { goto } from '$app/navigation';
	import { getProduct } from '$lib/api/product';

	let error: string | null = $state(null);
	let html5QrCode: Html5Qrcode | null = null;
	let productNotFound = $state(false);
	let lastScannedCode = $state('');

	function getQrBoxSize() {
		const screenWidth = window.innerWidth;
		return screenWidth < 640 ? { width: 250, height: 250 } : { width: 400, height: 250 };
	}

	onMount(() => {
		if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
			error = 'Your browser does not support the camera API';
			return;
		}

		const scanner = new Html5Qrcode('reader', {
			useBarCodeDetectorIfSupported: true,
			formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13],
			verbose: false
		});

		scanner
			.start(
				{ facingMode: 'environment' },
				{ fps: 10, qrbox: getQrBoxSize() },
				async (text) => {
					if (text == null) {
						console.log('Product not detected');
						return;
					}
					console.log('QR code detected:', text);
					lastScannedCode = text;

					// We must stop the scanner first to release the camera
					// This is important because:
					// 1. It frees up camera resources
					// 2. Prevents memory leaks
					// 3. Ensures the camera is available for other applications
					await scanner.stop();

					try {
						// Use getProduct to check if product exists before navigating
						const productState = await getProduct(text, fetch);
						if (!productState || productState.status !== 'success') {
							// Product doesn't exist in the database
							console.log('Product not found in database');
							productNotFound = true;
							return;
						}
						// Product exists, navigate to product page
						await goto('/products/' + text);
					} catch (err) {
						console.error('Error checking product:', err);
						productNotFound = true;
					}
				},
				() => {
					console.log('Product not detected');
				}
			)
			.catch(async (err) => {
				error = 'Camera access is required. Please enable it in your browser settings.';
				console.error('QR Code Scanner Error:', err);
				console.log('Product not detected');
				await cleanupScanner();
			});

		html5QrCode = scanner;
	});

	async function cleanupScanner() {
		if (html5QrCode != null) {
			try {
				await html5QrCode.stop();
				await html5QrCode.clear();
			} catch (e) {
				console.error('Error cleaning up scanner:', e);
			}
			html5QrCode = null;
		}
	}

	onDestroy(() => {
		cleanupScanner();
	});

	function addNewProduct() {
		// Navigate to the product edit page with the scanned barcode
		if (lastScannedCode) {
			goto(`/products/${lastScannedCode}/edit`);
		}
	}

	function restartScanner() {
		productNotFound = false;

		// Try to restart the scanner if it exists
		if (html5QrCode) {
			html5QrCode.start(
				{ facingMode: 'environment' },
				{ fps: 10, qrbox: getQrBoxSize() },
				async (text) => {
					if (text == null) {
						console.log('Product not detected');
						return;
					}
					console.log('QR code detected:', text);
					console.log('Product detected:', text);
					lastScannedCode = text;

					await html5QrCode?.stop();
					console.log('API called');
					await goto('/products/' + text);
				},
				() => {
					console.log('Product not detected');
				}
			);
		}
	}
</script>

{#if error != null}
	<div class="flex h-screen items-center justify-center">
		<p class="text-red-500">{error}</p>
	</div>
{:else if productNotFound}
	<div class="flex flex-col items-center justify-center p-8 text-center">
		<h2 class="mb-2 text-xl font-semibold">Product Not Found</h2>
		<p class="mb-6 text-gray-400">
			Barcode {lastScannedCode} was scanned successfully, but no product was found in our database.
		</p>

		<div class="flex gap-4">
			<button class="btn btn-outline" onclick={addNewProduct}> Add New Product </button>
			<button class="btn btn-outline" onclick={restartScanner}> Scan Again </button>
		</div>
	</div>
{:else}
	<div class="my-44 flex flex-1 items-center justify-center">
		<div id="reader" class="w-full max-w-md rounded-lg border-2 border-gray-300"></div>
	</div>
{/if}
