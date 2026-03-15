/* ── Hamburger toggle ──────────────────────────────────────────── */
const ham = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

ham.addEventListener('click', () => {
  ham.classList.toggle('open');
  navLinks.classList.toggle('open');
});

/* ── Static wavy background with animated-blur bullseye nodes ─── */
const canvas = document.getElementById('bg-canvas');
const ctx    = canvas.getContext('2d');

/* Resize canvas to fill viewport */
function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  buildTraces();   // recalculate wave geometry on resize
  drawWaves();     // redraw static waves immediately
}

/* ── Wave & node definitions ──────────────────────────────────── */
const TRACE_COUNT = 9;
let traces = [];

function buildTraces() {
  const W = canvas.width;
  const H = canvas.height;

  traces = Array.from({ length: TRACE_COUNT }, (_, i) => {
    const yBase = (i + 1) * (H / (TRACE_COUNT + 1));

    /* 2–4 nodes per trace, spread across the width */
    const nodeCount = 2 + Math.floor(Math.random() * 3);
    const nodes = Array.from({ length: nodeCount }, (__, j) => ({
      xFrac:      0.08 + (j / (nodeCount - 1 || 1)) * 0.84,  // spread 8%–92%
      outerR:     7 + Math.random() * 5,
      /* each node gets its own blur phase so they pulse independently */
      blurPhase:  Math.random() * Math.PI * 2,
      blurSpeed:  0.4 + Math.random() * 0.5,   // radians per second
    }));

    return {
      yBase,
      amp:   20 + Math.random() * 25,
      freq:  0.0016 + Math.random() * 0.001,
      phase: Math.random() * Math.PI * 2,
      nodes,
    };
  });
}

/* ── Draw the static wave paths (no node, no blur) ───────────── */
function drawWaves() {
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  traces.forEach(tr => {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(55, 55, 55, 0.9)';
    ctx.lineWidth   = 1.5;
    ctx.filter      = 'none';

    for (let x = 0; x <= W; x += 4) {
      const y = tr.yBase + tr.amp * Math.sin(tr.freq * x + tr.phase);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  });
}

/* ── Draw only the bullseye nodes on top each frame ──────────── */
function drawNodes(timestamp) {
  const W  = canvas.width;
  const H  = canvas.height;
  const t  = timestamp / 1000;  /* seconds */

  /* Clear and redraw waves first so nodes overlay them cleanly */
  ctx.clearRect(0, 0, W, H);
  drawWavePathsOnly();

  traces.forEach(tr => {
    tr.nodes.forEach(nd => {
      const x = nd.xFrac * W;
      const y = tr.yBase + tr.amp * Math.sin(tr.freq * x + tr.phase);
      const r = nd.outerR;

      /* Blur oscillates: 1.6px → 9.7px → 1.6px continuously */
      const MIN_BLUR = 1.6;
      const MAX_BLUR = 9.7;
      const sinVal   = (Math.sin(t * nd.blurSpeed + nd.blurPhase) + 1) / 2;  /* 0–1 */
      const blur     = MIN_BLUR + sinVal * (MAX_BLUR - MIN_BLUR);

      ctx.save();
      ctx.filter = `blur(${blur.toFixed(2)}px)`;

      /* Outer ring — stroke only, no fill */
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = '#F75183';
      ctx.lineWidth   = 1.8;
      ctx.fillStyle   = 'transparent';
      ctx.fill();
      ctx.stroke();

      /* Inner ring */
      ctx.beginPath();
      ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
      ctx.strokeStyle = '#F75183';
      ctx.lineWidth   = 1.4;
      ctx.fillStyle   = 'black';
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    });
  });

  requestAnimationFrame(drawNodes);
}

/* Draw wave paths only (no nodes) – used inside the animation loop */
function drawWavePathsOnly() {
  const W = canvas.width;

  traces.forEach(tr => {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(55, 55, 55, 0.9)';
    ctx.lineWidth   = 1.5;
    ctx.filter      = 'none';

    for (let x = 0; x <= W; x += 4) {
      const y = tr.yBase + tr.amp * Math.sin(tr.freq * x + tr.phase);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  });
}

/* ── Boot ─────────────────────────────────────────────────────── */
window.addEventListener('resize', resize);
resize();
requestAnimationFrame(drawNodes);
