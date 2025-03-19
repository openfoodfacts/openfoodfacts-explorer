<script lang="ts">
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let sortedTags = $derived([...data.keys].sort((a, b) => a.k.localeCompare(b.k)));
	let searchQuery = $state('');
	let filteredTags = $derived(sortedTags.filter(tag => 
		tag.k.toLowerCase().includes(searchQuery.toLowerCase())
	));
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 text-center">
		<h2 class="text-3xl font-bold mb-4 text-primary">Folksonomy Keys</h2>
		<p class="text-base-content/80 max-w-2xl mx-auto">
			Explore and discover Open Food Facts product tags. These community-contributed keys help categorize and describe food products.
		</p>
	</div>

	<div class="form-control w-full max-w-md mx-auto mb-8">
		<div class="relative">
			<input
				type="text"
				placeholder="Search tags..."
				class="input input-bordered w-full pl-4 pr-12 h-12 bg-base-200 placeholder:text-base-content/60 focus:bg-base-100 transition-colors duration-200"
				bind:value={searchQuery}
			/>
			<span class="icon icon-[mdi--magnify] absolute right-4 top-1/2 -translate-y-1/2 text-xl text-base-content/70"></span>
		</div>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
		{#each filteredTags as key}
			<a
				href="/folksonomy/{key.k}"
				class="card bg-base-200 hover:bg-base-300 transition-colors duration-200 shadow-lg hover:shadow-xl"
			>
				<div class="card-body p-4">
					<div class="flex items-center gap-2">
						<code class="px-2 py-1 rounded bg-base-300/50 text-sm font-mono break-all">{key.k}</code>
					</div>
					<div class="flex gap-2 mt-2">
						<span class="badge badge-primary badge-sm">{key.count} products</span>
					</div>
				</div>
			</a>
		{/each}
	</div>

	{#if filteredTags.length === 0}
		<div class="text-center py-8 text-base-content/70">
			<p>No tags found matching your search.</p>
		</div>
	{/if}
</div>