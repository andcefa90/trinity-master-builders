// Smooth scrolling, masked text reveals, parallax and counters.
import { gsap, ScrollTrigger, motionOK, $$ } from './config.js';

export let lenis = null;

export function initMotion() {
	if (!motionOK) return;
	document.documentElement.classList.add('js-motion');
	gsap.registerPlugin(ScrollTrigger);
	gsap.defaults({ ease: 'power3.out', duration: 1.1 });

	if (window.Lenis) {
		lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
		lenis.on('scroll', ScrollTrigger.update);
		gsap.ticker.add((t) => lenis.raf(t * 1000));
		gsap.ticker.lagSmoothing(0);
	}

	$$('[data-split]').forEach((el) => {
		if (el.closest('.intro')) return;
		const words = splitWords(el);
		gsap.from(words, {
			yPercent: 110,
			stagger: 0.045,
			duration: 1.15,
			scrollTrigger: { trigger: el, start: 'top 88%', once: true },
		});
	});

	$$('[data-reveal]').forEach((el) => {
		gsap.from(el, { y: 48, opacity: 0, duration: 1.2, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
	});

	$$('[data-parallax]').forEach((el) => {
		gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
	});

	// Hero media drifts and deepens as the page scrolls away from it.
	$$('[data-hero-media]').forEach((el) => {
		gsap.to(el, { yPercent: 14, scale: 1.06, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top top', end: 'bottom top', scrub: true } });
	});

	$$('[data-count]').forEach(countUp);

	addEventListener('load', () => ScrollTrigger.refresh());
}

/** Wrap each word in a masked span; keeps <em>, <br> and accessible text intact. */
export function splitWords(el) {
	const targets = [];
	const wrap = (text, parent) => {
		text.split(/(\s+)/).forEach((part) => {
			if (!part) return;
			if (/^\s+$/.test(part)) { parent.appendChild(document.createTextNode(part)); return; }
			const mask = document.createElement('span');
			mask.className = 'split-line';
			const inner = document.createElement('span');
			inner.textContent = part;
			mask.appendChild(inner);
			parent.appendChild(mask);
			targets.push(inner);
		});
	};
	const label = el.textContent.replace(/\s+/g, ' ').trim();
	const nodes = [...el.childNodes];
	el.textContent = '';
	nodes.forEach((n) => {
		if (n.nodeType === 3) wrap(n.textContent, el);
		else if (n.nodeName === 'BR') el.appendChild(n);
		else {
			const clone = n.cloneNode(false);
			wrap(n.textContent, clone);
			el.appendChild(clone);
		}
	});
	el.setAttribute('aria-label', label);
	[...el.children].forEach((c) => c.setAttribute('aria-hidden', 'true'));
	return targets;
}

function countUp(el) {
	const raw = el.dataset.count;
	const m = raw.match(/^([^0-9]*)([0-9][0-9,.]*)(.*)$/);
	if (!m) return;
	const end = parseFloat(m[2].replace(/,/g, ''));
	const decimals = (m[2].split('.')[1] || '').length;
	const o = { v: 0 };
	gsap.to(o, {
		v: end,
		duration: 1.8,
		ease: 'power2.out',
		scrollTrigger: { trigger: el, start: 'top 90%', once: true },
		onUpdate: () => { el.textContent = m[1] + o.v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + m[3]; },
	});
}

export function scrollToTarget(target) {
	if (lenis) lenis.scrollTo(target, { duration: 1.6, offset: 0 });
	else target.scrollIntoView({ behavior: motionOK ? 'smooth' : 'auto' });
}
