WIDGETS.quiz = function (el) {
  const qs = TERMS[el.dataset.term].check;
  el.innerHTML = `<div class="w-head"><h5>Check yourself</h5></div>
    <div class="quiz">${qs.map((q, i) => `
      <div class="q" data-i="${i}"><p class="q-text">${q.q}</p>
        <div class="opts">${q.opts.map((o, j) => `<button type="button" class="opt" data-j="${j}">${o}</button>`).join('')}</div>
        <p class="expl" hidden></p></div>`).join('')}</div>`;
  el.addEventListener('click', e => {
    const btn = e.target.closest('.opt'); if (!btn || btn.disabled) return;
    const box = btn.closest('.q'), q = qs[+box.dataset.i], j = +btn.dataset.j;
    $$('.opt', box).forEach((b, k) => { b.disabled = true; if (k === q.a) b.classList.add('right'); });
    if (j !== q.a) btn.classList.add('wrong');
    const ex = $('.expl', box); ex.textContent = (j === q.a ? 'Correct. ' : 'Not quite. ') + q.why; ex.hidden = false;
  });
};
