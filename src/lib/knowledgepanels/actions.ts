import { resolve } from '$app/paths';

const EDIT_SECTIONS: Record<string, string> = {
	edit_product: '',
	add_categories: '#categories',
	add_ingredients_text: '#ingredients',
	add_packaging_components: '#add-packaging-component',
	add_origins: '#origins',
	add_recycling_instructions: '#recycling',
	add_quantity: '#quantity',
	add_packaging_image: '#images',
	add_ingredients_image: '#images',
	add_nutrition_facts: '#nutrition'
};

export function getEditActionHref(action: string, code: string): string | undefined {
	const section = EDIT_SECTIONS[action];
	if (section == null) return undefined;
	return resolve('/products/[barcode]/edit', { barcode: code }) + section;
}
