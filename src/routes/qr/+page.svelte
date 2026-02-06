<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { Html5Qrcode } from 'html5-qrcode';

	import { goto } from '$app/navigation';
	import { _ } from '$lib/i18n';
	import { createProductsApi } from '$lib/api';

	let error: string | null = $state(null);
	let html5QrCode: Html5Qrcode | null = null;
	let productNotFound = $state(false);
	let lastScannedCode = $state('');

	function getQrBoxSize() {
		const screenWidth = window.innerWidth;
		return screenWidth < 640 ? { width: 250, height: 250 } : { width: 400, height: 250 };
	}

	async function startScanning(scanner: Html5Qrcode) {
		return scanner.start(
			{ facingMode: 'environment' },
			{ fps: 10, qrbox: getQrBoxSize() },
			async (text) => {
				if (text == null) return;
				console.log('QR code detected:', text);
				lastScannedCode = text;

				// We must stop the scanner first to release the camera
				// This is important because:
				// 1. It frees up camera resources
				// 2. Prevents memory leaks
				// 3. Ensures the camera is available for other applications
				await scanner.stop();

				const productsApi = createProductsApi(fetch);

				const { data: productState, error } = await productsApi.getProductV3(text, { fields: [] });
				if (!productState || error) {
					console.error('Error fetching product:', error);
					productNotFound = true;
					return;
				}
				if (productState.status !== 'success') {
					productNotFound = true;
					return;
				}

				// If product is found, navigate to its page
				await goto('/products/' + text);
			},
			() => {
				/* ignored */
			}
		);
	}

	onMount(async () => {
		if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
			error = 'Your browser does not support the camera API';
			return;
		}

		const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');

		const scanner = new Html5Qrcode('reader', {
			useBarCodeDetectorIfSupported: true,
			formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13],
			verbose: false
		});

		startScanning(scanner).catch(async (err) => {
			error = 'Camera access is required. Please enable it in your browser settings.';
			console.error('QR Code Scanner Error:', err);
			await cleanupScanner();
		});

		html5QrCode = scanner;
	});

	async function cleanupScanner() {
		if (html5QrCode != null) {
			try {
				await html5QrCode.stop();
				html5QrCode.clear();
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

	async function restartScanner() {
		try {
			productNotFound = false;
			error = null;
			lastScannedCode = '';

			if (html5QrCode) {
				await startScanning(html5QrCode);
			}
		} catch (err) {
			console.error('Failed to restart scanner:', err);
			error = 'Failed to restart the scanner. Please refresh the page.';
		}
	}
</script>

{#if error != null}
	<div class="flex h-screen items-center justify-center">
		<p class="text-red-500">{error}</p>
	</div>
{:else if productNotFound}
	<div class="flex flex-col items-center justify-center p-8 text-center">
		<h2 class="mb-2 text-xl font-semibold">{$_('qr.product_not_found')}</h2>
		<p class="mb-6 text-gray-400">
			{$_('qr.barcode_scanned_not_found', { values: { barcode: lastScannedCode } })}
		</p>

		<div class="flex gap-4">
			<button class="btn btn-outline" onclick={addNewProduct}>{$_('qr.add_new_product')}</button>
			<button class="btn btn-outline" onclick={restartScanner}>{$_('qr.scan_again')}</button>
		</div>
	</div>
{:else}
	<div class="my-44 flex flex-1 items-center justify-center">
		<div id="reader" class="w-full max-w-md rounded-lg border-2 border-gray-300"></div>
	</div>
{/if}
