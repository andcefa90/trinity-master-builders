// Process timeline: the line fills as you read; each step lights up when reached.
import { $, $$, gsap, ScrollTrigger, motionOK } from '../core/config.js';

export default function process(el) {
	if (!motionOK) return;
	gsap.to($('.process__track i', el), { scaleY: 1, ease: 'none', scrollTrigger: { trigger: $('.process__steps', el), start: 'top 60%', end: 'bottom 60%', scrub: true } });
	$$('.process__step', el).forEach((s) => ScrollTrigger.create({
		trigger: s, start: 'top 60%',
		onEnter: () => s.classList.add('is-lit'),
		onLeaveBack: () => s.classList.remove('is-lit'),
	}));
}
