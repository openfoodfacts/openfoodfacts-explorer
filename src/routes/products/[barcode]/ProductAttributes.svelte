<script lang="ts">
	import type { ProductAttribute, ProductAttributeGroup } from '$lib/api/product';
	import { personalizedSearch, type AttributePreference } from '$lib/stores/preferencesStore';
	import { get } from 'svelte/store';

	type Props = {
		groups: ProductAttributeGroup[];
		defaultPreferences: AttributePreference[];
	};

	const { groups: productGroups, defaultPreferences }: Props = $props();

	function getColorStyle(grade: string) {
		const normalizedGrade = grade.toLowerCase();
		return COLOR_MAP[normalizedGrade] ?? COLOR_MAP['unknown'];
	}

	const COLOR_MAP: Record<string, { textColor: string; bgColor: string }> = {
		a: {
			textColor: 'text-green-700',
			bgColor: 'bg-green-100 hover:bg-green-200'
		},
		b: {
			textColor: 'text-green-700',
			bgColor: 'bg-green-100 hover:bg-green-200'
		},
		c: {
			textColor: 'text-yellow-800',
			bgColor: 'bg-orange-100 hover:bg-orange-200'
		},
		d: {
			textColor: 'text-red-700',
			bgColor: 'bg-red-100 hover:bg-red-200'
		},
		e: {
			textColor: 'text-red-700',
			bgColor: 'bg-red-100 hover:bg-red-200'
		},
		unknown: {
			textColor: 'text-black',
			bgColor: 'bg-gray-200 hover:bg-gray-300'
		}
	};

	function shouldShowAttribute(attr: ProductAttribute) {
		const attributeId = attr.id.toLowerCase();

		let preferences = get(personalizedSearch).userPreferences;
		if (preferences.length === 0) {
			preferences = defaultPreferences;
		}

		const attribute = preferences.find((pref) => pref.attributeId === attributeId);
		if (attribute == null) {
			return false;
		}

		const { value } = attribute;
		if (value === 'not_important') {
			return false;
		}

		return true;
	}
</script>

<div class="my-8">
	<h2 class="mb-4 text-center text-3xl font-bold">Attributes</h2>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each productGroups as group (group.id)}
			{#each group.attributes as attr (attr.id)}
				{#if shouldShowAttribute(attr)}
					{@const colors = getColorStyle(attr.grade)}
					<div class="indicator mt-4 h-20 w-full">
						<div
							class="indicator-item indicator-top indicator-center badge badge-soft badge-primary"
						>
							<div>{group.name}</div>
							{#if group.warning}
								<div class="tooltip" data-tip={group.warning}>
									<span class="icon-[mdi--warning] text-orange-400 dark:text-orange-300"></span>
								</div>
							{/if}
						</div>

						<div
							class="m-1 flex h-full w-full items-center justify-start gap-4 rounded-lg p-4 {colors.bgColor}"
							title={attr.title}
						>
							<img alt={attr.title} src={attr.icon_url} class="h-15 w-15 object-contain" />
							<div>
								<p class="text-sm font-semibold {colors.textColor}">{attr.title}</p>
								<p class="text-xs text-black">{attr.description_short}</p>
							</div>
						</div>
					</div>
				{/if}
			{/each}
		{/each}
	</div>
</div>
