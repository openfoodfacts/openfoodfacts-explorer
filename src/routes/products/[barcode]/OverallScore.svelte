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
		!matches || score < 25 ? 'text-error' : score >= 50 ? 'text-success' : 'text-warning'
	);
</script>

<div class="flex items-center gap-3 rounded-box bg-base-content/5 p-4">
	<div
		class={['radial-progress text-sm inset-ring-4 inset-ring-base-content/12', color]}
		style="--value:{score}; --size:3rem; --thickness:4px"
		role="progressbar"
		aria-valuenow={score}
		aria-valuemin="0"
		aria-valuemax="100"
		aria-label={title}
	>
		<span class="font-bold text-base-content">{score}</span>
	</div>
	<div class="min-w-0 flex-1">
		<h2 class="text-lg font-bold">{title}</h2>
		{@render children?.()}
	</div>
	<a {href} class="max-w-[45%] text-right font-semibold text-secondary">{linkLabel}&nbsp;›</a>
</div>
