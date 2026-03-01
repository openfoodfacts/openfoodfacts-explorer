<script lang="ts">
	type Props = { page: number; totalPages: number; pageUrl: (p: number) => string };
	let { page, totalPages, pageUrl }: Props = $props();
</script>

<!-- Pagination -->
<div class="join w-full justify-center">
	{#if page > 1}
		<a href={pageUrl(1)} class="btn join-item"> 1 </a>
	{/if}
	{#if page > 3}
		<span class="btn btn-disabled join-item" aria-hidden="true">...</span>
	{/if}

	{#if page > 2}
		<a href={pageUrl(page - 1)} class="btn join-item">
			{page - 1}
		</a>
	{/if}

	<span class="btn join-item btn-active">{page}</span>

	{#if totalPages > page + 1}
		<a href={pageUrl(page + 1)} class="btn join-item"> {page + 1}</a>
	{/if}

	{#if totalPages > page + 2}
		<span class="btn btn-disabled join-item" aria-hidden="true">...</span>
	{/if}

	{#if totalPages > page}
		<a href={pageUrl(totalPages)} class="btn join-item"> {totalPages} </a>
	{/if}
</div>
