/* Matrix factorization page: train implicit ALS with 2 factors on the item-CF page's toy matrix,
   and plot each movie's learned vector. The same math as implementations/movie-recommender/recsys/mf.py. */
WIDGETS.mfdemo = function (el) {
  const MOVIES = ['Toy Story', 'Nemo', 'Alien', 'Terminator', 'Titanic', 'Notebook'];
  const PEOPLE = [
    [1, 1, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0], [1, 0, 0, 0, 1, 0], [0, 1, 0, 0, 0, 1],
    [0, 0, 1, 1, 0, 0], [0, 0, 1, 1, 1, 0], [0, 0, 0, 0, 1, 1], [1, 1, 0, 1, 0, 0]
  ];
  const ALPHA = 10, REG = 1, ROUNDS = 10;
  const COLS = MOVIES.map((_, j) => PEOPLE.map(p => p[j]));

  // solve_one for 2 factors: A x = b with A = gram + alpha * Yw'Yw + reg * I, b = (1 + alpha) * sum(Yw)
  const step = (fixed, rows) => {
    const g = [0, 0, 0];  // gram entries: [00, 01, 11]
    fixed.forEach(([a, b]) => { g[0] += a * a; g[1] += a * b; g[2] += b * b; });
    return rows.map(r => {
      let a00 = g[0] + REG, a01 = g[1], a11 = g[2] + REG, b0 = 0, b1 = 0;
      r.forEach((v, i) => { if (!v) return; const [y0, y1] = fixed[i];
        a00 += ALPHA * y0 * y0; a01 += ALPHA * y0 * y1; a11 += ALPHA * y1 * y1; b0 += (1 + ALPHA) * y0; b1 += (1 + ALPHA) * y1; });
      const d = a00 * a11 - a01 * a01;
      return [(b0 * a11 - a01 * b1) / d, (a00 * b1 - a01 * b0) / d];
    });
  };
  // the weighted squared error ALS minimizes, so you can watch it fall
  const loss = (U, I) => PEOPLE.reduce((s, p, u) => s + p.reduce((t, v, i) => {
    const pred = U[u][0] * I[i][0] + U[u][1] * I[i][1];
    return t + (v ? 1 + ALPHA : 1) * (v - pred) ** 2;
  }, 0), 0);

  // every round's vectors, computed once
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed / 2147483647 - 0.5) * 0.1; };
  let U = PEOPLE.map(() => [rnd(), rnd()]), I = MOVIES.map(() => [rnd(), rnd()]);
  const history = [{ U, I, loss: loss(U, I) }];
  for (let k = 0; k < ROUNDS; k++) { U = step(I, PEOPLE); I = step(U, COLS); history.push({ U, I, loss: loss(U, I) }); }

  const uid = Math.random().toString(36).slice(2, 7);
  const W = 520, H = 340, PAD = 40, LIM = 1.5;
  const x = v => PAD + (v + LIM) / (2 * LIM) * (W - 2 * PAD);
  const y = v => H - PAD - (v + LIM) / (2 * LIM) * (H - 2 * PAD);
  el.innerHTML = `
    <div class="w-head"><h5>Watch the vectors learn</h5><p>The same 8 people and 6 movies as the item-based CF demo. Each movie gets a vector of just 2 numbers, plotted as a point. They start random. Each round of ALS solves every person, then every movie.</p></div>
    <div class="slider-row"><label for="r${uid}">Rounds of training</label><input id="r${uid}" type="range" min="0" max="${ROUNDS}" step="1" value="${ROUNDS}"><span class="num" data-o="r"></span></div>
    <div class="outcomes" aria-live="polite">
      <div class="outcome"><span class="label">Fit error</span><span class="big" data-o="loss"></span><span data-o="losss"></span></div>
      <div class="outcome"><span class="label">Toy Story · Nemo</span><span class="big" data-o="tn"></span><span>predicted overlap, close = similar taste</span></div>
      <div class="outcome"><span class="label">Toy Story · Alien</span><span class="big" data-o="ta"></span><span>should stay smaller</span></div>
    </div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Each movie's two learned numbers plotted as a point. After training, Toy Story and Nemo sit together, apart from Alien and Terminator.">
      <line class="grid-l" x1="${x(-LIM)}" x2="${x(LIM)}" y1="${y(0)}" y2="${y(0)}"/>
      <line class="grid-l" x1="${x(0)}" x2="${x(0)}" y1="${y(-LIM)}" y2="${y(LIM)}"/>
      <text class="lbl" x="${x(-LIM)}" y="${y(0) - 6}">number 1</text>
      <text class="lbl" x="${x(0) + 6}" y="${y(LIM) + 10}">number 2</text>
      ${MOVIES.map((m, i) => `<g data-p="${i}"><circle class="mf-dot" r="5"/><text class="lbl strong"></text></g>`).join('')}
    </svg>
    <p class="w-note" data-o="note"></p>`;

  const input = $('input', el), o = k => $(`[data-o="${k}"]`, el);
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
  const upd = () => {
    const k = +input.value, h = history[k];
    o('r').textContent = k;
    // nudge labels apart where two movies land on top of each other
    const placed = [];
    h.I.forEach((v, i) => {
      const g = $(`[data-p="${i}"]`, el), cx = x(v[0]), cy = y(v[1]);
      $('circle', g).setAttribute('cx', cx); $('circle', g).setAttribute('cy', cy);
      const near = placed.filter(p => Math.abs(p[0] - cx) < 60 && Math.abs(p[1] - cy) < 14).length;
      placed.push([cx, cy]);
      const t = $('text', g);
      t.setAttribute('x', cx + 9); t.setAttribute('y', cy + 4 + near * 14); t.textContent = MOVIES[i];
    });
    o('loss').textContent = h.loss.toFixed(1);
    o('losss').textContent = k === 0 ? 'random start' : `down from ${history[0].loss.toFixed(1)} at the start`;
    o('tn').textContent = dot(h.I[0], h.I[1]).toFixed(2).replace('-0.00', '0.00');
    o('ta').textContent = dot(h.I[0], h.I[2]).toFixed(2).replace('-0.00', '0.00');
    o('note').textContent = k === 0
      ? 'Round 0: every vector is a tiny random guess, so all six movies sit in a clump near the middle and predict nothing.'
      : k < 3
      ? 'After a single round the error drops from about 209 to 50, and the movies jump apart. Number 1 is high for every movie: it soaks up "how much people watch in general".'
      : 'Number 2 now splits the movies. Toy Story and Nemo sit together on one side, Alien and Terminator on the other, Notebook in between. No one told the algorithm about genres. It found them from who watched what.';
  };
  input.addEventListener('input', upd); upd();
};
