/* Topic: cpm  ·  subject: What advertisers pay  ·  registered in js/config.js */
TERMS['cpm'] = { name: 'CPM', needs: ['bid', 'impression'],
    short: 'Cost Per Mille: the advertiser pays per 1,000 impressions, whether or not anyone clicks.',
    body: () => `
      <h2>What it is</h2>
      <p>"Mille" is Latin for thousand. With CPM pricing the advertiser pays for every 1,000 ${T('impression', 'impressions')}, whether or not anyone clicks. It's common for ${T('display', 'display')} and ${T('youtube', 'video')} campaigns where being seen is the goal.</p>
      <h2>Who carries the risk</h2>
      <p>The opposite of ${T('cpc')}: the platform gets paid for every showing, and the advertiser takes the risk that nobody clicks.</p>
      <h2>Comparing it with CPC</h2>
      <p>A CPM bid is already priced per 1,000 impressions, so it can be compared directly with the ${T('ecpm')} of a CPC bid.</p>
      <h2>Example</h2>
      <p>A $25 CPM campaign that gets 40,000 impressions costs 40 × $25 = $1,000.</p>` };
