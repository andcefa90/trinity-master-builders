// Hero entrance: the headline rises line by line once the intro has opened.
import { $$, gsap, motionOK } from '../core/config.js';

export default function hero(el) {
	if (!motionOK) return;
	const lines = $$('.hero__line > span', el);
	const ins = $$('[data-hero-in]', el);
	gsap.set(lines, { yPercent: 115 });
	gsap.set(ins, { y: 24, opacity: 0 });

	const play = () => {
		gsap.timeline({ defaults: { ease: 'expo.out' } })
			.to(lines, { yPercent: 0, duration: 1.5, stagger: 0.12 })
			.to(ins, { y: 0, opacity: 1, duration: 1.1, stagger: 0.1, ease: 'power3.out' }, 0.5);
	};
	if (document.documentElement.classList.contains('intro-playing')) {
		document.addEventListener('trinity:intro-reveal', play, { once: true });
	} else {
		requestAnimationFrame(play);
	}
}
