WIDGETS.actualcpc = function (el) {
  const uid = Math.random().toString(36).slice(2, 7), RESERVE = 0.03;
  const F = [['max', 'Your max CPC', '$', 3, 0.1], ['ctr', 'Your pCTR', '%', 3, 0.1], ['q', 'Your Ad Quality', '', 1, 0.1],
             ['obid', 'Their bid', '$', 2, 0.1], ['octr', 'Their pCTR', '%', 2, 0.1], ['oq', 'Their Ad Quality', '', 1.2, 0.1]];
  const field = ([k, l, u, v, st]) => `<label for="${k}${uid}">${l}</label><div class="field">${u === '$' ? '$' : ''}<input id="${k}${uid}" data-k="${k}" type="number" min="0" step="${st}" value="${v}">${u === '%' ? '%' : ''}</div>`;
  el.innerHTML = `
    <div class="w-head"><h5>What will I actually pay?</h5><p>You're competing for a spot. The ad directly below you sets your price. The Ad Rank threshold here is ${RESERVE.toFixed(3)}.</p></div>
    <div class="fields"><fieldset><legend>Your ad</legend>${F.slice(0, 3).map(field).join('')}</fieldset><fieldset><legend>The ad below you</legend>${F.slice(3).map(field).join('')}</fieldset></div>
    <div class="pricebar" aria-hidden="true"><span class="pb-paid"></span><span class="pb-mark"></span></div>
    <div class="pb-labels"><span>$0</span><span data-o="maxl"></span></div>
    <div class="outcomes" aria-live="polite">
      <div class="outcome"><span class="label">Your Ad Rank</span><span class="big" data-o="yr"></span><span data-o="yrs"></span></div>
      <div class="outcome"><span class="label">You pay per click</span><span class="big" data-o="pay"></span><span data-o="pays"></span></div>
      <div class="outcome"><span class="label">Saved vs your max</span><span class="big" data-o="save"></span><span data-o="saves"></span></div>
    </div>`;
  const v = k => Math.max(0, +$(`[data-k="${k}"]`, el).value || 0);
  const upd = () => {
    const max = v('max'), ctr = v('ctr') / 100, q = v('q');
    const yours = max * ctr * q, below = v('obid') * (v('octr') / 100) * v('oq'), mustBeat = Math.max(below, RESERVE);
    const shown = yours >= RESERVE, top = yours > below;
    let pay = ctr * q > 0 ? Math.min(max, mustBeat / (ctr * q) + 0.01) : max;
    $('[data-o="yr"]', el).textContent = yours.toFixed(3);
    $('[data-o="yrs"]', el).textContent = `${money(max)} × ${(ctr * 100).toFixed(1)}% × ${q} · theirs is ${below.toFixed(3)}`;
    $('[data-o="maxl"]', el).textContent = 'max ' + money(max);
    if (!shown) {
      $('[data-o="pay"]', el).textContent = 'Not shown'; $('[data-o="pays"]', el).textContent = 'Your Ad Rank is under the threshold.';
      $('[data-o="save"]', el).textContent = '—'; $('[data-o="saves"]', el).textContent = '';
      $('.pb-paid', el).style.width = '0%'; $('.pb-mark', el).style.left = '0%'; return;
    }
    if (!top) {
      $('[data-o="pay"]', el).textContent = 'Ranked lower'; $('[data-o="pays"]', el).textContent = 'Their Ad Rank beats yours, so they take the higher spot.';
      $('[data-o="save"]', el).textContent = '—'; $('[data-o="saves"]', el).textContent = 'Raise your bid, pCTR or quality.';
      $('.pb-paid', el).style.width = '0%'; $('.pb-mark', el).style.left = '0%'; return;
    }
    const pct = max > 0 ? pay / max * 100 : 0;
    $('[data-o="pay"]', el).textContent = money(pay);
    $('[data-o="pays"]', el).textContent = `${mustBeat.toFixed(3)} ÷ (${(ctr * 100).toFixed(1)}% × ${q}) + $0.01`;
    $('[data-o="save"]', el).textContent = money(max - pay);
    $('[data-o="saves"]', el).textContent = `${Math.round(100 - pct)}% below your max`;
    $('.pb-paid', el).style.width = pct + '%'; $('.pb-mark', el).style.left = pct + '%';
  };
  el.addEventListener('input', upd); upd();
};
