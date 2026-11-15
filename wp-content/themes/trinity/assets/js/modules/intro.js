// Signature logo reveal: lines → structure → form → logo → brand.
// Plays once per browser session, can be skipped (button, Esc, click), never runs with reduced motion.
import { $, $$, gsap, motionOK, config } from '../core/config.js';
import { lenis } from '../core/motion.js';

const KEY = 'trinity-intro-seen';

const finish = (el) => {
	el.remove();
	document.documentElement.classList.remove('intro-playing', 'intro-pending');
	lenis?.start();
	document.dispatchEvent(new CustomEvent('trinity:intro-done'));
};

export default function intro(el) {
	let seen = false;
	try { seen = sessionStorage.getItem(KEY) === '1'; } catch (e) { /* storage unavailable */ }
	if (!motionOK || !config.intro || seen || document.documentElement.classList.contains('curtain-in')) {
		finish(el);
		return;
	}
	try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* storage unavailable */ }

	document.documentElement.classList.add('intro-playing');
	el.classList.add('is-playing');
	lenis?.stop();

	const lines = $$('.intro__line', el);
	const axes = $$('.intro__axis', el);
	const guides = $$('.tri__guide', el);
	const rings = $$('.tri__ring', el);
	const shades = $$('.tri__shade', el);
	const groups = $$('.tri__g', el);
	const count = $('.intro__count', el);
	const symbol = $('.tri--intro', el);

	[...lines, ...axes, ...guides, ...rings].forEach((p) => {
		const len = p.getTotalLength ? p.getTotalLength() : 2000;
		p.style.strokeDasharray = p.classList.contains('tri__guide') ? '4 7' : `${len}`;
		if (!p.classList.contains('tri__guide')) p.style.strokeDashoffset = `${len}`;
	});
	gsap.set(guides, { opacity: 0 });
	gsap.set(shades, { opacity: 0 });
	gsap.set($$('.intro__word span, .intro__sub span', el), { yPercent: 110 });
	// Rings start pulled apart along their own axis, then assemble.
	groups.forEach((g, i) => gsap.set(g, { attr: { transform: `rotate(${i * 120}) translate(0 -60)` } }));

	const counter = { v: 0 };
	const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' }, onComplete: () => finish(el) });
	tl.to(counter, { v: 100, duration: 3.6, ease: 'power1.inOut', onUpdate: () => { count.textContent = String(Math.round(counter.v)).padStart(3, '0'); } }, 0)
		// 1. Lines: the drawing grid.
		.to(axes, { strokeDashoffset: 0, duration: 1.1, stagger: 0.1 }, 0)
		.to(lines, { strokeDashoffset: 0, duration: 1.2, stagger: { each: 0.02, from: 'center' } }, 0.1)
		// 2. Structure: construction guides.
		.to(guides, { opacity: 1, duration: 0.6, stagger: 0.12 }, 0.6)
		// 3. Form: gold ribbons drawn along the guides while the rings assemble.
		.to(rings, { strokeDashoffset: 0, duration: 1.6, stagger: 0.16 }, 1.0)
		.to(groups, { attr: { transform: (i) => `rotate(${i * 120}) translate(0 0)` }, duration: 1.6, stagger: 0.16, ease: 'expo.out' }, 1.0)
		// 4. Logo: depth and light.
		.to(shades, { opacity: 1, duration: 0.8 }, 2.2)
		.to(guides, { opacity: 0, duration: 0.6 }, 2.3)
		.fromTo(symbol, { filter: 'brightness(.85)' }, { filter: 'brightness(1.15)', duration: 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 2.4)
		// 5. Brand.
		.to($$('.intro__word span', el), { yPercent: 0, duration: 0.9, ease: 'expo.out' }, 2.5)
		.to($$('.intro__sub span', el), { yPercent: 0, duration: 0.9, ease: 'expo.out' }, 2.65)
		.addLabel('exit', 3.7)
		.to([lines, axes].flat(), { opacity: 0, duration: 0.5 }, 'exit')
		.to($('.intro__stage', el), { scale: 0.94, opacity: 0, duration: 0.7, ease: 'power2.in' }, 'exit')
		.to($$('.intro__meta, .intro__skip', el), { opacity: 0, duration: 0.4 }, 'exit')
		.to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, 'exit+=0.45')
		.call(() => document.dispatchEvent(new CustomEvent('trinity:intro-reveal')), [], 'exit+=0.75');

	const skip = () => { if (tl.time() < tl.labels.exit) tl.seek('exit'); };
	$('.intro__skip', el).addEventListener('click', skip);
	el.addEventListener('click', (e) => { if (!e.target.closest('.intro__skip')) skip(); });
	addEventListener('keydown', (e) => { if (e.key === 'Escape') skip(); }, { once: true });
}
