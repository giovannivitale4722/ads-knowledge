/* GSP page: why the top ad can pay less per click than the ad below it.
   B (position 1) must beat C's Ad Rank; C (position 2) must beat A's. Each pays that rank ÷ its own pCTR × quality. */
WIDGETS.gspwhy = function (el) {
  const B = { bid: 2, ctr: 3, q: 1 }, A = { bid: 4, ctr: 1, q: 1 };
  const uid = Math.random().toString(36).slice(2, 7);
  el.innerHTML = `
    <div class="w-head"><h5>Make C as good as B</h5><p>Change C's click rate and quality. B and A stay as in the example. Watch who pays more per click.</p></div>
    <div class="fields"><fieldset><legend>Ad C ($3.00 bid)</legend>
      <label for="c${uid}">pCTR</label><div class="field"><input id="c${uid}" data-k="ctr" type="number" min="0.1" max="100" step="0.1" value="2">%</div>
      <label for="q${uid}">Ad Quality</label><div class="field"><input id="q${uid}" data-k="q" type="number" min="0.1" step="0.1" value="0.8"></div>
    </fieldset></div>
    <div class="tbl-wrap"><table>
      <tr><th>Position</th><th class="num">Ad Rank</th><th class="num">Price in points</th><th class="num">Points per $1</th><th class="num">Pays per click</th></tr>
      <tbody data-o="rows"></tbody>
    </table></div>
    <p class="w-note" data-o="note"></p>`;
  const v = k => Math.max(0.0001, +$(`[data-k="${k}"]`, el).value || 0);
  const upd = () => {
    const C = { name: 'C', bid: 3, ctr: v('ctr'), q: v('q') };
    const ads = [{ name: 'A', ...A }, { name: 'B', ...B }, C]
      .map(a => ({ ...a, rank: a.bid * (a.ctr / 100) * a.q, eff: (a.ctr / 100) * a.q }))
      .sort((x, y) => y.rank - x.rank);
    const shown = ads.slice(0, 2).map((a, i) => {
      const below = ads[i + 1], price = Math.min(a.bid, below.rank / a.eff);
      return { ...a, pos: i + 1, below, price };
    });
    $('[data-o="rows"]', el).innerHTML = shown.map(a => `<tr><td>${a.pos}. Ad ${a.name}</td><td class="num">${a.rank.toFixed(3)}</td>
      <td class="num">${a.below.rank.toFixed(3)} <span class="muted">(beat ${a.below.name})</span></td><td class="num">${a.eff.toFixed(3)}</td><td class="num"><b>${money(a.price)}</b></td></tr>`).join('')
      + `<tr><td class="muted">Not shown: Ad ${ads[2].name}</td><td class="num muted">${ads[2].rank.toFixed(3)}</td><td class="num muted">—</td><td class="num muted">—</td><td class="num muted">—</td></tr>`;
    const [p1, p2] = shown;
    $('[data-o="note"]', el).textContent = p1.price < p2.price
      ? `Position 1 (Ad ${p1.name}) pays less per click than position 2, even though its price in points is higher (${p1.below.rank.toFixed(3)} vs ${p2.below.rank.toFixed(3)}). Its stronger ad turns each dollar into more points.`
      : `Now position 1 (Ad ${p1.name}) pays more per click than position 2, which is what you'd expect. The ads are close enough in quality that the higher price in points shows up in dollars too.`;
  };
  el.addEventListener('input', upd); upd();
};
