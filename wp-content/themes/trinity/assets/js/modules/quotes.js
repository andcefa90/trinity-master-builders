// Client words: one quote at a time, with previous/next and a slow automatic advance.
import { $$, reduced } from '../core/config.js';

export default function quotes(el) {
	const items = $$('.quote', el);
	if (items.length < 2) return;
	let i = 0;
	let timer = null;
	const show = (n) => { i = (n + items.length) % items.length; items.forEach((q, k) => q.classList.toggle('is-active', k === i)); };
	$$('[data-dir]', el).forEach((b) => b.addEventListener('click', () => { show(i + Number(b.dataset.dir)); restart(); }));
	const restart = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => show(i + 1), 8000); };
	el.addEventListener('pointerenter', () => clearInterval(timer));
	el.addEventListener('pointerleave', restart);
	restart();
}
