export async function getLocation(): Promise<GeolocationPosition> {
	return new Promise((resolve, reject) => {
		if (!navigator.geolocation) {
			reject(new Error('Geolocation is not supported by your browser'));
			return;
		}

		navigator.geolocation.getCurrentPosition(resolve, reject, {
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 0
		});
	});
}

export type OverpassAPIResult = {
	version: number;
	generator: string;
	osm3s: { timestamp_osm_base: string; copyright: string };
	elements: {
		type: string;
		id: number;
		lat: number;
		lon: number;
		tags: Record<string, string>;
	}[];
};

export async function getNearStores(radius: number = 1000): Promise<OverpassAPIResult> {
	const location = await getLocation();
	const { latitude, longitude } = location.coords;

	const query = `
		[out:json][timeout:90];
		(
			nwr["shop"="supermarket"](around:${radius},${latitude},${longitude});
			nwr["shop"="convenience"](around:${radius},${latitude},${longitude});
		);
		out center;
	`;

	const response = await fetch('https://overpass-api.de/api/interpreter', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: 'data=' + encodeURIComponent(query)
	});

	if (!response.ok) {
		throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data as OverpassAPIResult;
}

export async function idToName(fetch: typeof window.fetch, id: number): Promise<string> {
	const res = await fetch('https://overpass-api.de/api/interpreter', {
		method: 'POST',
		body: 'data=' + encodeURIComponent(`[out:json][timeout:90];(nwr(id:${id}););out tags;`)
	}).then((data) => data.json());
	console.debug(res);

	if (res.elements.length === 0) {
		return 'Unknown';
	}

	const tags = res.elements[0].tags;
	let name = tags.name;
	if (name === undefined) {
		name = tags['brand:name'];
	}
	if (name === undefined) {
		name = tags['brand'];
	}

	return name;
}
