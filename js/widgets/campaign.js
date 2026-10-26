WIDGETS.campaign = function (el) {
  const uid = Math.random().toString(36).slice(2, 7);
  const F = [['budget', 'Daily budget', '$', 100, 10], ['cpc', 'Average CPC', '$', 2.5, 0.1], ['cr', 'Conversion rate', '%', 4, 0.5], ['value', 'Value per sale', '$', 80, 5]];
  el.innerHTML = `
    <div class="w-head"><h5>From budget to customers</h5><p>Follow one day of spending through clicks, sales and revenue.</p></div>
    <div class="fields"><fieldset><legend>Your campaign</legend>${F.map(([k, l, u, v, st]) => `<label for="${k}${uid}">${l}</label><div class="field">${u === '$' ? '$' : ''}<input id="${k}${uid}" data-k="${k}" type="number" min="0" step="${st}" value="${v}">${u === '%' ? '%' : ''}</div>`).join('')}</fieldset></div>
    <ol class="funnel" aria-live="polite">
      <li><span class="label">Spend</span><span class="big" data-o="spend"></span></li>
      <li><span class="label">Clicks</span><span class="big" data-o="clicks"></span><span data-o="clicks-s"></span></li>
      <li><span class="label">Sales</span><span class="big" data-o="sales"></span><span data-o="sales-s"></span></li>
      <li><span class="label">Revenue</span><span class="big" data-o="rev"></span><span data-o="rev-s"></span></li>
    </ol>
    <div class="outcomes">
      <div class="outcome"><span class="label">Cost per sale (CPA)</span><span class="big" data-o="cpa"></span><span>CPC ÷ conversion rate</span></div>
      <div class="outcome"><span class="label">Return on ad spend</span><span class="big" data-o="roas"></span><span data-o="roas-s"></span></div>
    </div>`;
  const v = k => Math.max(0, +$(`[data-k="${k}"]`, el).value || 0);
  const upd = () => {
    const budget = v('budget'), cpc = v('cpc'), cr = v('cr') / 100, value = v('value');
    const clicks = cpc > 0 ? budget / cpc : 0, sales = clicks * cr, rev = sales * value, cpa = cr > 0 ? cpc / cr : 0, roas = budget > 0 ? rev / budget : 0;
    $('[data-o="spend"]', el).textContent = money(budget);
    $('[data-o="clicks"]', el).textContent = clicks.toFixed(0);
    $('[data-o="clicks-s"]', el).textContent = `${money(budget)} ÷ ${money(cpc)}`;
    $('[data-o="sales"]', el).textContent = sales.toFixed(1);
    $('[data-o="sales-s"]', el).textContent = `${clicks.toFixed(0)} × ${(cr * 100).toFixed(1)}%`;
    $('[data-o="rev"]', el).textContent = money(rev);
    $('[data-o="rev-s"]', el).textContent = `${sales.toFixed(1)} × ${money(value)}`;
    $('[data-o="cpa"]', el).textContent = cr > 0 ? money(cpa) : '—';
    const r = $('[data-o="roas"]', el);
    r.textContent = roas.toFixed(2) + '×';
    r.className = 'big ' + (roas > 1 ? 'pos-v' : roas < 1 ? 'neg-v' : 'zero-v');
    $('[data-o="roas-s"]', el).textContent = roas >= 1 ? `every $1 spent brings back ${money(roas)}` : `losing ${money(1 - roas)} per $1 before other costs`;
  };
  el.addEventListener('input', upd); upd();
};
