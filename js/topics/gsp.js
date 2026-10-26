/* Topic: gsp  ·  subject: How auctions work  ·  registered in js/config.js */
TERMS['gsp'] = { name: 'GSP', needs: ['vickrey', 'ad-rank', 'search-ads'],
    short: 'Generalized Second-Price: the multi-slot version of a second-price auction, used for search ads. Each ad pays just enough to beat the ad below it.',
    body: () => `
      <h2>The rules</h2>
      <p>A search results page has several ad positions, not one. GSP extends the ${T('vickrey', 'second-price')} idea to all of them:</p>
      <ul>
        <li>Sort the ads by ${T('ad-rank')}. Position 1 goes to the highest, position 2 to the next, and so on.</li>
        <li>Each ad pays the <b>minimum it would have needed to keep its position</b>, which is set by the ad right below it.</li>
      </ul>
      <p>With Ad Rank = ${T('bid')} × ${T('pctr')} × ${T('ad-quality')}, the textbook price per click is:</p>
      <div class="formula">price per click = Ad Rank of the ad below ÷ (your pCTR × your Ad Quality)</div>
      <h2>Example: 2 ad slots, 3 ads</h2>
      <div class="tbl-wrap"><table>
        <tr><th>Position</th><th>Ad</th><th class="num">Bid</th><th class="num">pCTR</th><th class="num">Quality</th><th class="num">Ad Rank</th><th class="num">Pays per click</th></tr>
        <tr><td>1</td><td>B</td><td class="num">$2.00</td><td class="num">3%</td><td class="num">1.0</td><td class="num">0.060</td><td class="num">0.048 ÷ (0.03 × 1.0) = <b>$1.60</b></td></tr>
        <tr><td>2</td><td>C</td><td class="num">$3.00</td><td class="num">2%</td><td class="num">0.8</td><td class="num">0.048</td><td class="num">0.040 ÷ (0.02 × 0.8) = <b>$2.50</b></td></tr>
        <tr><td>—</td><td>A</td><td class="num">$4.00</td><td class="num">1%</td><td class="num">1.0</td><td class="num">0.040</td><td class="num muted">Not shown</td></tr>
      </table></div>
      <p>Ad A bid the most and didn't show at all, and Ad B took the top spot while paying less than its $2.00 bid. Everyone pays at most their bid, and usually less.</p>
      <h2>Wait, why does position 1 pay less per click?</h2>
      <p>In the example, B holds the top spot for $1.60 a click, while C pays $2.50 for the spot below. That looks backwards, but it isn't.</p>
      <p><b>"The minimum to keep its position" is about each ad's own bid.</b> B asks: what's the lowest bid that still keeps my Ad Rank above C's 0.048? Since bid × 3% × 1.0 must be at least 0.048, the answer is $1.60. It's compared with B's own $2.00 bid, not with what C pays.</p>
      <p><b>The auction is priced in Ad Rank points, not dollars.</b> In points, position 1 <i>does</i> cost more:</p>
      <div class="tbl-wrap"><table>
        <tr><th>Ad</th><th>Has to beat</th><th class="num">Price in Ad Rank points</th><th class="num">Points per $1 of bid (pCTR × quality)</th><th class="num">Price in dollars per click</th></tr>
        <tr><td>B, position 1</td><td>C</td><td class="num"><b>0.048</b></td><td class="num">3% × 1.0 = 0.030</td><td class="num">0.048 ÷ 0.030 = $1.60</td></tr>
        <tr><td>C, position 2</td><td>A</td><td class="num"><b>0.040</b></td><td class="num">2% × 0.8 = 0.016</td><td class="num">0.040 ÷ 0.016 = $2.50</td></tr>
      </table></div>
      <p><b>Converting to dollars divides by how good your ad is.</b> B's ad gets clicked more and has higher quality, so each dollar it bids buys nearly twice as many Ad Rank points as C's. B needs fewer dollars per click to reach a higher price in points.</p>
      <p>Think of two traders paying the same kind of bill in different currencies. The top spot has the bigger bill, but B's currency is stronger, so B hands over fewer dollars. This is how ${T('ad-quality')} pays off: useful ads cost less.</p>
      <div class="widget" data-widget="gspwhy"></div>
      <h2>Who uses it</h2>
      <p>${T('search-ads', 'Google Search ads')} and AdSense search ads. Microsoft Advertising also runs a GSP auction, according to research papers, and Amazon says its Sponsored Products ads use one, although the FTC disputes how Amazon applies it. See the full comparison under ${T('auction-mechanism')}.</p>
      <h2>One catch</h2>
      <p>With more than one slot, bidding your true value is no longer always best, unlike a single-item ${T('vickrey', 'Vickrey auction')}. Sometimes you'd profit more from a cheaper, lower slot.</p>
      <p class="note">This is the textbook formula. Google's live auction has more inputs, so use it as a mental model rather than an exact description of production.</p>` };

/* Check-yourself questions shown at the end of the page */
CHECKS['gsp'] = [{ q: 'Which auction does Google Search use?', opts: ['First-Price', 'Generalized Second-Price (GSP)', 'Neither, ads go to the highest bid'], a: 1,
    why: 'GSP: you pay just enough to clear the threshold and beat the ad below you.' }];
