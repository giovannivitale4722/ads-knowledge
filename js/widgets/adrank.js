WIDGETS.adrank = function (el) {
  const ads = [{ n: 'A', bid: 4, ctr: 1, q: 1 }, { n: 'B', bid: 2, ctr: 3, q: 1 }, { n: 'C', bid: 3, ctr: 2, q: 0.8 }];
  const uid = Math.random().toString(36).slice(2, 7);
  el.innerHTML = `
    <div class="w-head"><h5>Who wins the top spot?</h5><p>Change any number. Ad Quality here is a simple multiplier where 1.0 is average.</p></div>
    <div class="fields">${ads.map((a, i) => `
      <fieldset><legend>Ad ${a.n}</legend>
        <label for="b${uid}${i}">Bid per click</label><div class="field">$<input id="b${uid}${i}" data-k="bid" data-i="${i}" type="number" min="0" step="0.1" value="${a.bid}"></div>
        <label for="c${uid}${i}">pCTR</label><div class="field"><input id="c${uid}${i}" data-k="ctr" data-i="${i}" type="number" min="0" max="100" step="0.1" value="${a.ctr}">%</div>
        <label for="q${uid}${i}">Ad Quality</label><div class="field"><input id="q${uid}${i}" data-k="q" data-i="${i}" type="number" min="0" step="0.1" value="${a.q}"></div>
      </fieldset>`).join('')}</div>
    <ol class="rank" aria-live="polite"></ol>
    <p class="w-note"></p>`;
  const out = $('.rank', el), note = $('.w-note', el);
  const upd = () => {
    $$('input', el).forEach(inp => { ads[+inp.dataset.i][inp.dataset.k] = Math.max(0, +inp.value || 0); });
    const r = ads.map(a => ({ ...a, rank: a.bid * (a.ctr / 100) * a.q })).sort((x, y) => y.rank - x.rank);
    const max = Math.max(r[0].rank, 1e-9);
    out.innerHTML = r.map((a, i) => `<li class="${i === 0 && a.rank > 0 ? 'win' : ''}">
      <span class="pos">${i + 1}</span><span class="nm">Ad ${a.n}${i === 0 && a.rank > 0 ? '<span class="win-tag">wins</span>' : ''}</span>
      <div class="bar" style="width:${Math.max(2, a.rank / max * 100)}%"></div><span class="val">${a.rank.toFixed(4)}</span>
      <span class="calc">${money(a.bid)} × ${a.ctr}% × ${a.q}</span></li>`).join('');
    const top = [...ads].sort((x, y) => y.bid - x.bid)[0];
    note.textContent = r[0].rank === 0 ? 'Every Ad Rank is zero, so nobody wins.'
      : top.n !== r[0].n ? `Ad ${top.n} has the highest dollar bid (${money(top.bid)}), but Ad ${r[0].n} wins on Ad Rank with a ${money(r[0].bid)} bid.`
      : `Ad ${r[0].n} has the highest bid and also the highest Ad Rank. Try lowering its pCTR.`;
  };
  el.addEventListener('input', upd); upd();
};
