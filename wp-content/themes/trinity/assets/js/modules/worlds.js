// Three worlds: pointing at a world changes the whole environment.
// While nobody interacts, the section gently cycles through the worlds (useful on a big presentation screen).
import { $, $$, isDesktop, reduced } from '../core/config.js';

export default function worlds(el) {
	const bands = $$('[data-world-band]', el);
	const scenes = $$('[data-scene]', el);
	let current = 'all';
	let timer = null;
	let touched = false;

	const set = (slug) => {
		if (slug === current) return;
		current = slug;
		scenes.forEach((s) => s.classList.toggle('is-active', s.dataset.scene === slug));
		bands.forEach((b) => b.classList.toggle('is-active', b.dataset.worldBand === slug));
		el.classList.toggle('has-active', slug !== 'all');
	};

	bands.forEach((b) => {
		const slug = b.dataset.worldBand;
		b.addEventListener('pointerenter', () => { touched = true; stop(); set(slug); });
		b.addEventListener('focusin', () => { touched = true; stop(); set(slug); });
	});
	$('.worlds__list', el)?.addEventListener('pointerleave', () => set('all'));

	const order = bands.map((b) => b.dataset.worldBand);
	const start = () => {
		if (timer || touched || reduced || !isDesktop()) return;
		let i = -1;
		timer = setInterval(() => { i = (i + 1) % order.length; set(order[i]); }, 3600);
	};
	const stop = () => { clearInterval(timer); timer = null; };

	new IntersectionObserver(([e]) => {
		if (e.isIntersecting && e.intersectionRatio > 0.5) start();
		else { stop(); if (!touched) set('all'); }
	}, { threshold: [0, 0.5, 0.8] }).observe(el);
}
