// Header: tone follows the section underneath, hides on scroll down, mobile menu.
import { $, $$ } from './config.js';
import { lenis } from './motion.js';

export function initHeader() {
	const header = $('#site-header');
	if (!header) return;
	const bar = $('.scroll-progress i', header);
	const toggle = $('.menu-toggle', header);
	const panel = $('#menu-panel');
	const tones = $$('[data-tone]');
	let lastY = scrollY;
	let ticking = false;

	const update = () => {
		ticking = false;
		const y = scrollY;
		const max = document.documentElement.scrollHeight - innerHeight;
		if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
		header.classList.toggle('is-scrolled', y > 24);

		const probe = header.offsetHeight / 2;
		let tone = 'light';
		for (const s of tones) {
			const r = s.getBoundingClientRect();
			if (r.top <= probe && r.bottom > probe) { tone = s.dataset.tone; }
		}
		const menuOpen = document.body.classList.contains('menu-open');
		header.classList.toggle('is-dark', tone === 'dark' || menuOpen);

		if (!menuOpen) header.classList.toggle('is-hidden', y > 240 && y > lastY + 4);
		if (y < lastY - 4) header.classList.remove('is-hidden');
		lastY = y;
	};
	addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
	addEventListener('resize', update);
	update();

	if (!toggle || !panel) return;
	const setOpen = (open) => {
		document.body.classList.toggle('menu-open', open);
		toggle.setAttribute('aria-expanded', String(open));
		panel.hidden = !open;
		if (open) { lenis?.stop(); header.classList.remove('is-hidden'); $('a', panel)?.focus({ preventScroll: true }); }
		else { lenis?.start(); toggle.focus({ preventScroll: true }); }
		update();
	};
	toggle.addEventListener('click', () => setOpen(panel.hidden));
	addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) setOpen(false); });
	$$('a', panel).forEach((a) => a.addEventListener('click', () => { document.body.classList.remove('menu-open'); }));
}
