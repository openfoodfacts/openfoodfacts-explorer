<script lang="ts">
	import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
	import { onMount } from 'svelte';

	onMount(() => {
		const html5QrCode = new Html5Qrcode('reader');

		html5QrCode.start(
			{ facingMode: 'environment' },
			{ fps: 10, qrbox: { width: 500, height: 500 }, aspectRatio: 1 },
			(text, result) => {
				if (result.result.format?.format === Html5QrcodeSupportedFormats.EAN_13) {
					html5QrCode.stop();
					window.location.href = '/products/' + text;
				}
			},
			undefined
		);
	});
</script>

<div class="flex items-center justify-center">
	<div id="reader" class="w-full"></div>
</div>
