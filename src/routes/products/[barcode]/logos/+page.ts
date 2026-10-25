import type { PageLoad } from './$types';
import { createRobotoffApi } from '#lib/api.js';
import { PUBLIC_IMAGES_URL } from '$app/env/public';

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const response = await createRobotoffApi(fetch).searchLogos({
			barcode: params.barcode,
			annotated: false
		});
		const data = response.data as
			| {
					logos?: Array<{
						id?: number;
						source_image?: string;
						annotation_type?: string;
						annotation_value?: string;
						score?: number;
					}>;
			  }
			| undefined;

		return {
			barcode: params.barcode,
			logos:
				data?.logos
					?.filter((logo): logo is typeof logo & { id: number } => logo.id != null)
					.map((logo) => ({
						logo_id: logo.id,
						image_url: logo.source_image
							? `${PUBLIC_IMAGES_URL}/images/products${logo.source_image}`
							: undefined,
						type: logo.annotation_type,
						value: logo.annotation_value,
						confidence: logo.score
					})) ?? []
		};
	} catch (err) {
		console.error('Error fetching logos for annotation:', err);
		return { barcode: params.barcode, logos: [], error: 'Unable to load logo detections' };
	}
};
