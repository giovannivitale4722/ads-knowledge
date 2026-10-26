WIDGETS.adx = function (el) {
  const BUYERS = ['Google Ads', 'Display & Video 360', 'Outside DSP'];
  const uid = Math.random().toString(36).slice(2, 7);
  let bids = [2.4, 2.85, 1.1], step = 6, timer = null;
  const STEPS = [
    { t: 0, on: ['viewer', 'pub'], text: () => 'The reader opens a news article. While the page loads, its code finds an empty 300×250 ad slot.' },
    { t: 10, on: ['pub', 'gam'], text: () => 'The page asks Google Ad Manager, the publisher\'s ad server, to fill the slot.' },
    { t: 20, on: ['gam'], text: c => `Ad Manager checks for direct deals first. None needs this impression, so it offers it on AdX with the publisher's floor of ${money(c.floor)} CPM.` },
    { t: 25, on: ['adx', 'b0', 'b1', 'b2'], text: () => 'AdX sends a bid request to every buyer at once: slot size, site, device, rough location and, if allowed, what\'s known about the reader.' },
    { t: 100, on: ['b0', 'b1', 'b2'], text: c => `Each buyer's software prices this one impression and answers within the deadline. ${c.nob ? `${c.nob} didn't bid.` : 'All three bid.'}` },
    { t: 110, on: ['adx'], text: c => c.best < 0 ? `AdX runs a first-price auction. No bid reaches the ${money(c.floor)} floor, so nobody wins.`
        : `AdX runs a first-price auction. Bids under the ${money(c.floor)} floor are thrown out. ${BUYERS[c.best]} wins with ${money(bids[c.best])} and pays exactly that.` },
    { t: 130, on: ['gam', 'pub', 'viewer'], text: c => c.best < 0 ? 'The slot goes unsold on AdX. The publisher fills it from another source or with its own house ad.'
        : 'The winning ad is sent back and appears on the page. One impression is counted. The reader never noticed any of this.' }
  ];
  const T_END = STEPS[STEPS.length - 1].t;
  el.innerHTML = `
    <div class="w-head"><h5>Watch one impression get sold</h5><p>Bids are in CPM (price per 1,000 impressions). Timings are typical, not exact.</p></div>
    <div class="flow">
      <div class="fnode" data-s="viewer"><b>Reader</b><span>opens the page</span></div>
      <div class="fnode" data-s="pub"><b>Publisher's page</b><span>has an empty slot</span></div>
      <div class="fnode" data-s="gam"><b>Ad Manager</b><span>publisher's ad server</span></div>
      <div class="fnode" data-s="adx"><b>AdX</b><span>runs the auction</span></div>
      <div class="fbuyers">${BUYERS.map((b, i) => `<div class="fnode buyer" data-s="b${i}"><b>${b}</b><span class="bid"></span></div>`).join('')}</div>
    </div>
    <div class="tl"><div class="tl-bar"><span class="tl-fill"></span></div><div class="tl-labels"><span>0 ms</span><span class="num" data-o="ms"></span></div></div>
    <ol class="fsteps">${STEPS.map((x, i) => `<li data-i="${i}"><span class="ms num">${x.t} ms</span><span class="tx"></span></li>`).join('')}</ol>
    <div class="ctrls">
      <button type="button" class="btn btn-primary btn-sm" data-a="play">Play a new impression</button>
      <button type="button" class="btn btn-secondary btn-sm" data-a="next">Next step</button>
    </div>
    <div class="slider-row"><label for="f${uid}">Floor price</label><input id="f${uid}" data-k="floor" type="range" min="0.5" max="4" step="0.1" value="1.5"><span class="num" data-o="floor"></span></div>
    <div class="outcomes" aria-live="polite">
      <div class="outcome"><span class="label">Winner</span><span class="big" data-o="win"></span></div>
      <div class="outcome"><span class="label">Pays (first-price)</span><span class="big" data-o="pay"></span><span data-o="per"></span></div>
      <div class="outcome"><span class="label">Publisher gets (about 80%)</span><span class="big" data-o="pub"></span></div>
    </div>`;
  const floorIn = $('[data-k="floor"]', el);
  const ctx = () => {
    const floor = +floorIn.value;
    const best = bids.reduce((bi, b, i) => b !== null && b >= floor && (bi < 0 || b > bids[bi]) ? i : bi, -1);
    return { floor, best, nob: bids.filter(b => b === null).length ? bids.map((b, i) => b === null ? BUYERS[i] : null).filter(Boolean).join(' and ') : '' };
  };
  const render = () => {
    const c = ctx(), cur = STEPS[step], shown = step >= 4, judged = step >= 5;
    $('[data-o="floor"]', el).textContent = money(c.floor);
    $$('.fnode', el).forEach(n => n.classList.toggle('on', cur.on.includes(n.dataset.s)));
    $$('.buyer', el).forEach((n, i) => {
      const b = bids[i];
      $('.bid', n).textContent = !shown ? (step >= 3 ? 'thinking…' : 'waiting') : b === null ? 'no bid' : money(b);
      n.classList.toggle('out', judged && (b === null || b < c.floor));
      n.classList.toggle('win', judged && i === c.best);
    });
    $('.tl-fill', el).style.width = (cur.t / T_END * 100) + '%';
    $('[data-o="ms"]', el).textContent = cur.t + ' ms';
    $$('.fsteps li', el).forEach((li, i) => {
      li.classList.toggle('done', i < step); li.classList.toggle('cur', i === step);
      $('.tx', li).textContent = STEPS[i].text(c);
    });
    const has = judged && c.best >= 0, price = has ? bids[c.best] : 0;
    $('[data-o="win"]', el).textContent = !judged ? '—' : has ? BUYERS[c.best] : 'Unsold';
    $('[data-o="pay"]', el).textContent = has ? money(price) + ' CPM' : '—';
    $('[data-o="per"]', el).textContent = has ? `= $${(price / 1000).toFixed(4)} for this one impression` : '';
    $('[data-o="pub"]', el).textContent = has ? money(price * 0.8) + ' CPM' : '—';
  };
  const stop = () => { clearInterval(timer); timer = null; };
  const play = () => {
    stop();
    bids = BUYERS.map(() => Math.random() < 0.2 ? null : Math.round((0.8 + Math.random() * 3) * 100) / 100);
    step = 0; render();
    timer = setInterval(() => { if (step >= STEPS.length - 1) return stop(); step++; render(); }, 1100);
  };
  el.addEventListener('click', e => {
    const a = e.target.closest('[data-a]'); if (!a) return;
    if (a.dataset.a === 'play') play();
    else { stop(); step = step >= STEPS.length - 1 ? 0 : step + 1; render(); }
  });
  floorIn.addEventListener('input', render);
  render();
};
