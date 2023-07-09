<script lang="ts">
	import Logo from '$lib/ui/Logo.svelte';
	import '../app.css';
	import 'leaflet/dist/leaflet.css';

	let barcode: string;
</script>

<svelte:head>
	<title>OFF Explorer</title>
	<meta name="description" content="Open Food Facts Explorer" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="navbar bg-base-100 max-w-7xl mx-auto mt-2 mb-8">
	<div class="navbar-start">
		<a href="/">
			<Logo />
		</a>
	</div>
	<div class="navbar-center">
		<div class="form-control">
			<div class="input-group">
				<input
					type="text"
					bind:value={barcode}
					class="input input-bordered w-full"
					placeholder="Barcode"
				/>

				<button
					class="btn btn-square px-10"
					on:click={() => (window.location.href = '/products/' + barcode)}
					disabled={barcode == null || barcode == ''}
				>
					Go
				</button>
			</div>
		</div>
	</div>

	<div class="navbar-end">
		<a class="btn btn-ghost" href="/folksonomy">Folksonomy</a>
		<a class="btn btn-ghost" href="/settings">Settings</a>
	</div>
</div>

<div class="container flex-col flex gap-4 xl:max-w-6xl mx-auto my-2">
	<slot />
</div>
