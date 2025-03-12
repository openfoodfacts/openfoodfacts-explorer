<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

	let error: string | null = $state(null);
	let productNotFound: boolean = $state(false);
	let scannedBarcode: string | null = $state(null);

	let html5QrCode: Html5Qrcode | null = null;

	async function searchProduct(barcode: string) {
		try {
			const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
			const data = await response.json();

			if (data.status === 1) {
				// Product exists, redirect to product page.
				window.location.href = `/products/${barcode}`;
			} else {
				// Product not found, prompt the user to add it.
				productNotFound = true;
				scannedBarcode = barcode;
			}
		} catch (err) {
			error = 'Failed to connect to OpenFoodFacts. Please try again.';
			console.error('API Error:', err);
		}
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

		function getQrBoxSize() {
			const screenWidth = window.innerWidth;
			return screenWidth < 640 ? { width: 250, height: 250 } : { width: 400, height: 250 };
		}

		scanner
			.start(
				{ facingMode: 'environment' },
				{ fps: 10, qrbox: getQrBoxSize() },
				(text) => {
					if (text == null) return;
					console.log('QR code detected:', text);
					scanner.stop();
					searchProduct(text);
				},
				() => {
					/* ignored */
				}
			)
			.catch((err) => {
				error = 'Camera access is required. Please enable it in your browser settings.';
				console.error('QR Code Scanner Error:', err);
			});

		html5QrCode = scanner;
	});

	onDestroy(() => {
		// Stop the scanner when the component is destroyed
		if (html5QrCode != null) {
			html5QrCode.stop();
		}
	});
</script>

{#if error != null}
	<div class="flex h-screen items-center justify-center">
		<p class="text-red-500">{error}</p>
	</div>
{:else if productNotFound}
	<div class="flex h-[90vh] flex-col items-center justify-center">
		<p class="text-lg">Product not found in OpenFoodFacts.</p>
		<p class="">Would you like to add it manually?</p>
		<a href="/add-product?barcode={scannedBarcode}" class="btn btn-secondary mt-3">
			Add Product
		</a>
	</div>
{:else}
	<div class="my-44 flex flex-1 items-center justify-center">
		<div id="reader" class="w-full max-w-md rounded-lg border-2 border-gray-300"></div>
	</div>
{/if}
