/* ---------- search ---------- */
const plain = id => TERMS[id].body().replace(/<[^>]+>/g, ' ').toLowerCase();
function searchTopics(q) {
  q = q.trim().toLowerCase(); if (!q) return [];
  const score = id => { const n = TERMS[id].name.toLowerCase();
    return n.startsWith(q) ? 0 : n.includes(q) ? 1 : TERMS[id].short.toLowerCase().includes(q) ? 2 : plain(id).includes(q) ? 3 : 9; };
  return ordered().map(id => [id, score(id)]).filter(x => x[1] < 9).sort((a, b) => a[1] - b[1]).map(x => x[0]).slice(0, 8);
}
const esc = v => v.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

document.addEventListener('input', e => {
  if (e.target.id !== 'q') return;
  const res = $('#results'), v = e.target.value, hits = searchTopics(v);
  if (!v.trim()) { res.hidden = true; return; }
  res.innerHTML = hits.length
    ? hits.map((id, i) => `<a href="#t-${id}" class="${i === 0 ? 'sel' : ''}"><span>${TERMS[id].name}</span><span class="s">${sectionOf(id).name}</span></a>`).join('')
    : `<p class="empty muted">No topic matches “${esc(v.trim())}”.</p>`;
  res.hidden = false;
});
document.addEventListener('keydown', e => {
  if (e.target.id !== 'q') return;
  if (e.key === 'Enter') { const first = $('#results a'); if (first) location.hash = first.getAttribute('href'); }
  if (e.key === 'Escape') { e.target.value = ''; $('#results').hidden = true; }
});
document.addEventListener('click', e => { const r = $('#results'); if (r && !e.target.closest('.search')) r.hidden = true; });
