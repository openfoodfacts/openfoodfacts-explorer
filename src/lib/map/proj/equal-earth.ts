/*
 * Equal Earth formulas adapted from d3-geo.
 *
 * Copyright 2010-2024 Mike Bostock
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose
 * with or without fee is hereby granted, provided that the above copyright notice
 * and this permission notice appear in all copies.
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
 * OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
 * TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
 * THIS SOFTWARE.
 */

import type * as Leaflet from 'leaflet';

const A1 = 1.340264;
const A2 = -0.081106;
const A3 = 0.000893;
const A4 = 0.003796;
const M = Math.sqrt(3) / 2;
const RAD = Math.PI / 180;
const MAX_THETA = Math.PI / 3;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function polynomial(theta: number) {
	const t2 = theta * theta;
	const t6 = t2 * t2 * t2;
	return {
		value: A1 + A2 * t2 + t6 * (A3 + A4 * t2),
		derivative: A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)
	};
}

/** Project longitude and latitude in degrees to unit-sphere coordinates. */
export function projectEqualEarth(lng: number, lat: number): [number, number] {
	const theta = Math.asin(M * Math.sin(clamp(lat, -90, 90) * RAD));
	const { value, derivative } = polynomial(theta);
	return [(lng * RAD * Math.cos(theta)) / (M * derivative), theta * value];
}

/** Unproject unit-sphere coordinates to longitude and latitude in degrees. */
export function unprojectEqualEarth(x: number, y: number): [number, number] {
	const maxY = MAX_THETA * polynomial(MAX_THETA).value;
	const targetY = clamp(y, -maxY, maxY);
	let theta = targetY;
	for (let i = 0; i < 12; i++) {
		const { value, derivative } = polynomial(theta);
		const delta = (theta * value - targetY) / derivative;
		theta -= delta;
		if (Math.abs(delta) < 1e-12) break;
	}
	const { derivative } = polynomial(theta);
	return [
		(M * x * derivative) / Math.cos(theta) / RAD,
		Math.asin(clamp(Math.sin(theta) / M, -1, 1)) / RAD
	];
}

/** Create a Leaflet CRS for the Equal Earth projection. */
export function equalEarthCrs(L: typeof import('leaflet')): Leaflet.CRS {
	const [maxX] = projectEqualEarth(180, 0);
	const [, maxY] = projectEqualEarth(0, 90);
	const crs = {
		...L.CRS.Earth,
		// Spherical Equal Earth, centered on the Greenwich meridian.
		projection: {
			project(latlng: Leaflet.LatLng) {
				return L.point(...projectEqualEarth(latlng.lng, latlng.lat));
			},
			unproject(point: Leaflet.Point) {
				const [lng, lat] = unprojectEqualEarth(point.x, point.y);
				return L.latLng(lat, lng);
			},
			bounds: L.bounds(L.point(-maxX, -maxY), L.point(maxX, maxY))
		},
		transformation: L.transformation(1 / (2 * maxX), 0.5, -1 / (2 * maxX), 0.5)
	};
	return crs;
}
