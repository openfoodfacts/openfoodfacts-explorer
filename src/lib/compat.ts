// Small layer of compatibility for older browsers, to avoid having to sprinkle
// if (window.SomeNewAPI) checks everywhere in the codebase.

export function addMediaQueryListener(
	mq: MediaQueryList,
	listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void
): void {
	// Prior Safari 14, MediaQueryList does not have method addEventListener,
	// use addListener for backward compatibility, which is supported by all browsers.
	if (mq.addEventListener) {
		mq.addEventListener('change', listener);
	} else if (mq.addListener) {
		mq.addListener(listener);
	}
}

export function removeMediaQueryListener(
	mq: MediaQueryList,
	listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void
): void {
	if (mq.removeEventListener) {
		mq.removeEventListener('change', listener);
	} else if (mq.removeListener) {
		mq.removeListener(listener);
	}
}
