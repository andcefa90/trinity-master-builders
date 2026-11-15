// Before/after comparison. On desktop the reveal is first driven by scroll
// (before → after), then hands control to the visitor as soon as they drag.
import { $, gsap, ScrollTrigger, motionOK, isDesktop } from '../core/config.js';
import { track } from '../core/analytics.js';

export default function beforeAfter(el) {
	const range = $('.ba__range', el);
	if (!range) return;
	let st = null;
	let tracked = false;

	const set = (v, fromUser) => {
		el.style.setProperty('--pos', `${v}%`);
		range.value = Math.round(v);
		el.dispatchEvent(new CustomEvent('ba:progress', { bubbles: true, detail: { value: 100 - v } }));
		if (fromUser && !tracked) { tracked = true; track('before_after', { label: document.title }); }
	};

	range.addEventListener('input', () => {
		if (st) { st.kill(); st = null; }
		set(Number(range.value), true);
	});

	if (motionOK && el.hasAttribute('data-scrub') && isDesktop()) {
		set(96);
		const o = { v: 96 };
		st = ScrollTrigger.create({
			trigger: el,
			start: 'top 70%',
			end: 'bottom 35%',
			scrub: 0.6,
			animation: gsap.to(o, { v: 8, ease: 'none', onUpdate: () => set(o.v) }),
		});
	} else {
		set(50);
	}
}
