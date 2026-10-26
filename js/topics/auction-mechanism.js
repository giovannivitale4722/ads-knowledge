/* Topic: auction-mechanism  ·  subject: How auctions work  ·  registered in js/config.js */
TERMS['auction-mechanism'] = { name: 'Auction mechanism', needs: ['bid'],
    short: 'The rules an ad auction uses to decide two things: which ad wins, and how much the winner pays.',
    body: () => `
      <h2>What it is</h2>
      <p>Every time someone searches or loads a page with ad space, an auction runs in a few milliseconds. The auction mechanism is its set of rules, and it answers two questions:</p>
      <ol>
        <li><b>Who wins?</b> In Google's case, ranked by ${T('ad-rank')}, not just ${T('bid')}.</li>
        <li><b>What does the winner pay?</b> This is where mechanisms differ most.</li>
      </ol>
      <h2>The three main types</h2>
      <div class="tbl-wrap"><table>
        <tr><th>Mechanism</th><th>Who wins</th><th>Winner pays</th><th>Bid your true value?</th></tr>
        <tr><td>${T('vickrey', 'Vickrey')}</td><td>Highest bid</td><td>The second-highest bid</td><td>Yes</td></tr>
        <tr><td>${T('gsp', 'GSP')}</td><td>Highest Ad Rank, slot by slot</td><td>Just enough to beat the ad below</td><td>Not always</td></tr>
        <tr><td>${T('first-price', 'First-Price')}</td><td>Highest bid</td><td>Their own bid</td><td>No, they shade</td></tr>
      </table></div>
      <h2>Who uses which auction</h2>
      <p>The short version: Google's own search and YouTube ads use <b>second-price style</b> auctions. The programmatic display market, meaning ad exchanges like AdX, switched to <b>first-price</b> between 2017 and 2019.</p>
      <div class="tbl-wrap"><table>
        <tr><th>Platform</th><th>Auction</th><th>Since</th><th>How sure</th></tr>
        <tr><td>${T('search-ads', 'Google Search ads')}</td><td>${T('gsp', 'GSP')}</td><td>Long-standing</td><td><span class="conf hi">Google's docs</span></td></tr>
        <tr><td>${T('youtube', 'YouTube ads')} in Google Ads</td><td>Second-price style</td><td>Long-standing</td><td><span class="conf hi">Google's docs</span></td></tr>
        <tr><td>${T('adx', 'Google Ad Manager / AdX')}</td><td>${T('first-price', 'First-Price')}</td><td>Sept 2019</td><td><span class="conf hi">Google's docs</span></td></tr>
        <tr><td>Other exchanges (Index, Rubicon, OpenX, PubMatic, AppNexus)</td><td>First-Price</td><td>2017–2018</td><td><span class="conf hi">Trade press</span></td></tr>
        <tr><td>AdSense: display, video and game ads</td><td>Moving to First-Price</td><td>Announced</td><td><span class="conf md">Trade press</span></td></tr>
        <tr><td>AdSense: search and shopping ads</td><td>Second-price</td><td>Long-standing</td><td><span class="conf md">Trade press</span></td></tr>
        <tr><td>Microsoft Advertising (Bing)</td><td>GSP</td><td>Long-standing</td><td><span class="conf md">Research papers</span></td></tr>
        <tr><td>Amazon Sponsored Products</td><td>GSP, says Amazon</td><td>2006</td><td><span class="conf lo">Disputed in court</span></td></tr>
        <tr><td>Meta (Facebook, Instagram)</td><td>"Total value" auction, second-price style</td><td>—</td><td><span class="conf lo">Unconfirmed</span></td></tr>
      </table></div>
      <ul>
        <li><b>Why exchanges switched:</b> header bidding let publishers ask many exchanges for bids at once. Comparing exchanges is much simpler when every price is just the bid.</li>
        <li><b>Amazon:</b> in August 2026 the FTC and 22 states sued, alleging a hidden "soft reserve" made advertisers pay their own bid about 80% of the time. Amazon says it has used a second-price auction since 2006 and disputes the claim.</li>
        <li><b>Meta:</b> it ranks ads by "total value" (bid × estimated action rate, plus ad quality). Blogs describe second-price style pricing, but Meta hasn't published the exact rule.</li>
        <li><b>Google Search:</b> trial testimony in the US government's 2023 case described pricing adjustments on top of plain GSP, including randomized GSP (RGSP). Treat GSP as the mental model, not the full production system.</li>
      </ul>
      <h2>Is anyone using a pure Vickrey auction?</h2>
      <p>Rarely. A ${T('vickrey', 'Vickrey auction')} is second-price for <b>one</b> item. In ads, the clearest case was historical: ad exchanges, AdX included, used to sell each impression to the highest bidder at the second-highest price, until the switch to first-price. Outside ads, eBay's automatic bidding works almost the same way.</p>
      <p class="sources">Sources: <a href="https://support.google.com/google-ads/answer/6297" target="_blank" rel="noopener">Google Ads: actual CPC</a> · <a href="https://support.google.com/google-ads/answer/2472735" target="_blank" rel="noopener">Google Ads: YouTube CPV bidding</a> · <a href="https://support.google.com/authorizedbuyers/answer/9483374" target="_blank" rel="noopener">Authorized Buyers: 2019 first-price move</a> · <a href="https://adexchanger.com/ad-exchange-news/five-forces-transformed-programmatic-auctions-2017" target="_blank" rel="noopener">AdExchanger: 2017 auction changes</a> · <a href="https://ppc.land/google-to-move-all-auctions-in-adsense-from-second-price-to-first-price" target="_blank" rel="noopener">PPC Land: AdSense to first-price</a> · <a href="https://martech.org/youtube-ads-wont-be-sold-through-adx-next-year-google-says" target="_blank" rel="noopener">MarTech: YouTube leaves AdX</a> · <a href="https://www.aboutamazon.com/md/company-news/amazon-ftc-sponsored-ads-lawsuit-response" target="_blank" rel="noopener">Amazon: FTC response</a> · <a href="https://searchengineland.com/google-rgsp-randomized-generalized-second-price-ad-auctions-explained-433053" target="_blank" rel="noopener">Search Engine Land: RGSP</a></p>
      <h2>Why the payment rule matters</h2>
      <p>The payment rule changes how smart bidders behave. If what you pay doesn't depend on your own bid (Vickrey), you can just bid what the ad is worth to you. If you pay your own bid (first-price), you have to guess what others will bid and bid lower, which is ${T('bid-shading')}. An auction where honest bidding is the best strategy is called <b>truthful</b>.</p>` };
