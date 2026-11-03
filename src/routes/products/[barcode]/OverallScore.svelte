<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		score: number;
		matches: boolean;
		title: string;
		linkLabel: string;
		href: string;
		children?: Snippet;
	};

	let { score, matches, title, linkLabel, href, children }: Props = $props();

	let color = $derived(
		!matches || score < 25
			? 'progress-error'
			: score >= 50
				? 'progress-success'
				: 'progress-warning'
	);
</script>

<div class="rounded-box bg-base-content/5 p-4">
	<div class="flex flex-wrap items-baseline gap-x-3">
		<h2 class="text-lg font-bold">{title}</h2>
		<span class="whitespace-nowrap">
			<span class="text-2xl font-bold">{score}</span>
			<span class="text-sm text-base-content/60">/ 100</span>
		</span>
		<a {href} class="ml-auto font-semibold text-secondary">{linkLabel}&nbsp;›</a>
	</div>
	{@render children?.()}
	<progress class={['progress mt-3 h-2', color]} value={score} max="100" aria-label={title}
	></progress>
</div>
