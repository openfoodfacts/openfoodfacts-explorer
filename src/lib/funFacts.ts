/**
 * Fun facts shown on the contributor dashboard.
 *
 * Each fact has a translation key under `landing.facts.*` and an English fallback.
 * Keep them evergreen: no counters or dates that go stale.
 */
export const FUN_FACTS = [
	{
		key: 'open_license',
		fallback:
			'Open Food Facts data is published under the Open Database License, so anyone can reuse it: researchers, app makers and curious people alike.'
	},
	{
		key: 'nutri_score',
		fallback:
			'The Nutri-Score is computed from the nutrition facts of a product, so every table you complete can unlock a score.'
	},
	{
		key: 'ocr',
		fallback:
			'A clear photo of the ingredients list lets text recognition pre-fill the ingredients for you.'
	},
	{
		key: 'founded',
		fallback: 'Open Food Facts started in 2012 and is built by volunteers all around the world.'
	},
	{
		key: 'nova',
		fallback:
			'The NOVA group tells how processed a food is, and it is worked out from the ingredients list.'
	},
	{
		key: 'photos',
		fallback:
			'Front, ingredients and nutrition photos are the fastest way to make a product complete.'
	},
	{
		key: 'barcode_prefix',
		fallback:
			'The first digits of a barcode tell which GS1 office issued it: 30 to 37 is France, 80 to 83 is Italy, 40 to 44 is Germany. It is where the brand registered, not always where the product is made.'
	},
	{
		key: 'check_digit',
		fallback:
			'The last digit of a barcode is a check digit computed from the others. It is how scanners notice a misread.'
	},
	{
		key: 'sister_projects',
		fallback:
			'The same idea powers Open Beauty Facts, Open Products Facts and Open Pet Food Facts, for cosmetics, everyday objects and pet food.'
	},
	{
		key: 'non_profit',
		fallback: 'Open Food Facts is run by a non-profit association, and anyone can join and help.'
	},
	{
		key: 'producers',
		fallback:
			'Brands and retailers can share their own product data through the Producers Platform, and those accounts start with “org-”.'
	},
	{
		key: 'per_100g',
		fallback:
			'Nutrition values are stored per 100 g or 100 ml, which is what makes two products comparable at a glance.'
	},
	{
		key: 'allergens',
		fallback:
			'Allergens are detected from the ingredients list, and you can also add the “may contain” traces.'
	},
	{
		key: 'e_numbers',
		fallback: 'Additives are listed by E-number, and E300 is simply vitamin C.'
	},
	{
		key: 'vegan',
		fallback:
			'Vegan and vegetarian hints are derived from the ingredients, so a complete list improves them for free.'
	},
	{
		key: 'packaging',
		fallback:
			'You can describe each part of a package (bottle, cap, label) and its material to help recycling insights.'
	},
	{
		key: 'robotoff',
		fallback:
			'Robotoff, the Open Food Facts AI, suggests corrections and asks quick questions that anyone can answer in seconds.'
	},
	{
		key: 'api',
		fallback:
			'There is a free public API and data exports, so apps you use every day can be built on top of the database.'
	},
	{
		key: 'open_prices',
		fallback:
			'Open Prices lets you share the prices you see in shops, so they can be compared over time.'
	},
	{
		key: 'custom_properties',
		fallback:
			'Contributors can add custom properties to a product, for details the standard fields do not cover.'
	},
	{
		key: 'edit_anyone',
		fallback:
			'Every edit is visible to everyone, and you can always correct a product that someone else filled in.'
	},
	{
		key: 'berries',
		fallback:
			'Botanically, bananas are berries and strawberries are not: a banana grows from a single ovary, a strawberry from many.'
	},
	{
		key: 'peanuts',
		fallback: 'Peanuts are not nuts but legumes, and their pods ripen underground.'
	},
	{
		key: 'banana_radioactive',
		fallback:
			'Bananas are slightly radioactive thanks to their potassium, but the dose is far too small to matter: your body keeps its potassium level steady.'
	},
	{
		key: 'honey',
		fallback:
			'Sealed honey hardly ever spoils: it is so rich in sugar and so low in water that bacteria struggle to grow in it.'
	},
	{
		key: 'first_barcode',
		fallback:
			'The first product ever scanned at a supermarket checkout was a pack of Wrigley’s chewing gum, in Troy, Ohio, in 1974.'
	},
	{
		key: 'nutri_score_2014',
		fallback:
			'Open Food Facts has been computing the Nutri-Score since 2014, long before it appeared on packs in shops.'
	}
] as const;

export type FunFactKey = (typeof FUN_FACTS)[number]['key'];
