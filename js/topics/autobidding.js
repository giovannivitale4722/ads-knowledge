/* Topic: autobidding  ·  subject: Autobidding  ·  registered in js/config.js */
TERMS['autobidding'] = { name: 'Autobidding strategies', needs: ['bid', 'expected-value', 'vickrey'],
    short: 'Instead of setting bids, the advertiser picks a goal and limits, and Google bids in every auction for them. The four main strategies are Maximize Clicks, Maximize Conversions, Target CPA and Target ROAS.',
    body: () => `
      <h2>What autobidding is</h2>
      <p>With manual bidding, the advertiser sets a max ${T('cpc', 'CPC')} for each keyword and hopes it's right. With <b>autobidding</b>, they only say what they want and what they're willing to accept. Google's system then sets a different ${T('bid', 'bid')} for every single auction, in milliseconds, using predictions about that exact person and moment.</p>
      <p class="callout"><b>The advertiser chooses a goal and its limits. The system chooses every bid.</b></p>

      <h2>The four strategies</h2>
      <div class="tbl-wrap"><table>
        <tr><th>Strategy</th><th>Goal</th><th>Limits</th><th>What the advertiser is really saying</th></tr>
        <tr><td><b>Maximize Clicks</b></td><td>Clicks</td><td>Budget</td><td>"Spend my daily budget and bring me as many visitors as possible."</td></tr>
        <tr><td><b>Maximize Conversions</b></td><td>Conversions</td><td>Budget</td><td>"Spend my budget and get as many sales or sign-ups as possible."</td></tr>
        <tr><td><b>Target CPA</b></td><td>Conversions</td><td>Cost per conversion, budget</td><td>"Get as many conversions as possible at about $20 each on average."</td></tr>
        <tr><td><b>Target ROAS</b></td><td>Value of conversions</td><td>Cost per unit of value, budget</td><td>"Bring in as much sales revenue as possible, with at least $3 back for every $1 spent."</td></tr>
      </table></div>
      <p>ROAS means return on ad spend: sales value ÷ ad cost. A target ROAS of 300% means $3 of sales for every $1 of ads. That's the same as a cost of at most $0.33 per $1 of value, which is why the limit is called "cost per unit value".</p>
      <p class="note">Naming: Google once folded Target CPA and Target ROAS into "Maximize conversions" and "Maximize conversion value" as optional targets, then brought the old names back. The bidding itself didn't change either time.</p>

      <h2>One recipe behind all four</h2>
      <p>The strategies look different, but they all bid the same way:</p>
      <div class="formula">bid = multiplier × predicted value of this impression</div>
      <p>Only two things change: <b>what counts as value</b>, and <b>what sets the multiplier</b>.</p>
      <div class="tbl-wrap"><table>
        <tr><th>Strategy</th><th>Value of one impression</th><th>What sets the multiplier</th></tr>
        <tr><td>Maximize Clicks</td><td>${T('pctr')}: the chance of a click</td><td>Spending the budget evenly through the day</td></tr>
        <tr><td>Maximize Conversions</td><td>pConv: the chance of a conversion</td><td>Spending the budget evenly through the day</td></tr>
        <tr><td>Target CPA</td><td>pConv × target CPA</td><td>Keeping cost per conversion on target, and staying within budget</td></tr>
        <tr><td>Target ROAS</td><td>pConv × expected order value ÷ target ROAS</td><td>Keeping ROAS on target, and staying within budget</td></tr>
      </table></div>
      <p>Why one multiplier? In a ${T('vickrey', 'second-price auction')}, "get the most of X while respecting a limit" always works out to "bid the value of X times one shared number". The ${T('target-cpa')} page walks through that math, with a version you can play with.</p>

      <h2>Maximize Clicks</h2>
      <div class="formula">bid = m × pCTR</div>
      <p>Every click counts the same, so an impression is worth more only if it's more likely to be clicked. Multiplying pCTR by m works out to <b>the same max price per click everywhere</b>: m is effectively one max CPC, raised or lowered until the budget is spent.</p>
      <p><b>Example:</b> m = $8. An impression with a 4% pCTR gets a bid of $8 × 0.04 = $0.32, which is $8 per expected click.</p>

      <h2>Maximize Conversions</h2>
      <div class="formula">bid = m × pConv</div>
      <p>Same idea, one step further down the funnel. A click that rarely converts is worth little, so bids follow the chance of a conversion instead. m becomes the max price per conversion, set by how fast the budget is being spent.</p>
      <p><b>Example:</b> m = $25. An impression with a 2% pConv gets $25 × 0.02 = $0.50.</p>

      <h2>Target CPA</h2>
      <div class="formula">bid = α × pConv × target CPA</div>
      <p>The value is fixed by the advertiser's target, and α is learned during the day: up when conversions cost less than the target, down when they cost more. The ${T('target-cpa', 'Target CPA autobidder')} page covers this one in depth, with demos and a C++ project.</p>
      <p><b>Example:</b> target $20, α = 1.3, pConv 5%: $20 × 0.05 × 1.3 = $1.30.</p>

      <h2>Target ROAS</h2>
      <div class="formula">bid = α × pConv × expected order value ÷ target ROAS</div>
      <p>Not every conversion is worth the same. A $300 order is worth fifteen times a $20 one. So Target ROAS predicts both <b>whether</b> someone will buy and <b>how much</b>. Dividing by the target ROAS turns sales value into a price the advertiser is willing to pay.</p>
      <p><b>Example:</b> pConv 3%, expected order $80, target ROAS 300%. Expected sales = 0.03 × $80 = $2.40. Divided by 3 gives a $0.80 bid at α = 1. α then rises when ROAS comes in above target and falls when it's below.</p>

      <h2>Budget pacing: the engine behind three of the four</h2>
      <p>Three strategies have a daily budget, and the naive approach goes wrong fast. Bid freely and you might spend everything by 9am, then miss the whole afternoon. <b>Budget pacing</b> spreads spending through the day:</p>
      <ol>
        <li>Draw a <b>plan</b>: how much should be spent by each point in the day.</li>
        <li>Every few minutes, compare what's actually been spent with the plan.</li>
        <li><b>Behind plan:</b> raise the multiplier to win more. <b>Ahead of plan:</b> lower it.</li>
        <li>Never go over the budget.</li>
      </ol>
      <div class="formula">m ← m × e<sup>step × (planned − spent) ÷ planned</sup></div>
      <p>It's the same thermostat as the Target CPA controller, pointed at spending instead of cost per conversion. Real plans aren't straight lines. They follow expected traffic, spending more in busy hours. Coming from trading, it's very close to a <b>VWAP execution algorithm</b>: work a large order through the day in proportion to expected volume, instead of all at once.</p>

      <h2>Two limits at once</h2>
      <p>Target CPA and Target ROAS have two limits: the efficiency target and the budget. They combine two dials:</p>
      <div class="formula">bid = α × pacing × value&nbsp;&nbsp;&nbsp;&nbsp;(pacing is at most 1)</div>
      <ul>
        <li><b>α</b> chases the efficiency target, as on the Target CPA page.</li>
        <li><b>Pacing</b> stays at 1 until the budget is about to run out, then it brakes.</li>
      </ul>
      <p>Whichever limit is tighter wins. With a small budget, the budget binds and the cost per conversion ends up <i>below</i> target, a sign the advertiser could spend more. With a big budget, the target binds and some budget goes unspent, because spending it would break the target.</p>

      <h2>Compare all four</h2>
      <p>All four strategies on the same simulated day. Drag the budget and watch which limit holds each one back.</p>
      <div class="widget" data-widget="abcompare"></div>
      <p>What to notice:</p>
      <ul>
        <li><b>Each strategy wins at its own goal.</b> Maximize Clicks gets the most clicks, Maximize Conversions the most conversions, and Target ROAS the most efficient sales, at least while the budget is tight.</li>
        <li><b>With a small budget, all four are held back by the budget</b> and spend nearly all of it.</li>
        <li><b>With a large budget, the target strategies stop early.</b> Target CPA won't spend past the point where conversions would cost more than $20. Maximize Conversions spends everything, and its cost per conversion climbs.</li>
        <li><b>The spending chart tracks the dashed plan line.</b> That's budget pacing at work.</li>
      </ul>

      <h2>Which one should an advertiser choose?</h2>
      <div class="tbl-wrap"><table>
        <tr><th>If the advertiser…</th><th>A good fit</th></tr>
        <tr><td>Wants traffic, or doesn't track conversions yet</td><td>Maximize Clicks</td></tr>
        <tr><td>Tracks conversions and wants as many as the budget allows</td><td>Maximize Conversions</td></tr>
        <tr><td>Knows what one customer is worth</td><td>Target CPA</td></tr>
        <tr><td>Sells things at different prices, like an online shop</td><td>Target ROAS</td></tr>
      </table></div>
      <p>The automated strategies need data to predict well, so a brand-new campaign often starts on a simpler strategy and moves to a target once enough conversions have come in.</p>

      <h2>Build it</h2>
      <p>The ${T('target-cpa', 'Target CPA autobidder')} is a hands-on C++ project in the Implementations section. The other three strategies are small changes to it: swap the value, and swap or add the controller.</p>
      <p class="sources">Sources: <a href="https://support.google.com/google-ads/answer/6336101" target="_blank" rel="noopener">Google Ads: Maximize clicks</a> · <a href="https://support.google.com/google-ads/answer/10353027" target="_blank" rel="noopener">Google Ads: Maximize conversions and conversion value with targets</a> · <a href="https://searchengineland.com/google-ads-brings-back-target-cpa-and-target-roas-naming-480690/" target="_blank" rel="noopener">Search Engine Land: Target CPA and Target ROAS names return</a> · <a href="https://research.google/pubs/autobidding-with-constraints/" target="_blank" rel="noopener">Autobidding with Constraints (WINE 2019)</a> · <a href="https://arxiv.org/abs/2408.07685" target="_blank" rel="noopener">Auto-bidding survey (2024)</a></p>` };

