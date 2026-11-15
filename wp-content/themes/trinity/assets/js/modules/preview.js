// Editorial lists (capabilities, projects): a preview image follows the pointer,
// plus client-side filtering by specialty on the projects page.
import { $, $$, finePointer, reduced, ScrollTrigger } from '../core/config.js';

export default function preview(el) {
	const items = $$('[data-preview]', el);
	const box = $('.cap-preview', el);

	if (box && finePointer && !reduced) {
		const img = $('img', box);
		let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
		const loop = () => {
			cx += (x - cx) * 0.16; cy += (y - cy) * 0.16;
			box.style.left = `${cx}px`; box.style.top = `${cy}px`;
			raf = box.classList.contains('is-on') ? requestAnimationFrame(loop) : 0;
		};
		items.forEach((it) => {
			it.addEventListener('pointerenter', (e) => {
				if (!it.dataset.preview) return;
				if (img.getAttribute('src') !== it.dataset.preview) img.src = it.dataset.preview;
				if (!box.classList.contains('is-on')) { cx = x = e.clientX; cy = y = e.clientY; }
				box.classList.add('is-on');
				if (!raf) raf = requestAnimationFrame(loop);
			});
			it.addEventListener('pointerleave', () => box.classList.remove('is-on'));
		});
		el.addEventListener('pointermove', (e) => { x = e.clientX + 40; y = e.clientY; }, { passive: true });
	}

	const filters = $$('[data-filter]', el);
	filters.forEach((b) => b.addEventListener('click', () => {
		const f = b.dataset.filter;
		filters.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
		$$('.p-row', el).forEach((r) => { r.hidden = Boolean(f) && r.dataset.line !== f; });
		ScrollTrigger?.refresh();
	}));
}
