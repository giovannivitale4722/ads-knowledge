WIDGETS.relevance = function (el) {
  const CONCEPTS = ['footwear', 'running', 'deals', 'training', 'bikes'];
  const DICT = { shoes: 0, shoe: 0, sneakers: 0, sneaker: 0, footwear: 0, running: 1, runner: 1, runners: 1, run: 1, marathon: 1, jogging: 1,
    cheap: 2, sale: 2, discount: 2, off: 2, deal: 2, deals: 2, training: 3, plan: 3, plans: 3, beginners: 3, coach: 3, bike: 4, tire: 4, flat: 4, fix: 4, repair: 4 };
  const STOP = new Set(['for', 'on', 'to', 'a', 'how', 'every', 'the', 'today', 'your', 'in', 'and', 'of']);
  const QUERIES = ['cheap running shoes', 'sneakers on sale', 'marathon training plan', 'how to fix a flat bike tire'];
  const ADS = [['A', 'Running shoes, 40% off today'], ['B', 'Marathon training plans for beginners'], ['C', 'Discount sneakers for every runner']];
  const THRESH = 0.35;
  const words = t => t.toLowerCase().split(/[^a-z]+/).filter(w => w && !STOP.has(w));
  const vec = t => { const v = CONCEPTS.map(() => 0); words(t).forEach(w => { if (w in DICT) v[DICT[w]] += 1; }); return v; };
  const cos = (a, b) => { const d = a.reduce((x, ai, i) => x + ai * b[i], 0), n = Math.hypot(...a) * Math.hypot(...b); return n ? d / n : 0; };
  const overlap = (a, b) => { const A = new Set(words(a)), B = new Set(words(b)), I = [...A].filter(w => B.has(w)); return { score: I.length / new Set([...A, ...B]).size, shared: I }; };
  const uid = Math.random().toString(36).slice(2, 7);
  el.innerHTML = `
    <div class="w-head"><h5>Words vs meaning</h5><p>Pick a search and compare two ways of scoring the same three ads. This is a toy: each word maps to a few topics (footwear, running, deals, training, bikes) instead of a real neural network.</p></div>
    <div class="slider-row"><label for="q${uid}">Search</label><select id="q${uid}" class="sel" data-k="q">${QUERIES.map(q => `<option>${q}</option>`).join('')}</select><span></span></div>
    <div class="tbl-wrap"><table class="rel-table">
      <tr><th>Ad</th><th>Words shared</th><th>Word match</th><th>Meaning match</th></tr>
      <tbody data-o="rows"></tbody>
    </table></div>
    <p class="w-note" data-o="note"></p>`;
  const bar = v => `<span class="mini"><span style="width:${Math.round(v * 100)}%"></span></span><span class="num">${v.toFixed(2)}</span>`;
  const upd = () => {
    const q = $('[data-k="q"]', el).value, qv = vec(q);
    const rows = ADS.map(([id, text]) => ({ id, text, o: overlap(q, text), m: cos(qv, vec(text)) }));
    const best = rows.reduce((b, r) => (r.m > (b ? b.m : -1) ? r : b), null);
    $('[data-o="rows"]', el).innerHTML = rows.map(r => `<tr class="${best && r === best && r.m >= THRESH ? 'pick' : ''}"><td><b>${r.id}</b> ${r.text}</td><td>${r.o.shared.length ? r.o.shared.join(', ') : '<span class="muted">none</span>'}</td><td class="cellbar">${bar(r.o.score)}</td><td class="cellbar m">${bar(r.m)}</td></tr>`).join('');
    const wordBest = rows.reduce((b, r) => (r.o.score > b.o.score ? r : b), rows[0]);
    $('[data-o="note"]', el).textContent = !best || best.m < THRESH
      ? `No ad clears the relevance threshold (${THRESH}), so none is shown. Showing a running ad to someone fixing a bike would waste the spot.`
      : wordBest.o.score === 0
      ? `No ad shares a single word with "${q}", yet ad ${best.id} means nearly the same thing. Word matching misses it. Meaning matching finds it.`
      : `Ad ${best.id} is the best match by meaning (${best.m.toFixed(2)}). Notice how the word and meaning scores can disagree.`;
  };
  el.addEventListener('change', upd); upd();
};
