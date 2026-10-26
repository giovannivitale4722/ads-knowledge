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
      <h2>Who uses it</h2>
      <p>${T('search-ads', 'Google Search ads')} and AdSense search ads. Microsoft Advertising also runs a GSP auction, according to research papers, and Amazon says its Sponsored Products ads use one, although the FTC disputes how Amazon applies it. See the full comparison under ${T('auction-mechanism')}.</p>
      <h2>One catch</h2>
      <p>With more than one slot, bidding your true value is no longer always best, unlike a single-item ${T('vickrey', 'Vickrey auction')}. Sometimes you'd profit more from a cheaper, lower slot.</p>
      <p class="note">This is the textbook formula. Google's live auction has more inputs, so use it as a mental model rather than an exact description of production.</p>` };

/* Check-yourself questions shown at the end of the page */
CHECKS['gsp'] = [{ q: 'Which auction does Google Search use?', opts: ['First-Price', 'Generalized Second-Price (GSP)', 'Neither, ads go to the highest bid'], a: 1,
    why: 'GSP: you pay just enough to clear the threshold and beat the ad below you.' }];
