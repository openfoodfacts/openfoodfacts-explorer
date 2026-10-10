export function getGoogleReverseSearchUrl(imageUrl: string): string {
	return `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`;
}

export function getYandexReverseSearchUrl(imageUrl: string): string {
	return `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(imageUrl)}`;
}
