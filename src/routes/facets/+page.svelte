<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h2 class="text-3xl font-bold">Exploring Facets</h2>

<div class="mt-8">
	<ul class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.facets as { taxo, icon: IconComponent, name } (taxo)}
			<li class="flex">
				<a
					href={`/facets/${taxo}`}
					class="flex min-h-24 w-full items-center rounded-lg border p-4 text-xl font-semibold transition hover:bg-base-200"
				>
					<IconComponent class="me-4 h-5 w-5 shrink-0"></IconComponent>
					<span class="line-clamp-2 leading-tight" title={name}>{name}</span>
				</a>
			</li>
		{/each}
	</ul>
</div>
