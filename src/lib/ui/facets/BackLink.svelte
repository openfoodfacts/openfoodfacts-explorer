<script lang="ts">
	import IconMdiArrowLeft from '@iconify-svelte/mdi/arrow-left';

	type Props = {
		href: string;
		label: string;
	};

	let { href, label }: Props = $props();
</script>

<a {href} class="btn w-full btn-outline btn-secondary">
	<IconMdiArrowLeft class="h-4 w-4 shrink-0" />
	{label}
</a>
