import type { KnowledgePanel } from './knowledgepanels/knowledgepanels';
import type { Nutriments } from './nutriments';

export type ProductState = {
	status: 'success' | 'success_with_warnings' | 'success_with_errors' | 'failure';
	result: {
		id: string;
		name: string;
		lc_name: string;
	};
	errors: object[];
	warnings: object[];

	product: {
		knowledge_panels: Record<string, KnowledgePanel>;
		product_name: string;
		product_name_en: string;
		_id: string;
		code: string;
		_keywords: string[];
		additives_n: number;
		ingredients: {
			id: string;
			percent: number;
			percent_estimate: number;
			percent_max: number;
			percent_min: number;
			text: string;
			vegan: string;
			vegetarian: string;
		}[];
		additives_tags: string[];

		image_front_url: string;
		image_front_small_url: string;
		image_front_thumb_url: string;

		image_ingredients_url: string;
		image_ingredients_small_url: string;
		image_ingredients_thumb_url: string;

		image_nutrition_url: string;
		image_nutrition_small_url: string;
		image_nutrition_thumb_url: string;

		quantity: string;
		nutriscore_grade: string;
		ecoscore_grade: string;
		nova_group: number;

		brands: string;
		brands_tags: string[];

		categories: string;
		categories_tags: string[];

		stores: string;
		stores_tags: string[];

		labels: string;
		labels_tags: string[];

		nutriments: Nutriments;
	};
};
