<script lang="ts">
	const { productAttributes = [] } = $props<{
		productAttributes: {
			id: string;
			name: string;
			attributes: {
				id: string;
				name: string;
				grade: string;
				title: string;
				description_short?: string;
				icon_url?: string;
			}[];
		}[];
	}>();

	console.log(productAttributes);
</script>

<div class="flex w-full justify-between gap-3 max-md:flex-col lg:max-h-32">
	<h2 class="mb-4 text-xl font-bold">Product Preferences</h2>

	<!-- product preferences will be listed here -->
</div>
