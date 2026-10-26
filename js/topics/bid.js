/* Topic: bid  ·  subject: What advertisers pay  ·  registered in js/config.js */
TERMS['bid'] = { name: 'Bid', needs: [],
    short: 'The most an advertiser is willing to pay, set ahead of time. Google\'s system places it for them in each auction, in milliseconds.',
    body: () => `
      <h2>What it is</h2>
      <p>A bid is the advertiser's <b>maximum</b> price for something. The "something" depends on how they're paying:</p>
      <ul>
        <li>With ${T('cpc')} bidding, it's the most they'll pay for one click.</li>
        <li>With ${T('cpm')} bidding, it's the most they'll pay for 1,000 ${T('impression', 'impressions')}.</li>
      </ul>
      <h2>Who actually places the bid?</h2>
      <p>Auctions happen in milliseconds, the moment someone searches or a page loads. No person can react that fast, so advertisers don't bid live. They set their bid <b>ahead of time</b>, and Google's system places it for them in every auction.</p>
      <div class="split">
        <div><h3>Ahead of time: the advertiser</h3>
          <p>Sets up a campaign once, with a standing instruction like one of these:</p>
          <ul><li><b>A manual bid:</b> "Show my ad for <i>running shoes</i>, and pay at most $1.50 per click."</li>
          <li><b>A goal:</b> "Get me sales at about $20 each." Google works out the bids.</li></ul></div>
        <div><h3>In the milliseconds: the system</h3>
          <ol><li>Finds every advertiser whose settings match this search or page.</li>
          <li>Places a bid for each one: the fixed $1.50, or a bid worked out for this exact auction.</li>
          <li>Runs the auction and shows the winning ad.</li></ol></div>
      </div>
      <p>With a goal, the bid can change from one auction to the next. The system might bid more for someone who looks likely to buy and less for someone who doesn't. This is called automated bidding (Google's version is Smart Bidding). The advertiser decides <i>what they want</i>, and the software decides <i>what to bid</i> each time.</p>
      <h2>A bid is a ceiling, not the price</h2>
      <p>What the advertiser actually pays depends on the ${T('auction-mechanism')}:</p>
      <ul>
        <li>In a ${T('vickrey', 'second-price')} or ${T('gsp', 'GSP')} auction, the winner usually pays <b>less</b> than their bid, just enough to beat the ad below.</li>
        <li>In a ${T('first-price', 'first-price')} auction, the winner pays <b>exactly</b> their bid. That's why bidders there bid below what the impression is worth to them (${T('bid-shading')}).</li>
      </ul>
      <h2>A high bid doesn't guarantee a win</h2>
      <p>Google doesn't rank ads by bid alone. The bid is one of three inputs to ${T('ad-rank')}, alongside ${T('pctr')} and ${T('ad-quality')}. A $4 bid on an ad nobody clicks can lose to a $2 bid on an ad people do click.</p>
      <h2>Bid vs value</h2>
      <p>Your <b>value</b> is what the click or impression is actually worth to you. Your <b>bid</b> is what you submit. Whether they should be equal depends on the auction. In a Vickrey auction, bidding your value is the best strategy. In a first-price auction it never is.</p>
      <h2>Example</h2>
      <p>An advertiser bids $3.00 per click. In a GSP auction, the ad below them only forces a price of $1.60, so each click costs $1.60, not $3.00.</p>` };
