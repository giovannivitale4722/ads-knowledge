/* Topic: vickrey  ·  subject: How auctions work  ·  registered in js/config.js */
TERMS['vickrey'] = { name: 'Vickrey auction', needs: ['auction-mechanism'],
    short: 'A sealed-bid auction where the highest bidder wins but pays the second-highest bid. Also called a second-price auction.',
    body: () => `
      <h2>The rules</h2>
      <p>Everyone submits a sealed bid without seeing the others. The highest bid wins, but the price is set by the <b>next-highest bid</b>, not by the winner's own.</p>
      <p><b>Example:</b> bids are $10, $8 and $5. The $10 bidder wins and pays <b>$8</b>.</p>
      <h2>Why bidding your true value is the best strategy</h2>
      <p>This feels wrong at first. Surely bidding a bit less saves money? In a Vickrey auction it doesn't, because of one fact:</p>
      <p class="callout"><b>Your bid never sets your price. It only decides whether you buy.</b> If you win, you pay the rival's bid, whatever yours was.</p>
      <p>So your bid is really an instruction: "buy if the price is below this number." Say the slot is worth $10 to you. You want to buy whenever the price is under $10 (profit) and pass whenever it's over $10 (loss). The instruction that does exactly that is: bid $10.</p>
      <h2>Try the alternatives</h2>
      <p>The slot is worth $10 to you. Here's what happens against three possible rival bids:</p>
      <div class="tbl-wrap"><table>
        <tr><th>Rival bids</th><th>Bid $10 (your true value)</th><th>Bid $8 (shade down)</th><th>Bid $13 (bid up)</th></tr>
        <tr><td class="num">$7</td><td>Win, pay $7: <b>+$3</b></td><td>Win, pay $7: +$3, <span class="muted">same</span></td><td>Win, pay $7: +$3, <span class="muted">same</span></td></tr>
        <tr><td class="num">$9</td><td>Win, pay $9: <b>+$1</b></td><td><span class="neg-v">Lose: $0, missed a profit</span></td><td>Win, pay $9: +$1, <span class="muted">same</span></td></tr>
        <tr><td class="num">$12</td><td>Lose: <b>$0</b></td><td>Lose: $0, <span class="muted">same</span></td><td><span class="neg-v">Win, pay $12: −$2</span></td></tr>
      </table></div>
      <ul>
        <li><b>Shading down never lowers your price.</b> When you still win, you pay the rival's bid either way. Its only effect is losing auctions you would have profited from.</li>
        <li><b>Bidding up never wins you anything good.</b> The only extra auctions you win are ones priced above your value, so they lose money.</li>
        <li><b>Whenever a different bid changes the outcome, it changes it for the worse.</b></li>
      </ul>
      <p>That's why a Vickrey auction is called <b>truthful</b>, and why honest bidding is a <b>dominant strategy</b>: it's the best move no matter what anyone else bids, so you don't even need to guess. The auction is named after economist William Vickrey.</p>
      <div class="widget" data-widget="truthful"></div>
      <p class="note">Trading comparison: it's like a limit order that always fills at the other side's price, never yours. The best limit is your true value. A lower limit doesn't get you a better fill, it just skips trades you wanted.</p>
      <h2>Why first-price is different</h2>
      <p>In a ${T('first-price', 'first-price auction')} your bid <i>is</i> your price, so bidding lower really does save money when you win. That's the trade-off behind ${T('bid-shading')}. In a Vickrey auction that saving doesn't exist, so shading only hurts.</p>
      <h2>Try it: both rules side by side</h2>
      <div class="widget" data-widget="playground"></div>
      <h2>Where it's used</h2>
      <ul>
        <li><b>Ad exchanges, until about 2018.</b> Exchanges, including Google's ${T('adx', 'AdX')} until 2019, sold each impression at the second-highest price. Nearly all have since moved to ${T('first-price', 'first-price')}.</li>
        <li><b>eBay.</b> Its automatic bidding raises your bid only as far as needed to beat the next bidder. The winner pays about the second-highest bid plus a small step, which works out almost the same as a Vickrey auction.</li>
        <li><b>Rarely in pure form.</b> Economists note that textbook Vickrey auctions are uncommon in practice.</li>
      </ul>
      <h2>Where it leads</h2>
      <p>A search page has several ad slots, not one. ${T('gsp')} is the version of this idea for several slots at once, and it's what Google Search uses.</p>` };
