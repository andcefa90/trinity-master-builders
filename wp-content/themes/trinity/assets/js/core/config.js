// Runtime configuration and capability flags shared by every module.

const el = document.getElementById('trinity-config');
export const config = el ? JSON.parse(el.textContent) : { lines: [], intro: false };

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = matchMedia('(pointer: fine)').matches;
export const isDesktop = () => matchMedia('(min-width: 901px)').matches;

export const gsap = window.gsap;
export const ScrollTrigger = window.ScrollTrigger;
export const motionOK = Boolean(gsap && ScrollTrigger) && !reduced;

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export const lineBySlug = (slug) => config.lines.find((l) => l.slug === slug);
