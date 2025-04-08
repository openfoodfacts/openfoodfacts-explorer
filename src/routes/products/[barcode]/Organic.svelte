<script lang="ts">
	let { productAttributes }: { productAttributes: any } = $props();
	
	const ORGANIC_MAP: Record<
		string,
		{ textColor: string; bgColor: string }
	> = {
		"a": {
			textColor: 'text-green-700',
			bgColor: 'bg-green-100 hover:bg-green-200'
		},
		"e": {
			textColor: 'text-red-700',
			bgColor: 'bg-red-100 hover:bg-red-200'
		},
		"unknown": {
			textColor: 'text-black',
			bgColor: 'bg-gray-200 hover:bg-gray-300'
		}
	};
	
	const { grade, title, description_short, icon_url } = $derived(productAttributes);
	const { textColor, bgColor } = $derived(ORGANIC_MAP[grade]);

</script>

<div
	class="flex h-full w-full items-center justify-evenly gap-4 rounded-xl p-4 md:max-lg:flex-col {bgColor}"
>
	<img alt="Organic" src="{icon_url}" class="h-20 transition-all duration-75 hover:brightness-90" />
	<div class="flex flex-col">
		<div class="{textColor} text-xl font-semibold">{title}</div>
		<div class="text-sm text-black">{description_short}</div>
	</div>
</div>
