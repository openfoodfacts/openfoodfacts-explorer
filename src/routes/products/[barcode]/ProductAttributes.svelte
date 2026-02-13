<script lang="ts">
	import { personalizedSearch, type AttributePreference } from '$lib/stores/preferencesStore';
	import { get } from 'svelte/store';

	import type { ProductAttributeV2 } from '@openfoodfacts/openfoodfacts-nodejs';
	import type { ProductGroupedAttributes } from './types';

	type Props = {
		groups: ProductGroupedAttributes[];
		defaultPreferences: AttributePreference[];
	};

	const { groups, defaultPreferences }: Props = $props();

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

	function shouldShowAttribute(attr: ProductAttributeV2) {
		const attributeId = attr.id!.toLowerCase();

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

{#snippet attributeCard(attribute: ProductAttributeV2)}
	{@const colors = getColorStyle(attribute.grade ?? 'unknown')}
	<div class="indicator mt-4 h-20 w-full">
		<div class="indicator-item indicator-top indicator-center badge badge-soft badge-primary">
			<div>{attribute.name}</div>
		</div>

		<div
			class="m-1 flex h-full w-full items-center justify-start gap-4 rounded-lg p-4 {colors.bgColor}"
			title={attribute.title}
		>
			<img alt={attribute.title} src={attribute.icon_url} class="h-15 w-15 object-contain" />
			<div>
				<p class="text-sm font-semibold {colors.textColor}">{attribute.title}</p>
				<p class="text-xs text-black">{attribute.description_short}</p>
			</div>
		</div>
	</div>
{/snippet}

<div class="my-4">
	<h2 class="mb-4 text-center text-3xl font-bold">Attributes</h2>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each groups.flatMap((it) => it.attributes).filter(shouldShowAttribute) as attr (attr.id)}
			{@render attributeCard(attr)}
		{/each}
	</div>
</div>
