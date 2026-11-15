// Live water render (caustics) for Cali WaterScapes concept visuals.
// One small fragment shader; renders at reduced resolution and only while on screen.
import { reduced } from '../core/config.js';

const FRAG = `precision mediump float;
uniform vec2 r; uniform float t; uniform vec3 a; uniform vec3 b;
void main(){
	vec2 uv = gl_FragCoord.xy / r.y;
	vec2 p = mod(uv * 6.28318 * 1.05, 6.28318) - 250.;
	vec2 i = p; float c = 1.; float n = .005;
	for (int k = 0; k < 5; k++) {
		float tt = t * (1. - (3.5 / float(k + 1)));
		i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
		c += 1. / length(vec2(p.x / (sin(i.x + tt) / n), p.y / (cos(i.y + tt) / n)));
	}
	c /= 5.; c = 1.17 - pow(c, 1.4);
	float v = pow(abs(c), 8.);
	vec3 col = mix(a, b, clamp(v, 0., 1.));
	float vg = smoothstep(1.25, .25, length(gl_FragCoord.xy / r - .5));
	gl_FragColor = vec4(col * mix(.7, 1., vg), 1.);
}`;

const TINTS = {
	deep: [[0.04, 0.12, 0.12], [0.55, 0.74, 0.71]],
	pool: [[0.07, 0.30, 0.33], [0.86, 0.95, 0.93]],
};

const active = new Set();
let running = false;

function frame(ts) {
	active.forEach((w) => draw(w, ts / 1000));
	if (active.size) requestAnimationFrame(frame);
	else running = false;
}

function draw(w, time) {
	const { gl, cv } = w;
	const s = Math.min(devicePixelRatio || 1, 1.5) * 0.55;
	const W = Math.max(2, Math.round(cv.clientWidth * s));
	const H = Math.max(2, Math.round(cv.clientHeight * s));
	if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; gl.viewport(0, 0, W, H); }
	gl.uniform2f(w.uR, W, H);
	gl.uniform1f(w.uT, time * 0.35 + w.offset);
	gl.drawArrays(gl.TRIANGLES, 0, 3);
}

export default function water(cv) {
	const gl = cv.getContext('webgl', { antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
	if (!gl) { cv.style.background = 'linear-gradient(160deg,#123b3d,#6f9f99)'; return; }
	const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
	const pr = gl.createProgram();
	gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
	gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
	gl.linkProgram(pr);
	gl.useProgram(pr);
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
	const loc = gl.getAttribLocation(pr, 'p');
	gl.enableVertexAttribArray(loc);
	gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
	const tint = TINTS[cv.dataset.tint] || TINTS.pool;
	gl.uniform3fv(gl.getUniformLocation(pr, 'a'), tint[0]);
	gl.uniform3fv(gl.getUniformLocation(pr, 'b'), tint[1]);

	const w = { cv, gl, uR: gl.getUniformLocation(pr, 'r'), uT: gl.getUniformLocation(pr, 't'), offset: Math.random() * 40 };
	draw(w, 8);

	if (reduced) return;
	new IntersectionObserver(([e]) => {
		if (e.isIntersecting) {
			active.add(w);
			if (!running) { running = true; requestAnimationFrame(frame); }
		} else active.delete(w);
	}, { rootMargin: '120px' }).observe(cv);
}
