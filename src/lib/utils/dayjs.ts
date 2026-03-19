import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import { locales } from '$lib/i18n';

dayjs.extend(relativeTime);
dayjs.extend(utc);

const languageCodes = locales.map((locale) => locale.split('-')[0].toLowerCase());
const dayjsLocaleModules = import.meta.glob('../../../node_modules/dayjs/locale/*.js', {
	eager: true
});

languageCodes.forEach((code) => {
	const modulePath = `../../../node_modules/dayjs/locale/${code}.js`;
	if (!dayjsLocaleModules[modulePath]) {
		console.warn(`Dayjs locale not found: ${code}`);
	}
});

export function formatRelativeTime(
	unix: number | null | undefined,
	locale: string = 'en-US'
): string | null {
	if (unix == null || unix === undefined || Number.isNaN(unix)) {
		return null;
	}

	try {
		const languageCode = locale.split('-')[0].toLowerCase();

		return dayjs.unix(unix).locale(languageCode).fromNow();
	} catch {
		return dayjs.unix(unix).locale('en').fromNow();
	}
}

export default dayjs;
