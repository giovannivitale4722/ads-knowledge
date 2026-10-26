/* Topic: vickrey  ·  subject: How auctions work  ·  registered in js/config.js */
TERMS['vickrey'] = { name: 'Vickrey auction', needs: ['auction-mechanism'],
    short: 'A sealed-bid auction where the highest bidder wins but pays the second-highest bid. Also called a second-price auction.',
    body: () => `
      <h2>The rules</h2>
      <p>Everyone submits a sealed bid without seeing the others. The highest bid wins, but the price is set by the <b>next-highest bid</b>, not by the winner's own.</p>
      <p><b>Example:</b> bids are $10, $8 and $5. The $10 bidder wins and pays <b>$8</b>.</p>
      <h2>Why bidding your true value is the best strategy</h2>
      <p>Your bid only decides <i>whether</i> you win. It never changes <i>what</i> you pay, because the price comes from someone else's bid. So:</p>
      <ul>
        <li><b>Bidding more than it's worth to you</b> can make you win when the price is above your value, and you lose money.</li>
        <li><b>Bidding less</b> doesn't lower your price. It only makes you lose auctions you would have profited from.</li>
      </ul>
      <p>That's why a Vickrey auction is called <b>truthful</b>: the best move is to bid exactly what the item is worth to you. It's named after economist William Vickrey.</p>
      <h2>Try it</h2>
      <div class="widget" data-widget="playground"></div>
      <h2>Where it's used</h2>
      <ul>
        <li><b>Ad exchanges, until about 2018.</b> Exchanges, including Google's ${T('adx', 'AdX')} until 2019, sold each impression at the second-highest price. Nearly all have since moved to ${T('first-price', 'first-price')}.</li>
        <li><b>eBay.</b> Its automatic bidding raises your bid only as far as needed to beat the next bidder. The winner pays about the second-highest bid plus a small step, which works out almost the same as a Vickrey auction.</li>
        <li><b>Rarely in pure form.</b> Economists note that textbook Vickrey auctions are uncommon in practice.</li>
      </ul>
      <h2>Where it leads</h2>
      <p>A search page has several ad slots, not one. ${T('gsp')} is the version of this idea for several slots at once, and it's what Google Search uses.</p>` };
