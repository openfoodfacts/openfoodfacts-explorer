<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import type { BarcodeDetector as WasmBarcodeDetector } from 'barcode-detector/ponyfill';

	import { goto } from '$app/navigation';
	import { _ } from '#lib/i18n/index.js';
	import { Gs1Barcode } from '#lib/barcodes/gs1.js';
	import { resolve } from '$app/paths';
	import zxingWasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url';

	let error: string | null = $state(null);
	let scannerTimedOut = $state(false);
	let manualBarcode = $state('');
	let invalidBarcodePayload = $state<string | null>(null);
	let scannerTimeout: ReturnType<typeof setTimeout> | null = null;
	let scanLoopTimeout: ReturnType<typeof setTimeout> | null = null;
	let videoElement: HTMLVideoElement | undefined = $state();
	let cameraStream: MediaStream | null = null;
	let detector: Pick<WasmBarcodeDetector, 'detect'> | null = null;
	let wasmBarcodeDetectorModule: Promise<typeof import('barcode-detector/ponyfill')> | null = null;
	let isSubmittingBarcode = $state(false);
	let canRetryScan = $state(false);
	let isDestroyed = false;
	let isScanning = false;
	type ScannerStartupStage = 'decoder' | 'camera' | 'video';

	class ScannerStartupError extends Error {
		readonly stage: ScannerStartupStage;

		constructor(stage: ScannerStartupStage, cause: unknown) {
			super(`Scanner startup failed during ${stage} initialization`, { cause });
			this.stage = stage;
		}
	}

	const scanFormats = ['qr_code', 'ean_13', 'ean_8', 'upc_a', 'itf', 'code_128'] as const;
	type BarcodeDetectorLike = Pick<WasmBarcodeDetector, 'detect'>;
	type NativeBarcodeDetectorConstructor = {
		new (options?: { formats?: string[] }): BarcodeDetectorLike;
		getSupportedFormats?: () => Promise<readonly string[]>;
	};

	async function createBarcodeDetector() {
		const NativeBarcodeDetector = (
			globalThis as typeof globalThis & {
				BarcodeDetector?: NativeBarcodeDetectorConstructor;
			}
		).BarcodeDetector;

		if (NativeBarcodeDetector?.getSupportedFormats) {
			try {
				const supportedFormats = await NativeBarcodeDetector.getSupportedFormats();
				if (scanFormats.every((format) => supportedFormats.includes(format))) {
					return {
						detector: new NativeBarcodeDetector({ formats: [...scanFormats] }),
						backend: 'native BarcodeDetector'
					};
				}
			} catch (err) {
				console.info('[Scanner] native detector unavailable; using WASM ponyfill', err);
			}
		}

		wasmBarcodeDetectorModule ??= (async () => {
			const module = await import('barcode-detector/ponyfill');
			module.prepareZXingModule({
				overrides: {
					locateFile: (path: string, prefix: string) =>
						path.endsWith('.wasm') ? zxingWasmUrl : `${prefix}${path}`
				}
			});
			return module;
		})();
		const { BarcodeDetector } = await wasmBarcodeDetectorModule;
		return {
			detector: new BarcodeDetector({ formats: [...scanFormats] }),
			backend: 'ZXing-C++ WASM ponyfill'
		};
	}

	function getStartupErrorMessage(err: unknown) {
		if (err instanceof ScannerStartupError) {
			switch (err.stage) {
				case 'decoder':
					return $_('qr.decoder_initialization_failed', {
						default: 'Could not initialize barcode scanning in this browser.'
					});
				case 'camera':
					return $_('qr.camera_access_required', {
						default: 'Could not access the camera. Check your browser permissions and try again.'
					});
				case 'video':
					return $_('qr.camera_preview_failed', {
						default:
							'Could not start the camera preview. Check your browser permissions and try again.'
					});
			}
		}

		return $_('qr.scanner_unavailable', {
			default: 'Barcode scanning is not available in this browser.'
		});
	}

	async function handleBarcodeSubmit(barcode: string) {
		const code = barcode.trim();
		const parsedBarcode = Gs1Barcode.parse(code);
		// Store internal product codes are shorter than a GTIN and do not have a
		// GS1 check digit. GTINs themselves must pass the checksum validation.
		const fallbackCode = /^\d{5,7}$/.test(code) ? code : null;
		const productCode = parsedBarcode?.code ?? fallbackCode;

		if (isDestroyed || productCode == null || isSubmittingBarcode) {
			if (productCode == null && !isDestroyed) {
				canRetryScan = true;
				invalidBarcodePayload = barcode;
				error = $_('qr.invalid_barcode', {
					default: 'Scanned code is not a valid barcode'
				});
			}
			return;
		}

		isSubmittingBarcode = true;

		try {
			await goto(resolve('/products/[barcode]', { barcode: productCode }));
		} catch (err) {
			console.error('Barcode navigation failed:', err);
			isSubmittingBarcode = false;
			canRetryScan = true;
			error = $_('qr.barcode_navigation_failed', {
				default: 'Could not open the product page. Please try scanning again.'
			});
		}
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

	function stopScanner() {
		isScanning = false;
		clearScannerTimeout();
		if (scanLoopTimeout != null) {
			clearTimeout(scanLoopTimeout);
			scanLoopTimeout = null;
		}
		cameraStream?.getTracks().forEach((track) => track.stop());
		cameraStream = null;
		if (videoElement != null) {
			videoElement.pause();
			videoElement.srcObject = null;
		}
	}

	async function scanNextFrame() {
		if (!isScanning || isDestroyed || detector == null || videoElement == null) return;

		try {
			const detections = await detector.detect(videoElement);
			const detectedCode = detections[0];
			if (detectedCode != null && detectedCode.rawValue !== '') {
				console.info('[Scanner] code detected', {
					text: detectedCode.rawValue,
					format: detectedCode.format
				});
				stopScanner();
				await handleBarcodeSubmit(detectedCode.rawValue);
				return;
			}
		} catch (err) {
			console.error('[Scanner] detection failed', err);
			stopScanner();
			canRetryScan = true;
			error = $_('qr.scanner_unavailable', {
				default: 'Barcode scanning is not available in this browser.'
			});
			return;
		}

		if (isScanning && !isDestroyed) {
			scanLoopTimeout = setTimeout(scanNextFrame, 150);
		}
	}

	async function startScanner() {
		if (isDestroyed || videoElement == null) return;
		stopScanner();
		error = null;
		scannerTimedOut = false;
		canRetryScan = false;

		let createdDetector: Awaited<ReturnType<typeof createBarcodeDetector>>;
		try {
			createdDetector = await createBarcodeDetector();
		} catch (err) {
			throw new ScannerStartupError('decoder', err);
		}
		if (isDestroyed) return;
		detector = createdDetector.detector;

		let stream: MediaStream;
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: { ideal: 'environment' } },
				audio: false
			});
		} catch (err) {
			throw new ScannerStartupError('camera', err);
		}
		if (isDestroyed) {
			stream.getTracks().forEach((track) => track.stop());
			return;
		}
		cameraStream = stream;
		videoElement.srcObject = cameraStream;
		try {
			await videoElement.play();
		} catch (err) {
			throw new ScannerStartupError('video', err);
		}

		if (isDestroyed) {
			stopScanner();
			return;
		}

		isScanning = true;
		startScannerTimeout();
		console.info('[Scanner] started', { backend: createdDetector.backend });
		void scanNextFrame();
	}

	onMount(async () => {
		if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
			error = $_('qr.scanner_unavailable', {
				default: 'Barcode scanning is not available in this browser.'
			});
			return;
		}

		startScanner().catch((err) => {
			error = getStartupErrorMessage(err);
			console.error('[Scanner] failed to start', err);
			stopScanner();
			canRetryScan = true;
		});
	});

	onDestroy(() => {
		isDestroyed = true;
		stopScanner();
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
			invalidBarcodePayload = null;

			await tick();

			await startScanner();
		} catch (err) {
			console.error('Failed to restart the scanner:', err);
			canRetryScan = true;
			error = getStartupErrorMessage(err);
		}
	}
