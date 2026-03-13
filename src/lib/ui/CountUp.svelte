<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';

	interface Props {
		value: number;
		duration?: number;
	}

	let { value, duration = 1500 }: Props = $props();

	const count = new Tween(0, { easing: cubicOut });

	let element: HTMLElement | undefined = $state();
	let display = $state(0);
	let hasStarted = false;

	$effect(() => {
		display = Math.floor(count.current);
	});

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !hasStarted) {
					count.set(value, { duration });
					hasStarted = true;
					observer.disconnect();
				}
			},
			{ threshold: 0.1 }
		);

		if (element) observer.observe(element);

		return () => observer.disconnect();
	});
</script>

<span bind:this={element}>
	{Intl.NumberFormat().format(display)}
</span>
