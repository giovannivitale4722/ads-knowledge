/* Topic: cpc  ·  subject: What advertisers pay  ·  registered in js/config.js */
TERMS['cpc'] = { name: 'CPC', needs: ['bid'],
    short: 'Cost Per Click: the advertiser pays only when someone clicks the ad.',
    body: () => `
      <h2>What it is</h2>
      <p>With CPC (cost per click) pricing, showing the ad is free. The advertiser pays only when someone clicks. It's the standard way ${T('search-ads')} are sold, and it's common on display too.</p>
      <p>The appeal is simple: you pay for <b>visits</b>, not just for being seen. The catch for the platform is that an ad nobody clicks earns nothing, which is why Google needs ${T('pctr')} to know what a CPC bid is really worth.</p>
      <div class="facts">
        <div><span class="v">$5.26</span><span class="l">average search CPC in 2025 (Google + Microsoft)</span></div>
        <div><span class="v">+13%</span><span class="l">rise in that average from 2024</span></div>
        <div><span class="v">$1.60–$8.58</span><span class="l">cheapest to priciest industry average</span></div>
        <div><span class="v">$0.01</span><span class="l">rounding step for US prices</span></div>
      </div>

      <h2>Max CPC vs actual CPC</h2>
      <ul>
        <li><b>Max CPC</b> is your ${T('bid')}: the most you're willing to pay for one click. You set it ahead of time, or Google's system sets it for you.</li>
        <li><b>Actual CPC</b> is what you're really charged. It's usually less.</li>
      </ul>
      <p>Google's rule for search: you pay only what's needed to <b>clear the Ad Rank threshold</b> and <b>beat the ${T('ad-rank')} of the ad directly below you</b>. If nobody is below you, you pay the reserve price. That's the ${T('gsp', 'GSP')} idea in practice:</p>
      <div class="formula">actual CPC ≈ Ad Rank you must beat ÷ (your pCTR × your Ad Quality) + $0.01</div>
      <p>Because your own pCTR and quality are in the denominator, a <b>better ad pays less</b> for the same position.</p>
      <div class="widget" data-widget="actualcpc"></div>
      <p class="note">Your actual CPC can occasionally be above your max CPC, for example when bid adjustments raise your bid for certain devices or locations.</p>

      <h2>Average CPC</h2>
      <p>Every click is priced in its own auction, so reports show an average:</p>
      <div class="formula">average CPC = total cost ÷ total clicks</div>
      <p>Three clicks that cost $1.20, $1.60 and $2.00 total $4.80, so the average CPC is $4.80 ÷ 3 = <b>$1.60</b>.</p>

      <h2>The CPC math</h2>
      <p>CPC connects to almost every number in a campaign:</p>
      <div class="tbl-wrap"><table>
        <tr><th>To find</th><th>Formula</th><th>Example</th></tr>
        <tr><td>Clicks</td><td>budget ÷ average CPC</td><td class="num">$100 ÷ $2.50 = 40</td></tr>
        <tr><td>Clicks from impressions</td><td>impressions × CTR</td><td class="num">2,000 × 2% = 40</td></tr>
        <tr><td>Value per 1,000 impressions (${T('ecpm')})</td><td>CPC × CTR × 1000</td><td class="num">$2.50 × 2% × 1000 = $50</td></tr>
        <tr><td>Cost per customer (CPA)</td><td>CPC ÷ conversion rate</td><td class="num">$2.50 ÷ 4% = $62.50</td></tr>
        <tr><td>Return on ad spend (ROAS)</td><td>revenue ÷ cost</td><td class="num">$128 ÷ $100 = 1.28×</td></tr>
      </table></div>
      <p>The key insight is the CPA row. A click is only worth what it leads to. A $10 click that converts 10% of the time costs $100 per customer, and so does a $1 click that converts 1% of the time.</p>
      <div class="widget" data-widget="campaign"></div>

      <h2>What makes CPC higher or lower</h2>
      <div class="split">
        <div><h3>Pushes CPC up</h3><ul>
          <li><b>Competition:</b> more advertisers bidding on the same searches.</li>
          <li><b>Valuable customers:</b> lawyers, dentists and insurers can afford high CPCs because one customer is worth thousands.</li>
          <li><b>Busy seasons:</b> holidays and sales events bring more bidders.</li>
          <li><b>Top positions:</b> thresholds for the top of the page are higher.</li>
        </ul></div>
        <div><h3>Pushes CPC down</h3><ul>
          <li><b>Higher ${T('ad-quality')}:</b> relevant ads with good landing pages pay less for the same spot.</li>
          <li><b>Higher ${T('pctr')}:</b> an ad people click on beats others with a lower bid.</li>
          <li><b>Less contested searches:</b> specific, longer queries usually have fewer bidders.</li>
          <li><b>Lower positions:</b> a lower spot can cost less per click.</li>
        </ul></div>
      </div>

      <h2>What clicks cost in practice</h2>
      <p>Average search CPCs from LocaliQ's 2025 benchmarks, which cover 16,446 campaigns across Google and Microsoft Ads:</p>
      <div class="tbl-wrap"><table>
        <tr><th>Industry</th><th class="num">Average CPC</th></tr>
        <tr><td>Legal services</td><td class="num">$8.58</td></tr>
        <tr><td>Dental services</td><td class="num">$7.85</td></tr>
        <tr><td>Home improvement</td><td class="num">$7.85</td></tr>
        <tr><td><b>All industries</b></td><td class="num"><b>$5.26</b></td></tr>
        <tr><td>Travel</td><td class="num">$2.12</td></tr>
        <tr><td>Restaurants</td><td class="num">$2.05</td></tr>
        <tr><td>Arts &amp; entertainment</td><td class="num">$1.60</td></tr>
      </table></div>
      <p>CPCs rose in most industries in 2025. Individual keywords can cost far more than these averages.</p>

      <h2>Paying per click vs choosing the bid</h2>
      <p>Two separate questions often get mixed up: <b>what you pay for</b> (here, clicks) and <b>who decides the bid</b>. You can pay per click while letting Google choose every bid.</p>
      <div class="tbl-wrap"><table>
        <tr><th>Bidding strategy</th><th>Who sets the bid</th><th>Goal</th></tr>
        <tr><td>Manual CPC</td><td>You, per keyword or ad group</td><td>Full control over each max CPC</td></tr>
        <tr><td>Maximize clicks</td><td>Google, automatically</td><td>As many clicks as possible within your budget</td></tr>
        <tr><td>Maximize conversions / Target CPA</td><td>Google, per auction</td><td>Customers, not just clicks</td></tr>
      </table></div>
      <p>With the automated options, Google's system works out a bid for every auction in milliseconds (see "Who actually places the bid?" on the ${T('bid')} page). On search you are typically still charged per click.</p>

      <h2>Clicks you don't pay for</h2>
      <p>Not every click counts. Google filters <b>invalid clicks</b>, such as bots, deliberate fake clicking, and accidental double clicks, and doesn't charge for them. If invalid clicks slip through, Google gives credits afterward. Advertisers can ask Google to investigate the last 60 days of traffic.</p>

      <h2>CPC compared with other pricing</h2>
      <div class="tbl-wrap"><table>
        <tr><th>Pricing</th><th>You pay when</th><th>Who takes the risk</th><th>Common for</th></tr>
        <tr><td><b>CPC</b></td><td>Someone clicks</td><td>Shared: the platform risks no clicks, you risk clicks that don't buy</td><td>Search, getting visitors</td></tr>
        <tr><td>${T('cpm', 'CPM')}</td><td>The ad is shown (per 1,000)</td><td>You: you pay even if nobody clicks</td><td>Display, video, awareness</td></tr>
        <tr><td>CPA</td><td>Someone buys or signs up</td><td>Mostly the platform</td><td>Performance campaigns</td></tr>
      </table></div>
      <p class="sources">Sources: <a href="https://support.google.com/google-ads/answer/6297" target="_blank" rel="noopener">Google Ads: actual CPC</a> · <a href="https://support.google.com/google-ads/answer/42995" target="_blank" rel="noopener">Google Ads: invalid clicks</a> · <a href="https://support.google.com/google-ads/answer/11182074" target="_blank" rel="noopener">Google Ads: managing invalid traffic</a> · <a href="https://localiq.com/blog/search-advertising-benchmarks/" target="_blank" rel="noopener">LocaliQ: 2025 search benchmarks</a> · <a href="https://searchengineland.com/google-ads-costs-rise-again-but-conversions-improve-report-455663" target="_blank" rel="noopener">Search Engine Land: costs rise again</a></p>` };

/* Check-yourself questions shown at the end of the page */
CHECKS['cpc'] = [
    { q: 'Your max CPC is $3.00, your pCTR is 3% and your Ad Quality is 1.0. The ad below you has an Ad Rank of 0.048. Roughly what do you pay per click?', opts: ['$3.00', '$1.61', '$0.05'], a: 1,
      why: '0.048 ÷ (0.03 × 1.0) = $1.60, plus $0.01 to beat it. You pay just enough to beat the ad below, not your max.' },
    { q: 'A campaign spends $200, gets 80 clicks and 4 sales. What is the cost per sale (CPA)?', opts: ['$2.50', '$40', '$50'], a: 2,
      why: '$200 ÷ 4 sales = $50. The $2.50 is the average CPC ($200 ÷ 80 clicks).' }];
