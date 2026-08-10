/**
 * Minimal CSV helpers for client-side downloads.
 */

export function escapeCsvValue(value: unknown): string {
	if (value == null) return '';
	const str = String(value);
	if (/[",\n\r]/.test(str)) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
	const lines = [
		headers.map(escapeCsvValue).join(','),
		...rows.map((row) => row.map(escapeCsvValue).join(','))
	];
	return lines.join('\r\n') + '\r\n';
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
