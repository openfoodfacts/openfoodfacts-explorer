<script lang="ts">
	export let value: number;
	export let id: string;
</script>

<div>
	<input type="range" {id} min="0" max="100" class="range" step="20" bind:value />
	<div class="flex w-full justify-between px-2 text-xs">
		<span>0%</span>
		<span>100%</span>
	</div>
</div>
