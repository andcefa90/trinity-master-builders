// "Enter the space": one detail card open at a time; Esc or a click elsewhere closes it.
import { $$ } from '../core/config.js';
import { track } from '../core/analytics.js';

export default function hotspots(el) {
	const spots = $$('.spot', el);
	const close = () => spots.forEach((s) => {
		s.setAttribute('aria-expanded', 'false');
		document.getElementById(s.getAttribute('aria-controls')).hidden = true;
	});
	spots.forEach((s) => {
		s.addEventListener('click', (e) => {
			e.stopPropagation();
			const open = s.getAttribute('aria-expanded') === 'true';
			close();
			if (!open) {
				s.setAttribute('aria-expanded', 'true');
				document.getElementById(s.getAttribute('aria-controls')).hidden = false;
				track('hotspot_open', { label: s.textContent.trim() });
			}
		});
	});
	document.addEventListener('click', (e) => { if (!e.target.closest('.spot-card')) close(); });
	addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}
