export function formBody(params: Record<string, string | null | undefined>) {
	const formBody = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value != null) {
			formBody.append(key, value);
		}
	}
	return formBody;
}
