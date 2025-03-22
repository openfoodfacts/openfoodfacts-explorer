<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
	import { goto } from '$app/navigation';

	let error: string | null = $state(null);

	let html5QrCode: Html5Qrcode | null = null;

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
				async (text) => {
					if (text == null) return;
					console.log('QR code detected:', text);

					// We must stop the scanner first to release the camera
					// This is important because:
					// 1. It frees up camera resources
					// 2. Prevents memory leaks
					// 3. Ensures the camera is available for other applications
					await scanner.stop();
					// Then we navigate to the product page
					// Using goto() instead of window.location for proper SvelteKit navigation
					await goto('/products/' + text);
				},
				() => {
					/* ignored */
				}
			)
			.catch(async (err) => {
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
</script>

{#if error != null}
	<div class="flex h-screen items-center justify-center">
		<p class="text-red-500">{error}</p>
	</div>
{:else}
	<div class="my-44 flex flex-1 items-center justify-center">
		<div id="reader" class="w-full max-w-md rounded-lg border-2 border-gray-300"></div>
	</div>
{/if}
