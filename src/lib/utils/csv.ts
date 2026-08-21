/**
 * CSV helpers for client-side downloads, backed by csv-stringify.
 */

import { stringify } from 'csv-stringify/sync';

export function toCsv(headers: string[], rows: unknown[][]): string {
	return stringify([headers, ...rows], {
		escape_formulas: true,
		record_delimiter: '\r\n',
		// With CRLF record delimiters, lone \n/\r in cells still need quoting.
		quoted_match: /\r|\n/
	});
}

export function downloadCsv(filename: string, csv: string): void {
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = filename;
	anchor.rel = 'noopener';
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
}
