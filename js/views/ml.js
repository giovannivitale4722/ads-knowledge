/* ---------- machine learning hub ---------- */
const ML_SUBJECT = 'Machine learning in ads';

function viewML() {
  const sec = SECTIONS.find(x => x.name === ML_SUBJECT), examples = inOrder(sec.terms);
  const uses = [
    ['Find candidate ads', 'Which ads match what this search means, using embeddings', 'ad-quality', 'Ad Quality: ad relevance'],
    ['Predict clicks', 'How likely this person is to click each ad', 'pctr', 'pCTR'],
    ['Judge quality', 'How relevant the ad is and how good its landing page is', 'ad-quality', 'Ad Quality'],
    ['Set the bid', 'The bid for this auction that best meets the advertiser\'s goal', 'bid', 'Bid: who places the bid'],
    ['Shade first-price bids', 'The lowest bid that is still likely to win', 'bid-shading', 'Bid shading']
  ];
  return `
    <header class="title-row">
      <div><div class="crumbs"><a href="#home">Home</a> / Machine learning</div><h1>Machine learning in ads</h1>
        <p class="sub">An ad system makes millions of predictions every second. Here's where machine learning does that work, with worked examples you can run in your browser.</p></div>
    </header>
    <section class="panel">
      <div class="panel-head"><h2>Where ML shows up in one ad request</h2><span class="aside">Each step happens in milliseconds</span></div>
      <div class="tbl-wrap" style="border:0"><table>
        <tr><th>Step</th><th>What the model predicts</th><th>Read more</th></tr>
        ${uses.map(([step, what, id, label]) => `<tr><td><b>${step}</b></td><td>${what}</td><td><a href="#t-${id}">${label}</a></td></tr>`).join('')}
      </table></div>
    </section>
    <section class="browse">
      <div class="panel-head"><h2>Worked examples <span class="count">${examples.length}</span></h2><span class="aside">Every algorithm explained step by step, with a version you can run</span></div>
      <div class="ml-examples">${examples.map(id => `
        <a class="panel ml-ex" href="#t-${id}">
          <h3>${TERMS[id].name}</h3>
          <p>${TERMS[id].short}</p>
          <span class="ml-go">Read the walkthrough →</span>
        </a>`).join('')}</div>
    </section>`;
}
