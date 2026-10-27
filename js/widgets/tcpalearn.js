/* Target CPA page, Step 5: replay the day with the controller learning alpha window by window.
   Uses the shared simulation in tcpa-sim.js. */
WIDGETS.tcpalearn = function (el) {
  const day = TCPA.day(), { best } = TCPA.sweep(day), T = TCPA.TARGET;
  const STEPS = [0.1, 0.25, 0.5, 1, 2];
  const W = 520, L = 46, R = 14, P1 = { top: 12, h: 110 }, P2 = { top: 150, h: 110 }, H = 290, AMAX = 4, CPA_MAX = 40;
  let step = 0.25, trust = 0, run = null, shown = 0, timer = null;
  const TRUST = 100;

  el.innerHTML = `
    <div class="w-head"><h5>Watch the controller learn</h5><p>α starts at 1. After every 1,000 auctions the controller looks at the cost so far and nudges α. The dashed line is the best fixed α, which the controller never gets to see.</p></div>
    <div class="ctrls">
      <span class="seg" role="group" aria-label="Step size">${STEPS.map(s => `<button type="button" data-s="${s}" aria-pressed="${s === step}">step ${s}</button>`).join('')}</span>
      <button type="button" class="btn btn-ghost-toggle btn-sm" data-a="trust" aria-pressed="false">Scale step by data</button>
      <button type="button" class="btn btn-primary btn-sm" data-a="play">Replay the day</button>
    </div>
    <div class="outcomes" aria-live="polite">
      <div class="outcome"><span class="label">Conversions</span><span class="big" data-o="conv"></span><span data-o="convs"></span></div>
      <div class="outcome"><span class="label">Cost per conversion so far</span><span class="big" data-o="cpa"></span><span>target $20</span></div>
      <div class="outcome"><span class="label">α now</span><span class="big" data-o="alpha"></span><span>best fixed α ${best.alpha.toFixed(2)}</span></div>
    </div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Alpha and the running cost per conversion over the 100 windows of the day.">
      <g data-o="static"></g>
      <polyline class="curve" data-o="la" points=""/>
      <polyline class="curve ink" data-o="lc" points=""/>
      <circle class="marker" data-o="da" r="4"/><circle class="marker" data-o="dc" r="4"/>
    </svg>
    <p class="w-note" data-o="note"></p>`;

  const o = k => $(`[data-o="${k}"]`, el);
  const n = () => run.windows.length;
  const x = i => L + i / (n() - 1) * (W - L - R);
  const yA = v => P1.top + (1 - Math.min(v, AMAX) / AMAX) * P1.h;
  const yC = v => P2.top + (1 - Math.min(v, CPA_MAX) / CPA_MAX) * P2.h;
  const drawStatic = () => {
    const g = (ticks, f, fmt) => ticks.map(v => `<line class="grid-l" x1="${L}" x2="${W - R}" y1="${f(v)}" y2="${f(v)}"/><text class="lbl" x="${L - 8}" y="${f(v) + 4}" text-anchor="end">${fmt(v)}</text>`).join('');
    o('static').innerHTML = g([0, 1, 2, 3, 4], yA, v => v)
      + `<line class="best-l" x1="${L}" x2="${W - R}" y1="${yA(best.alpha)}" y2="${yA(best.alpha)}"/><text class="lbl" x="${L + 22}" y="${yA(best.alpha) - 5}">best fixed α</text>`
      + `<text class="lbl strong" x="${L + 4}" y="${P1.top + 10}">α</text>`
      + g([0, 20, 40], yC, v => '$' + v)
      + `<line class="target-l" x1="${L}" x2="${W - R}" y1="${yC(T)}" y2="${yC(T)}"/><text class="lbl" x="${L + 22}" y="${yC(T) - 5}">$20 target</text>`
      + `<text class="lbl strong" x="${L + 4}" y="${P2.top + 10}">Cost per conversion so far</text>`
      + [0, 25, 50, 75, 100].map(i => `<text class="lbl" x="${L + i / 100 * (W - L - R)}" y="${H - 8}" text-anchor="${i === 0 ? 'start' : i === 100 ? 'end' : 'middle'}">${i === 100 ? '100 windows' : i}</text>`).join('');
  };
  const draw = () => {
    const ws = run.windows.slice(0, shown), last = ws[ws.length - 1];
    const alphaAfter = i => (i + 1 < run.windows.length ? run.windows[i + 1].alpha : run.alpha);
    o('la').setAttribute('points', ws.map((w, i) => `${x(i).toFixed(1)},${yA(alphaAfter(i)).toFixed(1)}`).join(' '));
    o('lc').setAttribute('points', ws.filter(w => w.convs > 0).map((w, i, arr) => `${x(ws.indexOf(w)).toFixed(1)},${yC(w.cpa).toFixed(1)}`).join(' '));
    const i = shown - 1, aNow = alphaAfter(i);
    o('da').setAttribute('cx', x(i)); o('da').setAttribute('cy', yA(aNow));
    o('dc').setAttribute('cx', x(i)); o('dc').setAttribute('cy', yC(last.cpa));
    o('conv').textContent = last.convs.toLocaleString();
    o('convs').textContent = shown === n() ? `${Math.round(100 * last.convs / best.convs)}% of the best fixed α's ${best.convs.toLocaleString()}` : `window ${shown} of ${n()}`;
    o('cpa').textContent = last.convs ? money(last.cpa) : '—';
    o('cpa').className = 'big ' + (last.cpa > T * 1.05 ? 'neg-v' : '');
    o('alpha').textContent = aNow.toFixed(2);
    if (shown < n()) { o('note').textContent = 'Running…'; return; }
    const pct = Math.round(100 * last.convs / best.convs);
    if (trust) {
      o('note').textContent = step >= 2
        ? `Even with data-scaled steps, a step of 2 is too big: once enough data arrives, the full step kicks in and α lurches. Scaling helps, but it can't rescue every setting.`
        : `With data-scaled steps, early windows (few conversions) barely move α, and the full step only kicks in once there's enough data to trust. Result: ${pct}% of the best conversions at ${money(last.cpa)}, much less sensitive to which step you picked.`;
      return;
    }
    o('note').textContent = {
      0.1: `A small step learns slowly but steadily. α is still creeping up as the day ends, so many auctions were bid too cautiously.`,
      0.25: `A good step size: α rises from 1 to about the best value and stays there, and the cost settles near $20. This is the behavior to aim for.`,
      0.5: `This is the step your C++ project uses. α wobbles above and below the best value as the running cost catches up, but the day still ends near $20 with ${pct}% of the best conversions.`,
      1: `Too big a step: α overshoots, then the running cost, which remembers every expensive window, keeps pushing α down until it hits the floor. The day is mostly lost.`,
      2: `Far too big: α lurches up and down every few windows. The cost ends near target only by luck, with ${pct}% of the best conversions.`
    }[step];
  };
  const play = () => {
    clearInterval(timer);
    run = TCPA.runDay(day, 1, step, TCPA.WINDOW, trust); shown = 1; drawStatic(); draw();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { shown = n(); draw(); return; }
    timer = setInterval(() => { shown = Math.min(n(), shown + 2); draw(); if (shown >= n()) clearInterval(timer); }, 30);
  };
  el.addEventListener('click', e => {
    const s = e.target.closest('[data-s]');
    if (s) { step = +s.dataset.s; $$('[data-s]', el).forEach(b => b.setAttribute('aria-pressed', b === s)); play(); return; }
    const t = e.target.closest('[data-a="trust"]');
    if (t) { trust = trust ? 0 : TRUST; t.setAttribute('aria-pressed', !!trust); play(); return; }
    if (e.target.closest('[data-a="play"]')) play();
  });
  // open on the finished run so the page is complete at rest
  run = TCPA.runDay(day, 1, step, TCPA.WINDOW, trust); shown = n(); drawStatic(); draw();
};
