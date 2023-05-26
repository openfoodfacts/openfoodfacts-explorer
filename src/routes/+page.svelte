<script lang="ts">
	let barcode: string;
</script>

<div class="container xl:max-w-6xl mx-auto my-4 flex justify-center">
	<div class="form-control">
		<div class="input-group">
			<input type="text" bind:value={barcode} class="input input-bordered" placeholder="Barcode" />

			<button
				class="btn btn-square px-10"
				on:click={() => (window.location.href = '/product/' + barcode)}
				disabled={barcode == null || barcode == ''}
			>
				Go
			</button>
		</div>
	</div>
</div>
