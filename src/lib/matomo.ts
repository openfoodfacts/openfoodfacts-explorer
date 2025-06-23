const _paq = (window._paq = window._paq || []);
/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);

function initializeMatomo() {
	const url = 'https://analytics.openfoodfacts.org/';
	_paq.push(['setTrackerUrl', url + 'matomo.php']);
	_paq.push(['setSiteId', '17']);
	const d = document;
	const g = d.createElement('script');
	const s = d.getElementsByTagName('script')[0];

	g.async = true;
	g.src = url + 'matomo.js';

	if (s.parentNode != null) {
		s.parentNode.insertBefore(g, s);
	} else {
		console.error('Matomo script could not be inserted into the document.');
	}
}

export { initializeMatomo as initMatomo };
