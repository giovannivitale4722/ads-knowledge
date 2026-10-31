/* Notes shown under a group of projects on the Implementations page, keyed by group id
   (see IMPL_GROUPS in impl.js). Each is a function so ${T()} links resolve at render time. */
const IMPL_NOTES = {
  autobidding: () => `
    <h2>What my simulations leave out</h2>
    <p>Each project simulates one day well enough to show how the strategy works, but real autobidding is harder in every one of these ways:</p>
    <div class="tbl-wrap"><table>
      <tr><th>In my code</th><th>In production</th></tr>
      <tr><td>A conversion and its sales value arrive instantly, in the same auction</td><td>They arrive hours, days or weeks later, and some are refunded afterwards. See the delay problem below</td></tr>
      <tr><td>pConv and order value predictions are unbiased</td><td>Models are trained on past data, drift as behavior changes, and can be systematically too high or too low</td></tr>
      <tr><td>Competitors' bids are fixed in advance</td><td>Competitors are autobidders too, reacting to each other. See ${T('everyone-autobids', 'when everyone autobids')}</td></tr>
      <tr><td>One ad slot, second-price</td><td>Search ranks several ads (${T('gsp', 'GSP')}), and many exchanges are ${T('first-price', 'first-price')}, which needs ${T('bid-shading', 'bid shading')}</td></tr>
      <tr><td>One day, starting from α = 1</td><td>Multipliers carry over from day to day, and a new strategy goes through a learning period</td></tr>
      <tr><td>The traffic forecast is exact, and the step size is picked by hand</td><td>Forecasts miss holidays and news events, and controllers are tuned against historical data</td></tr>
      <tr><td>A single goal per project</td><td>Most campaigns combine a target with a daily budget</td></tr>
    </table></div>

    <h2>How Google learns about a sale</h2>
    <p>The ad runs on Google, but the purchase happens on the advertiser's own website. Google only knows about a sale if the advertiser reports it. That's <b>conversion tracking</b>:</p>
    <ol class="pipe" style="--n:3">
      <li><b>Click</b><span>Google adds a click ID (GCLID) to the landing page, and a cookie remembers the click</span></li>
      <li><b>Purchase</b><span>a Google tag on the order page records a conversion, with the order's value</span></li>
      <li><b>Match</b><span>the click ID ties the sale back to the ad, auction and campaign</span></li>
    </ol>
    <div class="tbl-wrap"><table>
      <tr><th>Way a conversion reaches Google</th><th>When it's used</th><th>Source</th></tr>
      <tr><td><b>Google tag</b> on the website</td><td>Online purchases and sign-ups. Phone calls and app installs can be recorded without a tag</td><td><span class="conf hi">Google's docs</span></td></tr>
      <tr><td><b>Offline conversion import</b></td><td>Sales that happen elsewhere, like in a store or over the phone, uploaded with their click ID (it must be under 90 days old). Processing takes 24 to 48 hours</td><td><span class="conf hi">Google's docs</span></td></tr>
      <tr><td><b>Enhanced conversions</b></td><td>The tag also sends a SHA-256 hash of the customer's email, matched to signed-in Google accounts. Recovers conversions that cookies miss</td><td><span class="conf hi">Google's docs</span></td></tr>
      <tr><td><b>Conversion adjustments</b></td><td>Retract a conversion or restate its value, for refunds and changed orders. Only adjustments within 7 days count for autobidding</td><td><span class="conf hi">Google's docs</span></td></tr>
    </table></div>
    <p>So the <code>sales</code> value my <code>observe()</code> receives straight from the auction really arrives later, through one of these channels, and not always complete.</p>

    <h2>The delay problem</h2>
    <p>Someone clicks on Monday and buys on Thursday. Conversions can be reported up to 90 days after the click. The conversion window, how long after a click a sale still counts, defaults to 30 days and can be set from 1 to 90.</p>
    <p>Spend is known immediately, but conversions trickle in. So the most recent days always look worse than they really are: a CPA that looks too high, a ROAS that looks too low. A controller like mine would read that as "falling short" and cut bids for no reason, every single day.</p>
    <div class="tbl-wrap"><table>
      <tr><th>Yesterday</th><th class="num">Spend</th><th class="num">Sales</th><th class="num">ROAS</th></tr>
      <tr><td>Reported so far</td><td class="num">$1,000</td><td class="num">$1,800</td><td class="num">180%: looks far below a 300% target</td></tr>
      <tr><td>Estimated final, if 60% of sales usually arrive within a day</td><td class="num">$1,000</td><td class="num">$1,800 ÷ 0.6 = $3,000</td><td class="num">300%: on target</td></tr>
    </table></div>
    <p>How it's dealt with in practice:</p>
    <div class="tbl-wrap"><table>
      <tr><th>Practice</th><th>What it does</th><th>Source</th></tr>
      <tr><td><b>Predict the conversions still to come</b></td><td>Google's bid strategy report shows how many more conversions it expects for recent days, based on the account's usual delay</td><td><span class="conf hi">Google's docs</span></td></tr>
      <tr><td><b>Judge results over full cycles</b></td><td>Evaluate over a period covering at least 2 full conversion cycles, the typical time from click to conversion, because recent performance looks weaker than it is</td><td><span class="conf hi">Google's docs</span></td></tr>
      <tr><td><b>Expect changes to take time</b></td><td>The bidder reacts to a new target right away, but hitting it can take 1 to 2 conversion cycles, because the conversions arrive late</td><td><span class="conf hi">Google's docs</span></td></tr>
      <tr><td><b>Lean on predictions, not just feedback</b></td><td>The per-auction part of the bid (pConv × value) comes from models trained on older, complete data. Only the feedback loop on α needs fresh, still-incomplete numbers, so it should react slowly</td><td><span class="conf">How my projects are built</span></td></tr>
    </table></div>
    <p><b>Trying it in my simulations:</b> give each sale a random delay so it lands some windows later, watch the controller cut α by mistake, then fix it by dividing recent sales by the share that's usually arrived by then.</p>
    <p class="sources">Sources: <a href="https://support.google.com/google-ads/answer/1722022" target="_blank" rel="noopener">About conversion measurement</a> · <a href="https://support.google.com/google-ads/answer/9888656" target="_blank" rel="noopener">About enhanced conversions</a> · <a href="https://support.google.com/google-ads/answer/7686280" target="_blank" rel="noopener">How to adjust your conversions</a> · <a href="https://support.google.com/google-ads/answer/3123169" target="_blank" rel="noopener">About conversion windows</a> · <a href="https://support.google.com/google-ads/answer/12076786" target="_blank" rel="noopener">Performance fluctuations: conversion delay</a> · <a href="https://support.google.com/google-ads/answer/6239119" target="_blank" rel="noopener">How long it takes customers to convert</a> · <a href="https://support.google.com/google-ads/answer/6268633" target="_blank" rel="noopener">Tips on measuring Smart Bidding performance</a> · <a href="https://support.google.com/google-ads/answer/10433846" target="_blank" rel="noopener">Target adjustments with Search Smart Bidding</a> (all Google Ads Help)</p>`
};
