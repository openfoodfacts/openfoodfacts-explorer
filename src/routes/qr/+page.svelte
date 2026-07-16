<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import type { Html5Qrcode } from 'html5-qrcode';

	import { goto } from '$app/navigation';
	import { _ } from '$lib/i18n';
	import { createProductsApi } from '$lib/api';
	import { browser } from '$app/environment';

	let error: string | null = $state(null);
	let html5QrCode: Html5Qrcode | null = null;
	let productNotFound = $state(false);
	let lastScannedCode = $state('');
	let scannerTimedOut = $state(false);
	let manualBarcode = $state('');
	let scannerTimeout: ReturnType<typeof setTimeout> | null = null;

	function getQrBoxSize() {
		if (!browser) throw new Error('getQrBoxSize can only be called inside browser');

		const screenWidth = window.innerWidth;
		return screenWidth < 640 ? { width: 250, height: 250 } : { width: 400, height: 250 };
	}

	async function startScanning(scanner: Html5Qrcode) {
		return scanner.start(
			{ facingMode: 'environment' },
			{ fps: 10, qrbox: getQrBoxSize() },
			async (text) => {
				if (text == null) return;
				clearScannerTimeout();
				console.debug('QR code detected:', text);
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

	function clearScannerTimeout() {
		if (scannerTimeout != null) {
			clearTimeout(scannerTimeout);
			scannerTimeout = null;
		}
	}

	function startScannerTimeout() {
		clearScannerTimeout();
		scannerTimeout = setTimeout(() => {
			stopScanner()
				.then(() => {
					scannerTimedOut = true;
				})
				.catch((err) => {
					console.error('Failed to stop scanner after timeout:', err);
				});
		}, 20_000);
	}

	async function startScanner(scanner: Html5Qrcode) {
		await startScanning(scanner);
		startScannerTimeout();
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

		html5QrCode = scanner;
		startScanner(scanner).catch(async (err) => {
			error = 'Camera access is required. Please enable it in your browser settings.';
			console.error('QR Code Scanner Error:', err);
			await cleanupScanner();
		});
	});

	async function stopScanner() {
		clearScannerTimeout();
		if (html5QrCode != null) {
			await html5QrCode.stop();
		}
	}

	async function cleanupScanner() {
		if (html5QrCode != null) {
			try {
				await stopScanner();
				html5QrCode.clear();
			} catch (e) {
				console.error('Error cleaning up scanner:', e);
			}
			html5QrCode = null;
		}
	}

	onDestroy(() => {
		clearScannerTimeout();
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
			scannerTimedOut = false;
			error = null;
			lastScannedCode = '';
			manualBarcode = '';

			// Ensure page is fully rendered before restarting the scan
			await tick();

			if (html5QrCode) {
				await startScanner(html5QrCode);
			}
		} catch (err) {
			console.error('Failed to restart scanner:', err);
			error = 'Failed to restart the scanner. Please refresh the page.';
		}
	}

	function submitManualBarcode(event: SubmitEvent) {
		event.preventDefault();
		const barcode = manualBarcode.trim();
		if (/^\d+$/.test(barcode)) {
			goto(`/products/${barcode}`);
		}
	}
</script>

{#if error != null}
	<div class="flex h-screen items-center justify-center">
		<p class="text-red-500">{error}</p>
	</div>
{:else if productNotFound}
	<div class="flex flex-col items-center justify-center p-8 text-center">
		<h2 class="mb-2 text-xl font-semibold">
			{$_('qr.product_not_found', { default: 'Product Not Found' })}
		</h2>
		<p class="mb-6 text-gray-400">
			{$_('qr.barcode_scanned_not_found', {
				values: { barcode: lastScannedCode },
				default: `Barcode ${lastScannedCode} was scanned successfully, but no product was found.`
			})}
		</p>

		<div class="flex gap-4">
			<button class="btn btn-outline" onclick={addNewProduct}
				>{$_('qr.add_new_product', { default: 'Add new product' })}</button
			>
			<button class="btn btn-outline" onclick={restartScanner}
				>{$_('qr.scan_again', { default: 'Scan again' })}</button
			>
		</div>
	</div>
{:else if scannerTimedOut}
	<div class="flex flex-col items-center justify-center p-8 text-center">
		<form class="w-full max-w-md" onsubmit={submitManualBarcode}>
			<label class="mb-2 block text-left" for="manual-barcode">
				{$_('qr.manual_barcode', { default: 'Enter the barcode manually' })}
			</label>
			<div class="join w-full">
				<input
					id="manual-barcode"
					type="text"
					inputmode="numeric"
					placeholder={$_('qr.manual_barcode', { default: 'Enter the barcode manually' })}
					aria-label={$_('qr.manual_barcode', { default: 'Enter the barcode manually' })}
					bind:value={manualBarcode}
					class="input join-item input-bordered w-full"
					required
					pattern="\d+"
				/>
				<button class="btn btn-primary join-item" type="submit">
					{$_('search.button', { default: 'Search' })}
				</button>
			</div>
		</form>

		<button class="btn btn-outline mt-4" onclick={restartScanner}
			>{$_('qr.scan_again', { default: 'Scan again' })}</button
		>
	</div>
{:else}
	<div class="my-44 flex flex-1 items-center justify-center">
		<div id="reader" class="w-full max-w-md rounded-lg border-2 border-gray-300"></div>
	</div>
{/if}
