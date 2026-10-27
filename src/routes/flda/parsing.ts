export function parseCSV(text: string): Record<string, string>[] {
	const lines = text.split(/\r?\n/).filter(Boolean);
	if (lines.length === 0) return [];
	const headers = parseCSVLine(lines[0]);
	return lines.slice(1).map((line) => {
		const values = parseCSVLine(line);
		const obj: Record<string, string> = {};
		headers.forEach((h, i) => (obj[h.trim()] = values[i]?.trim() ?? ''));
		return obj;
	});
}

function parseCSVLine(line: string): string[] {
	const result: string[] = [];
	let field = '';
	let inQuotes = false;
	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		if (char === '"') {
			if (inQuotes && line[i + 1] === '"') {
				field += '"';
				i++;
			} else {
				inQuotes = !inQuotes;
			}
		} else if (char === ',' && !inQuotes) {
			result.push(field);
			field = '';
		} else {
			field += char;
		}
	}
	result.push(field);
	return result;
}
