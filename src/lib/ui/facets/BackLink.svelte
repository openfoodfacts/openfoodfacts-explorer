<script lang="ts">
	import IconMdiArrowLeft from '@iconify-svelte/mdi/arrow-left';

	type Props = {
		href: string;
		label: string;
	};

	let { href, label }: Props = $props();
</script>

<a {href} class="btn btn-circle shrink-0 btn-ghost" aria-label={label} title={label}>
	<IconMdiArrowLeft class="h-5 w-5" aria-hidden="true" />
</a>
