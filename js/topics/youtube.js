/* Topic: youtube  ·  subject: Where ads appear  ·  registered in js/config.js */
TERMS['youtube'] = { name: 'YouTube ads', needs: [],
    short: 'Video ads shown before, during or alongside YouTube videos.',
    body: () => `
      <h2>What they are</h2>
      <p>Ads served on YouTube. The best known are video ads that play before or during a video. Common formats include:</p>
      <ul>
        <li><b>Skippable in-stream:</b> the viewer can skip after 5 seconds.</li>
        <li><b>Non-skippable in-stream:</b> short ads that must be watched.</li>
        <li><b>Bumper ads:</b> 6-second non-skippable ads.</li>
      </ul>
      <h2>How they're sold</h2>
      <p>Like ${T('display', 'Display')}, there's no search query. The ad is matched to the viewer and the video. But YouTube is <b>not</b> sold like the rest of display:</p>
      <ul>
        <li><b>Not on AdX.</b> Google pulled YouTube ads out of its ${T('adx', 'Ad Exchange')} in 2015. YouTube ads are bought through Google Ads, Display &amp; Video 360, or Google's sales team.</li>
        <li><b>Second-price style.</b> When you bid per view in Google Ads, Google says you pay no more than what's needed to rank above the advertiser just below you. That's the same idea as ${T('gsp', 'GSP')}, not ${T('first-price', 'first-price')}.</li>
      </ul>
      <p class="note">Correction: an earlier version of this site said YouTube had shifted to first-price auctions. Google's own documentation describes second-price style pricing for YouTube ads bought in Google Ads.</p>` };
