// Desktop-only cursor with contextual labels, plus magnetic buttons.
import { $, $$, finePointer, reduced } from './config.js';

export function initCursor() {
	if (!finePointer || reduced) return;
	const c = $('.cursor');
	if (!c) return;
	const label = $('.cursor__label', c);
	let x = -100, y = -100, cx = -100, cy = -100;

	addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; c.classList.add('is-on'); }, { passive: true });
	document.addEventListener('pointerleave', () => c.classList.remove('is-on'));
	document.addEventListener('pointerover', (e) => {
		const t = e.target.closest('[data-cursor]');
		c.classList.toggle('has-label', Boolean(t));
		label.textContent = t ? t.dataset.cursor : '';
	});
	const loop = () => {
		cx += (x - cx) * 0.22;
		cy += (y - cy) * 0.22;
		c.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
		requestAnimationFrame(loop);
	};
	loop();

	$$('[data-magnetic]').forEach((b) => {
		b.addEventListener('pointermove', (e) => {
			const r = b.getBoundingClientRect();
			b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.28}px, ${(e.clientY - r.top - r.height / 2) * 0.38}px)`;
		});
		b.addEventListener('pointerleave', () => {
			b.style.transition = 'transform .7s cubic-bezier(.2,.7,.1,1), color .5s';
			b.style.transform = '';
			setTimeout(() => { b.style.transition = ''; }, 700);
		});
	});
}
