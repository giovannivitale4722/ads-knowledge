/* ---------- home page ---------- */
function viewHome() {
  const firsts = ordered().filter(id => !TERMS[id].needs.length);
  const demos = [
    ['logistic-regression', 'Train a click model', 'Watch a real model learn from 2,000 impressions'],
    ['adx', 'Watch one impression get sold', 'Follow a real-time auction, millisecond by millisecond'],
    ['pctr', 'Build a pCTR', 'Change the situation and watch the click prediction move'],
    ['cpc', 'What will I actually pay?', 'See why your real cost per click is below your max'],
    ['ad-quality', 'Words vs meaning', 'See why matching meaning beats matching words'],
    ['ad-rank', 'Who wins the top spot?', 'Change bids and click rates and watch the ranking flip'],
    ['ecpm', 'Per-click vs per-impression', 'See how a CPC bid is compared with a CPM bid'],
    ['vickrey', 'Same bids, two payment rules', 'Second-price and first-price side by side'],
    ['bid-shading', 'Find the best shaded bid', 'Slide your bid and watch expected profit peak']
  ];
  const formulas = [
    ['ad-rank', 'Ad Rank', 'Bid × pCTR × Ad Quality'],
    ['pctr', 'pCTR from a model score', '1 ÷ (1 + e<sup>−score</sup>)'],
    ['logistic-regression', 'Log loss', '−[y · ln p + (1 − y) · ln(1 − p)]'],
    ['ecpm', 'eCPM', 'Bid<sub>CPC</sub> × pCTR × 1000'],
    ['cpm', 'Cost of one impression', 'CPM ÷ 1000'],
    ['cpc', 'Cost per customer (CPA)', 'CPC ÷ conversion rate'],
    ['ad-quality', 'Quality Score (estimated)', '1 + expected CTR + relevance + landing page points'],
    ['gsp', 'GSP price per click', 'Ad Rank below ÷ (pCTR × Ad Quality)'],
    ['bid-shading', 'Expected profit', '(value − bid) × chance of winning']
  ];
  return `
    <header class="title-row">
      <div><h1>Ads Knowledge</h1><p class="sub">Learn how Google Ads works, from a single impression to the auction that decides which ad you see.</p></div>
      <div class="search" role="search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
        <input id="q" type="search" placeholder="Search ${ids.length} topics" aria-label="Search topics" autocomplete="off">
        <div class="results" id="results" hidden></div>
      </div>
    </header>
    <section class="panel about">
      <div class="panel-head"><h2>Why I made this</h2><span class="aside">Updated ${UPDATED}</span></div>
      <p>I got really interested in ad exchanges, so I decided to study up on how they work, from auctions and bidding to how an ad gets picked for you. This site is everything I've learned so far, condensed into one place. I use it as my own reference, and you're welcome to as well: start from the beginning, or jump to whatever topic catches your interest! I'm still learning, so I'll keep adding to it and updating it as I go.</p>
    </section>
    <section class="panel start">
      <div class="start-main">
        <div class="panel-head"><h2>New to ads? Start here</h2></div>
        <p class="lede">Every time you search on Google, a tiny auction decides which ads you see. Here's the whole idea in four steps. Click any underlined word to learn more.</p>
        <ol class="steps">
          <li><div><b>Someone searches or opens a page.</b> Each chance to show an ad is an ${T('impression', 'impression')}. On ${T('search-ads')}, the search says what the person wants. On ${T('display', 'display')} and ${T('youtube', 'YouTube')}, the page or video gives the clues.</div></li>
          <li><div><b>Advertisers compete.</b> Each one set a ${T('bid', 'bid')} ahead of time: the most they'll pay, usually per click (${T('cpc')}) or per 1,000 impressions (${T('cpm')}). Nobody bids live. Google's system places each bid for them in milliseconds.</div></li>
          <li><div><b>Google ranks the ads.</b> Not by money alone. ${T('ad-rank')} = bid × ${T('pctr')} × ${T('ad-quality')}, so a useful ad can beat a bigger bid.</div></li>
          <li><div><b>The winner pays.</b> How much depends on the ${T('auction-mechanism', 'auction mechanism')}: just enough to beat the ad below (${T('gsp', 'GSP')}, used by Google Search), or exactly the bid (${T('first-price', 'first-price')}, used by ad exchanges like AdX).</div></li>
        </ol>
      </div>
      <aside class="first">
        <h3>Read these first</h3>
        <p class="muted">The ${firsts.length} topics everything else builds on. Each takes a couple of minutes.</p>
        <ol class="first-list">${firsts.map(id => `<li><a href="#t-${id}">${TERMS[id].name}</a></li>`).join('')}</ol>
        <a class="btn btn-primary" href="#t-${firsts[0]}">Begin with ${TERMS[firsts[0]].name}</a>
      </aside>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>Roadmap</h2><span class="aside">Each topic builds on the ones to its left</span></div>
      ${roadmapHTML()}
    </section>
    <section class="browse">
      <div class="panel-head"><h2>Browse by subject</h2><a class="aside" href="#glossary">All ${ids.length} topics</a></div>
      <div class="themes">${SECTIONS.map(sec => { const list = inOrder(sec.terms); return `
        <article class="panel theme">
          <div><h3>${sec.name}</h3><p class="q">${sec.q}</p></div>
          <ul class="list">${list.map(id => `<li><a class="row" href="#t-${id}"><span class="t">${TERMS[id].name}</span><span class="s">${stageOf(id)}</span></a></li>`).join('')}</ul>
          ${sec.key ? `<div class="formula">${sec.key}</div>` : ''}
          <a class="theme-go" href="#t-${list[0]}">Start with ${TERMS[list[0]].name} →</a>
        </article>`; }).join('')}</div>
    </section>
    <div class="grid">
      <section class="panel s6">
        <div class="panel-head"><h2>Try it yourself <span class="count">${demos.length}</span></h2></div>
        <ul class="list">${demos.map(([id, t, d]) => `<li><a class="row" href="#t-${id}"><span><span class="t">${t}</span><br><span class="s">${d}</span></span><span class="s">${TERMS[id].name}</span></a></li>`).join('')}</ul>
      </section>
      <section class="panel s6">
        <div class="panel-head"><h2>Key formulas <span class="count">${formulas.length}</span></h2></div>
        <ul class="list">${formulas.map(([id, t, f]) => `<li><a class="row" href="#t-${id}"><span><span class="t">${t}</span><br><span class="s">${f}</span></span><span class="s">${TERMS[id].name}</span></a></li>`).join('')}</ul>
      </section>
    </div>
    <footer class="foot">${ids.length} topics in ${SECTIONS.length} subjects · Updated ${UPDATED} · Still growing as I learn</footer>`;
}
