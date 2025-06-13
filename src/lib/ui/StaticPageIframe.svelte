<script lang="ts">
	import { onMount } from 'svelte';
	export let src: string = '';
	export let title: string = '';

	onMount(() => {
		window.addEventListener('message', function (event) {
			const iframe = document.getElementById('static-page-iframe');
			if (event.data.frameHeight && iframe) {
				console.debug('Received frameHeight:', event.data.frameHeight);
				iframe.style.height = event.data.frameHeight + 'px';
			}
		});
	});
</script>

<iframe id="static-page-iframe" {src} class="w-full border-0" {title} scrolling="no" frameborder="0"
></iframe>
