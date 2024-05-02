<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

	let error: string | null = null;

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

		scanner.start(
			{ facingMode: 'environment' },
			{ fps: 1, qrbox: { width: 500, height: 300 } },
			(text, _result) => {
				if (text == null) return;
				console.log('QR code detected:', text);

				scanner.stop();
				window.location.href = '/products/' + text;
			},
			() => {
				/* ignored */
			}
		);

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
	<div class="flex items-center justify-center">
		<p>{error}</p>
	</div>
{:else}
	<div class="flex items-center justify-center">
		<div id="reader" class="w-full"></div>
	</div>
{/if}
