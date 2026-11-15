// About page: the Trinity symbol assembles from three rings when it comes into view.
import { $$, gsap, motionOK } from '../core/config.js';

export default function symbolDraw(el) {
	if (!motionOK) return;
	const rings = $$('.tri__ring', el);
	const groups = $$('.tri__g', el);
	rings.forEach((r) => { const l = r.getTotalLength(); r.style.strokeDasharray = l; r.style.strokeDashoffset = l; });
	gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 80%', once: true } })
		.fromTo(groups, { attr: { transform: (i) => `rotate(${i * 120}) translate(0 -70)` } }, { attr: { transform: (i) => `rotate(${i * 120}) translate(0 0)` }, duration: 1.8, stagger: 0.15, ease: 'expo.out' }, 0)
		.to(rings, { strokeDashoffset: 0, duration: 2, stagger: 0.15, ease: 'power2.inOut' }, 0)
		.from($$('.tri__label', el), { opacity: 0, y: 8, stagger: 0.12, duration: 0.8 }, 1.4);
}
