import type { LayoutLoad } from './$types';
import { createRobotoffApi } from '$lib/api';
import { PUBLIC_IMAGES_URL } from '$env/static/public';

async function getLogos(barcode: string, fetch: typeof window.fetch) {
	try {
		const robotoff = createRobotoffApi(fetch);
		const response = await robotoff.searchLogos({ barcode });

		console.log('Raw logos response:', response.data);

		return (
			response.data?.logos?.map((logo: any) => {

				const image_url =
					logo.source_image
						? `${PUBLIC_IMAGES_URL}/images/products${logo.source_image}`
						: undefined;
						
				return {
					logo_id: logo.id,
					image_url,
					type: logo.annotation_type ?? undefined,
					value: logo.annotation_value ?? undefined,
					confidence: logo.score ?? 0
				};
			}) ?? []
		);
	} catch (err) {
		console.error('Error fetching logos:', err);
		return [];
	}
}

export const load: LayoutLoad = async ({ params, fetch }) => {
	const logos = await getLogos(params.barcode, fetch);

	return {
		barcode: params.barcode,
		logos,
		logoCount: logos.length
	};
};