<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { Html5Qrcode } from 'html5-qrcode';

	import { goto } from '$app/navigation';
	import { _ } from '$lib/i18n';
	import { browser } from '$app/environment';

	let error: string | null = $state(null);
	let html5QrCode: Html5Qrcode | null = null;
	let scannerTimedOut = $state(false);
	let manualBarcode = $state('');
	let scannerTimeout: ReturnType<typeof setTimeout> | null = null;
	let isSubmittingBarcode = $state(false);
	let isDestroyed = false;

	function getQrBoxSize() {
		if (!browser) throw new Error('getQrBoxSize can only be called inside browser');

		const screenWidth = window.innerWidth;
		return screenWidth < 640 ? { width: 250, height: 250 } : { width: 400, height: 250 };
	}

	async function handleBarcodeSubmit(barcode: string) {
		const code = barcode.trim();

		if (!/^\d+$/.test(code) || isSubmittingBarcode) return;

		isSubmittingBarcode = true;

		try {
			await goto(`/search?q=${encodeURIComponent(code)}`);
		} catch (err) {
			console.error('Barcode navigation failed:', err);
			isSubmittingBarcode = false;
			scannerTimedOut = true;
		}
	}

	async function startScanning(scanner: Html5Qrcode) {
		return scanner.start(
			{ facingMode: 'environment' },
			{ fps: 10, qrbox: getQrBoxSize() },
			async (text) => {
				if (text == null) return;
				clearScannerTimeout();
				console.debug('QR code detected:', text);

				// We must stop the scanner first to release the camera
				// This is important because:
				// 1. It frees up camera resources
				// 2. Prevents memory leaks
				// 3. Ensures the camera is available for other applications
				try {
					await scanner.stop();
				} catch (error) {
					console.error('Error stopping scanner:', error);
				}

				await handleBarcodeSubmit(text);
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
			scannerTimedOut = true;
		}, 20000);
	}

	async function startScanner(scanner: Html5Qrcode) {
		await startScanning(scanner);
		if (!isDestroyed) {
			startScannerTimeout();
		}
	}

	onMount(async () => {
		if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
			error = 'Your browser does not support the camera API';
			return;
		}

		const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');

		if (isDestroyed) return;

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
		isDestroyed = true;
		clearScannerTimeout();

		cleanupScanner().catch((err) => {
			console.error('Error cleaning up scanner:', err);
		});
	});

	async function submitManualBarcode(event: SubmitEvent) {
		event.preventDefault();

		await handleBarcodeSubmit(manualBarcode);
	}
</script>

{#if error != null}
	<div class="flex h-screen items-center justify-center">
		<p class="text-red-500">{error}</p>
	</div>
{:else}
	<div class="flex flex-col items-center p-8">
		<div id="reader" class="w-full max-w-md rounded-lg border-2 border-base-300"></div>

		{#if scannerTimedOut}
			<form class="mt-6 w-full max-w-md" onsubmit={submitManualBarcode}>
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
						class="input input-bordered join-item w-full"
						required
						pattern="\d+"
					/>

					<button class="btn btn-primary join-item" type="submit">
						{$_('search.button', { default: 'Search' })}
					</button>
				</div>
			</form>
		{/if}
	</div>
{/if}
