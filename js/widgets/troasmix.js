/* Target ROAS page: where each strategy's sales come from, by order size. Both bidders are tuned
   in hindsight to the same 300% ROAS. Uses the shared simulation in troas-sim.js. */
WIDGETS.troasmix = function (el) {
  const { aware, blind } = TROAS.compare(), B = TROAS.BUCKETS;
  let metric = 'sales';
  const W = 520, L = 56, R = 14, TOP = 12, PH = 190, H = 236, GROUP = (W - L - R) / B.length, BAR = 26;

  el.innerHTML = `
    <div class="w-head"><h5>Where the money goes</h5><p>Two bidders on the same day, both tuned to exactly the 300% ROAS target. One bids on each impression's predicted order value (Target ROAS). The other treats every order as average-sized, as Target CPA does.</p></div>
    <div class="ctrls"><span class="seg" role="group" aria-label="Show">${[['sales', 'Sales ($)'], ['orders', 'Orders']].map(([k, t]) => `<button type="button" data-k="${k}" aria-pressed="${k === metric}">${t}</button>`).join('')}</span></div>
    <div class="outcomes">
      <div class="outcome"><span class="label">Value-aware (Target ROAS)</span><span class="big">$${Math.round(aware.sales).toLocaleString()}</span><span>${aware.orders.toLocaleString()} orders · ROAS ${Math.round(100 * aware.roas)}%</span></div>
      <div class="outcome"><span class="label">Value-blind (like Target CPA)</span><span class="big">$${Math.round(blind.sales).toLocaleString()}</span><span>${blind.orders.toLocaleString()} orders · ROAS ${Math.round(100 * blind.roas)}%</span></div>
      <div class="outcome"><span class="label">Extra sales from using order value</span><span class="big">+${Math.round(100 * (aware.sales / blind.sales - 1))}%</span><span>same ROAS target</span></div>
    </div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Sales by order size for both bidders. The value-aware bidder wins far more large orders."><g data-o="g"></g></svg>
    <div class="tlegend"><span><i class="sw-aware"></i>Value-aware</span><span><i class="sw-blind"></i>Value-blind</span></div>
    <p class="w-note" data-o="note"></p>`;

  const draw = () => {
    const get = r => r.byBucket.map(b => metric === 'sales' ? b.sales : b.orders);
    const a = get(aware), b = get(blind), max = Math.max(...a, ...b) * 1.1;
    const y = v => TOP + (1 - v / max) * PH;
    const fmt = v => metric === 'sales' ? '$' + (v >= 1000 ? Math.round(v / 1000) + 'k' : Math.round(v)) : Math.round(v).toLocaleString();
    const ticks = [0, max / 3, 2 * max / 3].map(v => `<line class="grid-l" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="lbl" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${fmt(v)}</text>`).join('');
    const bars = B.map((bk, i) => {
      const cx = L + GROUP * (i + 0.5);
      return `<rect class="bar-aware" x="${cx - BAR - 2}" width="${BAR}" y="${y(a[i])}" height="${TOP + PH - y(a[i])}"/>`
        + `<rect class="bar-blind" x="${cx + 2}" width="${BAR}" y="${y(b[i])}" height="${TOP + PH - y(b[i])}"/>`
        + `<text class="lbl" x="${cx}" y="${H - 18}" text-anchor="middle">${bk[2]}</text>`;
    }).join('');
    $('[data-o="g"]', el).innerHTML = ticks + bars + `<text class="lbl" x="${L + (W - L - R) / 2}" y="${H - 4}" text-anchor="middle">predicted order size</text>`;
    const big = B.length - 1;
    $('[data-o="note"]', el).textContent = metric === 'sales'
      ? `The value-blind bidder pays the same for a likely $15 order as for a likely $300 one, so it overpays for small orders and gets outbid on big ones. Above $200 it wins ${blind.byBucket[big].orders} order${blind.byBucket[big].orders === 1 ? '' : 's'}, against ${aware.byBucket[big].orders} for the value-aware bidder.`
      : `Count orders instead of dollars and the two look similar: ${aware.orders.toLocaleString()} against ${blind.orders.toLocaleString()}. The value-blind bidder's orders are just smaller. That's why Target CPA, which counts conversions, is the wrong goal for a shop with very different prices.`;
  };
  el.addEventListener('click', e => {
    const k = e.target.closest('[data-k]');
    if (!k) return;
    metric = k.dataset.k; $$('[data-k]', el).forEach(x => x.setAttribute('aria-pressed', x === k)); draw();
  });
  draw();
};
