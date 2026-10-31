/* ---------- implementations hub ---------- */
const IMPL_SUBJECT = 'Implementations';
const IMPL_REPO = 'https://github.com/giovannivitale4722/ads-knowledge/tree/main/implementations/';
const IMPL_PROJECTS = {
  'target-cpa': { folder: 'tcpa-autobidder', lang: 'C++', todos: 2, group: 'autobidding' },
  'max-conversions': { folder: 'budget-pacer', lang: 'C++', todos: 3, group: 'autobidding' },
  'item-cf': { folder: 'movie-recommender', lang: 'Python', todos: 3, group: 'recsys' }
};
// The groups the Implementations page is split into, in order. Every project names one in `group`.
const IMPL_GROUPS = [
  { id: 'autobidding', name: 'Autobidding', q: 'Bidders that set every bid for an advertiser, in C++' },
  { id: 'recsys', name: 'Recommendation algorithms', q: 'Systems that pick what to show each person, in Python' }
];

function implCard(id) {
  const p = IMPL_PROJECTS[id] || {};
  return `
        <div class="panel ml-ex">
          <h3>${TERMS[id].name}</h3>
          <p>${TERMS[id].short}</p>
          <div class="impl-meta"><span class="conf">${p.lang || 'Code'}</span><span class="conf lo">${p.todos || 0} TODOs for you</span></div>
          <div class="impl-links"><a class="ml-go" href="#t-${id}">Visual walkthrough →</a>${p.folder ? `<a class="ml-go" href="${IMPL_REPO}${p.folder}" target="_blank" rel="noopener">Code on GitHub ↗</a>` : ''}</div>
        </div>`;
}

function viewImpl() {
  const sec = SECTIONS.find(x => x.name === IMPL_SUBJECT), list = inOrder(sec.terms);
  return `
    <header class="title-row">
      <div><div class="crumbs"><a href="#home">Home</a> / Implementations</div><h1>Implementations</h1>
        <p class="sub">Build the real algorithms yourself. Each project has a visual walkthrough here and a code project where you write the core of the algorithm.</p></div>
    </header>
    <section class="panel">
      <div class="panel-head"><h2>How each project works</h2></div>
      <ol class="pipe" style="--n:4">
        <li><b>Read the walkthrough</b><span>the idea, step by step, with demos you can play with</span></li>
        <li><b>Open the project</b><span>everything is built except the core logic</span></li>
        <li><b>Fill in the TODOs</b><span>the comments spell out exactly what each one must do</span></li>
        <li><b>Test and run</b><span>make test checks you, make run shows the results</span></li>
      </ol>
    </section>
    ${IMPL_GROUPS.map(g => {
      const ids = list.filter(id => (IMPL_PROJECTS[id] || {}).group === g.id);
      return !ids.length ? '' : `
    <section class="browse">
      <div class="panel-head"><h2>${g.name} <span class="count">${ids.length}</span></h2><span class="aside">${g.q}</span></div>
      <div class="ml-examples">${ids.map(implCard).join('')}</div>
    </section>`; }).join('')}`;
}
