import { writable } from 'svelte/store';

export type NutriPatrolFlagConfig = {
	barcode: string;
	imageId?: string;
	url?: string;
	type?: 'product' | 'image' | 'search';
	flavor?: 'off' | 'obf' | 'opff' | 'opf' | 'off-pro';
};

export const nutripatrolFlagStore = writable<NutriPatrolFlagConfig | null>(null);

export function openNutriPatrolFlag(config: NutriPatrolFlagConfig) {
	nutripatrolFlagStore.set(config);
}

export function closeNutriPatrolFlag() {
	nutripatrolFlagStore.set(null);
}
