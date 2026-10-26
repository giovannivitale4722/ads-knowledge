/* Autobidding strategies page: run all four strategies on the same day for a chosen budget.
   Uses autobid-sim.js (which builds on tcpa-sim.js). */
WIDGETS.abcompare = function (el) {
  const uid = Math.random().toString(36).slice(2, 7);
  const W = 520, L = 52, R = 14, P1 = { top: 12, h: 110 }, P2 = { top: 150, h: 100 }, H = 280;
  let sel = 'tcpa', results = null, raf = 0;
  const GOAL_COL = { clicks: 'clicks', conv: 'convs', tcpa: 'convs', troas: 'value' };

  el.innerHTML = `
    <div class="w-head"><h5>Four strategies, one day</h5><p>The same 100,000 auctions as the Target CPA page. Pick a daily budget. Target CPA aims for $20 per conversion and Target ROAS for $3 of sales per $1 spent.</p></div>
    <div class="slider-row"><label for="b${uid}">Daily budget</label><input id="b${uid}" type="range" min="3000" max="45000" step="1000" value="15000"><span class="num" data-o="b"></span></div>
    <div class="tbl-wrap"><table class="ab-table">
      <tr><th>Strategy</th><th class="num">Spent</th><th class="num">Clicks</th><th class="num">Conversions</th><th class="num">Cost per conv.</th><th class="num">Sales value</th><th class="num">ROAS</th><th>Held back by</th></tr>
      <tbody data-o="rows"></tbody>
    </table></div>
    <p class="ab-key"><span class="goal-chip">Highlighted</span> each strategy's own goal. Bold is the best in that column.</p>
    <div class="ctrls"><span class="seg" role="group" aria-label="Show strategy">${ABID.STRATS.map(s => `<button type="button" data-s="${s.id}" aria-pressed="${s.id === sel}">${s.name}</button>`).join('')}</span></div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Spending through the day against an even plan, and the bid multiplier, for the selected strategy.">
      <g data-o="chart"></g>
    </svg>
    <p class="w-note" data-o="note"></p>`;

  const o = k => $(`[data-o="${k}"]`, el), input = $('input', el);
  const fmt$ = v => '$' + Math.round(v).toLocaleString();
  const x = i => L + i / (ABID.WINDOWS - 1) * (W - L - R);

  const drawChart = () => {
    const r = results[sel], B = r.budget, n = ABID.WINDOWS;
    const yS = v => P1.top + (1 - v / B) * P1.h;
    const mults = r.windows.map(w => w.mult), mMax = Math.max(...mults) * 1.15 || 1;
    const nice = mMax > 20 ? Math.ceil(mMax / 10) * 10 : mMax > 4 ? Math.ceil(mMax) : Math.ceil(mMax * 4) / 4;
    const yM = v => P2.top + (1 - v / nice) * P2.h;
    const grid = (ticks, f, lab) => ticks.map(v => `<line class="grid-l" x1="${L}" x2="${W - R}" y1="${f(v)}" y2="${f(v)}"/><text class="lbl" x="${L - 8}" y="${f(v) + 4}" text-anchor="end">${lab(v)}</text>`).join('');
    const isTarget = sel === 'tcpa' || sel === 'troas';
    o('chart').innerHTML =
      grid([0, B / 2, B], yS, v => v === 0 ? '$0' : '$' + +(v / 1000).toFixed(1) + 'k')
      + `<line class="best-l" x1="${x(0)}" y1="${yS(B / n)}" x2="${x(n - 1)}" y2="${yS(B)}"/>`
      + `<polyline class="curve" points="${r.windows.map((w, i) => `${x(i).toFixed(1)},${yS(w.spend).toFixed(1)}`).join(' ')}"/>`
      + `<text class="lbl strong" x="${L + 4}" y="${P1.top + 10}">Spent so far <tspan class="lbl">(dashed line: an even plan)</tspan></text>`
      + grid([0, nice / 2, nice], yM, v => +v.toFixed(2))
      + `<polyline class="curve ink" points="${mults.map((m, i) => `${x(i).toFixed(1)},${yM(m).toFixed(1)}`).join(' ')}"/>`
      + `<text class="lbl strong" x="${L + 4}" y="${P2.top + 10}">${isTarget ? 'Multiplier (α × pacing)' : 'Pacing multiplier'}</text>`
      + [0, 25, 50, 75, 100].map(i => `<text class="lbl" x="${L + i / 100 * (W - L - R)}" y="${H - 6}" text-anchor="${i === 0 ? 'start' : i === 100 ? 'end' : 'middle'}">${i === 100 ? 'end of day' : i + '%'}</text>`).join('');
  };

  const note = () => {
    const B = +input.value, t = results.tcpa, ro = results.troas, mc = results.conv;
    if (t.limitedBy === 'Budget' && ro.limitedBy === 'Budget') return `At ${fmt$(B)} every strategy runs out of budget, so the budget is the tighter limit for all four. Target CPA lands at ${money(t.cpa)} per conversion, under its $20 target: this advertiser could spend more.`;
    if (t.limitedBy !== 'Budget') return `At ${fmt$(B)} Target CPA stops spending at ${fmt$(t.spend)}, because buying more would push its cost per conversion past $20. Maximize Conversions keeps spending the whole budget, and its cost per conversion rises to ${money(mc.cpa)}.`;
    return `At ${fmt$(B)} the budget still limits Target CPA, but Target ROAS is starting to be held back by its 3× target.`;
  };

  const render = () => {
    const B = +input.value;
    o('b').textContent = fmt$(B);
    results = Object.fromEntries(ABID.STRATS.map(s => [s.id, ABID.run(s.id, B)]));
    const cols = ['clicks', 'convs', 'value', 'roas'], best = {};
    cols.forEach(k => { best[k] = Math.max(...Object.values(results).map(r => r[k])); });
    best.cpa = Math.min(...Object.values(results).map(r => r.cpa));
    const cell = (r, k, text) => `<td class="num${GOAL_COL[r.id] === k ? ' goal' : ''}${Math.abs(r[k] - best[k]) < 1e-9 ? ' best' : ''}">${text}</td>`;
    o('rows').innerHTML = ABID.STRATS.map(s => {
      const r = results[s.id];
      return `<tr class="${s.id === sel ? 'sel' : ''}"><td><b>${s.name}</b></td><td class="num">${fmt$(r.spend)} <span class="muted">${Math.round(100 * r.spend / B)}%</span></td>
        ${cell(r, 'clicks', r.clicks.toLocaleString())}${cell(r, 'convs', r.convs.toLocaleString())}${cell(r, 'cpa', money(r.cpa))}
        ${cell(r, 'value', fmt$(r.value))}${cell(r, 'roas', r.roas.toFixed(2) + '×')}<td>${r.limitedBy}</td></tr>`;
    }).join('');
    drawChart();
    o('note').textContent = note();
  };

  input.addEventListener('input', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(render); });
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-s]'); if (!b) return;
    sel = b.dataset.s; $$('[data-s]', el).forEach(x => x.setAttribute('aria-pressed', x === b));
    $$('.ab-table tbody tr', el).forEach((tr, i) => tr.classList.toggle('sel', ABID.STRATS[i].id === sel));
    drawChart();
  });
  render();
};
