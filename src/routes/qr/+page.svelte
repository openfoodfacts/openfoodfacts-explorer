<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import type { Html5Qrcode } from 'html5-qrcode';

	import { goto } from '$app/navigation';
	import { _ } from '$lib/i18n';
	import { Gs1Barcode } from '$lib/barcodes/gs1';

	let error: string | null = $state(null);
	let html5QrCode: Html5Qrcode | null = null;
	let scannerTimedOut = $state(false);
	let manualBarcode = $state('');
	let scannerTimeout: ReturnType<typeof setTimeout> | null = null;
	let isSubmittingBarcode = $state(false);
	let canRetryScan = $state(false);
	let isDestroyed = false;
	let scanFailureCount = 0;
	let lastScanFailureLogAt = 0;

	function getQrBoxSize(viewfinderWidth: number, viewfinderHeight: number) {
		// html5-qrcode passes the actual camera-frame dimensions here. Keep the
		// region wide enough for horizontal product barcodes without scanning the
		// entire frame at native camera resolution.
		return {
			width: Math.min(Math.floor(viewfinderWidth * 0.85), 700),
			height: Math.min(Math.floor(viewfinderHeight * 0.5), 300)
		};
	}

	function logScanFailure(errorMessage: string) {
		scanFailureCount += 1;
		const now = Date.now();

		// html5-qrcode calls this for every frame that does not contain a code.
		// Throttle the diagnostic so it remains useful in the browser console.
		if (now - lastScanFailureLogAt < 2000) return;

		console.debug('[QR scanner] no code detected', {
			attemptsSinceLastLog: scanFailureCount,
			errorMessage
		});
		scanFailureCount = 0;
		lastScanFailureLogAt = now;
	}

	async function handleBarcodeSubmit(barcode: string) {
		const code = barcode.trim();
		const parsedBarcode = Gs1Barcode.parse(code);
		const fallbackCode = /^(?:\d{5,7}|\d{15,18})$/.test(code) ? code : null;
		const productCode = parsedBarcode?.code ?? fallbackCode;

		if (isDestroyed || productCode == null || isSubmittingBarcode) {
			if (productCode == null && !isDestroyed) {
				canRetryScan = true;
				error = $_('qr.invalid_barcode', {
					default: 'Scanned code is not a valid barcode'
				});
			}
			return;
		}

		isSubmittingBarcode = true;

		try {
			await goto(`/search?q=${encodeURIComponent(productCode)}`);
		} catch (err) {
			console.error('Barcode navigation failed:', err);
			isSubmittingBarcode = false;
		}
	}

	async function startScanning(scanner: Html5Qrcode) {
		return scanner.start(
			{ facingMode: 'environment' },
			{ fps: 10, qrbox: getQrBoxSize },
			async (text, result) => {
				if (isDestroyed || text == null) return;
				clearScannerTimeout();
				console.info('[QR scanner] code detected', {
					text,
					format: result.result.format?.formatName ?? 'unknown'
				});

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

				if (!isDestroyed) {
					await handleBarcodeSubmit(text);
				}
			},
			(errorMessage) => {
				logScanFailure(errorMessage);
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
			if (!isDestroyed) {
				scannerTimedOut = true;
			}
		}, 20000);
	}

	async function startScanner(scanner: Html5Qrcode) {
		if (isDestroyed) return;

		await startScanning(scanner);

		if (!isDestroyed) {
			startScannerTimeout();
			console.info('[QR scanner] camera started');
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
			formatsToSupport: [
				Html5QrcodeSupportedFormats.QR_CODE,
				Html5QrcodeSupportedFormats.EAN_13,
				Html5QrcodeSupportedFormats.EAN_8,
				Html5QrcodeSupportedFormats.UPC_A,
				Html5QrcodeSupportedFormats.ITF
			],
			verbose: false
		});

		html5QrCode = scanner;
		startScanner(scanner).catch(async (err) => {
			error = $_('qr.camera_access_required', {
				default: 'Camera access is required. Please enable it in your browser settings.'
			});
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

	async function restartScanner() {
		try {
			error = null;
			canRetryScan = false;
			scannerTimedOut = false;
			manualBarcode = '';

			await tick();

			if (html5QrCode) {
				await startScanner(html5QrCode);
			}
		} catch (err) {
			console.error('Failed to restart the scanner:', err);
			canRetryScan = true;
			error = 'Failed to restart the scanner. Please refresh the page.';
		}
	}
</script>

{#if error != null}
	<div class="flex h-screen items-center justify-center">
		<div class="flex flex-col items-center gap-4 text-center">
			<p class="text-error">{error}</p>
			{#if canRetryScan}
				<button class="btn btn-outline" onclick={restartScanner}>
					{$_('qr.scan_again', { default: 'Scan again' })}
				</button>
			{/if}
		</div>
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
						class="input-bordered input join-item w-full"
						required
						pattern="[0-9]+"
						minlength="5"
						maxlength="18"
					/>

					<button class="btn join-item btn-primary" type="submit">
						{$_('search.button', { default: 'Search' })}
					</button>
				</div>
			</form>
		{/if}
	</div>
{/if}
