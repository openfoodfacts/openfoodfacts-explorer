import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import { locales } from '$lib/i18n';
import 'dayjs/locale/en';
import 'dayjs/locale/it';

dayjs.extend(relativeTime);
dayjs.extend(utc);

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
