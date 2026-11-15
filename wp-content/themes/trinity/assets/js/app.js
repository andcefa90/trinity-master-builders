// Trinity front-end entry. Core runs everywhere; features load on demand
// only when the page contains them (data-module="…").
import { $, $$ } from './core/config.js';
import { initMotion } from './core/motion.js';
import { initHeader } from './core/header.js';
import { initCursor } from './core/cursor.js';
import { initTransitions } from './core/transitions.js';
import { initAnalytics } from './core/analytics.js';

const loaders = {
	hero: () => import('./modules/hero.js'),
	worlds: () => import('./modules/worlds.js'),
	'before-after': () => import('./modules/before-after.js'),
	transformation: () => import('./modules/transformation.js'),
	craft: () => import('./modules/craft.js'),
	water: () => import('./modules/water.js'),
	builder: () => import('./modules/builder.js'),
	hotspots: () => import('./modules/hotspots.js'),
	journey: () => import('./modules/journey.js'),
	'drag-reel': () => import('./modules/drag-reel.js'),
	capabilities: () => import('./modules/preview.js'),
	'project-index': () => import('./modules/preview.js'),
	quotes: () => import('./modules/quotes.js'),
	process: () => import('./modules/process.js'),
	'symbol-draw': () => import('./modules/symbol-draw.js'),
};

async function boot() {
	// Deferred classic scripts (GSAP, Lenis) are guaranteed to have run by DOMContentLoaded.
	if (document.readyState === 'loading') {
		await new Promise((r) => document.addEventListener('DOMContentLoaded', r, { once: true }));
	}

	initMotion();
	initHeader();
	initCursor();
	initTransitions();
	initAnalytics();

	// The intro must start before the hero so the hero waits for it.
	if ($('#intro')) {
		const { default: intro } = await import('./modules/intro.js');
		intro($('#intro'));
	}

	const groups = new Map();
	$$('[data-module]').forEach((el) => {
		const name = el.dataset.module;
		if (!loaders[name]) return;
		if (!groups.has(name)) groups.set(name, []);
		groups.get(name).push(el);
	});
	await Promise.all(
		[...groups].map(async ([name, els]) => {
			try {
				const mod = await loaders[name]();
				els.forEach((el) => mod.default(el));
			} catch (err) {
				console.warn(`[trinity] ${name} failed to load`, err); // eslint-disable-line no-console
			}
		})
	);
	window.ScrollTrigger?.refresh();
}

boot();