</script>

{#if error != null}
	<div class="flex h-screen items-center justify-center">
		<div class="flex flex-col items-center gap-4 text-center">
			<div class="max-w-full px-4" role="alert">
				<p class="text-error">{error}</p>
				{#if invalidBarcodePayload !== null}
					<div class="mt-3 max-w-full text-left">
						<p class="mb-1 text-sm font-semibold">
							{$_('qr.invalid_barcode_payload', { default: 'Scanner payload' })}
						</p>
						<code
							class="block max-w-full overflow-x-auto rounded-box bg-base-200 p-3 text-sm break-all whitespace-pre-wrap"
						>
							{invalidBarcodePayload || $_('qr.empty_barcode_payload', { default: '(empty)' })}
						</code>
					</div>
				{/if}
			</div>
			{#if canRetryScan}
				<button class="btn btn-outline" onclick={restartScanner}>
					{$_('qr.scan_again', { default: 'Scan again' })}
				</button>
			{/if}
		</div>
	</div>
{:else}
	<div class="flex flex-col items-center p-8">
		<video
			bind:this={videoElement}
			id="reader"
			class="w-full max-w-md rounded-lg border-2 border-base-300"
			autoplay
			muted
			playsinline
		></video>

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
						maxlength="14"
					/>

					<button class="btn join-item btn-primary" type="submit">
						{$_('search.button', { default: 'Search' })}
					</button>
				</div>
			</form>
		{/if}
	</div>
{/if}
