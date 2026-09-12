<script lang="ts">
	type Props = {
		page: number;
		totalPages: number;
		pageUrl: (p: number) => string;
		onPageChange?: (page: number) => void;
	};
	let { page, totalPages, pageUrl, onPageChange }: Props = $props();

	function handlePageChange(event: MouseEvent, nextPage: number) {
		if (!onPageChange) return;

		event.preventDefault();
		onPageChange(nextPage);
	}
</script>

<!-- Pagination -->
<div class="join w-full justify-center">
	{#if page > 1}
		<a href={pageUrl(1)} class="btn join-item" onclick={(event) => handlePageChange(event, 1)}>
			1
		</a>
	{/if}
	{#if page > 3}
		<span class="btn btn-disabled join-item" aria-hidden="true">...</span>
	{/if}

	{#if page > 2}
		<a
			href={pageUrl(page - 1)}
			class="btn join-item"
			onclick={(event) => handlePageChange(event, page - 1)}
		>
			{page - 1}
		</a>
	{/if}

	<span class="btn btn-active join-item" aria-current="page">{page}</span>

	{#if totalPages > page + 1}
		<a
			href={pageUrl(page + 1)}
			class="btn join-item"
			onclick={(event) => handlePageChange(event, page + 1)}
		>
			{page + 1}
		</a>
	{/if}

	{#if totalPages > page + 2}
		<span class="btn btn-disabled join-item" aria-hidden="true">...</span>
	{/if}

	{#if totalPages > page}
		<a
			href={pageUrl(totalPages)}
			class="btn join-item"
			onclick={(event) => handlePageChange(event, totalPages)}
		>
			{totalPages}
		</a>
	{/if}
</div>
