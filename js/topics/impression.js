/* Topic: impression  ·  subject: Where ads appear  ·  registered in js/config.js */
TERMS['impression'] = { name: 'Impression', needs: [],
    short: 'One showing of an ad to one person.',
    body: () => `
      <h2>What it is</h2>
      <p>An impression is counted every time an ad is shown: once on a search results page, once on a website, once before a YouTube video. It's the most basic unit in advertising. Every other number is measured against it.</p>
      <p>An impression only means the ad was <i>shown</i>. It doesn't mean the person looked at it, clicked it or bought anything.</p>
      <h2>Why it matters</h2>
      <ul>
        <li><b>Click rate is measured per impression.</b> ${T('pctr', 'CTR')} = clicks ÷ impressions.</li>
        <li><b>Some ads are paid per impression.</b> With ${T('cpm')} pricing the advertiser pays for every 1,000 impressions.</li>
        <li><b>Different bids are compared per impression.</b> ${T('ecpm')} converts any bid into value per 1,000 impressions so they can be ranked against each other.</li>
        <li><b>Each impression is its own auction.</b> On an exchange like ${T('adx', 'AdX')}, every single impression is sold separately in real time.</li>
      </ul>
      <h2>Example</h2>
      <p>An ad is shown 2,000 times and gets 40 clicks. That's 2,000 impressions and a 2% click-through rate (40 ÷ 2,000).</p>` };
