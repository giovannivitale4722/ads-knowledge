WIDGETS.playground = function (el) {
  const VALUE = 10, uid = Math.random().toString(36).slice(2, 7);
  el.innerHTML = `
    <div class="w-head"><h5>Same bids, two payment rules</h5><p>This impression is worth $10 to you. There's one rival bidder, and ties go to the rival.</p></div>
    <div class="slider-row"><label for="y${uid}">Your bid</label><input id="y${uid}" data-k="you" type="range" min="0" max="15" step="0.5" value="10"><span class="num" data-o="you"></span></div>
    <div class="slider-row"><label for="v${uid}">Rival's bid</label><input id="v${uid}" data-k="riv" type="range" min="0" max="15" step="0.5" value="7"><span class="num" data-o="riv"></span></div>
    <div class="outcomes" aria-live="polite"><div class="outcome" data-o="2"></div><div class="outcome" data-o="1"></div></div>`;
  const card = (title, win, pay) => {
    if (!win) return `<span class="label">${title}</span><span class="big zero-v">$0.00</span><span>You lose, so you pay nothing.</span>`;
    const p = VALUE - pay, cls = p > 0 ? 'pos-v' : p < 0 ? 'neg-v' : 'zero-v';
    return `<span class="label">${title}</span><span class="big ${cls}">${p > 0 ? '+' : p < 0 ? '−' : ''}${money(Math.abs(p))}</span><span>You win and pay ${money(pay)}. Profit = $10.00 − ${money(pay)}.</span>`;
  };
  const upd = () => {
    const you = +$('[data-k="you"]', el).value, riv = +$('[data-k="riv"]', el).value, win = you > riv;
    $('[data-o="you"]', el).textContent = money(you); $('[data-o="riv"]', el).textContent = money(riv);
    $('[data-o="2"]', el).innerHTML = card('Second-price (Vickrey) profit', win, riv);
    $('[data-o="1"]', el).innerHTML = card('First-price profit', win, you);
  };
  el.addEventListener('input', upd); upd();
};
