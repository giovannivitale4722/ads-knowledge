/* ---------- implementations hub ---------- */
const IMPL_SUBJECT = 'Implementations';
const IMPL_REPO = 'https://github.com/giovannivitale4722/ads-knowledge/tree/main/implementations/';
const IMPL_PROJECTS = {
  'target-cpa': { folder: 'tcpa-autobidder', lang: 'C++', todos: 2 }
};

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
    <section class="browse">
      <div class="panel-head"><h2>Projects <span class="count">${list.length}</span></h2></div>
      <div class="ml-examples">${list.map(id => {
        const p = IMPL_PROJECTS[id] || {};
        return `
        <div class="panel ml-ex">
          <h3>${TERMS[id].name}</h3>
          <p>${TERMS[id].short}</p>
          <div class="impl-meta"><span class="conf">${p.lang || 'Code'}</span><span class="conf lo">${p.todos || 0} TODOs for you</span></div>
          <div class="impl-links"><a class="ml-go" href="#t-${id}">Visual walkthrough →</a>${p.folder ? `<a class="ml-go" href="${IMPL_REPO}${p.folder}" target="_blank" rel="noopener">Code on GitHub ↗</a>` : ''}</div>
        </div>`; }).join('')}</div>
    </section>`;
}
