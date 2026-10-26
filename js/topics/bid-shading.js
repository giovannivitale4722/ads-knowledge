/* Topic: bid-shading  ·  subject: How auctions work  ·  registered in js/config.js */
TERMS['bid-shading'] = { name: 'Bid shading', needs: ['first-price', 'expected-value'],
    short: 'Bidding less than an impression is worth to you, so winning still leaves a profit. It\'s needed in first-price auctions.',
    body: () => `
      <h2>Why it exists</h2>
      <p>In a ${T('first-price', 'first-price auction')} you pay your own bid. If you bid your full value, winning earns you nothing. "Overpaying" means paying more than you needed to win.</p>
      <h2>The trade-off</h2>
      <ul>
        <li><b>Shade a lot:</b> big profit when you win, but you rarely win.</li>
        <li><b>Shade a little:</b> you win often, but each win earns little.</li>
      </ul>
      <p>The best bid maximizes ${T('expected-value', 'expected')} profit:</p>
      <div class="formula">expected profit = (value − bid) × chance of winning at that bid</div>
      <h2>Where the "chance of winning" comes from</h2>
      <p>You can't see other bids in advance. Bidders estimate it from past auctions: how often did bids at each level win? The better that estimate, the closer you can bid to the lowest price that still wins.</p>
      <h2>Try it</h2>
      <div class="widget" data-widget="shading"></div>` };

/* Check-yourself questions shown at the end of the page */
CHECKS['bid-shading'] = [{ q: 'Why does a First-Price auction require bid shading?', opts: ['You pay what you bid, so bidding your full value leaves no profit', 'Google caps first-price bids', 'pCTR is lower in first-price auctions'], a: 0,
    why: 'You pay your own bid, so you bid below your value to avoid overpaying.' }];
