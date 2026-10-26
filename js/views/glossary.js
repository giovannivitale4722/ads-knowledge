/* ---------- all topics page ---------- */
function viewGlossary() {
  return `
    <header class="title-row"><div><h1>All topics</h1><p class="sub">${ids.length} topics in ${SECTIONS.length} subjects. Within each subject, topics are listed in the order to read them.</p></div></header>
    ${SECTIONS.map(sec => `
    <section class="panel">
      <div class="panel-head"><h2>${sec.name} <span class="count">${sec.terms.length}</span></h2><span class="aside">${sec.q}</span></div>
      <div class="tbl-wrap" style="border:0"><table class="gl-table">
        <tr><th>Topic</th><th>In one line</th><th>Stage</th></tr>
        ${inOrder(sec.terms).map(id => `<tr><td><a href="#t-${id}">${TERMS[id].name}</a></td><td class="def">${TERMS[id].short}</td><td class="muted">${stageOf(id)}</td></tr>`).join('')}
      </table></div>
    </section>`).join('')}`;
}
