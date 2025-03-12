<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

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
				(text) => {
					if (text == null) return;
					console.log('QR code detected:', text);

					scanner.stop();
					window.location.href = '/products/' + text;
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
{:else}
	<div class="my-44 flex flex-1 items-center justify-center">
		<div id="reader" class="w-full max-w-md rounded-lg border-2 border-gray-300"></div>
	</div>
{/if}
