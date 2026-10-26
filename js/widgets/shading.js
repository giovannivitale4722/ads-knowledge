WIDGETS.shading = function (el) {
  const V = 10, W = 520, H = 220, L = 44, R = 12, TP = 12, B = 30, YMAX = 3;
  const x = b => L + (b / V) * (W - L - R), y = p => TP + (1 - p / YMAX) * (H - TP - B);
  const prof = b => (V - b) * (b / V);
  const pts = []; for (let i = 0; i <= 100; i++) { const b = i / 10; pts.push(`${x(b).toFixed(1)},${y(prof(b)).toFixed(1)}`); }
  const grid = [1, 2, 3].map(p => `<line class="grid-l" x1="${L}" x2="${W - R}" y1="${y(p)}" y2="${y(p)}"/>`).join('') +
    [0, 1, 2, 3].map(p => `<text class="lbl" x="${L - 8}" y="${y(p) + 4}" text-anchor="end">$${p.toFixed(2)}</text>`).join('');
  const ticks = [0, 2, 4, 6, 8, 10].map(b => `<text class="lbl" x="${x(b)}" y="${H - B + 18}" text-anchor="${b === 0 ? 'start' : b === 10 ? 'end' : 'middle'}">$${b}</text>`).join('');
  const uid = Math.random().toString(36).slice(2, 7);
  el.innerHTML = `
    <div class="w-head"><h5>Find the best shaded bid</h5><p>The impression is worth $10 to you. In this simplified setup the rival's bid is equally likely to be anywhere from $0 to $10, so a bid of $b wins b/10 of the time.</p></div>
    <div class="slider-row"><label for="s${uid}">Your bid</label><input id="s${uid}" type="range" min="0" max="10" step="0.1" value="8"><span class="num" data-o="b"></span></div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Expected profit for each bid from $0 to $10. It peaks at $2.50 with a $5 bid.">
      ${grid}<line class="base" x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}"/>${ticks}
      <polyline class="curve" points="${pts.join(' ')}"/>
      <text class="lbl" x="${x(5)}" y="${y(2.5) - 10}" text-anchor="middle">best: $5 bid</text>
      <line class="guide" data-o="g" y1="${y(0)}" y2="${TP}"/>
      <circle class="marker" data-o="dot" r="5"/>
    </svg>
    <div class="outcomes" aria-live="polite">
      <div class="outcome"><span class="label">Chance of winning</span><span class="big" data-o="w"></span></div>
      <div class="outcome"><span class="label">Profit if you win</span><span class="big" data-o="pw"></span></div>
      <div class="outcome"><span class="label">Expected profit</span><span class="big" data-o="ep"></span></div>
    </div>
    <p class="w-note" data-o="n"></p>`;
  const o = k => $(`[data-o="${k}"]`, el);
  const upd = () => {
    const b = +$('input', el).value, ep = prof(b);
    o('b').textContent = money(b);
    o('dot').setAttribute('cx', x(b)); o('dot').setAttribute('cy', y(ep));
    o('g').setAttribute('x1', x(b)); o('g').setAttribute('x2', x(b));
    o('w').textContent = Math.round(b * 10) + '%';
    o('pw').textContent = money(V - b);
    o('ep').textContent = money(ep);
    o('n').textContent = b >= 9.95 ? 'Bidding your full $10 value earns nothing, even when you win.'
      : Math.abs(b - 5) < 0.05 ? 'This is the peak: $5 gives the highest expected profit in this setup.'
      : b > 5 ? 'You win often, but each win earns little. Try shading more.' : 'Each win earns a lot, but you rarely win. Try shading less.';
  };
  el.addEventListener('input', upd); upd();
};
