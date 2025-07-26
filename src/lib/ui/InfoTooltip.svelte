<script lang="ts">
	type Props = {
		text: string;
		position?: 'top' | 'bottom' | 'left' | 'right';
	};

	let { text }: Props = $props();

	const getTooltipContentClasses = () => {
		return [
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
	};
</script>

<div
	class="tooltip tooltip-bottom {getTooltipContentClasses()} tooltip-primary z-50"
	data-tip={text}
>
	<button
		type="button"
		class="btn btn-ghost btn-xs hover:bg-primary/10 h-5 min-h-0 w-5 rounded-full p-0 transition-colors duration-200"
		aria-label="More information"
	>
		<span
			class="icon-[mdi--help-circle-outline] text-primary hover:text-primary/70 h-4 w-4 transition-colors duration-200"
		></span>
	</button>
</div>
