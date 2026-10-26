/* Topic: expected-value  ·  subject: What advertisers pay  ·  registered in js/config.js */
TERMS['expected-value'] = { name: 'Expected value', needs: ['pctr'],
    short: 'The average result if the same situation repeated many times: each outcome times its probability, added up.',
    body: () => `
      <h2>What it is</h2>
      <p>Expected value is what something is worth <i>on average</i> when the outcome is uncertain:</p>
      <div class="formula">expected value = Σ (probability of outcome × value of outcome)</div>
      <h2>In ads</h2>
      <p>A per-click bid only pays if someone clicks, and you don't know in advance whether they will. So the platform asks: across many showings, what is this ad worth <i>per showing</i>?</p>
      <div class="formula">expected value per impression = ${T('bid')} per click × ${T('pctr')}</div>
      <p>If a click pays $1.50 and the chance of a click is 2%, each showing is worth $1.50 × 0.02 = <b>$0.03</b> on average. Most showings earn nothing and a few earn $1.50, but over many showings it averages 3 cents.</p>
      <h2>Why it matters</h2>
      <ul>
        <li>It's how bids priced in different ways become comparable. ${T('ecpm')} is just expected value per impression × 1000.</li>
        <li>It's how a bidder picks a bid in a ${T('first-price')} auction: maximize expected profit = (value − bid) × chance of winning. See ${T('bid-shading')}.</li>
      </ul>` };
