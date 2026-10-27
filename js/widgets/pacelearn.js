/* Maximize Conversions page, Step 5: replay the day with the pacing controller, under either plan.
   Uses the shared simulation in pacing-sim.js. */
WIDGETS.pacelearn = function (el) {
  const day = PACE.day(), { best } = PACE.sweep(day), B = PACE.BUDGET, N = PACE.WINDOWS;
  const STEPS = [0.25, 0.5, 1];
  const W = 520, L = 50, R = 14, P1 = { top: 12, h: 120 }, P2 = { top: 160, h: 100 }, H = 290, MMAX = 50;
  let plan = 'traffic', step = 0.5, run = null, shown = 0, timer = null;

  el.innerHTML = `
    <div class="w-head"><h5>Watch the pacer</h5><p>m starts at $20. After every 15-minute window, the controller compares spending with the plan and nudges m. The grey bars are the day's traffic.</p></div>
    <div class="ctrls">
      <span class="seg" role="group" aria-label="Plan">${[['traffic', 'Traffic-shaped plan'], ['even', 'Even plan']].map(([k, t]) => `<button type="button" data-p="${k}" aria-pressed="${k === plan}">${t}</button>`).join('')}</span>
      <span class="seg" role="group" aria-label="Step size">${STEPS.map(s => `<button type="button" data-s="${s}" aria-pressed="${s === step}">step ${s}</button>`).join('')}</span>
      <button type="button" class="btn btn-primary btn-sm" data-a="play">Replay the day</button>
    </div>
    <div class="outcomes" aria-live="polite">
      <div class="outcome"><span class="label">Conversions</span><span class="big" data-o="conv"></span><span data-o="convs"></span></div>
      <div class="outcome"><span class="label">Spent so far</span><span class="big" data-o="spend"></span><span data-o="spends"></span></div>
      <div class="outcome"><span class="label">m now</span><span class="big" data-o="m"></span><span>best fixed m ${money(best.mult)}</span></div>
    </div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Spending against the plan, and the multiplier m, through the 96 windows of the day.">
      <g data-o="static"></g>
      <polyline class="curve ink" data-o="ls" points=""/>
      <polyline class="curve" data-o="lm" points=""/>
      <circle class="marker" data-o="ds" r="4"/><circle class="marker" data-o="dm" r="4"/>
    </svg>
    <p class="w-note" data-o="note"></p>`;

  const o = k => $(`[data-o="${k}"]`, el);
  const x = i => L + (i + 1) / N * (W - L - R);
  const yS = v => P1.top + (1 - v / B) * P1.h;
  const yM = v => P2.top + (1 - Math.min(v, MMAX) / MMAX) * P2.h;
  const drawStatic = () => {
    const g = (ticks, f, fmt) => ticks.map(v => `<line class="grid-l" x1="${L}" x2="${W - R}" y1="${f(v)}" y2="${f(v)}"/><text class="lbl" x="${L - 8}" y="${f(v) + 4}" text-anchor="end">${fmt(v)}</text>`).join('');
    const bw = (W - L - R) / N;
    const bars = PACE.TRAFFIC.map((t, i) => `<rect class="traffic-b" x="${(L + i * bw).toFixed(1)}" width="${(bw - 0.5).toFixed(1)}" y="${(P1.top + P1.h - t * P1.h * 0.45).toFixed(1)}" height="${(t * P1.h * 0.45).toFixed(1)}"/>`).join('');
    const planPts = `${L},${yS(0)} ` + PACE.PLANS[plan].map((v, i) => `${x(i).toFixed(1)},${yS(v).toFixed(1)}`).join(' ');
    o('static').innerHTML = bars
      + g([0, 3000, 6000], yS, v => '$' + v.toLocaleString())
      + `<polyline class="plan-l" points="${planPts}"/>`
      + `<text class="lbl strong" x="${L + 4}" y="${P1.top + 24}">Spent so far <tspan class="lbl">(dashed: the ${plan === 'even' ? 'even' : 'traffic-shaped'} plan)</tspan></text>`
      + g([0, 25, 50], yM, v => '$' + v)
      + `<line class="best-l" x1="${L}" x2="${W - R}" y1="${yM(best.mult)}" y2="${yM(best.mult)}"/><text class="lbl" x="${L + 22}" y="${yM(best.mult) - 5}">best fixed m</text>`
      + `<text class="lbl strong" x="${L + 4}" y="${P2.top + 10}">m</text>`
      + [0, 6, 12, 18, 24].map(h => `<text class="lbl" x="${L + h / 24 * (W - L - R)}" y="${H - 8}" text-anchor="${h === 0 ? 'start' : h === 24 ? 'end' : 'middle'}">${h === 24 ? 'midnight' : String(h).padStart(2, '0') + ':00'}</text>`).join('');
  };
  const draw = () => {
    const ws = run.windows.slice(0, shown), last = ws[ws.length - 1], i = shown - 1;
    const mAfter = k => (k + 1 < run.windows.length ? run.windows[k + 1].m : run.m);
    o('ls').setAttribute('points', `${L},${yS(0)} ` + ws.map((w, k) => `${x(k).toFixed(1)},${yS(w.spend).toFixed(1)}`).join(' '));
    o('lm').setAttribute('points', `${L},${yM(PACE.START_M)} ` + ws.map((w, k) => `${x(k).toFixed(1)},${yM(mAfter(k)).toFixed(1)}`).join(' '));
    o('ds').setAttribute('cx', x(i)); o('ds').setAttribute('cy', yS(last.spend));
    o('dm').setAttribute('cx', x(i)); o('dm').setAttribute('cy', yM(mAfter(i)));
    o('conv').textContent = last.convs.toLocaleString();
    o('convs').textContent = shown === N ? `${Math.round(100 * last.convs / best.convs)}% of the best fixed m's ${best.convs}` : `${PACE.clock(i)}`;
    o('spend').textContent = '$' + Math.round(last.spend).toLocaleString();
    const off = last.spend - last.planned;
    o('spends').textContent = Math.abs(off) < 0.03 * B ? 'on plan' : `${off > 0 ? 'ahead of' : 'behind'} plan by $${Math.round(Math.abs(off)).toLocaleString()}`;
    o('m').textContent = money(mAfter(i));
    if (shown < N) { o('note').textContent = 'Running…'; return; }
    const pct = Math.round(100 * last.convs / best.convs);
    if (plan === 'even') {
      const night = Math.max(...run.windows.slice(0, 24).map(w => w.m));
      o('note').textContent = `The even plan asks for the same spend at 3am as at noon. Night traffic is thin, so the pacer pushes m up to ${money(night)} to keep up, overpaying for those few auctions. When the morning crowd arrives with m still high, spending races ahead of plan and m gets slashed, so the busy, valuable hours are bid too cautiously. Result: ${pct}% of the best.`;
      return;
    }
    o('note').textContent = step >= 1
      ? `A big step makes m jumpy: it reacts hard to every window's noise. Still ${pct}% of the best here, because the plan matches the traffic, so most corrections are small anyway.`
      : `The plan expects little spend at night and a lot at midday, which matches how the auctions arrive. So spending tracks the plan with only small corrections, m stays near the best fixed value, and the day ends with the budget spent and ${pct}% of the best conversions.`;
  };
  const play = () => {
    clearInterval(timer);
    run = PACE.runDay(day, PACE.START_M, step, PACE.PLANS[plan]); shown = 1; drawStatic(); draw();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { shown = N; draw(); return; }
    timer = setInterval(() => { shown = Math.min(N, shown + 2); draw(); if (shown >= N) clearInterval(timer); }, 30);
  };
  el.addEventListener('click', e => {
    const p = e.target.closest('[data-p]');
    if (p) { plan = p.dataset.p; $$('[data-p]', el).forEach(b => b.setAttribute('aria-pressed', b === p)); play(); return; }
    const s = e.target.closest('[data-s]');
    if (s) { step = +s.dataset.s; $$('[data-s]', el).forEach(b => b.setAttribute('aria-pressed', b === s)); play(); return; }
    if (e.target.closest('[data-a="play"]')) play();
  });
  // open on the finished run so the page is complete at rest
  run = PACE.runDay(day, PACE.START_M, step, PACE.PLANS[plan]); shown = N; drawStatic(); draw();
};
