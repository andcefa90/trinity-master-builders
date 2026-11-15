// Walk through the house: the section pins and each room wipes in with a clean,
// architectural vertical cut while the room list follows along.
import { $, $$, gsap, motionOK } from '../core/config.js';

export default function journey(el) {
	if (!motionOK) return;
	const pin = $('.journey__pin', el);
	const scenes = $$('.journey__scene', el);
	const rooms = $$('.journey__room', el);
	if (scenes.length < 2) { rooms[0]?.classList.add('is-current'); return; }

	const mark = (n) => rooms.forEach((r, k) => r.classList.toggle('is-current', k === n));
	mark(0);

	gsap.matchMedia().add('(min-width: 901px)', () => {
		const tl = gsap.timeline({
			defaults: { ease: 'none' },
			scrollTrigger: {
				trigger: el,
				pin,
				start: 'top top',
				end: () => `+=${innerHeight * (scenes.length - 1) * 0.85}`,
				scrub: 0.6,
				onUpdate: (self) => mark(Math.min(scenes.length - 1, Math.round(self.progress * (scenes.length - 1)))),
			},
		});
		scenes.forEach((s, k) => {
			const img = $('img', s);
			if (k === 0) { tl.to(img, { scale: 1, duration: 1 }, 0); return; }
			tl.fromTo(s, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power2.inOut' }, k - 1)
				.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.4 }, k - 1);
		});
		return () => { gsap.set(scenes, { clearProps: 'clipPath' }); mark(0); };
	});
}
