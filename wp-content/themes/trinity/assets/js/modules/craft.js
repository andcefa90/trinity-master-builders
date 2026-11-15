// Craftsmanship: on desktop the section pins and the close-ups travel sideways;
// each image eases from macro to detail as it crosses the screen.
import { $, $$, gsap, ScrollTrigger, motionOK } from '../core/config.js';

export default function craft(el) {
	if (!motionOK) return;
	const pin = $('.craft__pin', el);
	const track = $('.craft__track', el);
	const mm = gsap.matchMedia();
	mm.add('(min-width: 901px)', () => {
		const dist = () => Math.max(0, track.scrollWidth - innerWidth);
		const tween = gsap.to(track, {
			x: () => -dist(),
			ease: 'none',
			scrollTrigger: { trigger: el, pin, start: 'top top', end: () => `+=${dist()}`, scrub: 0.7, invalidateOnRefresh: true },
		});
		$$('.craft__media img', track).forEach((img) => {
			gsap.fromTo(img, { scale: 1.5 }, {
				scale: 1.15,
				ease: 'none',
				scrollTrigger: { trigger: img, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
			});
		});
		return () => gsap.set(track, { clearProps: 'transform' });
	});
	ScrollTrigger.refresh();
}
