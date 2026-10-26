/* Topic: adx  ·  subject: Where ads appear  ·  registered in js/config.js */
TERMS['adx'] = { name: 'AdX', needs: ['display', 'impression'],
    short: 'Google Ad Exchange: a marketplace where websites and apps sell their ad space and advertisers buy it, one impression at a time, through real-time auctions.',
    body: () => `
      <h2>What it is</h2>
      <p>Google Ad Exchange (AdX) is a real-time marketplace for ad space on websites, apps and video. <b>Publishers</b>, the sites and apps that have ad space, offer each ${T('impression')} the moment it happens. <b>Advertisers</b>, through their buying software, bid on it. The best bid wins, and the ad appears, all before the page finishes loading.</p>
      <p>Think of a stock exchange where every "share" is a single impression. It exists for a fraction of a second and is sold once, to one buyer. AdX is part of <b>Google Ad Manager</b>, the platform publishers use to manage and sell their ad space.</p>
      <div class="facts">
        <div><span class="v">1</span><span class="l">auction for every impression</span></div>
        <div><span class="v">~100 ms</span><span class="l">typical time buyers get to answer</span></div>
        <div><span class="v">2019</span><span class="l">switched to first-price auctions</span></div>
        <div><span class="v">4</span><span class="l">ways to sell (deal types)</span></div>
      </div>

      <h2>Who's in the market</h2>
      <div class="split three">
        <div><h3>Sellers: publishers</h3><p>News sites, blogs, recipe sites, mobile apps. They have ad slots on their pages and want the most money for each one. They set rules such as a minimum price.</p></div>
        <div><h3>The exchange: AdX</h3><p>Sits in the middle, inside Google Ad Manager. It describes each impression to buyers, collects their bids, runs the auction and takes a fee.</p></div>
        <div><h3>Buyers: advertisers' software</h3><p><b>Google Ads</b> (advertisers on the Google Display Network), <b>Display &amp; Video 360</b> (Google's buying platform for agencies and big brands), and outside buying platforms through Google's Authorized Buyers program.</p></div>
      </div>

      <h2>Follow one impression</h2>
      <p>This is real-time bidding (RTB). Press <b>Play</b> to watch a single ad slot get sold, or step through it. Try raising the floor price to see impressions go unsold.</p>
      <div class="widget" data-widget="adx"></div>

      <h2>What's inside a bid request</h2>
      <p>When AdX asks buyers for bids, it sends a short description of the impression. The industry standard format is called OpenRTB. Here's a simplified one:</p>
<pre class="code">{
  "imp":    { "size": "300x250", "floor_cpm": 1.50 },   <span class="c">// the slot, and the lowest price accepted</span>
  "site":   { "domain": "dailynews.example",
              "page": "/sports/finals-recap" },        <span class="c">// what the reader is looking at</span>
  "device": { "type": "mobile", "os": "iOS" },          <span class="c">// phone, tablet or desktop</span>
  "geo":    { "country": "US", "region": "TX" },        <span class="c">// rough location only</span>
  "user":   { "id": "…", "consent": true }             <span class="c">// only if privacy rules allow</span>
}</pre>
      <p>Each buyer's software turns this into a guess: how likely is this person to click or buy, and what is that worth to one of its advertisers? That guess becomes the ${T('bid')}. Everything has to happen inside the response deadline. A late answer counts as no bid.</p>

      <h2>Four ways to sell</h2>
      <p>The open auction is only one option. Publishers can also make deals with specific buyers:</p>
      <div class="tbl-wrap"><table>
        <tr><th>Deal type</th><th>Who can buy</th><th>Price</th><th>Volume guaranteed?</th></tr>
        <tr><td><b>Open Auction</b></td><td>Any approved buyer</td><td>Set by the auction, above the floor</td><td>No</td></tr>
        <tr><td><b>Private Auction</b></td><td>Only invited buyers</td><td>Set by the auction, usually a higher floor</td><td>No</td></tr>
        <tr><td><b>Preferred Deal</b></td><td>One buyer, who gets the first look</td><td>Fixed price agreed in advance</td><td>No, the buyer can pass</td></tr>
        <tr><td><b>Programmatic Guaranteed</b></td><td>One buyer</td><td>Fixed price agreed in advance</td><td>Yes, a set number of impressions</td></tr>
      </table></div>
      <p>Moving down the table, the publisher gives up competition in exchange for certainty, and the buyer gets guaranteed access to premium space.</p>

      <h2>The floor price</h2>
      <p>A floor (also called a reserve price) is the lowest bid the publisher will accept, usually stated as a ${T('cpm', 'CPM')}. It's a trade-off:</p>
      <ul>
        <li><b>Floor too low:</b> impressions sell, but sometimes for far less than they're worth.</li>
        <li><b>Floor too high:</b> fewer bids clear it, so more impressions go unsold (a lower <i>fill rate</i>).</li>
      </ul>
      <p>When nothing clears the floor, the publisher falls back to something else: another demand source or its own house ad.</p>

      <h2>Why it switched to first-price</h2>
      <p>Before 2019, AdX sold each impression in a second-price auction: the winner paid just above the runner-up's bid. That's a ${T('vickrey', 'Vickrey auction')}. Then the market changed:</p>
      <ul>
        <li><b>2017–2018:</b> with header bidding, publishers asked many exchanges for bids at once. Most exchanges (AppNexus, Index, Rubicon, OpenX, PubMatic) switched to ${T('first-price', 'first-price')} so their bids compared cleanly.</li>
        <li><b>March 2019:</b> Google announced a single first-price auction for Ad Manager and gave up its "last look" advantage.</li>
        <li><b>September 2019:</b> AdX traffic moved fully to first-price.</li>
      </ul>
      <p>YouTube isn't part of this. Google stopped selling YouTube ads through AdX in 2015, and YouTube ads bought in Google Ads are still priced second-price style.</p>
      <p>The catch for buyers: paying your own bid means bidding your full value leaves no profit. So buyers bid lower than the impression is worth to them, using ${T('bid-shading')}.</p>

      <h2>Where the money goes</h2>
      <p>Say an advertiser wins at a $2.80 CPM, which is $0.0028 for this one impression. The exchange keeps a fee and the publisher gets the rest. AdX's fee is commonly reported at about 20%:</p>
      <div class="money" role="img" aria-label="Of a $2.80 CPM, about $2.24 goes to the publisher and about $0.56 to the exchange.">
        <span class="pub">Publisher $2.24</span><span class="fee">AdX $0.56</span>
      </div>
      <p class="note">The buyer's own platform usually takes a fee too, before the bid is sent, so the advertiser's total cost is higher than the winning bid.</p>

      <h2>AdX isn't the only exchange</h2>
      <div class="split">
        <div><h3>Header bidding</h3><p>Publishers can ask several exchanges for bids at once, from code in the page's header, before their ad server decides. The exchanges then compete for each impression instead of being called one after another.</p></div>
        <div><h3>Open Bidding</h3><p>Google's version of the same idea, run on Google's servers inside Ad Manager. Other exchanges bid in the same auction as AdX, and the highest bid wins.</p></div>
      </div>

      <h2>The jargon, decoded</h2>
      <dl class="terms">
        <dt>Publisher</dt><dd>Owns the site or app and sells the ad space.</dd>
        <dt>Inventory</dt><dd>A publisher's ad space, counted in impressions.</dd>
        <dt>Ad server</dt><dd>The publisher's system that decides what fills each slot. For Google, that's Ad Manager.</dd>
        <dt>Ad exchange</dt><dd>The marketplace where impressions are auctioned, like AdX.</dd>
        <dt>SSP</dt><dd>Supply-side platform: software that helps publishers sell. AdX plays this role for publishers too.</dd>
        <dt>DSP</dt><dd>Demand-side platform: software that bids for advertisers, like Display &amp; Video 360.</dd>
        <dt>RTB</dt><dd>Real-time bidding: auctioning each impression as it happens.</dd>
        <dt>Bid request</dt><dd>The description of an impression sent to buyers.</dd>
        <dt>Floor price</dt><dd>The lowest bid a publisher will accept.</dd>
        <dt>Fill rate</dt><dd>The share of impressions that actually get sold.</dd>
      </dl>` };

/* Check-yourself questions shown at the end of the page */
CHECKS['adx'] = [
    { q: 'The floor is $2.00 CPM. Bids come in at $2.80, $2.40 and $1.70. What happens?', opts: ['The $2.80 bidder wins and pays $2.40', 'The $2.80 bidder wins and pays $2.80', 'Nobody wins, because one bid is under the floor'], a: 1,
      why: 'AdX runs a first-price auction. The $1.70 bid is thrown out for being under the floor, and the highest bid wins and pays exactly what it bid.' },
    { q: 'A publisher raises its floor price a lot. What is most likely to happen?', opts: ['Every impression sells for more', 'More impressions go unsold, but those that sell earn more', 'Buyers have to answer faster'], a: 1,
      why: 'Fewer bids clear a high floor, so the fill rate drops even though each sale earns more.' }];
