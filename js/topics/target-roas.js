/* Topic: target-roas  ·  subject: Implementations  ·  registered in js/config.js
   The visual walkthrough for implementations/troas-autobidder (the C++ project). */
TERMS['target-roas'] = { name: 'Target ROAS autobidder', needs: ['target-cpa'],
    short: 'An autobidder that wins as much sales value as possible while keeping return on ad spend at a target, by bidding on each impression\'s predicted order value and learning one multiplier during the day.',
    body: () => `
      <h2>What you're building</h2>
      <p>An online shop tells Google: <b>"Bring in as much sales revenue as possible, with at least $3 of sales for every $1 of ads."</b> The shop sells everything from $10 phone cases to $500 headphones, so some sales are worth fifty times others. Your autobidder has to choose a bid for every one of 100,000 auctions.</p>
      <p class="callout"><b>It's ${T('target-cpa', 'Target CPA')} with one new idea:</b> not every conversion is worth the same. So the bidder predicts how much each one would be worth, and bids on that.</p>
      <ol class="pipe" style="--n:5">
        <li><b>The goal</b><span>max sales, with sales ÷ spend ≥ 3</span></li>
        <li><b>Predict</b><span>pConv and the likely order value</span></li>
        <li><b>Bid</b><span>α × pConv × order value ÷ 3</span></li>
        <li><b>Auction</b><span>second-price: win if your bid is highest</span></li>
        <li><b>Adjust α</b><span>every 1,000 auctions, based on the ROAS so far</span></li>
      </ol>
      <div class="facts">
        <div><span class="v">300%</span><span class="l">target ROAS: $3 of sales per $1</span></div>
        <div><span class="v">$67</span><span class="l">average order, from $5 to $1,000</span></div>
        <div><span class="v">+90%</span><span class="l">sales from using order value, in the C++ simulation</span></div>
        <div><span class="v">3</span><span class="l">functions you write in C++</span></div>
      </div>

      <h2>Step 1: ROAS</h2>
      <p><b>ROAS</b> means return on ad spend: sales ÷ ad spend. A target ROAS of 300% (or 3.0) means every $1 of ads should bring back $3 of sales. It's the shop's version of a target CPA: instead of "at most $20 per conversion", it says "at least $3 back per $1".</p>
      <div class="tbl-wrap"><table>
        <tr><th>Day</th><th class="num">Ad spend</th><th class="num">Sales</th><th class="num">ROAS</th><th>Against a 300% target</th></tr>
        <tr><td>A</td><td class="num">$1,000</td><td class="num">$4,500</td><td class="num">450%</td><td>Beating it: room to bid more</td></tr>
        <tr><td>B</td><td class="num">$1,000</td><td class="num">$3,000</td><td class="num">300%</td><td>On target</td></tr>
        <tr><td>C</td><td class="num">$1,000</td><td class="num">$2,000</td><td class="num">200%</td><td>Falling short: bid less</td></tr>
      </table></div>

      <h2>Step 2: Bid on value, not on conversions</h2>
      <p>Two models run for every impression: <b>pConv</b>, the chance of a purchase, and the <b>order value</b>, how much that purchase would likely be worth. Their product is the sales the impression brings in on average. Dividing by the target turns sales into what the shop will pay for them:</p>
      <div class="formula">bid = α × pConv × order value ÷ target ROAS</div>
      <div class="tbl-wrap"><table>
        <tr><th>Impression</th><th class="num">pConv</th><th class="num">Likely order</th><th class="num">Expected sales</th><th class="num">Bid at α = 1 (÷ 3)</th></tr>
        <tr><td>Phone case shopper</td><td class="num">4%</td><td class="num">$15</td><td class="num">$0.60</td><td class="num">$0.20</td></tr>
        <tr><td>Headphones shopper</td><td class="num">2%</td><td class="num">$300</td><td class="num">$6.00</td><td class="num">$2.00</td></tr>
      </table></div>
      <p>The phone case shopper is twice as likely to buy, yet gets a tenth of the bid, because the sale is worth a twentieth as much. A ${T('target-cpa', 'Target CPA')} bidder would do the opposite: it counts every conversion as equal, so it bids <i>more</i> on the phone case shopper.</p>

      <h2>Step 3: What that difference is worth</h2>
      <div class="widget" data-widget="troasmix"></div>
      <p>What to notice:</p>
      <ul>
        <li><b>Both bidders hit the same ROAS target.</b> The difference is purely in which auctions they win.</li>
        <li><b>The value-blind bidder overpays for small orders</b> and gets outbid on big ones. It wins almost no orders above $200.</li>
        <li><b>Switch to Orders:</b> the counts look similar. Measured by conversions, the two seem about equal. Measured by sales, which is what the shop cares about, they're not. Pick the strategy that counts what you actually care about.</li>
      </ul>

      <h2>Step 4: Find α while the day runs</h2>
      <p>The same thermostat as Target CPA, with one sign flipped. For CPA, low is good. For ROAS, <b>high is good</b>: beating the target means there's room to bid more.</p>
      <div class="formula">error = (ROAS − target) ÷ target&nbsp;&nbsp;&nbsp;&nbsp;then&nbsp;&nbsp;&nbsp;&nbsp;α ← α × e<sup>step × error</sup></div>
      <div class="tbl-wrap"><table>
        <tr><th>ROAS so far</th><th class="num">error</th><th class="num">α is multiplied by (step 0.25)</th><th>Effect</th></tr>
        <tr><td>450%</td><td class="num">+0.50</td><td class="num">× 1.13</td><td>Beating the target: bid 13% more</td></tr>
        <tr><td>300%</td><td class="num">0</td><td class="num">× 1.00</td><td>On target: no change</td></tr>
        <tr><td>150%</td><td class="num">−0.50</td><td class="num">× 0.88</td><td>Falling short: bid 12% less</td></tr>
      </table></div>
      <p><b>Why a smaller step than Target CPA's 0.5?</b> ROAS is lumpier. A single $500 order can swing a window's sales, so a big step overreacts to lucky and unlucky windows. In the C++ simulation, step 0.25 lands at 93% of the best possible sales and 296% ROAS. Step 0.5 gets only 83%.</p>

      <h2>How this maps to your code</h2>
      <p>The C++ project in <a href="https://github.com/giovannivitale4722/ads-knowledge/tree/main/implementations/troas-autobidder" target="_blank" rel="noopener"><code>implementations/troas-autobidder</code></a> simulates this day. Everything is built except the three pieces that <i>are</i> the strategy:</p>
      <div class="tbl-wrap"><table>
        <tr><th>Idea on this page</th><th>Where in the code</th><th>Status</th></tr>
        <tr><td>The 100,000 auctions, with predicted and actual order values</td><td><code>market.hpp</code></td><td><span class="conf">Done</span></td></tr>
        <tr><td><b>Step 2: bid = α × pConv × order value ÷ target</b></td><td><code>TargetRoasBidder::bid()</code></td><td><span class="conf lo">TODO 1: you write it</span></td></tr>
        <tr><td><b>Adding up wins, spend, sales and orders</b></td><td><code>TargetRoasBidder::observe()</code></td><td><span class="conf lo">TODO 2: you write it</span></td></tr>
        <tr><td><b>Step 4: the α controller</b></td><td><code>TargetRoasBidder::end_window()</code></td><td><span class="conf lo">TODO 3: you write it</span></td></tr>
        <tr><td>Running the day, comparing four strategies</td><td><code>simulate.cpp</code>, <code>main.cpp</code></td><td><span class="conf">Done</span></td></tr>
      </table></div>
<pre class="code">cd implementations/troas-autobidder
make test     <span class="c"># checks all three TODOs</span>
make run      <span class="c"># simulates the day and compares four strategies</span></pre>
      <p>When your code is right, <code>make run</code> should look like this:</p>
      <div class="tbl-wrap"><table>
        <tr><th>Strategy</th><th class="num">Orders</th><th class="num">Sales</th><th class="num">ROAS</th></tr>
        <tr><td>Naive (α = 1)</td><td class="num">852</td><td class="num">$59,969</td><td class="num">467%</td></tr>
        <tr><td>Best fixed α (hindsight)</td><td class="num">1,701</td><td class="num">$118,370</td><td class="num">300%</td></tr>
        <tr><td>Value-blind, best α</td><td class="num">1,538</td><td class="num">$62,391</td><td class="num">301%</td></tr>
        <tr><td>Your autobidder</td><td class="num">about 1,580</td><td class="num">about $110,000</td><td class="num">about 296%</td></tr>
      </table></div>
      <p>The C++ day uses different random numbers from the demo above, so its gap is bigger: 90% more sales from using order value, instead of the demo's 54%.</p>

      <h2>What makes it hard in production</h2>
      <ul>
        <li><b>Two models can be wrong.</b> The bid multiplies pConv by the predicted order value. If either is biased, the bid is too. An order value model that's 30% too optimistic quietly pushes ROAS below target until the controller catches up.</li>
        <li><b>Values arrive late and change.</b> Returns and cancellations lower the real sales days after the click.</li>
        <li><b>Lumpy sales.</b> A few huge orders can make one day's ROAS look great or terrible by luck, which is why the step has to be smaller.</li>
        <li><b>Budgets.</b> With a daily budget too, the bid becomes α × pacing × value, as on the ${T('max-conversions', 'budget pacer')} page.</li>
      </ul>
      <p class="sources">Sources: <a href="https://support.google.com/google-ads/answer/6268637" target="_blank" rel="noopener">Google Ads: About Target ROAS bidding</a> · <a href="https://research.google/pubs/autobidding-with-constraints/" target="_blank" rel="noopener">Aggarwal, Badanidiyuru &amp; Mehta: Autobidding with Constraints (WINE 2019)</a></p>` };

/* Check-yourself questions shown at the end of the page */
CHECKS['target-roas'] = [
  { q: 'pConv is 3%, the likely order is $80 and the target ROAS is 400%. What is the bid at α = 1?', opts: ['$0.60', '$2.40', '$9.60'], a: 0,
    why: 'Expected sales = 0.03 × $80 = $2.40. Divided by the target of 4 gives $0.60.' },
  { q: 'The ROAS so far is 240% against a 300% target. What should the controller do?', opts: ['Raise α', 'Lower α', 'Nothing'], a: 1,
    why: 'Below target: error = (2.4 − 3) ÷ 3 = −0.2, so α shrinks. High ROAS is good, low ROAS means bid less.' },
  { q: 'Two bidders hit the same 300% ROAS and win about the same number of orders. Why can one bring in far more sales?', opts: ['It pays less per click', 'It wins the bigger orders by bidding on order value', 'It runs more auctions'], a: 1,
    why: 'Bidding on predicted order value shifts wins toward large orders, so the same number of orders adds up to much more revenue.' }
];