/* Check-yourself questions shown at the end of the page */
CHECKS['autobidding'] = [
  { q: 'An online shop sells $15 phone cases and $900 laptops. Which strategy fits best?', opts: ['Maximize Clicks', 'Target CPA', 'Target ROAS'], a: 2,
    why: 'Conversions are worth very different amounts, so the strategy should value each one by its expected order value. That is Target ROAS.' },
  { q: 'Target ROAS is 400%, pConv is 2% and the expected order is $100. What is the bid at α = 1?', opts: ['$0.50', '$2.00', '$8.00'], a: 0,
    why: 'Expected sales = 0.02 × $100 = $2. Divided by the 4× target = $0.50.' },
  { q: 'Halfway through the day, a Maximize Conversions campaign has spent 30% of its budget. What does pacing do?', opts: ['Raises the multiplier', 'Lowers the multiplier', 'Stops bidding'], a: 0,
    why: 'It is behind the plan (about 50% by midday), so it bids more to catch up.' },
  { q: 'A Target CPA campaign with a small budget ends the day at $14 per conversion against a $20 target. What is holding it back?', opts: ['The CPA target', 'The budget', 'Nothing'], a: 1,
    why: 'Cost per conversion is under target, so the target is not binding. The budget ran out first, so more budget would bring more conversions.' }
];
