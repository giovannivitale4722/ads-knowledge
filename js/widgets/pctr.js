WIDGETS.pctr = function (el) {
  const BIAS = -4.4;
  const FEATS = [
    { k: 'match', label: 'Search matches the ad', type: 'range', min: 0, max: 1, step: 0.05, val: 0.7, w: 2.0, fmt: v => Math.round(v * 100) + '% match' },
    { k: 'pos', label: 'Ad position', type: 'select', opts: [['Top of page', 0], ['Bottom of page', -1.2]], val: 0 },
    { k: 'mobile', label: 'On a phone', type: 'check', val: 1, w: 0.3 },
    { k: 'past', label: 'Clicked this advertiser before', type: 'check', val: 0, w: 1.2 }
  ];
  const uid = Math.random().toString(36).slice(2, 7);
  const ctl = f => f.type === 'range'
    ? `<div class="slider-row"><label for="${f.k}${uid}">${f.label}</label><input id="${f.k}${uid}" data-k="${f.k}" type="range" min="${f.min}" max="${f.max}" step="${f.step}" value="${f.val}"><span class="num" data-o="${f.k}"></span></div>`
    : f.type === 'select'
    ? `<div class="slider-row"><label for="${f.k}${uid}">${f.label}</label><select id="${f.k}${uid}" data-k="${f.k}" class="sel">${f.opts.map(([n, v]) => `<option value="${v}">${n}</option>`).join('')}</select><span></span></div>`
    : `<div class="slider-row"><label for="${f.k}${uid}">${f.label}</label><span class="chk"><input id="${f.k}${uid}" data-k="${f.k}" type="checkbox" ${f.val ? 'checked' : ''}></span><span></span></div>`;
  const W = 520, H = 170, L = 40, R = 12, TP = 10, B = 28, ZMIN = -8, ZMAX = 4;
  const x = z => L + (z - ZMIN) / (ZMAX - ZMIN) * (W - L - R), y = p => TP + (1 - p) * (H - TP - B);
  const sig = z => 1 / (1 + Math.exp(-z));
  const pts = []; for (let z = ZMIN; z <= ZMAX + 1e-9; z += 0.1) pts.push(`${x(z).toFixed(1)},${y(sig(z)).toFixed(1)}`);
  el.innerHTML = `
    <div class="w-head"><h5>Build a pCTR</h5><p>A person searches and one ad could be shown. Change the situation and watch each feature push the score up or down. These weights are made up for illustration. Real models learn millions of them from data.</p></div>
    <div class="ctl-list">${FEATS.map(ctl).join('')}</div>
    <div class="contrib" aria-live="polite"></div>
    <div class="pctr-out">
      <div class="outcome"><span class="label">Total score</span><span class="big num" data-o="z"></span><span>sum of the rows above</span></div>
      <div class="outcome"><span class="label">pCTR</span><span class="big num" data-o="p"></span><span data-o="per"></span></div>
    </div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="The logistic function turns the total score into a probability between 0 and 100 percent.">
      ${[0.5, 1].map(p => `<line class="grid-l" x1="${L}" x2="${W - R}" y1="${y(p)}" y2="${y(p)}"/>`).join('')}
      ${[0, 0.5, 1].map(p => `<text class="lbl" x="${L - 8}" y="${y(p) + 4}" text-anchor="end">${p * 100}%</text>`).join('')}
      <line class="base" x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}"/>
      ${[-8, -6, -4, -2, 0, 2, 4].map(z => `<text class="lbl" x="${x(z)}" y="${H - B + 17}" text-anchor="${z === ZMIN ? 'start' : z === ZMAX ? 'end' : 'middle'}">${z}</text>`).join('')}
      <text class="lbl" x="${W - R}" y="${y(0) - 6}" text-anchor="end">score →</text>
      <polyline class="curve" points="${pts.join(' ')}"/>
      <line class="guide" data-o="g" y1="${y(0)}" y2="${TP}"/>
      <circle class="marker" data-o="dot" r="5"/>
    </svg>
    <p class="w-note">The S-shaped curve is the logistic function. Most ads sit on its flat lower-left part, where small score changes move pCTR by fractions of a percent.</p>`;
  const val = f => { const i = $(`[data-k="${f.k}"]`, el); return f.type === 'check' ? (i.checked ? 1 : 0) : +i.value; };
  const upd = () => {
    const rows = [{ label: 'Starting point (an average ad)', c: BIAS }].concat(FEATS.map(f => {
      const v = val(f);
      if (f.type === 'range') $(`[data-o="${f.k}"]`, el).textContent = f.fmt(v);
      return { label: f.label, c: f.type === 'select' ? v : v * f.w };
    }));
    const z = rows.reduce((a, r) => a + r.c, 0), p = sig(z), M = 5;
    $('.contrib', el).innerHTML = rows.map(r => {
      const w = Math.min(Math.abs(r.c), M) / M * 50;
      return `<div class="crow"><span class="cl">${r.label}</span><span class="ctrack"><span class="cbar ${r.c >= 0 ? 'up' : 'down'}" style="${r.c >= 0 ? 'left:50%' : `left:${50 - w}%`};width:${w}%"></span></span><span class="cv num">${r.c > 0 ? '+' : r.c < 0 ? '−' : ''}${Math.abs(r.c).toFixed(1)}</span></div>`;
    }).join('');
    $('[data-o="z"]', el).textContent = (z < 0 ? '−' : '') + Math.abs(z).toFixed(1);
    $('[data-o="p"]', el).textContent = (p * 100).toFixed(1) + '%';
    $('[data-o="per"]', el).textContent = `about ${Math.round(p * 1000)} clicks per 1,000 showings`;
    $('[data-o="dot"]', el).setAttribute('cx', x(Math.max(ZMIN, Math.min(ZMAX, z)))); $('[data-o="dot"]', el).setAttribute('cy', y(p));
    $('[data-o="g"]', el).setAttribute('x1', x(Math.max(ZMIN, Math.min(ZMAX, z)))); $('[data-o="g"]', el).setAttribute('x2', x(Math.max(ZMIN, Math.min(ZMAX, z))));
  };
  el.addEventListener('input', upd); el.addEventListener('change', upd); upd();
};
