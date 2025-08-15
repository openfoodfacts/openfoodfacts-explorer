<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h2 class="text-3xl font-bold">Exploring Facets</h2>

<div class="mt-8">
	<ul class="menu w-full gap-2">
		{#each data.facets as { taxo, icon, name } (taxo)}
			<li class="w-full">
				<a href={`/facets/${taxo}`} class="flex items-center text-xl font-semibold">
					<span class="me-4 {icon}"></span>
					<span> {name} </span>
				</a>
			</li>
		{/each}
	</ul>
</div>
