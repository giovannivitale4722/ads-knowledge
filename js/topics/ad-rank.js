/* Topic: ad-rank  ·  subject: How ads are ranked  ·  registered in js/config.js */
TERMS['ad-rank'] = { name: 'Ad Rank', needs: ['bid', 'pctr', 'ad-quality'],
    short: 'The score Google uses to order ads. It combines bid, predicted click rate and ad quality, so the highest bid doesn\'t automatically win.',
    body: () => `
      <h2>The formula</h2>
      <div class="formula">Ad Rank = ${T('bid', 'Bid')} × ${T('pctr', 'pCTR')} × ${T('ad-quality', 'Ad Quality')}</div>
      <h2>What it decides</h2>
      <ul>
        <li><b>Order:</b> the highest Ad Rank gets the top position, the next gets the second, and so on.</li>
        <li><b>Whether the ad shows at all:</b> an ad needs a high enough Ad Rank to be eligible.</li>
        <li><b>Price:</b> in a ${T('gsp', 'GSP')} auction, what you pay is set by the Ad Rank of the ad below you.</li>
      </ul>
      <h2>Why not just rank by bid?</h2>
      <p>A high bid on an ad nobody clicks wastes the spot. With ${T('cpc')} pricing, an unclicked ad earns nothing. Multiplying by pCTR turns the bid into what the spot is actually expected to earn, close to its ${T('expected-value', 'expected value')}. Multiplying by Ad Quality rewards ads that are relevant to the person.</p>
      <p>Because it's a product, a weak factor can be made up by a strong one. A lower bid with a high pCTR can beat a higher bid with a low pCTR.</p>
      <h2>Try it</h2>
      <div class="widget" data-widget="adrank"></div>` };

/* Check-yourself questions shown at the end of the page */
CHECKS['ad-rank'] = [{ q: 'True or false: the highest dollar bid always wins.', opts: ['True', 'False'], a: 1,
    why: 'Ads are ranked by Ad Rank = Bid × pCTR × Ad Quality, so a lower bid with a better pCTR or quality can win.' }];
