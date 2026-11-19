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

	let tone = $derived<'error' | 'success' | 'warning'>(
		!matches || score < 25 ? 'error' : score >= 50 ? 'success' : 'warning'
	);
	const toneClasses = {
		error: { text: 'text-error', background: '[--score-accent:var(--color-error)]' },
		success: { text: 'text-success', background: '[--score-accent:var(--color-success)]' },
		warning: { text: 'text-warning', background: '[--score-accent:var(--color-warning)]' }
	};
</script>

<div
	class={[
		'rounded-box bg-[color:color-mix(in_oklab,var(--score-accent)_5%,color-mix(in_oklab,var(--color-base-content)_5%,transparent))] p-4',
		toneClasses[tone].background
	]}
>
	<div class="flex items-center gap-3">
		<div
			class={[
				'radial-progress text-sm inset-ring-4 inset-ring-base-content/12 [--size:3rem] [--thickness:4px]',
				toneClasses[tone].text
			]}
			style="--value:{score}"
			role="progressbar"
			aria-valuenow={score}
			aria-valuemin="0"
			aria-valuemax="100"
			aria-label={title}
		>
			<span class="font-bold text-base-content">{score}</span>
		</div>
		<div class="min-w-0 flex-1">
			<h2 class="text-base font-bold">{title}</h2>
		</div>
		<a {href} class="max-w-[45%] text-right text-sm font-semibold text-secondary"
			>{linkLabel}&nbsp;›</a
		>
	</div>
	{@render children?.()}
</div>
