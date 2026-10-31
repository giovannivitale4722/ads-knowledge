/* Item-based CF page: a tiny watch matrix. Pick the movies "you" watched and see every other
   movie's score, built from cosine similarities, the same math as implementations/movie-recommender. */
WIDGETS.cfdemo = function (el) {
  const MOVIES = ['Toy Story', 'Nemo', 'Alien', 'Terminator', 'Titanic', 'Notebook'];
  const PEOPLE = [
    [1, 1, 0, 0, 0, 0], [1, 1, 1, 0, 0, 0], [1, 0, 0, 0, 1, 0], [0, 1, 0, 0, 0, 1],
    [0, 0, 1, 1, 0, 0], [0, 0, 1, 1, 1, 0], [0, 0, 0, 0, 1, 1], [1, 1, 0, 1, 0, 0]
  ];
  const n = MOVIES.length;
  // cosine similarity between movie columns, diagonal 0 (as in TODO 2)
  const col = j => PEOPLE.map(p => p[j]);
  const both = (i, j) => PEOPLE.reduce((s, p) => s + p[i] * p[j], 0);
  const SIM = MOVIES.map((_, i) => MOVIES.map((_, j) => i === j ? 0 : both(i, j) / Math.sqrt(both(i, i) * both(j, j))));
  let watched = new Set([0]);

  el.innerHTML = `
    <div class="w-head"><h5>Recommend from a tiny matrix</h5><p>Eight people and six movies. A dot means that person watched it. Pick the movies you've watched, and every other movie is scored by how similar it is to yours.</p></div>
    <div class="tbl-wrap"><table class="cf-matrix">
      <tr><th>Person</th>${MOVIES.map(m => `<th class="num">${m}</th>`).join('')}</tr>
      ${PEOPLE.map((p, k) => `<tr><td>${k + 1}</td>${p.map(v => `<td class="num">${v ? '●' : ''}</td>`).join('')}</tr>`).join('')}
    </table></div>
    <div class="ctrls" role="group" aria-label="Movies you watched">
      <span class="lbl-inline">You watched:</span>
      ${MOVIES.map((m, i) => `<button type="button" class="btn btn-ghost-toggle btn-sm" data-m="${i}" aria-pressed="${watched.has(i)}">${m}</button>`).join('')}
    </div>
    <ol class="rank" aria-live="polite"></ol>
    <p class="w-note" data-o="note"></p>`;

  const draw = () => {
    const mine = [...watched];
    const rows = MOVIES.map((m, j) => ({ j, m, score: mine.reduce((s, i) => s + SIM[i][j], 0) }))
      .filter(r => !watched.has(r.j)).sort((a, b) => b.score - a.score);
    const top = rows.length ? rows[0].score : 0, max = Math.max(top, 0.0001);
    $('.rank', el).innerHTML = !mine.length ? '' : rows.map((r, k) => `
      <li class="${k === 0 && r.score > 0 ? 'win' : ''}">
        <span class="pos">${k + 1}</span><span class="nm">${r.m}</span>
        <span class="bar" style="width:${(100 * r.score / max).toFixed(1)}%"></span>
        <span class="val">${r.score.toFixed(2)}</span>
        <span class="calc">${mine.map(i => `${SIM[i][r.j].toFixed(2)} from ${MOVIES[i]}`).join(' + ')}</span>
      </li>`).join('');
    const best = rows[0];
    $('[data-o="note"]', el).textContent = !mine.length
      ? 'Pick at least one movie: with no history, there is nothing to compare against. That is the cold-start problem.'
      : !best || best.score === 0
      ? 'Nothing left with any overlap. Every remaining movie scores 0.'
      : `Recommend ${best.m}. Its score is the sum of its similarities to ${mine.length === 1 ? MOVIES[mine[0]] : 'each movie you picked'}: ${mine.map(i => SIM[i][best.j].toFixed(2)).join(' + ')} = ${best.score.toFixed(2)}.`;
  };
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-m]');
    if (!b) return;
    const i = +b.dataset.m;
    watched.has(i) ? watched.delete(i) : watched.add(i);
    b.setAttribute('aria-pressed', watched.has(i));
    draw();
  });
  draw();
};
