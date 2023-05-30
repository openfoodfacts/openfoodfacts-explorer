import type { Nutriments } from './nutriments';

export type ProductState = {
	code: string;
	status: number;
	status_verbose: string;
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

export type KnowledgePanel = {
	type: 'card' | 'inline';
	expanded: boolean;
	expand_for: string;
	title_element: {
		title: string;
		grade: 'a' | 'b' | 'c' | 'd' | 'e' | 'unknown';
		icon_url: string;
		icon_color_from_evaluation: string;
		icon_size: string;
		type: string;
	};
	elements: KnowledgeElement[];
	topics: string[];
	level: string;
	size?: 'small';
};

export type KnowledgeElement =
	| KnowledgeTextElement
	| KnowledgeImageElement
	| KnowledgePanelGroupElement
	| KnowledgePanelElement
	| KnowledgeTableElement
	| KnowledgeActionElement;

interface KnowledgeElementBase {
	element_type: 'text' | 'image' | 'panel_group' | 'panel' | 'table' | 'action';
}

export type KnowledgeTextElement = KnowledgeElementBase & {
	element_type: 'text';
	text_element: {
		type: 'summary' | 'warning' | 'notes';
		html: string;
		language: string;
		lc: string;
		edit_field_id: string;
		edit_field_type: string;
		edit_field_value: string;
		source_url: string;
		source_text: string;
		source_lc: string;
		source_language: string;
	};
};

export type KnowledgeImageElement = KnowledgeElementBase & {
	element_type: 'image';
	image_element: {
		url: string;
		width: number;
		height: number;
		alt_text: string;
	};
};

export type KnowledgePanelGroupElement = KnowledgeElementBase & {
	element_type: 'panel_group';
	panel_group_element: {
		title: string;
		panel_ids: string[];
	};
};

export type KnowledgePanelElement = KnowledgeElementBase & {
	element_type: 'panel';
	panel_element: {
		panel_id: string;
	};
};

export type KnowledgeTableElement = KnowledgeElementBase & {
	element_type: 'table';
	table_element: {
		id: string;
		title: string;
		rows: {
			values: { text: string; evaluation?: string }[];
		}[];
		columns: {
			type: string;
			text: string;
			text_for_small_screen: string;
			style: string;
			column_group_id: string;
			shown_by_default: boolean;
		}[];
	};
};

export type KnowledgeActionElement = KnowledgeElementBase & {
	element_type: 'action';
	action_element: {
		actions: string[];
		html: string;
	};
};
