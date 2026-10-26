/* Topic: target-cpa  ·  subject: Implementations  ·  registered in js/config.js
   The visual walkthrough for implementations/tcpa-autobidder (the C++ project). */
TERMS['target-cpa'] = { name: 'Target CPA autobidder', needs: ['autobidding'],
    short: 'An autobidder that wins as many conversions as possible while keeping the average cost per conversion at a target, using one bid multiplier it learns during the day.',
    body: () => `
      <h2>What you're building</h2>
      <p>An advertiser tells Google: <b>"Get me as many sales as possible, at about $20 each on average."</b> They never set a bid. Your autobidder has to choose a bid for every one of 100,000 auctions in a day to make that happen.</p>
      <p class="callout"><b>The whole strategy is one formula and one feedback loop.</b> Bid each impression's value times a dial called α, and adjust α as the day goes on.</p>
      <ol class="pipe" style="--n:5">
        <li><b>The goal</b><span>max conversions, average cost ≤ $20</span></li>
        <li><b>Predict</b><span>pConv: chance this impression becomes a sale</span></li>
        <li><b>Bid</b><span>α × pConv × $20</span></li>
        <li><b>Auction</b><span>second-price: win if your bid is highest</span></li>
        <li><b>Adjust α</b><span>every 1,000 auctions, based on the cost so far</span></li>
      </ol>
      <div class="facts">
        <div><span class="v">$20</span><span class="l">target cost per conversion (T)</span></div>
        <div><span class="v">100,000</span><span class="l">auctions in the simulated day</span></div>
        <div><span class="v">1</span><span class="l">number to learn: the multiplier α</span></div>
        <div><span class="v">2</span><span class="l">functions you write in C++</span></div>
      </div>

      <h2>Step 1: What is one impression worth?</h2>
      <p>For each auction, a model predicts <b>pConv</b>: the chance that showing the ad leads to a conversion (a sale or a sign-up). If a conversion is worth $20 to the advertiser, the impression is worth on average:</p>
      <div class="formula">value = pConv × T</div>
      <div class="tbl-wrap"><table>
        <tr><th>Impression</th><th class="num">pConv</th><th class="num">Value (pConv × $20)</th><th>In words</th></tr>
        <tr><td>A</td><td class="num">5%</td><td class="num">$1.00</td><td>1 in 20 converts, so it's worth $1</td></tr>
        <tr><td>B</td><td class="num">2%</td><td class="num">$0.40</td><td>Less likely to convert, worth less</td></tr>
        <tr><td>C</td><td class="num">10%</td><td class="num">$2.00</td><td>A great impression, worth more</td></tr>
      </table></div>
      <p>This is the ${T('expected-value', 'expected value')} idea again: a chance times a payoff.</p>

      <h2>Step 2: One dial for every bid</h2>
      <p>The bid is the value times one shared multiplier, <b>α</b> (alpha):</p>
      <div class="formula">bid = α × pConv × T</div>
      <div class="tbl-wrap"><table>
        <tr><th>Impression</th><th class="num">Value</th><th class="num">Bid at α = 1.0</th><th class="num">Bid at α = 1.3</th><th class="num">Bid at α = 0.8</th></tr>
        <tr><td>A</td><td class="num">$1.00</td><td class="num">$1.00</td><td class="num">$1.30</td><td class="num">$0.80</td></tr>
        <tr><td>B</td><td class="num">$0.40</td><td class="num">$0.40</td><td class="num">$0.52</td><td class="num">$0.32</td></tr>
        <tr><td>C</td><td class="num">$2.00</td><td class="num">$2.00</td><td class="num">$2.60</td><td class="num">$1.60</td></tr>
      </table></div>
      <p>Turning α up raises <b>every</b> bid by the same percentage, so the bids stay in proportion to how valuable each impression is. Good impressions always get bigger bids. α only sets the overall level: how aggressive the bidder is.</p>
      <p><b>Why is one dial enough?</b> You might expect each impression to need its own clever adjustment. It doesn't. In a ${T('vickrey', 'second-price auction')}, the best possible policy for "maximize conversions with average cost ≤ T" is exactly this: every value times the same α. That's a published result from Google researchers (Aggarwal, Badanidiyuru and Mehta, 2019). So the whole problem shrinks to finding <b>one number</b>.</p>

      <h2>Step 3: Turn the dial</h2>
      <p>Here's the full simulated day: 100,000 auctions, the same rules as your C++ project. Hold α fixed and see what happens.</p>
      <div class="widget" data-widget="tcpadial"></div>
      <p>What to notice:</p>
      <ul>
        <li><b>At α = 1, the cost per conversion lands around $14.50, well under the $20 target.</b> The advertiser said they'd pay up to $20 on average, and the bidder is leaving that room unused. It wins only about half the conversions it could.</li>
        <li><b>Raising α wins more conversions, but each one costs more.</b> You're now winning pricier auctions too.</li>
        <li><b>The best α is where the cost reaches $20 exactly,</b> about 1.65 here. Past that, you break the advertiser's target.</li>
      </ul>

      <h2>Why the best α is above 1</h2>
      <div class="split">
        <div><h3>The target is an average</h3><p>The advertiser cares about the <b>average</b> cost, not each sale. Cheap conversions bank room that can pay for some expensive ones. Bidding exactly each impression's value never uses that room.</p></div>
        <div><h3>You pay less than you bid</h3><p>In a second-price auction you pay the competitor's bid, not yours. So your actual costs come in below your bids, and you can bid above value while the average still lands on target.</p></div>
      </div>

      <h2>Step 4: Find α while the day runs</h2>
      <p>The dial demo cheated: it tried every α after seeing the whole day. In real life nobody knows the best α in advance, because it depends on the competition. So the bidder <b>learns</b> it as it goes, like a thermostat:</p>
      <div class="split three">
        <div><h3>Cheaper than target</h3><p>CPA so far is $15. There's room to spare, so turn α up and win more.</p></div>
        <div><h3>On target</h3><p>CPA so far is $20. Leave α alone.</p></div>
        <div><h3>Too expensive</h3><p>CPA so far is $26. Turn α down and pull back.</p></div>
      </div>
      <p>After every window of 1,000 auctions, the controller measures how far off it is and nudges α:</p>
      <div class="formula">error = (T − CPA) ÷ T&nbsp;&nbsp;&nbsp;&nbsp;then&nbsp;&nbsp;&nbsp;&nbsp;α ← α × e<sup>step × error</sup></div>
      <div class="tbl-wrap"><table>
        <tr><th>CPA so far</th><th class="num">error</th><th class="num">α is multiplied by (step 0.5)</th><th>Effect</th></tr>
        <tr><td>$10</td><td class="num">+0.50</td><td class="num">× 1.28</td><td>Bid 28% more</td></tr>
        <tr><td>$20</td><td class="num">0</td><td class="num">× 1.00</td><td>No change</td></tr>
        <tr><td>$40</td><td class="num">−1.00</td><td class="num">× 0.61</td><td>Bid 39% less</td></tr>
      </table></div>
      <ul>
        <li><b>Why multiply instead of add?</b> α stays positive, and the same error moves it by the same percentage whether α is 0.5 or 5.</li>
        <li><b>Why the CPA so far, not just the last window?</b> One window might hold only a handful of conversions, so its CPA is mostly luck. The running total is steadier, and it's what the advertiser is judged on.</li>
        <li><b>What if there are no conversions yet?</b> The CPA isn't defined, so leave α alone.</li>
        <li><b>Why the step size matters:</b> too small and α learns slowly. Too big and it overreacts, overshooting back and forth.</li>
      </ul>

      <h2>Step 5: Watch it learn</h2>
      <p>The same day again, but now α starts at 1 and the controller has to find it on its own. Try different step sizes.</p>
      <div class="widget" data-widget="tcpalearn"></div>
      <p>With a moderate step, α climbs from 1 toward the hindsight-best value and the running CPA settles near $20. With a big step it overshoots. Then the running cost, which remembers every expensive window, keeps pushing α down long after it should stop. That's why real systems tune the step size carefully and smooth their signals.</p>

      <h2>How this maps to your code</h2>
      <p>The C++ project in <a href="https://github.com/giovannivitale4722/ads-knowledge/tree/main/implementations/tcpa-autobidder" target="_blank" rel="noopener"><code>implementations/tcpa-autobidder</code></a> simulates exactly this day. Everything is built except the two pieces that <i>are</i> the strategy:</p>
      <div class="tbl-wrap"><table>
        <tr><th>Idea on this page</th><th>Where in the code</th><th>Status</th></tr>
        <tr><td>The 100,000 auctions</td><td><code>market.hpp</code></td><td><span class="conf">Done</span></td></tr>
        <tr><td>Second-price auction</td><td><code>auction.hpp</code></td><td><span class="conf">Done</span></td></tr>
        <tr><td><b>Step 2: bid = α × pConv × T</b></td><td><code>TargetCpaBidder::bid()</code></td><td><span class="conf lo">TODO 1: you write it</span></td></tr>
        <tr><td>Recording wins, spend and conversions</td><td><code>TargetCpaBidder::observe()</code></td><td><span class="conf">Done</span></td></tr>
        <tr><td><b>Step 4: the α controller</b></td><td><code>TargetCpaBidder::end_window()</code></td><td><span class="conf lo">TODO 2: you write it</span></td></tr>
        <tr><td>Running the day, calling your code</td><td><code>simulate.cpp</code></td><td><span class="conf">Done</span></td></tr>
        <tr><td>Steps 3 and 5: comparing strategies</td><td><code>main.cpp</code></td><td><span class="conf">Done</span></td></tr>
      </table></div>
      <p>Both TODOs are in <code>src/tcpa_bidder.cpp</code>, the only file you edit. TODO 2 follows Step 4 exactly: skip if there are no conversions, compute the error from the cumulative CPA (the <code>cpa()</code> function gives it), multiply α by <code>exp(step_ * error)</code>, then clamp α between <code>min_alpha_</code> and <code>max_alpha_</code>.</p>
<pre class="code">cd implementations/tcpa-autobidder
make test     <span class="c"># checks both TODOs, including the edge cases</span>
make run      <span class="c"># simulates the day and compares three strategies</span></pre>
      <p>When your code is right, <code>make run</code> should look roughly like this (step 0.5):</p>
      <div class="tbl-wrap"><table>
        <tr><th>Strategy</th><th class="num">Conversions</th><th class="num">CPA</th><th class="num">α</th></tr>
        <tr><td>Naive (α = 1)</td><td class="num">812</td><td class="num">$14.25</td><td class="num">1.00</td></tr>
        <tr><td>Best fixed α (hindsight)</td><td class="num">1,534</td><td class="num">$19.99</td><td class="num">1.71</td></tr>
        <tr><td>Your autobidder</td><td class="num">close to 1,534</td><td class="num">close to $20</td><td class="num">learned</td></tr>
      </table></div>

      <h2>What makes it hard in production</h2>
      <ul>
        <li><b>Conversion delay.</b> Sales arrive hours or days after the click, so the recent CPA looks worse than it really is. A naive controller would cut bids for no reason. Real systems estimate the conversions still on their way.</li>
        <li><b>Prediction errors.</b> The bid is directly proportional to pConv. A model that's twice too optimistic bids twice too much. Calibration matters as much as on the ${T('pctr')} page.</li>
        <li><b>Budgets.</b> Most advertisers also have a daily budget. A second multiplier slows bidding when spending runs ahead of plan. That's budget pacing.</li>
        <li><b>First-price auctions.</b> The one-multiplier result needs a truthful, second-price-style auction. On exchanges like ${T('adx', 'AdX')}, which are first-price, you add ${T('bid-shading')} on top.</li>
        <li><b>Everyone is autobidding.</b> Your competitors are multipliers chasing their own targets too, so the market becomes a game between bidding agents.</li>
      </ul>

      <details class="source math">
        <summary>The math behind "one dial is enough", for the curious</summary>
        <p>Choose which impressions to win to maximize conversions, subject to total cost ≤ T × total conversions. Attach a penalty μ ≥ 0 to the constraint (a Lagrange multiplier) and the goal becomes:</p>
        <div class="formula">maximize Σ<sub>won</sub> [ pConv<sub>i</sub> × (1 + μT) − μ × cost<sub>i</sub> ]</div>
        <p>Each impression now stands alone: it's worth winning exactly when cost<sub>i</sub> ≤ pConv<sub>i</sub> × (T + 1/μ). In a second-price auction, bidding b means "win whenever the price is below b". So bid exactly that threshold:</p>
        <div class="formula">bid<sub>i</sub> = pConv<sub>i</sub> × T × (1 + 1/(μT))&nbsp;&nbsp;&nbsp;so&nbsp;&nbsp;&nbsp;α = 1 + 1/(μT)</div>
        <p>Every impression shares the same μ, so every bid shares the same α. And since μ is positive, α comes out above 1. Learning α during the day is the same as learning μ, and the multiplicative update in Step 4 is a form of gradient descent on it.</p>
      </details>
      <p class="sources">Sources: <a href="https://research.google/pubs/autobidding-with-constraints/" target="_blank" rel="noopener">Aggarwal, Badanidiyuru &amp; Mehta: Autobidding with Constraints (WINE 2019)</a> · <a href="https://arxiv.org/abs/2408.07685" target="_blank" rel="noopener">Auto-bidding and Auctions in Online Advertising: A Survey (2024)</a></p>` };

/* Check-yourself questions shown at the end of the page */
CHECKS['target-cpa'] = [
  { q: 'pConv is 4% and the target CPA is $20. With α = 1.5, what do you bid?', opts: ['$0.80', '$1.20', '$30'], a: 1,
    why: 'Value = 4% × $20 = $0.80. Bid = 1.5 × $0.80 = $1.20.' },
  { q: 'Halfway through the day the CPA so far is $12 against a $20 target. What should the controller do?', opts: ['Lower α', 'Raise α', 'Stop bidding'], a: 1,
    why: 'It is cheaper than the target, so there is room to bid more: error = (20 − 12) ÷ 20 = +0.4, and α grows.' },
  { q: 'Why does the best α usually end up above 1?', opts: ['Google adds a fee', 'The target is an average, and in a second-price auction you pay less than you bid', 'pConv is always too low'], a: 1,
    why: 'Cheap conversions leave room in the average, and you pay the competitor\'s price, so bidding above value still lands on target.' }
];
