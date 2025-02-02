<script lang="ts">
	interface Props {
		value: number;
		id: string;
	}

	let { value = $bindable(), id }: Props = $props();
</script>

<div>
	<input type="range" {id} min="0" max="100" class="range" step="20" bind:value />
	<div class="flex w-full justify-between px-2 text-xs">
		<span>0%</span>
		<span>100%</span>
	</div>
</div>
