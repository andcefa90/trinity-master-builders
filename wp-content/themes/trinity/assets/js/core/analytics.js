// Analytics events. Works with GTM (dataLayer), GA4 (gtag) and Meta Pixel (fbq) when configured.
import { $$ } from './config.js';

export function track(event, params = {}) {
	const data = { page_path: location.pathname, ...params };
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({ event: `trinity_${event}`, ...data });
	if (typeof window.gtag === 'function') window.gtag('event', event, data);
	if (typeof window.fbq === 'function') {
		if (event === 'lead_submit') window.fbq('track', 'Lead', data);
		else window.fbq('trackCustom', event, data);
	}
}

export function initAnalytics() {
	document.addEventListener('click', (e) => {
		const el = e.target.closest('[data-track], a[href^="tel:"], a[href^="mailto:"]');
		if (!el) return;
		let event = el.dataset.track;
		if (!event) event = el.href.startsWith('tel:') ? 'phone_click' : 'email_click';
		track(event, { label: el.dataset.trackLabel || el.textContent.trim().slice(0, 80) });
	});
	$$('[data-track-view]').forEach((el) => track(el.dataset.trackView, { label: el.dataset.trackLabel || '' }));
}
