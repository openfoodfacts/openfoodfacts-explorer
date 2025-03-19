<script lang="ts">
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let sortOrder = $state<'alpha' | 'popular'>('alpha');
	let searchQuery = $state('');

	let sortedTags = $derived([...data.keys].sort((a, b) => {
		if (sortOrder === 'popular') {
			return b.count - a.count;
		}
		return a.k.localeCompare(b.k);
	}));

	let filteredTags = $derived(sortedTags.filter(tag => 
		tag.k.toLowerCase().includes(searchQuery.toLowerCase())
	));

	function exportAsCSV() {
		const headers = ['Key', 'Products Count', 'Unique Values'];
		const rows = filteredTags.map(tag => [tag.k, tag.count.toString(), tag.values.toString()]);
		const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'folksonomy_tags.csv';
		a.click();
		URL.revokeObjectURL(url);
	}

	function getWikiUrl(key: string) {
		return `https://wiki.openfoodfacts.org/Folksonomy_tag:${key}`;
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 text-center">
		<h2 class="text-3xl font-bold mb-4 text-primary">Folksonomy Keys</h2>
		<p class="text-base-content/80 max-w-2xl mx-auto">
			Explore and discover Open Food Facts product tags. These community-contributed keys help categorize and describe food products.
		</p>
	</div>

	<div class="flex flex-col sm:flex-row gap-4 items-center justify-between max-w-4xl mx-auto mb-8">
		<div class="form-control w-full max-w-md">
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

		<div class="flex gap-2 items-center">
			<div class="join">
				<button
					class="join-item btn btn-sm {sortOrder === 'alpha' ? 'btn-primary' : 'btn-ghost'}"
					onclick={() => sortOrder = 'alpha'}
					aria-label="Sort alphabetically"
				>
					<span class="icon icon-[mdi--sort-alphabetical-ascending]"></span>
					A-Z
				</button>
				<button
					class="join-item btn btn-sm {sortOrder === 'popular' ? 'btn-primary' : 'btn-ghost'}"
					onclick={() => sortOrder = 'popular'}
					aria-label="Sort by popularity"
				>
					<span class="icon icon-[mdi--trending-up]"></span>
					Popular
				</button>
			</div>
			<button
				class="btn btn-sm btn-ghost"
				onclick={exportAsCSV}
				aria-label="Export tags as CSV file"
				title="Export as CSV"
			>
				<span class="icon icon-[mdi--file-download-outline]"></span>
				Export
			</button>
		</div>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
		{#each filteredTags as key}
			<div class="card bg-base-200 hover:bg-base-300 transition-colors duration-200 shadow-lg hover:shadow-xl">
				<div class="card-body p-4">
					<div class="flex items-center justify-between gap-2">
						<a
							href="/folksonomy/{key.k}"
							class="hover:underline"
						>
							<code class="px-2 py-1 rounded bg-base-300/50 text-sm font-mono break-all">{key.k}</code>
						</a>
						<a
							href={getWikiUrl(key.k)}
							class="btn btn-ghost btn-xs"
							target="_blank"
							rel="noopener noreferrer"
							title="View or create wiki documentation"
							aria-label="View or create wiki documentation for {key.k}"
						>
							<span class="icon icon-[mdi--book-edit-outline]"></span>
						</a>
					</div>
					<div class="flex flex-wrap gap-2 mt-2">
						<span class="badge badge-primary badge-sm">{key.count} products</span>
						<span class="badge badge-ghost badge-sm">{key.values} values</span>
					</div>
				</div>
			</div>
		{/each}
	</div>

	{#if filteredTags.length === 0}
		<div class="text-center py-8 text-base-content/70">
			<p>No tags found matching your search.</p>
		</div>
	{/if}
</div>