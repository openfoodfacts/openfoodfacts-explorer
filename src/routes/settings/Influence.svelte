<script lang="ts">
	export let value: number;
	export let id: string;
</script>

<div>
	<input type="range" {id} min="0" max="100" class="range" step="20" bind:value />
	<div class="w-full flex justify-between text-xs px-2">
		<span>0%</span>
		<span>100%</span>
	</div>
</div>
