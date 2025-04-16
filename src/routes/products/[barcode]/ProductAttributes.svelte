<script lang="ts">
	import type { Attribute, ProductAttribute, ProductAttributes } from '$lib/api/product';

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

	interface Props {
		productAttributes: ProductAttributes;
	}

	const { productAttributes }: Props = $props();

	function getAttributeByName(name: string): Attribute | undefined {
		const attributeGroup = productAttributes.find((pa: ProductAttribute) =>
			pa.name.toLowerCase().includes(name.toLowerCase())
		);
		return attributeGroup?.attributes[0];
	}

	function getColorStyle(grade: string) {
		const normalizedGrade = grade.toLowerCase();
		return COLOR_MAP[normalizedGrade] ?? COLOR_MAP['unknown'];
	}

	let nutriScore = $derived(getAttributeByName('nutri'));
	let novaScore = $derived(getAttributeByName('processing'));
	let greenScore = $derived(getAttributeByName('environment'));
	let organicScore = $derived(getAttributeByName('labels'));

	function scoreCard(attribute: Attribute | undefined, href: string) {
		if (!attribute) return null;

		const colors = getColorStyle(attribute.grade);

		return {
			href,
			icon: attribute.icon_url,
			title: attribute.title,
			description: attribute.description_short,
			textColor: colors.textColor,
			bgColor: colors.bgColor
		};
	}

	type CardData = {
		href: string;
		icon: string;
		title: string;
		description: string;
		textColor: string;
		bgColor: string;
	};

	const cards = $derived(
		[
			scoreCard(nutriScore, '#health_card'),
			scoreCard(novaScore, '#nova'),
			scoreCard(greenScore, '#environment_card'),
			scoreCard(organicScore, '#')
		].filter((card): card is CardData => card !== null)
	);
</script>

{#snippet productAttributesCard(card: CardData)}
	<a href={card.href} class="md:w-full">
		<div
			class="flex h-full w-full items-center justify-evenly gap-4 rounded-lg p-4 text-center md:max-lg:flex-col {card.bgColor}"
		>
			{#if card.icon}
				<img alt={card.title} src={card.icon} class="h-16" />
			{/if}
			<div class="flex flex-col">
				<div class="text-xl font-semibold {card.textColor}">{card.title}</div>
				{#if card.description}
					<div class="text-sm text-black">{card.description}</div>
				{/if}
			</div>
		</div>
	</a>
{/snippet}

<div>
	<h2 class="mb-4 text-center text-3xl font-bold">Product Preferences</h2>
	<div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
		{#each cards as card (card.href)}
			{@render productAttributesCard(card)}
		{/each}
	</div>
</div>
