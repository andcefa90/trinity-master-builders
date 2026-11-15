// "Build your vision": turns the plain form into a guided, one-question-at-a-time flow.
// A line that is still coming soon (Cali WaterScapes) becomes a launch-list signup, never a booking.
import { $, $$, config, lineBySlug } from '../core/config.js';
import { track } from '../core/analytics.js';

export default function builder(form) {
	form.classList.add('js-builder');
	const steps = $$('.vision__step', form);
	const next = $('.vision__next', form);
	const nextLabel = $('.btn__label', next);
	const back = $('.vision__back', form);
	const bar = $('.vision__progress i', form);
	const count = $('.vision__count', form);
	const soon = $('.vision__soon', form);
	const done = $('.vision__done:not(.is-static)', form);
	const error = $('.vision__error', form);
	const contactLegend = $('[data-step="contact"] legend', form);
	const projectLegend = contactLegend.textContent;
	const started = Date.now();
	let i = 0;
	let begun = false;

	const lineValue = () => form.elements.line?.value || '';
	const isLaunch = () => {
		const l = lineBySlug(lineValue());
		return Boolean(l && l.comingSoon);
	};
	// Stage and timeline only matter for projects we can take on now.
	const visible = () => steps.filter((s) => !(isLaunch() && ['stage', 'timeline'].includes(s.dataset.step)));

	const valid = (step) => {
		const name = step.dataset.step;
		if (name === 'line') return Boolean(lineValue());
		if (name === 'contact') {
			const n = form.elements.name.value.trim();
			const e = form.elements.email.value.trim();
			return n.length > 1 && /^\S+@\S+\.\S+$/.test(e);
		}
		return true;
	};

	const render = (focus = true) => {
		const list = visible();
		i = Math.min(i, list.length - 1);
		steps.forEach((s) => s.classList.toggle('is-current', s === list[i]));
		const last = i === list.length - 1;
		bar.style.width = `${((i + 1) / list.length) * 100}%`;
		count.textContent = `${i + 1} / ${list.length}`;
		back.classList.toggle('is-visible', i > 0);
		next.disabled = !valid(list[i]);
		nextLabel.textContent = last ? (isLaunch() ? 'Join the list' : 'Send my project') : 'Continue';
		soon.hidden = !isLaunch();
		contactLegend.textContent = isLaunch() ? contactLegend.dataset.launchText : projectLegend;
		if (focus) {
			const f = list[i].querySelector('input:not([type=radio]), textarea') || list[i].querySelector('input');
			f?.focus({ preventScroll: true });
		}
	};

	const go = (dir) => { i = Math.max(0, i + dir); render(); };

	form.addEventListener('input', (e) => {
		if (!begun) { begun = true; track('lead_start', { line: lineValue() }); }
		if (e.target.name === 'line' && isLaunch()) track('water_interest', { label: 'Builder' });
		render(false);
		// Choosing an option moves the conversation forward.
		if (e.target.type === 'radio') setTimeout(() => { if (i < visible().length - 1) go(1); }, 380);
	});
	back.addEventListener('click', () => go(-1));

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const list = visible();
		if (!valid(list[i])) return;
		if (i < list.length - 1) { go(1); return; }

		const data = Object.fromEntries(new FormData(form).entries());
		data.elapsed = Date.now() - started;
		data.utm = new URLSearchParams(location.search).get('utm_campaign') || '';
		next.disabled = true;
		nextLabel.textContent = 'Sending…';
		error.hidden = true;
		$$('[aria-invalid]', form).forEach((f) => f.removeAttribute('aria-invalid'));

		try {
			// Static preview builds (config.demo) show the real confirmation without sending anything.
			const res = config.demo
				? new Response(JSON.stringify({ ok: true, intent: isLaunch() ? 'launch_list' : 'project', line: (lineBySlug(data.line) || {}).brand || 'Trinity Master Builders' }), { status: 201 })
				: await fetch(`${config.restUrl}leads`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': config.nonce },
				body: JSON.stringify(data),
			});
			const body = await res.json().catch(() => ({}));
			if (!res.ok) {
				const fields = body?.data?.fields || {};
				Object.keys(fields).forEach((k) => form.elements[k]?.setAttribute('aria-invalid', 'true'));
				throw new Error(body.message || 'Something went wrong. Please call us instead.');
			}
			const launch = body.intent === 'launch_list';
			const first = (data.name || '').split(' ')[0];
			steps.forEach((s) => s.classList.remove('is-current'));
			$('.vision__nav', form).hidden = true;
			bar.style.width = '100%';
			count.textContent = '';
			$('[data-done-title]', done).textContent = launch ? `You're on the list, ${first}.` : `Thank you, ${first}.`;
			$('[data-done-text]', done).textContent = launch
				? 'We will let you know as soon as Cali WaterScapes starts taking projects.'
				: `Your project is with the ${body.line} team. We will be in touch soon.`;
			done.hidden = false;
			done.focus();
			track('lead_submit', { line: data.line, intent: body.intent });
		} catch (err) {
			error.textContent = err.message;
			error.hidden = false;
			next.disabled = false;
			nextLabel.textContent = isLaunch() ? 'Join the list' : 'Send my project';
		}
	});

	// Arriving with ?line=… preselects the specialty and starts at the next question.
	const preset = new URLSearchParams(location.search).get('line');
	if (!lineValue() && preset) {
		const r = form.querySelector(`input[name="line"][value="${CSS.escape(preset)}"]`);
		if (r) r.checked = true;
	}
	if (lineValue()) i = 1;
	render(false);
}
