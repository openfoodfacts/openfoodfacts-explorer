export type Currency =
	| 'EUR'
	| 'USD'
	| 'GBP'
	| 'JPY'
	| 'CNY'
	| 'INR'
	| 'AUD'
	| 'CAD'
	| 'CHF'
	| 'HKD';

export type OsmType = 'NODE' | 'WAY' | 'RELATION';

export interface NewPrice {
	price: number;
	currency: Currency;
	location_osm_id: number;
	location_osm_type: OsmType | undefined;
	date: string;
	proof_id: number;
}
