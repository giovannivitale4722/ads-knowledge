/* Boot: checks the data, then routing, the term popover and page-wide events. Load last. */
console.assert(Object.keys(TERMS).every(id => SECTIONS.filter(x => x.terms.includes(id)).length === 1), 'every topic belongs to exactly one subject');
Object.entries(CHECKS).forEach(([id, c]) => { TERMS[id].check = c; });

/* ---------- routing ---------- */
function route() {
  closePop();
  let h = location.hash.slice(1) || 'home';
  const main = $('#main');
  if (h === 'glossary') main.innerHTML = viewGlossary();
  else if (h === 'ml') main.innerHTML = viewML();
  else if (h.startsWith('t-') && TERMS[h.slice(2)]) main.innerHTML = viewTerm(h.slice(2));
  else { h = 'home'; main.innerHTML = viewHome(); }
  $$('[data-widget]', main).forEach(el => WIDGETS[el.dataset.widget](el));
  $$('.rail-item').forEach(a => {
    const nav = h.startsWith('t-') ? (sectionOf(h.slice(2)).name === ML_SUBJECT ? 'ml' : 'glossary') : h;
    if (a.dataset.nav === nav) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  requestAnimationFrame(drawEdges);
  buildToc();
  window.scrollTo(0, 0);
}

/* ---------- popover for underlined terms ---------- */
const pop = $('#pop');
let popAnchor = null;
function openPop(btn) {
  const id = btn.dataset.t, t = TERMS[id];
  if (popAnchor) popAnchor.setAttribute('aria-expanded', 'false');
  popAnchor = btn; btn.setAttribute('aria-expanded', 'true');
  $('#pop-name').textContent = t.name;
  $('#pop-def').textContent = t.short;
  $('#pop-needs').textContent = stageOf(id) + ' · ' + needsText(id);
  $('#pop-more').href = '#t-' + id;
  $('#pop-more').hidden = location.hash === '#t-' + id;
  pop.hidden = false;
  if (innerWidth < 600) { pop.classList.add('sheet'); pop.style.top = pop.style.left = ''; }
  else {
    pop.classList.remove('sheet');
    const r = btn.getBoundingClientRect(), w = pop.offsetWidth, ph = pop.offsetHeight;
    let top = r.bottom + scrollY + 8;
    if (r.bottom + ph + 16 > innerHeight && r.top - ph - 8 > 0) top = r.top + scrollY - ph - 8;
    pop.style.top = top + 'px';
    pop.style.left = Math.min(Math.max(16, r.left + scrollX), scrollX + innerWidth - w - 16) + 'px';
  }
}
function closePop(refocus) {
  if (pop.hidden) return;
  pop.hidden = true;
  if (popAnchor) { popAnchor.setAttribute('aria-expanded', 'false'); if (refocus) popAnchor.focus(); }
  popAnchor = null;
}

document.addEventListener('click', e => {
  const t = e.target.closest('.term');
  if (t) { e.preventDefault(); t === popAnchor ? closePop() : openPop(t); return; }
  if (!e.target.closest('#pop')) closePop();
});
document.addEventListener('mouseover', e => { const n = e.target.closest('.node'); if (n) traceNode(n.dataset.n); });
document.addEventListener('mouseout', e => { const n = e.target.closest('.node'); if (n && !n.contains(e.relatedTarget)) traceNode(null); });
document.addEventListener('focusin', e => { const n = e.target.closest('.node'); traceNode(n ? n.dataset.n : null); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePop(true); });
let rz; addEventListener('resize', () => { closePop(); clearTimeout(rz); rz = setTimeout(drawEdges, 80); });
addEventListener('hashchange', route);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawEdges);
route();
