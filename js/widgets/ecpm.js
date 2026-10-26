WIDGETS.ecpm = function (el) {
  const uid = Math.random().toString(36).slice(2, 7);
  el.innerHTML = `
    <div class="w-head"><h5>Per-click vs per-impression: which is worth more?</h5></div>
    <div class="fields">
      <fieldset><legend>Advertiser 1 bids CPC</legend>
        <label for="p${uid}">Bid per click</label><div class="field">$<input id="p${uid}" data-k="cpc" type="number" min="0" step="0.1" value="1.5"></div>
        <label for="r${uid}">pCTR</label><div class="field"><input id="r${uid}" data-k="ctr" type="number" min="0" max="100" step="0.1" value="2">%</div>
      </fieldset>
      <fieldset><legend>Advertiser 2 bids CPM</legend>
        <label for="m${uid}">Bid per 1,000 impressions</label><div class="field">$<input id="m${uid}" data-k="cpm" type="number" min="0" step="1" value="25"></div>
      </fieldset>
    </div>
    <ol class="rank" aria-live="polite"></ol>
    <p class="w-note"></p>`;
  const val = k => Math.max(0, +$(`[data-k="${k}"]`, el).value || 0);
  const upd = () => {
    const cpc = val('cpc'), ctr = val('ctr'), cpm = val('cpm');
    const e1 = cpc * (ctr / 100) * 1000, e2 = cpm, max = Math.max(e1, e2, 1e-9);
    const rows = [['Adv. 1', e1, e1 > e2], ['Adv. 2', e2, e2 > e1]];
    $('.rank', el).innerHTML = rows.map(([n, v, w], i) => `<li class="${w ? 'win' : ''}"><span class="pos">${i + 1}</span><span class="nm">${n}${w ? '<span class="win-tag">wins</span>' : ''}</span>
      <div class="bar" style="width:${Math.max(2, v / max * 100)}%"></div><span class="val">${money(v)}</span>
      <span class="calc">${i === 0 ? `${money(cpc)} × ${ctr}% × 1000` : `${money(cpm)} CPM, already per 1,000`}</span></li>`).join('');
    $('.w-note', el).textContent = e1 === e2 ? 'Both are worth the same per 1,000 impressions.'
      : `Advertiser ${e1 > e2 ? 1 : 2} is worth more per 1,000 impressions (eCPM ${money(Math.max(e1, e2))} vs ${money(Math.min(e1, e2))}).`;
  };
  el.addEventListener('input', upd); upd();
};
