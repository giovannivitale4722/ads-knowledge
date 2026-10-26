/* ---------- topic page ---------- */
function viewTerm(id) {
  const t = TERMS[id], sec = sectionOf(id), ord = ordered(), i = ord.indexOf(id);
  const before = ord.filter(x => ancestors(id).has(x)), others = inOrder(sec.terms).filter(x => x !== id), leads = unlocks(id);
  const prev = ord[i - 1], next = ord[i + 1];
  const chips = list => list.map(x => `<a href="#t-${x}">${TERMS[x].name}</a>`).join('');
  return `
    <header class="title-row">
      <div><div class="crumbs"><a href="#home">Home</a> / <a href="#glossary">${sec.name}</a></div><h1>${t.name}</h1><p class="sub">${t.short}</p></div>
    </header>
    ${before.length ? `<div class="path" aria-label="Builds on"><span class="path-l">Builds on</span>${before.map(x => `<a href="#t-${x}">${TERMS[x].name}</a><span class="arr" aria-hidden="true">→</span>`).join('')}<span class="here">${t.name}</span></div>` : ''}
    <div class="topic-layout">
      <article class="panel"><div class="prose">${t.body()}${t.check ? `<div class="widget" data-widget="quiz" data-term="${id}"></div>` : ''}</div></article>
      <nav class="toc" aria-label="On this page"><p class="toc-h">On this page</p><div class="toc-list"></div></nav>
    </div>
    <section class="keep-going" aria-label="Keep going">
      ${leads.length ? `<div><span class="kg-l">Leads to</span><div class="path">${chips(leads)}</div></div>` : ''}
      <div><span class="kg-l">More in ${sec.name}</span><div class="path">${chips(others)}</div></div>
    </section>
    <nav class="pager" aria-label="Roadmap order">
      ${prev ? `<a href="#t-${prev}"><span class="s">← Previous on the roadmap</span><span class="t">${TERMS[prev].name}</span></a>` : ''}
      ${next ? `<a class="next" href="#t-${next}"><span class="s">Next on the roadmap →</span><span class="t">${TERMS[next].name}</span></a>` : ''}
    </nav>`;
}

/* ---------- "On this page" outline for topic pages ---------- */
let tocObserver = null;
function buildToc() {
  if (tocObserver) { tocObserver.disconnect(); tocObserver = null; }
  const list = $('.toc-list'); if (!list) return;
  const heads = $$('.prose > h2');
  if (heads.length < 3) { $('.toc').hidden = true; return; }
  heads.forEach((h, i) => { h.id = 'sec-' + i; });
  list.innerHTML = heads.map((h, i) => `<button type="button" data-goto="sec-${i}">${h.textContent}</button>`).join('');
  const mark = id => $$('.toc-list button').forEach(b => b.classList.toggle('on', b.dataset.goto === id));
  mark('sec-0');
  if ('IntersectionObserver' in window) {
    tocObserver = new IntersectionObserver(es => {
      const vis = es.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (vis) mark(vis.target.id);
    }, { rootMargin: '0px 0px -70% 0px' });
    heads.forEach(h => tocObserver.observe(h));
  }
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-goto]'); if (!b) return;
  const h = document.getElementById(b.dataset.goto);
  if (h) h.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
});
