/* Topic: max-conversions  ·  subject: Implementations  ·  registered in js/config.js
   The visual walkthrough for implementations/budget-pacer (the C++ project). */
TERMS['max-conversions'] = { name: 'Maximize Conversions budget pacer', needs: ['autobidding', 'target-cpa'],
    short: 'An autobidder that wins as many conversions as possible within a daily budget, by following a spending plan shaped like the day\'s traffic and adjusting one bid multiplier to stay on it.',
    body: () => `
      <h2>What you're building</h2>
      <p>An advertiser tells Google: <b>"Get me as many sales as possible today, and don't spend more than $6,000."</b> There's no target cost per sale this time, only the budget. Your autobidder has to spread that money over 100,000 auctions arriving through a 24-hour day.</p>
      <p class="callout"><b>The hard part isn't how much to bid. It's when to spend.</b> Spend too fast and the money is gone by mid-morning. Spend too slowly and it's still there at midnight, which means sales you could have had.</p>
      <ol class="pipe" style="--n:5">
        <li><b>The goal</b><span>max conversions, spend ≤ $6,000</span></li>
        <li><b>Plan</b><span>how much to have spent by each time of day</span></li>
        <li><b>Bid</b><span>m × pConv, never more than what's left</span></li>
        <li><b>Auction</b><span>second-price: win if your bid is highest</span></li>
        <li><b>Adjust m</b><span>every 15 minutes, based on spend versus plan</span></li>
      </ol>
      <div class="facts">
        <div><span class="v">$6,000</span><span class="l">daily budget (B)</span></div>
        <div><span class="v">96</span><span class="l">15-minute windows in the day</span></div>
        <div><span class="v">1</span><span class="l">number to learn: the multiplier m</span></div>
        <div><span class="v">3</span><span class="l">functions you write in C++</span></div>
      </div>

      <h2>Step 1: One dial again</h2>
      <p>Each impression gets a predicted <b>pConv</b>, the chance it leads to a conversion, as on the ${T('target-cpa', 'Target CPA')} page. The bid is that chance times one shared multiplier, <b>m</b>:</p>
      <div class="formula">bid = m × pConv</div>
      <p>Read m as <b>the most you'll pay for one conversion</b>. If m is $20, an impression with a 5% chance of converting is worth 5% × $20 = $1.</p>
      <div class="tbl-wrap"><table>
        <tr><th>Impression</th><th class="num">pConv</th><th class="num">Bid at m = $10</th><th class="num">Bid at m = $20</th><th class="num">Bid at m = $40</th></tr>
        <tr><td>A</td><td class="num">5%</td><td class="num">$0.50</td><td class="num">$1.00</td><td class="num">$2.00</td></tr>
        <tr><td>B</td><td class="num">2%</td><td class="num">$0.20</td><td class="num">$0.40</td><td class="num">$0.80</td></tr>
        <tr><td>C</td><td class="num">10%</td><td class="num">$1.00</td><td class="num">$2.00</td><td class="num">$4.00</td></tr>
      </table></div>
      <p><b>Why is one dial enough again?</b> Put a price λ on every dollar of budget. An impression is then worth winning exactly when its cost is below pConv ÷ λ. In a ${T('vickrey', 'second-price auction')}, bidding pConv ÷ λ does exactly that. So m = 1 ÷ λ, the same for every impression. The whole problem is finding one number, just like α for Target CPA.</p>

      <h2>Step 2: Turn the dial</h2>
      <p>The full simulated day: 100,000 auctions, the same rules as your C++ project. Hold m fixed and watch the budget.</p>
      <div class="widget" data-widget="pacedial"></div>
      <p>What to notice:</p>
      <ul>
        <li><b>A high m runs out early.</b> At $40 the money is gone by about 8:45am. Every auction after that is lost, including cheap ones that would have converted.</li>
        <li><b>A low m leaves money on the table.</b> Spending stops being the limit, and unspent budget is conversions you didn't buy.</li>
        <li><b>The best fixed m makes the budget last exactly until midnight.</b> That's around $15.50 here. But you only know it after the day is over.</li>
      </ul>

      <h2>Step 3: Make a plan</h2>
      <p>To learn m during the day, the bidder needs to know whether it's spending too fast or too slow. That needs a <b>plan</b>: how much should be spent by the end of each 15-minute window.</p>
      <p>The obvious plan is a straight line: $62.50 every window. But auctions don't arrive evenly. At 3am there are about an eighth as many as at noon. A better plan follows the expected traffic:</p>
      <div class="formula">plan[w] = B × (traffic[0] + … + traffic[w]) ÷ total traffic</div>
      <div class="tbl-wrap"><table>
        <tr><th>Spent by</th><th class="num">Even plan</th><th class="num">Traffic-shaped plan</th></tr>
        <tr><td>06:00</td><td class="num">$1,500</td><td class="num">$378</td></tr>
        <tr><td>09:00</td><td class="num">$2,250</td><td class="num">$1,083</td></tr>
        <tr><td>12:00</td><td class="num">$3,000</td><td class="num">$2,178</td></tr>
        <tr><td>18:00</td><td class="num">$4,500</td><td class="num">$4,245</td></tr>
        <tr><td>midnight</td><td class="num">$6,000</td><td class="num">$6,000</td></tr>
      </table></div>
      <p>The even plan wants a quarter of the budget gone by 6am, when only 6% of the day's auctions have happened. The traffic-shaped plan asks for 6%. Real systems build the traffic curve from previous days. In this project the forecast is exact.</p>

      <h2>Step 4: Follow the plan</h2>
      <p>After every window, the controller compares spending with the plan and nudges m. It's the Target CPA thermostat again, pointed at spending instead of cost per conversion:</p>
      <div class="formula">error = (planned − spent) ÷ planned&nbsp;&nbsp;&nbsp;&nbsp;then&nbsp;&nbsp;&nbsp;&nbsp;m ← m × e<sup>step × error</sup></div>
      <div class="tbl-wrap"><table>
        <tr><th>Situation</th><th class="num">error</th><th class="num">m is multiplied by (step 0.5)</th><th>Effect</th></tr>
        <tr><td>Planned $1,000, spent $500</td><td class="num">+0.50</td><td class="num">× 1.28</td><td>Behind plan: bid 28% more</td></tr>
        <tr><td>Planned $1,000, spent $1,000</td><td class="num">0</td><td class="num">× 1.00</td><td>On plan: no change</td></tr>
        <tr><td>Planned $1,000, spent $1,500</td><td class="num">−0.50</td><td class="num">× 0.78</td><td>Ahead of plan: bid 22% less</td></tr>
      </table></div>
      <p>One more rule keeps the budget safe: <b>never bid more than what's left</b>. In a second-price auction you never pay more than your bid, so this alone makes overspending impossible.</p>

      <h2>Step 5: Watch it pace</h2>
      <p>The same day again, with m starting at $20 and the controller adjusting it. Switch between the two plans.</p>
      <div class="widget" data-widget="pacelearn"></div>

      <h2>Why the even plan does worse</h2>
      <div class="split">
        <div><h3>It overpays at night</h3><p>The plan wants $62.50 every 15 minutes, but at 3am there are only a few dozen auctions. To keep up, the controller pushes m to around $40 and pays far too much for those few conversions.</p></div>
        <div><h3>Then it starves the day</h3><p>When morning traffic arrives, m is still high, so spending races ahead of plan. The controller slashes m to about $5 and bids too cautiously through the busiest, most valuable hours.</p></div>
      </div>
      <p>The controller is the same in both runs. Only the plan differs. <b>Getting the plan right beats tuning the controller.</b></p>

      <h2>How this maps to your code</h2>
      <p>The C++ project in <a href="https://github.com/giovannivitale4722/ads-knowledge/tree/main/implementations/budget-pacer" target="_blank" rel="noopener"><code>implementations/budget-pacer</code></a> simulates exactly this day. Everything is built except the three pieces that <i>are</i> the strategy:</p>
      <div class="tbl-wrap"><table>
        <tr><th>Idea on this page</th><th>Where in the code</th><th>Status</th></tr>
        <tr><td>The 100,000 auctions and the traffic curve</td><td><code>market.hpp</code></td><td><span class="conf">Done</span></td></tr>
        <tr><td>Second-price auction</td><td><code>auction.hpp</code></td><td><span class="conf">Done</span></td></tr>
        <tr><td><b>Step 3: the spending plan</b></td><td><code>make_plan()</code></td><td><span class="conf lo">TODO 1: you write it</span></td></tr>
        <tr><td><b>Steps 1 and 4: bid = m × pConv, capped at what's left</b></td><td><code>BudgetPacer::bid()</code></td><td><span class="conf lo">TODO 2: you write it</span></td></tr>
        <tr><td>Recording wins, spend and conversions</td><td><code>BudgetPacer::observe()</code></td><td><span class="conf">Done</span></td></tr>
        <tr><td><b>Step 4: the pacing controller</b></td><td><code>BudgetPacer::end_window()</code></td><td><span class="conf lo">TODO 3: you write it</span></td></tr>
        <tr><td>Running the day, calling your code</td><td><code>simulate.cpp</code></td><td><span class="conf">Done</span></td></tr>
        <tr><td>Steps 2 and 5: comparing strategies</td><td><code>main.cpp</code></td><td><span class="conf">Done</span></td></tr>
      </table></div>
      <p>All three TODOs are in <code>src/budget_pacer.cpp</code>, the only file you edit. TODO 1 is new C++ practice: building a <code>std::vector</code> with a loop and a running sum. TODO 2 uses <code>std::min</code>. TODO 3 is the Target CPA controller with spend in place of CPA, plus moving <code>window_</code> on to the next window.</p>
<pre class="code">cd implementations/budget-pacer
make test     <span class="c"># checks all three TODOs, including the edge cases</span>
make run      <span class="c"># simulates the day and compares four strategies</span></pre>
      <p>When your code is right, <code>make run</code> should look like this:</p>
      <div class="tbl-wrap"><table>
        <tr><th>Strategy</th><th class="num">Conversions</th><th class="num">Spend</th><th>Budget gone at</th></tr>
        <tr><td>No pacing (m = $40)</td><td class="num">288</td><td class="num">$6,000</td><td>08:45</td></tr>
        <tr><td>Best fixed m (hindsight)</td><td class="num">531</td><td class="num">$6,000</td><td>23:00</td></tr>
        <tr><td>Your pacer, even plan</td><td class="num">401</td><td class="num">$5,634</td><td>never</td></tr>
        <tr><td>Your pacer, traffic plan</td><td class="num">497</td><td class="num">$6,000</td><td>23:30</td></tr>
      </table></div>

      <h2>Optimizations to try next</h2>
      <p>Once the basic pacer works, each of these is a real improvement production systems use. Each one is a change you can make in the C++ project and measure with <code>make run</code>.</p>
      <ul>
        <li><b>A wrong forecast.</b> Make real traffic differ from <code>expected_traffic()</code>, such as a quiet afternoon or a sudden spike. The pacer should cope, but how well depends on the step size.</li>
        <li><b>Data-scaled steps.</b> As on the Target CPA page: move m less when there's little evidence, early in the day or in quiet hours.</li>
        <li><b>Throttling instead of bid scaling.</b> Keep the bid at full value and randomly skip a share of auctions instead. It's simpler and keeps bids honest, but it skips good and bad auctions alike.</li>
        <li><b>Pacing on value, not spend.</b> Spending evenly isn't the real goal: conversions are. Adaptive pacing (Balseiro and Gur, 2019) updates the price of budget, λ, directly from each auction's spend, and comes with proven guarantees.</li>
        <li><b>Combine with a target.</b> Target CPA with a budget uses two dials, α × pacing × pConv × T, with pacing at most 1. Whichever limit is tighter wins.</li>
      </ul>

      <details class="source math">
        <summary>The math behind "one dial is enough", for the curious</summary>
        <p>Choose which impressions to win to maximize conversions, subject to total cost ≤ B. Attach a penalty λ ≥ 0 to the budget (a Lagrange multiplier) and the goal becomes:</p>
        <div class="formula">maximize Σ<sub>won</sub> [ pConv<sub>i</sub> − λ × cost<sub>i</sub> ]</div>
        <p>Each impression now stands alone: it's worth winning exactly when cost<sub>i</sub> ≤ pConv<sub>i</sub> ÷ λ. In a second-price auction, bidding b means "win whenever the price is below b". So bid exactly that threshold:</p>
        <div class="formula">bid<sub>i</sub> = pConv<sub>i</sub> ÷ λ&nbsp;&nbsp;&nbsp;so&nbsp;&nbsp;&nbsp;m = 1 ÷ λ</div>
        <p>λ is how much one more dollar of budget is worth, in conversions. A tight budget makes λ big and m small. The pacing controller is a way of learning λ during the day: spending behind plan means budget is less scarce than assumed, so λ falls and m rises.</p>
      </details>
      <p class="sources">Sources: <a href="https://support.google.com/google-ads/answer/7381968" target="_blank" rel="noopener">Google Ads: About Maximize conversions bidding</a> · <a href="https://research.google/pubs/autobidding-with-constraints/" target="_blank" rel="noopener">Aggarwal, Badanidiyuru &amp; Mehta: Autobidding with Constraints (WINE 2019)</a> · <a href="https://doi.org/10.1287/mnsc.2018.3174" target="_blank" rel="noopener">Balseiro &amp; Gur: Learning in Repeated Auctions with Budgets (Management Science, 2019)</a> · <a href="https://arxiv.org/abs/2408.07685" target="_blank" rel="noopener">Auto-bidding and Auctions in Online Advertising: A Survey (2024)</a></p>` };

/* Check-yourself questions shown at the end of the page */
CHECKS['max-conversions'] = [
  { q: 'm is $25 and pConv is 4%. $0.60 of budget is left. What do you bid?', opts: ['$0.60', '$1.00', '$25'], a: 0,
    why: 'm × pConv = $1.00, but the bid is capped at what is left, $0.60. You never pay more than your bid, so you cannot overspend.' },
  { q: 'At noon the plan says $2,178 should be spent. You have spent $1,600. What does the controller do?', opts: ['Lower m', 'Raise m', 'Nothing'], a: 1,
    why: 'You are behind plan: error = (2178 − 1600) ÷ 2178 ≈ +0.27, so m is multiplied by e^(0.5 × 0.27) ≈ 1.14.' },
  { q: 'Why does a straight-line plan hurt the pacer?', opts: ['It spends too little overall', 'It asks for as much spend at 3am as at noon, so m is pushed up at night and cut during the day', 'It ignores pConv'], a: 1,
    why: 'Traffic is thin at night. To keep up with an even plan, the pacer overpays for night auctions, then overcorrects when the busy hours arrive.' }
];
