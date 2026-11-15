// Mouse drag for horizontal reels (touch and trackpads scroll natively).
import { $, finePointer } from '../core/config.js';

export default function dragReel(el) {
	const track = el.matches('.reel__track') ? el : $('.reel__track', el);
	if (!track || !finePointer) return;
	let down = false, startX = 0, startLeft = 0, moved = 0;

	track.addEventListener('pointerdown', (e) => {
		if (e.pointerType !== 'mouse' || e.button !== 0) return;
		down = true; moved = 0; startX = e.clientX; startLeft = track.scrollLeft;
	});
	addEventListener('pointermove', (e) => {
		if (!down) return;
		const dx = e.clientX - startX;
		moved = Math.max(moved, Math.abs(dx));
		if (moved > 6) track.classList.add('is-dragging');
		track.scrollLeft = startLeft - dx;
	});
	addEventListener('pointerup', () => {
		if (!down) return;
		down = false;
		setTimeout(() => track.classList.remove('is-dragging'), 0);
	});
	track.addEventListener('click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
	track.addEventListener('dragstart', (e) => e.preventDefault());
}
