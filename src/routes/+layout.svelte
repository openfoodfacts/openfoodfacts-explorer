<script lang="ts">
	import '../app.css';
	import 'leaflet/dist/leaflet.css';
</script>

<svelte:head>
	<title>OFF Explorer</title>
	<meta name="description" content="Open Food Facts Explorer" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="navbar bg-base-100 max-w-7xl mx-auto mt-2 mb-8">
	<div class="flex-1">
		<a class="btn btn-ghost normal-case text-xl" href="/">OpenFoodFacts Explorer</a>
	</div>

	<div class="flex-none">
		<a class="btn btn-ghost" href="/settings">Settings</a>
	</div>
</div>

<div class="container flex-col flex gap-4 xl:max-w-6xl mx-auto my-2">
	<slot />
</div>
