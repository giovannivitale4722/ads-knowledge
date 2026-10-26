/* Vickrey page: for any bid, shade every possible rival bid by what happens compared with bidding your true value. */
WIDGETS.truthful = function (el) {
  const V = 10, MAX = 15, uid = Math.random().toString(36).slice(2, 7);
  const pct = x => (x / MAX * 100).toFixed(2) + '%';
  el.innerHTML = `
    <div class="w-head"><h5>Every possible rival bid at once</h5><p>The slot is worth $10 to you. Pick your bid. The strip covers every rival bid from $0 to $15 and colors each one by what happens to you compared with bidding exactly $10.</p></div>
    <div class="slider-row"><label for="t${uid}">Your bid</label><input id="t${uid}" type="range" min="0" max="15" step="0.5" value="13"><span class="num" data-o="b"></span></div>
    <div class="tstrip" aria-hidden="true" data-o="strip"></div>
    <div class="tstrip-axis" aria-hidden="true">${[0, 5, 10, 15].map(x => `<span style="left:${pct(x)}">$${x}</span>`).join('')}</div>
    <div class="tlegend">
      <span><i class="same"></i>Same result as bidding $10</span>
      <span><i class="loss"></i>You win but lose money</span>
      <span><i class="miss"></i>You lose a slot you'd have profited from</span>
    </div>
    <p class="w-note" aria-live="polite" data-o="note"></p>`;
  const upd = () => {
    const b = +$('input', el).value;
    $('[data-o="b"]', el).textContent = money(b);
    const lo = Math.min(b, V), hi = Math.max(b, V), bad = b > V ? 'loss' : 'miss';
    const segs = [[0, lo, 'same'], [lo, hi, bad], [hi, MAX, 'same']].filter(([a, z]) => z > a);
    $('[data-o="strip"]', el).innerHTML = segs.map(([a, z, c]) => `<span class="${c}" style="left:${pct(a)};width:${pct(z - a)}"></span>`).join('')
      + `<span class="tmark" style="left:${pct(V)}" title="Your true value"></span>`;
    $('[data-o="note"]', el).textContent = b === V
      ? 'Bidding your true value: there is no rival bid where a different bid would have done better.'
      : b > V
      ? `Bidding ${money(b)}: if the rival bids between $10 and ${money(b)}, you win but pay more than the slot is worth. Every other rival bid gives the same result as bidding $10. Nothing gets better.`
      : `Bidding ${money(b)}: if the rival bids between ${money(b)} and $10, you lose a slot you'd have profited from. Every other rival bid gives the same result as bidding $10, and you never pay less.`;
  };
  el.addEventListener('input', upd); upd();
};
