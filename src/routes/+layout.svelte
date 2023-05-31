<script lang="ts">
	import '../app.css';
</script>

<svelte:head>
	<title>OFF Explorer</title>
	<meta name="description" content="Open Food Facts Explorer" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="container flex-col flex gap-4 xl:max-w-6xl mx-auto my-2">
	<slot />
</div>
