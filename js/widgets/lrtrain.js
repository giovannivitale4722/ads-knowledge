/* Logistic regression page: train a real model in the browser on simulated impressions.
   Data comes from hidden "true" weights; full-batch gradient descent on log loss learns them back. */
WIDGETS.lrtrain = function (el) {
  const FEATS = [['match', 'Search matches the ad', 0.55], ['top', 'Top of page', 0.4], ['phone', 'On a phone', 0.6], ['past', 'Clicked advertiser before', 0.15]];
  const TRUE = { b: -3.2, w: [1.8, 0.9, -0.3, 1.4] };
  const N_TRAIN = 2000, N_TEST = 1000, MAX_STEPS = 2000;
  const sig = z => 1 / (1 + Math.exp(-z));
  // seeded random numbers, so everyone sees the same dataset
  let seed = 7;
  const rand = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const make = n => Array.from({ length: n }, () => {
    const x = FEATS.map(f => (rand() < f[2] ? 1 : 0));
    const p = sig(TRUE.b + x.reduce((s, xi, j) => s + xi * TRUE.w[j], 0));
    return { x, y: rand() < p ? 1 : 0 };
  });
  const train = make(N_TRAIN), test = make(N_TEST);
  const ctr = d => d.reduce((s, r) => s + r.y, 0) / d.length;

  let b = 0, w = [0, 0, 0, 0], step = 0, hist = [], running = 0;
  const predict = x => sig(b + x.reduce((s, xi, j) => s + xi * w[j], 0));
  const loss = d => d.reduce((s, r) => { const p = Math.min(Math.max(predict(r.x), 1e-9), 1 - 1e-9); return s - (r.y ? Math.log(p) : Math.log(1 - p)); }, 0) / d.length;
  const auc = d => {
    const s = d.map(r => [predict(r.x), r.y]).sort((a, c) => a[0] - c[0]);
    let rank = 0, pos = 0, sumR = 0, i = 0;
    while (i < s.length) { let j = i; while (j < s.length && s[j][0] === s[i][0]) j++; const avg = (i + j + 1) / 2; for (let k = i; k < j; k++) if (s[k][1]) { sumR += avg; pos++; } i = j; }
    const neg = s.length - pos; return pos && neg ? (sumR - pos * (pos + 1) / 2) / (pos * neg) : 0.5;
  };
  const gdStep = lr => {
    let gb = 0; const gw = [0, 0, 0, 0];
    for (const r of train) { const e = predict(r.x) - r.y; gb += e; for (let j = 0; j < 4; j++) gw[j] += e * r.x[j]; }
    b -= lr * gb / N_TRAIN; for (let j = 0; j < 4; j++) w[j] -= lr * gw[j] / N_TRAIN;
    step++; hist.push(loss(train));
  };

  const uid = Math.random().toString(36).slice(2, 7);
  const W = 520, H = 190, L = 40, R = 12, TP = 10, B = 28, YMAX = 0.8;
  el.innerHTML = `
    <div class="w-head"><h5>Train a click model</h5><p>2,000 simulated impressions to learn from (${(ctr(train) * 100).toFixed(1)}% were clicked), plus 1,000 held back for testing. Every weight starts at 0.</p></div>
    <div class="ctrls">
      <button type="button" class="btn btn-primary btn-sm" data-a="1">Train 1 step</button>
      <button type="button" class="btn btn-secondary btn-sm" data-a="25">Train 25 steps</button>
      <button type="button" class="btn btn-secondary btn-sm" data-a="400">Train 400 steps</button>
      <button type="button" class="btn btn-secondary btn-sm" data-a="reset">Reset</button>
    </div>
    <div class="slider-row"><label for="lr${uid}">Learning rate</label><input id="lr${uid}" type="range" min="0.5" max="16" step="0.5" value="1"><span class="num" data-o="lr"></span></div>
    <div class="outcomes" aria-live="polite">
      <div class="outcome"><span class="label">Steps trained</span><span class="big" data-o="step"></span></div>
      <div class="outcome"><span class="label">Log loss (training / new data)</span><span class="big" data-o="loss"></span></div>
      <div class="outcome"><span class="label">AUC on new data</span><span class="big" data-o="auc"></span></div>
      <div class="outcome"><span class="label">Predicted vs actual click rate</span><span class="big" data-o="cal"></span></div>
    </div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Training log loss by step. It starts at 0.693 and falls as the model learns.">
      <g data-o="grid"></g><polyline class="curve" data-o="line" points=""/><circle class="marker" data-o="dot" r="4"/>
    </svg>
    <div class="lr-weights" data-o="weights"></div>
    <div class="tlegend"><span><i class="lw"></i>Learned weight</span><span><i class="tw"></i>True weight (hidden from the model)</span></div>
    <p class="w-note" data-o="note"></p>`;
  const lrIn = $('input', el), o = k => $(`[data-o="${k}"]`, el);
  const x = (s, max) => L + s / max * (W - L - R), y = v => TP + (1 - Math.min(v, YMAX) / YMAX) * (H - TP - B);
  const pctW = v => (Math.min(Math.abs(v), 4) / 4 * 50).toFixed(2) + '%';
  const render = () => {
    const lr = +lrIn.value; o('lr').textContent = lr.toFixed(1);
    const tl = loss(train), vl = loss(test);
    o('step').textContent = step.toLocaleString();
    o('loss').textContent = `${tl.toFixed(3)} / ${vl.toFixed(3)}`;
    o('auc').textContent = step ? auc(test).toFixed(3) : '0.500';
    const pAvg = test.reduce((s, r) => s + predict(r.x), 0) / N_TEST;
    o('cal').textContent = `${(pAvg * 100).toFixed(1)}% / ${(ctr(test) * 100).toFixed(1)}%`;
    const max = Math.max(100, Math.ceil(step / 100) * 100);
    o('grid').innerHTML = [0.2, 0.4, 0.6, 0.8].map(v => `<line class="grid-l" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/>`).join('')
      + [0, 0.2, 0.4, 0.6, 0.8].map(v => `<text class="lbl" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${v.toFixed(1)}</text>`).join('')
      + `<line class="base" x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}"/>`
      + [0, 0.25, 0.5, 0.75, 1].map(f => `<text class="lbl" x="${x(f * max, max)}" y="${H - B + 17}" text-anchor="${f === 0 ? 'start' : f === 1 ? 'end' : 'middle'}">${Math.round(f * max)}</text>`).join('')
      + `<text class="lbl" x="${W - R}" y="${y(0) - 6}" text-anchor="end">steps →</text>`
      + `<text class="lbl" x="${L + 6}" y="${y(Math.log(2)) - 6}">start: 0.693 (a coin-flip guess)</text>`;
    const pts = [[0, Math.log(2)], ...hist.map((v, i) => [i + 1, v])];
    o('line').setAttribute('points', pts.map(([s, v]) => `${x(s, max).toFixed(1)},${y(v).toFixed(1)}`).join(' '));
    o('dot').setAttribute('cx', x(step, max)); o('dot').setAttribute('cy', y(step ? hist[hist.length - 1] : Math.log(2)));
    o('weights').innerHTML = [['bias', 'Bias (starting point)', b, TRUE.b], ...FEATS.map((f, j) => [f[0], f[1], w[j], TRUE.w[j]])].map(([, label, lv, tv]) => `
      <div class="lw-row"><span class="cl">${label}</span>
        <span class="ctrack"><span class="cbar up lwbar" style="${lv >= 0 ? 'left:50%' : `left:calc(50% - ${pctW(lv)})`};width:${pctW(lv)}"></span>
          <span class="tmarker" style="left:calc(50% ${tv >= 0 ? '+' : '-'} ${pctW(tv)})"></span></span>
        <span class="cv num">${lv >= 0 ? '+' : '−'}${Math.abs(lv).toFixed(2)} <span class="muted">/ ${tv >= 0 ? '+' : '−'}${Math.abs(tv).toFixed(1)}</span></span></div>`).join('');
    const gap = Math.max(Math.abs(b - TRUE.b), ...w.map((v, j) => Math.abs(v - TRUE.w[j])));
    o('note').textContent = step === 0 ? 'Every weight is 0, so the model predicts 50% for everything. Press Train to start.'
      : hist.length > 1 && hist[hist.length - 1] > hist[hist.length - 2] + 1e-6 ? 'The loss went up. The learning rate is too high, so the nudges overshoot. Try lowering it.'
      : gap < 0.25 ? 'The learned weights are now close to the true ones. The model recovered the hidden pattern from clicks alone.'
      : step < 30 ? 'The bias drops first: most impressions get no click, so the quickest win is predicting low across the board.'
      : 'The loss is still falling. Features that really drive clicks, like a matching search, are pulling ahead.';
  };
  const runSteps = n => {
    const id = ++running, lr = () => +lrIn.value;
    const tick = () => {
      if (id !== running) return;
      const chunk = Math.min(n, 8, MAX_STEPS - step);
      for (let i = 0; i < chunk; i++) gdStep(lr());
      n -= chunk; render();
      if (n > 0 && step < MAX_STEPS) requestAnimationFrame(tick);
    };
    tick();
  };
  el.addEventListener('click', e => {
    const a = e.target.closest('[data-a]'); if (!a) return;
    if (a.dataset.a === 'reset') { running++; b = 0; w = [0, 0, 0, 0]; step = 0; hist = []; render(); }
    else runSteps(+a.dataset.a);
  });
  lrIn.addEventListener('input', render);
  render();
};
