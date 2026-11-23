export const messageLoaders = import.meta.glob('./messages/*.json');

export const availableLocales = Object.keys(messageLoaders)
	.map((path) =>
		path
			.split('/')
			.pop()
			?.replace(/\.json$/, '')
			.replaceAll('_', '-')
	)
	.filter((locale): locale is string => locale != null)
	.toSorted();
