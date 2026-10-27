/* "When everyone autobids" page: four Target CPA advertisers in one market. Uses market-sim.js. */
WIDGETS.marketsim = function (el) {
  const MODES = { none: [false, false, false, false], one: [true, false, false, false], all: [true, true, true, true] };
  const MODE_LABEL = { none: 'Nobody (all bid α = 1)', one: 'Only A autobids', all: 'Everyone autobids' };
  const STEPS = [0.1, 0.25, 0.6];
  const STYLE = ['s-a', 's-b', 's-c', 's-d'];
  const W = 520, L = 46, R = 30, P1 = { top: 26, h: 120 }, P2 = { top: 190, h: 80 }, H = 300;
  let mode = 'all', step = 0.1;
  const base = MKT.run(MODES.none, 0.1);

  el.innerHTML = `
    <div class="w-head"><h5>A market of autobidders</h5><p>Four advertisers compete for the same 60,000 impressions in second-price auctions. Each has its own Target CPA. Autobidders run the same α controller as the Target CPA page.</p></div>
    <div class="ctrls">
      <span class="seg" role="group" aria-label="Who autobids">${Object.keys(MODES).map(m => `<button type="button" data-m="${m}" aria-pressed="${m === mode}">${MODE_LABEL[m]}</button>`).join('')}</span>
      <span class="seg" role="group" aria-label="Controller step size">${STEPS.map(s => `<button type="button" data-s="${s}" aria-pressed="${s === step}">step ${s}</button>`).join('')}</span>
    </div>
    <div class="outcomes" aria-live="polite">
      <div class="outcome"><span class="label">Average price per impression</span><span class="big" data-o="price"></span><span data-o="prices"></span></div>
      <div class="outcome"><span class="label">Total conversions in the market</span><span class="big" data-o="convs"></span><span data-o="convss"></span></div>
    </div>
    <div class="tbl-wrap"><table>
      <tr><th>Advertiser</th><th class="num">Target CPA</th><th>Bids by</th><th class="num">Final α</th><th class="num">Actual CPA</th><th class="num">Conversions</th><th class="num">Spend</th></tr>
      <tbody data-o="rows"></tbody>
    </table></div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Each advertiser's alpha through the day, and the market's average price per impression."><g data-o="chart"></g></svg>
    <p class="w-note" data-o="note"></p>`;

  const o = k => $(`[data-o="${k}"]`, el);
  const pct = (v, b) => `${v >= b ? '+' : '−'}${Math.abs(Math.round(100 * (v - b) / b))}% vs nobody autobidding`;

  const render = () => {
    const r = MKT.run(MODES[mode], step), n = r.windows.length;
    o('price').textContent = '$' + r.avgPrice.toFixed(3);
    o('prices').textContent = mode === 'none' ? 'the baseline' : pct(r.avgPrice, base.avgPrice);
    o('convs').textContent = r.totalConvs.toLocaleString();
    o('convss').textContent = mode === 'none' ? 'the baseline' : pct(r.totalConvs, base.totalConvs);
    o('rows').innerHTML = r.ads.map((a, j) => {
      const b = base.ads[j], off = a.cpa > a.target * 1.08;
      return `<tr><td><span class="sw ${STYLE[j]}"></span><b>${a.id}</b></td><td class="num">${money(a.target)}</td><td>${a.autobid ? 'Autobidder' : 'Fixed α = 1'}</td>
        <td class="num">${a.alpha.toFixed(2)}</td><td class="num ${off ? 'neg-v' : ''}">${a.convs ? money(a.cpa) : '—'}</td>
        <td class="num">${a.convs.toLocaleString()} <span class="muted">(${a.convs >= b.convs ? '+' : '−'}${Math.abs(a.convs - b.convs)})</span></td><td class="num">$${Math.round(a.spend).toLocaleString()}</td></tr>`;
    }).join('');
    // chart: alpha per advertiser, then market price
    const aMax = Math.max(2, Math.ceil(Math.max(...r.windows.flatMap(w => w.alpha)) + 0.5));
    const pMax = Math.ceil(Math.max(...r.windows.map(w => w.price), base.avgPrice) * 10) / 10 + 0.1;
    const x = i => L + i / (n - 1) * (W - L - R);
    const yA = v => P1.top + (1 - v / aMax) * P1.h, yP = v => P2.top + (1 - v / pMax) * P2.h;
    const grid = (ticks, f, lab) => ticks.map(v => `<line class="grid-l" x1="${L}" x2="${W - R}" y1="${f(v)}" y2="${f(v)}"/><text class="lbl" x="${L - 8}" y="${f(v) + 4}" text-anchor="end">${lab(v)}</text>`).join('');
    o('chart').innerHTML = grid([0, aMax / 2, aMax], yA, v => +v.toFixed(1))
      + `<text class="lbl strong" x="${L}" y="${P1.top - 12}">Each advertiser's α</text>`
      + r.ads.map((a, j) => `<polyline class="curve ${STYLE[j]}" points="${r.windows.map((w, i) => `${x(i).toFixed(1)},${yA(w.alpha[j]).toFixed(1)}`).join(' ')}"/>
          <text class="lbl strong" x="${W - R + 4}" y="${yA(r.windows[n - 1].alpha[j]) + 4}">${a.id}</text>`).join('')
      + grid([0, pMax], yP, v => '$' + v.toFixed(2))
      + `<line class="best-l" x1="${L}" x2="${W - R}" y1="${yP(base.avgPrice)}" y2="${yP(base.avgPrice)}"/>`
      + `<polyline class="curve ink" points="${r.windows.map((w, i) => `${x(i).toFixed(1)},${yP(w.price).toFixed(1)}`).join(' ')}"/>`
      + `<text class="lbl strong" x="${L}" y="${P2.top - 12}">Average price per impression <tspan class="lbl">(dashed: nobody autobidding)</tspan></text>`
      + [0, 50, 100].map(i => `<text class="lbl" x="${L + i / 100 * (W - L - R)}" y="${H - 6}" text-anchor="${i === 0 ? 'start' : i === 100 ? 'end' : 'middle'}">${i === 100 ? 'end of day' : i === 0 ? 'start' : 'midday'}</text>`).join('');
    const c = r.ads[2], d = r.ads[3];
    o('note').textContent = mode === 'none'
      ? 'Nobody autobids: everyone bids exactly pConv × their target. Every CPA lands well under its target, so all four are leaving room unused.'
      : mode === 'one'
      ? `Only A autobids. A raises its α, wins far more conversions and lands near its $20 target, taking impressions from the others. Prices rise for everyone.`
      : step >= 0.6
      ? `The controllers chase each other. C's α runs to its cap and the others collapse to the floor, leaving C with an almost uncontested, cheap market. That's instability, not a healthy equilibrium.`
      : `Everyone pushes α up until their own target binds, so prices rise. C, with the highest target, outbids the rest and wins ${c.convs.toLocaleString()} conversions. D, with the lowest target, is squeezed to ${d.convs}. Impressions now go to whoever will pay most, not whoever converts best, so total conversions fall.`;
  };
  el.addEventListener('click', e => {
    const m = e.target.closest('[data-m]'), s = e.target.closest('[data-s]');
    if (m) { mode = m.dataset.m; $$('[data-m]', el).forEach(b => b.setAttribute('aria-pressed', b === m)); }
    else if (s) { step = +s.dataset.s; $$('[data-s]', el).forEach(b => b.setAttribute('aria-pressed', b === s)); }
    else return;
    render();
  });
  render();
};
