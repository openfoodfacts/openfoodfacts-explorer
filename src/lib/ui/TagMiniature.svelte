<script lang="ts">
	type Props = {
		src?: string | null;
		alt?: string;
		size?: 'xs' | 'sm' | 'md' | 'lg';
		class?: string;
	};

	let { src, alt = '', size = 'md', class: className = '' }: Props = $props();

	let hasError = $state(false);

	$effect(() => {
		void src;
		hasError = false;
	});

	const sizeClasses = {
		xs: 'h-3.5 w-3.5',
		sm: 'h-4 w-4',
		md: 'h-5 w-5',
		lg: 'h-6 w-6'
	};
</script>

{#if src && !hasError}
	<img
		{src}
		alt={alt || ''}
		loading="lazy"
		decoding="async"
		class={[
			'inline-block shrink-0 rounded-xs object-contain dark:invert',
			sizeClasses[size] || sizeClasses.md,
			className
		]}
		onerror={() => {
			hasError = true;
		}}
	/>
{/if}
