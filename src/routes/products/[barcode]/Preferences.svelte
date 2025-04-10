<script lang="ts">

	type Attribute = {
		id: string;
		name: string;
		grade: string;
		title: string;
		description_short?: string;
		icon_url?: string;
	};
	type ProductAttribute = {
		id: string;
		name: string;
		attributes: Attribute[];
	};
	type ProductAttributes = {
		productAttributes: ProductAttribute[];
	};

	const { productAttributes = [] } = $props<{
		productAttributes: ProductAttributes;
	}>();

</script>

<div class="flex w-full justify-between gap-3 max-md:flex-col lg:max-h-32">
	<h2 class="mb-4 text-xl font-bold">Product Preferences</h2>

	<!-- product preferences will be listed here -->
</div>
