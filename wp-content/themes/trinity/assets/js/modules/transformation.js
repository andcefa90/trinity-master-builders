// Highlights Before / Vision / After as the comparison progresses.
import { $$ } from '../core/config.js';

export default function transformation(el) {
	const steps = $$('.transform__step', el);
	if (!steps.length) return;
	const mark = (i) => steps.forEach((s, n) => s.classList.toggle('is-current', n === i));
	mark(0);
	el.addEventListener('ba:progress', (e) => {
		const p = e.detail.value; // 0 = all before, 100 = all after
		mark(Math.min(steps.length - 1, Math.floor((p / 100) * steps.length * 0.999)));
	});
}
