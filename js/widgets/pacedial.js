/* Maximize Conversions page, Step 2: hold m fixed for the whole day and watch the budget.
   Uses the shared simulation in pacing-sim.js. */
WIDGETS.pacedial = function (el) {
  const day = PACE.day(), { pts, best } = PACE.sweep(day), B = PACE.BUDGET, N = PACE.WINDOWS;
  const uid = Math.random().toString(36).slice(2, 7);
  const W = 520, L = 50, R = 14, TOP = 24, PH = 200, H = 256;
  const MMIN = 4, MMAX = 40;
  const x = w => L + (w + 1) / N * (W - L - R);
  const y = v => TOP + (1 - v / B) * PH;
  const grid = [0, 2000, 4000, 6000].map(v => `<line class="grid-l" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="lbl" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">$${v.toLocaleString()}</text>`).join('');
  const hours = [0, 6, 12, 18, 24].map(h => `<text class="lbl" x="${L + h / 24 * (W - L - R)}" y="${H - 8}" text-anchor="${h === 0 ? 'start' : h === 24 ? 'end' : 'middle'}">${h === 24 ? 'midnight' : String(h).padStart(2, '0') + ':00'}</text>`).join('');

  el.innerHTML = `
    <div class="w-head"><h5>The m dial</h5><p>Every bid all day is m × pConv, where m is the most you'll pay for a conversion. The budget is $6,000. Slide m and watch when the money runs out.</p></div>
    <div class="slider-row"><label for="m${uid}">m ($ per conversion)</label><input id="m${uid}" type="range" min="${MMIN}" max="${MMAX}" step="0.5" value="30"><span class="num" data-o="m"></span></div>
    <div class="outcomes" aria-live="polite">
      <div class="outcome"><span class="label">Conversions</span><span class="big" data-o="conv"></span><span data-o="convs"></span></div>
      <div class="outcome"><span class="label">Budget runs out at</span><span class="big" data-o="gone"></span><span data-o="gones"></span></div>
      <div class="outcome"><span class="label">Left unspent at midnight</span><span class="big" data-o="left"></span><span data-o="lefts"></span></div>
    </div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Spending through the day for a fixed m. High m spends the budget by morning, low m leaves money unspent.">
      ${grid}
      <line class="target-l" x1="${L}" x2="${W - R}" y1="${y(B)}" y2="${y(B)}"/>
      <text class="lbl" x="${W - R}" y="${y(B) - 5}" text-anchor="end">$6,000 budget</text>
      <polyline class="curve ink" data-o="line" points=""/>
      <text class="lbl strong" x="${L + 4}" y="${TOP + 24}">Spent so far</text>
      ${hours}
      <line class="guide" data-o="g" y1="${TOP}" y2="${TOP + PH}"/>
    </svg>
    <p class="w-note" data-o="note"></p>`;

  const input = $('input', el), o = k => $(`[data-o="${k}"]`, el);
  const upd = () => {
    const m = +input.value, p = pts.reduce((b, q) => (Math.abs(q.mult - m) < Math.abs(b.mult - m) ? q : b), pts[0]);
    o('m').textContent = money(p.mult);
    o('line').setAttribute('points', `${L},${y(0)} ` + p.windows.map((w, i) => `${x(i).toFixed(1)},${y(w.spend).toFixed(1)}`).join(' '));
    o('conv').textContent = p.convs.toLocaleString();
    o('convs').textContent = Math.abs(p.mult - best.mult) < 0.01 ? 'the best any fixed m can do' : `${Math.round(100 * p.convs / best.convs)}% of the best fixed m's ${best.convs}`;
    o('gone').textContent = p.gone >= 0 ? PACE.clock(p.gone) : 'never';
    o('gone').className = 'big ' + (p.gone >= 0 && p.gone < N - 8 ? 'neg-v' : '');
    o('gones').textContent = p.gone >= 0 ? `${((N - 1 - p.gone) / 4).toFixed(1)} hours with no budget` : 'money lasts all day';
    o('left').textContent = '$' + Math.round(B - p.spend).toLocaleString();
    o('lefts').textContent = `${Math.round(100 * (B - p.spend) / B)}% of the budget`;
    const gx = p.gone >= 0 ? x(p.gone) : W - R;
    o('g').setAttribute('x1', gx); o('g').setAttribute('x2', gx);
    o('note').textContent = Math.abs(p.mult - best.mult) < 1
      ? `Around ${money(best.mult)}, the budget lasts almost exactly until midnight. That's the best fixed m: ${best.convs} conversions, and the most any single m can get on this day.`
      : p.mult > best.mult
      ? `Too high. The bidder wins expensive auctions all morning and is out of money by ${PACE.clock(p.gone >= 0 ? p.gone : N - 1)}. Every afternoon and evening auction, including the cheap ones, is lost.`
      : `Too low. The bidder only wins the cheapest auctions, and $${Math.round(B - p.spend).toLocaleString()} is left at midnight. That money could have bought more conversions.`;
  };
  input.addEventListener('input', upd); upd();
};
