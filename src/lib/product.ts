export type ProductState = {
	code: string;
	status: number;
	status_verbose: string;
	product: {
		product_name: string;
		product_name_en: string;
		_id: string;
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
		quantity: string;
		nutriscore_grade: string;
	};
};
