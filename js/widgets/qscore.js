WIDGETS.qscore = function (el) {
  const PARTS = [['ectr', 'Expected CTR', [0, 1.75, 3.5]], ['rel', 'Ad relevance', [0, 1, 2]], ['lp', 'Landing page experience', [0, 1.75, 3.5]]];
  const LABELS = ['Below average', 'Average', 'Above average'];
  const uid = Math.random().toString(36).slice(2, 7);
  el.innerHTML = `
    <div class="w-head"><h5>Build a Quality Score</h5><p>Set each part's rating. Every keyword starts at 1 point, and each rating adds points.</p></div>
    <div class="ctl-list">${PARTS.map(([k, l]) => `<div class="slider-row"><label for="${k}${uid}">${l}</label><select id="${k}${uid}" class="sel" data-k="${k}">${LABELS.map((x, i) => `<option value="${i}" ${i === 1 ? 'selected' : ''}>${x}</option>`).join('')}</select><span></span></div>`).join('')}</div>
    <div class="qs-bar" aria-hidden="true" data-o="bar"></div>
    <div class="qs-legend"><span><i class="b0"></i>Starting point</span><span><i class="b1"></i>Expected CTR (up to 3.5)</span><span><i class="b2"></i>Ad relevance (up to 2)</span><span><i class="b3"></i>Landing page (up to 3.5)</span></div>
    <div class="outcomes" aria-live="polite">
      <div class="outcome"><span class="label">Quality Score</span><span class="big" data-o="qs"></span><span data-o="raw"></span></div>
      <div class="outcome"><span class="label">What it means</span><span data-o="mean"></span></div>
    </div>
    <p class="w-note">Weights found by analysts working backwards from real accounts, not published by Google: expected CTR and landing page about 39% each, ad relevance about 22%.</p>`;
  const upd = () => {
    const pts = PARTS.map(([k, , w]) => w[+$(`[data-k="${k}"]`, el).value]);
    const raw = 1 + pts.reduce((a, b) => a + b, 0), qs = Math.round(raw);
    $('[data-o="bar"]', el).innerHTML = [1, ...pts].map((p, i) => `<span class="b${i}" style="width:${p * 10}%"></span>`).join('');
    $('[data-o="qs"]', el).textContent = qs + ' / 10';
    const rs = raw.toFixed(2).replace(/\.?0+$/, '');
    $('[data-o="raw"]', el).textContent = `1 + ${pts.join(' + ')} = ${rs}${String(qs) !== rs ? `, shown as ${qs}` : ''}`;
    $('[data-o="mean"]', el).textContent = qs >= 8 ? 'Strong. The ad and page fit what searchers want.' : qs >= 5 ? 'Middle of the pack. There is room to improve.' : 'Weak. The ad, keyword or landing page likely needs work.';
  };
  el.addEventListener('change', upd); upd();
};
