/* Target CPA page, Step 3: hold alpha fixed for the whole day and see conversions and CPA.
   Uses the shared simulation in tcpa-sim.js. */
WIDGETS.tcpadial = function (el) {
  const day = TCPA.day(), { pts, best } = TCPA.sweep(day), T = TCPA.TARGET;
  const uid = Math.random().toString(36).slice(2, 7);
  const W = 520, L = 46, R = 14, P1 = { top: 12, h: 110 }, P2 = { top: 150, h: 110 }, H = 290;
  const AMIN = 0.5, AMAX = 3, CPA_MAX = 30, CONV_MAX = Math.ceil(Math.max(...pts.map(p => p.convs)) / 500) * 500;
  const x = a => L + (a - AMIN) / (AMAX - AMIN) * (W - L - R);
  const yCpa = v => P1.top + (1 - v / CPA_MAX) * P1.h;
  const yConv = v => P2.top + (1 - v / CONV_MAX) * P2.h;
  const line = (f, key) => pts.map(p => `${x(p.alpha).toFixed(1)},${f(p[key]).toFixed(1)}`).join(' ');
  const grid = (panel, ticks, f, fmt) => ticks.map(v => `<line class="grid-l" x1="${L}" x2="${W - R}" y1="${f(v)}" y2="${f(v)}"/><text class="lbl" x="${L - 8}" y="${f(v) + 4}" text-anchor="end">${fmt(v)}</text>`).join('');

  el.innerHTML = `
    <div class="w-head"><h5>The α dial</h5><p>Every bid all day is α × pConv × $20. Slide α and see the whole day's result.</p></div>
    <div class="slider-row"><label for="a${uid}">α (alpha)</label><input id="a${uid}" type="range" min="${AMIN}" max="${AMAX}" step="0.05" value="1"><span class="num" data-o="a"></span></div>
    <div class="outcomes" aria-live="polite">
      <div class="outcome"><span class="label">Conversions</span><span class="big" data-o="conv"></span><span data-o="convs"></span></div>
      <div class="outcome"><span class="label">Cost per conversion</span><span class="big" data-o="cpa"></span><span data-o="cpas"></span></div>
      <div class="outcome"><span class="label">Spend</span><span class="big" data-o="spend"></span><span data-o="wins"></span></div>
    </div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="As alpha rises, cost per conversion and conversions both rise. Cost reaches the $20 target at alpha ${best.alpha.toFixed(2)}.">
      ${grid(P1, [0, 10, 20, 30], yCpa, v => '$' + v)}
      <line class="target-l" x1="${L}" x2="${W - R}" y1="${yCpa(T)}" y2="${yCpa(T)}"/>
      <text class="lbl" x="${W - R}" y="${yCpa(T) - 5}" text-anchor="end">$20 target</text>
      <polyline class="curve ink" points="${line(yCpa, 'cpa')}"/>
      <text class="lbl strong" x="${L + 4}" y="${P1.top + 10}">Cost per conversion</text>
      ${grid(P2, [0, CONV_MAX / 2, CONV_MAX], yConv, v => v.toLocaleString())}
      <polyline class="curve" points="${line(yConv, 'convs')}"/>
      <text class="lbl strong" x="${L + 4}" y="${P2.top + 10}">Conversions</text>
      <line class="best-l" x1="${x(best.alpha)}" x2="${x(best.alpha)}" y1="${P1.top}" y2="${P2.top + P2.h}"/>
      <text class="lbl" x="${x(best.alpha) + 4}" y="${P2.top + P2.h - 6}">best α ${best.alpha.toFixed(2)}</text>
      ${[0.5, 1, 1.5, 2, 2.5, 3].map(a => `<text class="lbl" x="${x(a)}" y="${H - 8}" text-anchor="${a === AMIN ? 'start' : a === AMAX ? 'end' : 'middle'}">${a}</text>`).join('')}
      <line class="guide" data-o="g" y1="${P1.top}" y2="${P2.top + P2.h}"/>
      <circle class="marker" data-o="d1" r="5"/><circle class="marker" data-o="d2" r="5"/>
    </svg>
    <p class="w-note" data-o="note"></p>`;

  const input = $('input', el), o = k => $(`[data-o="${k}"]`, el);
  const upd = () => {
    const a = +input.value, p = pts.reduce((b, q) => (Math.abs(q.alpha - a) < Math.abs(b.alpha - a) ? q : b), pts[0]);
    o('a').textContent = a.toFixed(2);
    o('conv').textContent = p.convs.toLocaleString();
    o('convs').textContent = `${Math.round(100 * p.convs / best.convs)}% of the best within target`;
    o('cpa').textContent = money(p.cpa);
    o('cpa').className = 'big ' + (p.cpa > T + 0.005 ? 'neg-v' : '');
    o('cpas').textContent = p.cpa > T + 0.005 ? `${money(p.cpa - T)} over the $20 target` : `${money(T - p.cpa)} of room left under $20`;
    o('spend').textContent = '$' + Math.round(p.spend).toLocaleString();
    o('wins').textContent = `won ${(100 * p.wins / day.length).toFixed(1)}% of auctions`;
    o('g').setAttribute('x1', x(p.alpha)); o('g').setAttribute('x2', x(p.alpha));
    o('d1').setAttribute('cx', x(p.alpha)); o('d1').setAttribute('cy', yCpa(Math.min(p.cpa, CPA_MAX)));
    o('d2').setAttribute('cx', x(p.alpha)); o('d2').setAttribute('cy', yConv(p.convs));
    o('note').textContent = Math.abs(p.alpha - best.alpha) < 0.026
      ? `This is the best fixed α: the most conversions you can get while the cost stays at or under $20.`
      : p.cpa <= T
      ? `Under target. The advertiser would happily pay more per conversion, so turning α up wins more of them.`
      : `Over target. Each extra conversion now costs more than the advertiser agreed to, so α has gone too far.`;
  };
  input.addEventListener('input', upd); upd();
};
