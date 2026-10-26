/* ---------- roadmap logic ---------- */
const STAGES = ['Start here', 'Building blocks', 'Core ideas', 'Putting it together'];
const ids = Object.keys(TERMS);
const depthMemo = {};
function depth(id) {
  if (depthMemo[id] !== undefined) return depthMemo[id];
  const n = TERMS[id].needs;
  return (depthMemo[id] = n.length ? 1 + Math.max(...n.map(depth)) : 0);
}
function ancestors(id, out = new Set()) { TERMS[id].needs.forEach(n => { if (!out.has(n)) { out.add(n); ancestors(n, out); } }); return out; }
const unlocks = id => ids.filter(o => TERMS[o].needs.includes(id));
const ordered = () => [...ids].sort((a, b) => depth(a) - depth(b) || ids.indexOf(a) - ids.indexOf(b));
const stageOf = id => STAGES[Math.min(depth(id), STAGES.length - 1)];
const sectionOf = id => SECTIONS.find(x => x.terms.includes(id));
const inOrder = list => ordered().filter(id => list.includes(id));
const needsText = id => TERMS[id].needs.length ? 'Read first: ' + TERMS[id].needs.map(x => TERMS[x].name).join(', ') : 'A good place to start';

function roadmapHTML() {
  const cols = STAGES.map((name, i) => ({ name, items: ordered().filter(id => Math.min(depth(id), STAGES.length - 1) === i) })).filter(c => c.items.length);
  return `<div class="road" style="--cols:${cols.length}"><svg class="edges" aria-hidden="true"></svg>${cols.map(c => `
    <div class="stage"><div class="stage-name">${c.name}</div>${c.items.map(id => `
      <a class="node" href="#t-${id}" data-n="${id}">
        <span class="st" aria-hidden="true"></span><span class="nm">${TERMS[id].name}</span><span class="go" aria-hidden="true">→</span>
        <span class="needs">${TERMS[id].needs.length ? 'After ' + TERMS[id].needs.map(x => TERMS[x].name).join(', ') : 'Start here'}</span>
      </a>`).join('')}</div>`).join('')}</div>
    <p class="road-foot" aria-live="polite">Point at a topic to trace everything it builds on.</p>`;
}

/* ---------- roadmap edges and path tracing ---------- */
function drawEdges() {
  const road = $('.road'); if (!road) return;
  const svg = $('svg.edges', road);
  if (getComputedStyle(svg).display === 'none') return;
  const box = road.getBoundingClientRect(), pos = {};
  $$('.node', road).forEach(n => { const r = n.getBoundingClientRect(); pos[n.dataset.n] = { r: r.right - box.left, l: r.left - box.left, y: r.top - box.top + r.height / 2 }; });
  let d = '';
  ids.forEach(id => TERMS[id].needs.forEach(p => {
    const a = pos[p], b = pos[id]; if (!a || !b) return;
    const mx = (a.r + b.l) / 2;
    d += `<path data-from="${p}" data-to="${id}" d="M${a.r},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.l},${b.y}"/>`;
  }));
  svg.innerHTML = d;
}
function traceNode(id) {
  const road = $('.road'); if (!road) return;
  const chain = id ? ancestors(id) : new Set(), all = new Set([...chain, id]);
  road.classList.toggle('focus', !!id);
  $$('.node', road).forEach(n => { n.classList.toggle('on', n.dataset.n === id); n.classList.toggle('chain', chain.has(n.dataset.n)); });
  $$('.edges path', road).forEach(p => p.classList.toggle('on', !!id && all.has(p.dataset.from) && all.has(p.dataset.to)));
  const foot = $('.road-foot');
  if (foot) foot.innerHTML = !id ? 'Point at a topic to trace everything it builds on.'
    : chain.size ? `<b>${TERMS[id].name}</b> builds on ${chain.size} topic${chain.size === 1 ? '' : 's'}: ${ordered().filter(x => chain.has(x)).map(x => TERMS[x].name).join(', ')}.`
    : `<b>${TERMS[id].name}</b> doesn't need anything first. It's a good place to start.`;
}
