/* Topic: everyone-autobids  ·  subject: Autobidding  ·  registered in js/config.js */
TERMS['everyone-autobids'] = { name: 'When everyone autobids', needs: ['autobidding', 'target-cpa'],
    short: 'When every advertiser uses an autobidder, the auction becomes algorithms competing with algorithms. Prices rise, efficiency can fall, and both Google and the bidders change how they optimize.',
    body: () => `
      <h2>The bidders change type</h2>
      <p>Classic auction theory, including the ${T('vickrey', 'Vickrey')} lesson that bidding your true value is best, assumes bidders who want <b>profit</b>: value minus price, auction by auction. Autobidders want something else.</p>
      <div class="split">
        <div><h3>Profit maximizer (classic)</h3><p>"This click is worth $10 to me, and I want as much of that $10 left over as possible." Leftover margin is the point.</p></div>
        <div><h3>Value maximizer (autobidder)</h3><p>"Get me as many conversions as possible, as long as the average cost stays at or under $20." Leftover margin is wasted room, so it spends right up to the limit.</p></div>
      </div>
      <p class="callout"><b>Once every advertiser autobids, the auction becomes algorithms competing with algorithms.</b> Each one pushes its multiplier up until its own target or budget stops it.</p>

      <h2>A market of controllers</h2>
      <p>Every autobidder runs a controller like the one on the ${T('target-cpa', 'Target CPA')} page. But now each controller's actions change everyone else's prices:</p>
      <ol class="pipe" style="--n:4">
        <li><b>A raises α</b><span>its CPA is under target, so it bids more</span></li>
        <li><b>Prices rise</b><span>in a second-price auction, A's bids set others' prices</span></li>
        <li><b>B's CPA rises</b><span>B now pays more per conversion</span></li>
        <li><b>B lowers α</b><span>which lowers prices for A, and the loop goes on</span></li>
      </ol>
      <p>Will this loop settle down? Where does it settle? And is the result any good? The demo below lets you see, then the research gives the answers.</p>

      <h2>Watch it happen</h2>
      <div class="widget" data-widget="marketsim"></div>
      <p>What to notice:</p>
      <ul>
        <li><b>Nobody autobidding:</b> everyone bids exactly value, and every CPA ends well under its target.</li>
        <li><b>Only A autobids:</b> A nearly doubles its conversions by outbidding the others. One autobidder in a manual market has a big edge, which is why everyone adopted them.</li>
        <li><b>Everyone autobids (step 0.1):</b> prices jump, every advertiser ends near its own target, and the edge disappears. The advertiser willing to pay the most per conversion (C, at $28) takes the biggest share. Total conversions fall, because impressions go to the highest bidder rather than the likeliest converter.</li>
        <li><b>Bigger steps:</b> the controllers overreact to each other. One advertiser can end up pinned at its maximum while the rest give up, which is a real risk when thousands of controllers run at once.</li>
      </ul>

      <h2>Does the market settle, and is it any good?</h2>
      <div class="tbl-wrap"><table>
        <tr><th>Question</th><th>What the research found</th></tr>
        <tr><td><b>Is there a stable outcome?</b></td><td>Yes. When every advertiser uses a Target CPA–style autobidder in a truthful auction, there's an equilibrium: a set of multipliers where nobody gains by changing theirs (Aggarwal, Badanidiyuru &amp; Mehta, 2019).</td></tr>
        <tr><td><b>How good is it?</b></td><td>At least <b>half as good as perfect</b>. The <i>price of anarchy</i> compares the equilibrium with a central planner who places every ad perfectly. For autobidders it's 1/2: total conversions are always at least half the best possible. The same bound has been shown for first-price auctions.</td></tr>
        <tr><td><b>What if only some advertisers autobid?</b></td><td>The guarantee gets slightly worse, about 0.457, when autobidders and classic profit-maximizers share the market.</td></tr>
        <tr><td><b>Can you just compute the equilibrium?</b></td><td>Not in general. For budget-paced bidders, finding the equilibrium multipliers is provably hard, so real systems let their controllers run and rely on them to settle.</td></tr>
      </table></div>
      <p>"Half as good as perfect" sounds alarming, but it's a <b>worst-case guarantee</b>. Real markets usually do much better. The research question is how to design auctions and bidders that push results close to perfect.</p>

      <h2>What goes wrong in practice</h2>
      <ul>
        <li><b>Feedback loops:</b> controllers chasing each other, as in the bigger-step demo, but across thousands of advertisers.</li>
        <li><b>Synchronized behavior:</b> many campaigns reset budgets at midnight and pace toward similar plans, so demand bunches up at the same hours.</li>
        <li><b>Squeezed advertisers:</b> those with lower targets, often smaller businesses, get priced out of auctions they used to win.</li>
        <li><b>Thin auctions:</b> on niche searches, one aggressive multiplier can dominate.</li>
      </ul>

      <h2>What Google can change: the auction</h2>
      <div class="tbl-wrap"><table>
        <tr><th>Idea</th><th>What it does</th></tr>
        <tr><td><b>Boosts</b></td><td>Add a quality- or value-based term to each bid before ranking. With autobidders, well-chosen boosts can raise both advertisers' total value and Google's revenue (Deng, Mao, Mirrokni &amp; Zuo, 2021).</td></tr>
        <tr><td><b>Reserve prices tuned for autobidders</b></td><td>Classically, a minimum price trades total value for revenue. With value-maximizing autobidders, the right reserves can improve both (Balseiro et al., 2021).</td></tr>
        <tr><td><b>Choosing the auction format</b></td><td>First-price, second-price and randomized auctions are compared by how efficient they stay when every bidder is an algorithm.</td></tr>
        <tr><td><b>Using predictions</b></td><td>Auctions that use ML predictions of bidders' values. As predictions get more accurate, efficiency moves from about 0.46 toward perfect.</td></tr>
      </table></div>

      <h2>What bidders change: the autobidder</h2>
      <div class="tbl-wrap"><table>
        <tr><th>Technique</th><th>Problem it solves</th></tr>
        <tr><td><b>Dual (Lagrangian) methods</b></td><td>Turn "maximize X within limits" into learning one multiplier per limit. That's the α you're implementing.</td></tr>
        <tr><td><b>PID controllers</b></td><td>React to how fast the error is changing, not just its size, for steadier tracking with less overshoot.</td></tr>
        <tr><td><b>Throttling</b></td><td>Pace a budget by skipping a share of auctions instead of lowering every bid.</td></tr>
        <tr><td><b>Win-rate models</b></td><td>Predict the chance of winning at each price, which is needed for ${T('bid-shading')} in first-price auctions.</td></tr>
        <tr><td><b>Delayed-feedback models</b></td><td>Estimate conversions that haven't arrived yet, so the controller doesn't cut bids by mistake.</td></tr>
        <tr><td><b>Reinforcement learning</b></td><td>Learn a bidding policy that plans across the whole day instead of reacting window by window.</td></tr>
        <tr><td><b>Generative auto-bidding</b></td><td>A recent research direction: models that generate a whole bidding plan for the day at once.</td></tr>
        <tr><td><b>Portfolio bidding</b></td><td>One strategy shared across many campaigns, so budget flows to wherever conversions are cheapest.</td></tr>
      </table></div>

      <p class="note">Trading comparison: equity markets went through the same shift. Once most volume was algorithmic, the big questions became crowding, feedback loops between algorithms, and how market rules shape algorithm-versus-algorithm outcomes. Autobidding is going through that shift now.</p>
      <p class="sources">Sources: <a href="https://research.google/pubs/autobidding-with-constraints/" target="_blank" rel="noopener">Autobidding with Constraints (WINE 2019)</a> · <a href="https://arxiv.org/abs/2208.10650" target="_blank" rel="noopener">Efficiency of the First-Price Auction in the Autobidding World</a> · <a href="https://arxiv.org/abs/2207.03630" target="_blank" rel="noopener">Efficiency of non-truthful auctions under auto-bidding</a> · <a href="https://research.google/pubs/towards-efficient-auctions-in-an-auto-bidding-world/" target="_blank" rel="noopener">Towards Efficient Auctions in an Auto-bidding World (WWW 2021)</a> · <a href="https://arxiv.org/abs/2111.02468" target="_blank" rel="noopener">Robust Auction Design in the Auto-bidding World</a> · <a href="https://arxiv.org/abs/2408.07685" target="_blank" rel="noopener">Auto-bidding survey (2024)</a></p>` };

/* Check-yourself questions shown at the end of the page */
CHECKS['everyone-autobids'] = [
  { q: 'Why do prices rise when everyone switches to autobidding?', opts: ['Google raises reserve prices', 'Each autobidder raises its multiplier until its own target binds, so slack gets spent', 'Autobidders bid randomly'], a: 1,
    why: 'Autobidders are value maximizers: they spend up to their limit. In a second-price auction, higher bids from rivals raise everyone\'s prices.' },
  { q: 'The price of anarchy for autobidders is 1/2. What does that guarantee?', opts: ['Advertisers pay half price', 'Total conversions are at least half of what a perfect allocation would achieve', 'Half the auctions are lost'], a: 1,
    why: 'It is a worst-case bound comparing the equilibrium to a central planner. Real markets usually do much better.' },
  { q: 'In a market where everyone autobids, which advertiser tends to win the most?', opts: ['The one with the lowest target CPA', 'The one with the highest target CPA', 'The one with the most keywords'], a: 1,
    why: 'A higher target means a higher willingness to pay per conversion, so its multiplier settles higher and it outbids the others.' }
];
