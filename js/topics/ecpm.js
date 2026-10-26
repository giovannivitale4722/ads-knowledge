/* Topic: ecpm  ·  subject: What advertisers pay  ·  registered in js/config.js */
TERMS['ecpm'] = { name: 'eCPM', needs: ['expected-value', 'cpc', 'cpm'],
    short: 'Expected value per 1,000 impressions. It turns bids priced per click, per impression and so on into one comparable number.',
    body: () => `
      <h2>The problem it solves</h2>
      <p>One advertiser bids per click (${T('cpc')}) and another bids per thousand impressions (${T('cpm')}). "$1.50 per click" and "$25 per thousand showings" aren't in the same unit, so the system can't compare them directly.</p>
      <h2>The formula</h2>
      <div class="formula">eCPM = ${T('bid', 'Bid')}<sub>CPC</sub> × ${T('pctr', 'pCTR')} × 1000</div>
      <ul>
        <li>A per-click bid only pays if clicked, so multiply by the chance of a click (pCTR). That gives ${T('expected-value', 'expected value')} per ${T('impression')}.</li>
        <li>Multiply by 1000 to put it on the same "per thousand" scale as CPM.</li>
      </ul>
      <h2>Example</h2>
      <p>$1.50 per click × 2% pCTR × 1000 = <b>$30 eCPM</b>. That beats a $25 CPM bid, even though "$25" sounds like more money than "$1.50".</p>
      <h2>Try it</h2>
      <div class="widget" data-widget="ecpm"></div>` };

/* Check-yourself questions shown at the end of the page */
CHECKS['ecpm'] = [{ q: 'An ad bids $3.00 per click with a pCTR of 2%. What is its eCPM?', opts: ['$0.06', '$6', '$60', '$600'], a: 2,
    why: '$3.00 × 0.02 × 1000 = $60.' }];
