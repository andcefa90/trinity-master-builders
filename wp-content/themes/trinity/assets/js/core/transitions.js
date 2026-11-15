// Page transitions: a curtain in the destination world's color closes before navigating
// and opens on arrival, so moving between Trinity, Landscape, Home and Water feels continuous.
import { $, gsap, motionOK } from './config.js';
import { scrollToTarget } from './motion.js';

const KEY = 'trinity-curtain';

export function initTransitions() {
	const curtain = $('.curtain');
	if (!curtain) return;
	const panel = $('.curtain__panel', curtain);
	const mark = $('.curtain__mark', curtain);
	const root = document.documentElement;

	// Arrival.
	if (root.classList.contains('curtain-in')) {
		try { sessionStorage.removeItem(KEY); } catch (e) { /* storage unavailable */ }
		if (motionOK) {
			curtain.style.visibility = 'visible';
			gsap.set(panel, { scaleY: 1, transformOrigin: '50% 0%' });
			gsap.timeline({ onComplete: () => { root.classList.remove('curtain-in'); curtain.style.visibility = ''; gsap.set(panel, { clearProps: 'all' }); } })
				.to(mark, { opacity: 0, duration: 0.3 }, 0)
				.to(panel, { scaleY: 0, duration: 0.9, ease: 'expo.inOut' }, 0.05);
		} else {
			root.classList.remove('curtain-in');
		}
	}

	// Back/forward cache: never restore a closed curtain.
	addEventListener('pageshow', (e) => {
		if (e.persisted) { root.classList.remove('curtain-in'); curtain.style.visibility = ''; if (gsap) gsap.set([panel, mark], { clearProps: 'all' }); }
	});

	document.addEventListener('click', (e) => {
		const a = e.target.closest('a[href]');
		if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		const url = new URL(a.href, location.href);

		if (url.origin === location.origin && url.pathname === location.pathname && url.hash) {
			const t = document.querySelector(url.hash);
			if (t) { e.preventDefault(); scrollToTarget(t); }
			return;
		}
		if (!motionOK || a.target === '_blank' || a.hasAttribute('download') || url.origin !== location.origin
			|| /\/wp-(admin|login)/.test(url.pathname) || /\.(pdf|jpe?g|png|webp|mp4|zip)$/i.test(url.pathname)) return;

		e.preventDefault();
		const world = a.dataset.world || '';
		curtain.dataset.world = world;
		try { sessionStorage.setItem(KEY, world); } catch (err) { /* storage unavailable */ }
		curtain.style.visibility = 'visible';
		gsap.timeline({ onComplete: () => { location.href = url.href; } })
			.fromTo(panel, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.7, ease: 'expo.inOut' })
			.fromTo(mark, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4 }, 0.4);
	});
}
