<script lang="ts">
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';

	type Props = {
		text: string;
		/** Side on which the tooltip opens. Use e.g. `right` when the icon sits at the edge of the viewport. */
		position?: 'top' | 'bottom' | 'left' | 'right';
	};

	let { text, position = 'top' }: Props = $props();

	// Full class names so Tailwind can detect them
	const positionClasses = {
		top: 'tooltip-top',
		bottom: 'tooltip-bottom',
		left: 'tooltip-left',
		right: 'tooltip-right'
	} as const;

	const tooltipContentClasses = [
		'[&:before]:max-w-[160px]',
		'[&:before]:whitespace-pre-wrap',
		'[&:before]:break-words',
		'[&:before]:text-[0.65rem]',
		'[&:before]:p-1.5',
		'[&:before]:leading-tight',
		'[&:before]:sm:max-w-[180px]',
		'[&:before]:sm:text-xs',
		'[&:before]:sm:p-2'
	].join(' ');
</script>

<div
	class="tooltip {positionClasses[position]} {tooltipContentClasses} z-50 tooltip-primary"
	data-tip={text}
>
	<button
		type="button"
		class="btn h-5 min-h-0 w-5 rounded-full btn-ghost p-0 transition-colors duration-200 btn-xs hover:bg-primary/10"
		aria-label="More information"
	>
		<IconMdiHelpCircleOutline
			class="h-4 w-4 text-primary transition-colors duration-200 hover:text-primary/70"
		/>
	</button>
</div>
