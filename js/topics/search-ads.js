/* Topic: search-ads  ·  subject: Where ads appear  ·  registered in js/config.js */
TERMS['search-ads'] = { name: 'Search ads', needs: [],
    short: 'Ads shown on Google Search results pages, triggered by what the person typed.',
    body: () => `
      <h2>What they are</h2>
      <p>Search ads appear above and below the regular results on Google Search, marked as sponsored. Advertisers choose keywords they want to show up for, and when a search matches, their ad enters the auction.</p>
      <h2>Why they're special</h2>
      <p>The person typed exactly what they're looking for. A search for "running shoes size 10" says a lot more about intent than a page visit does. That makes search ads very valuable and easy to judge: the system can compare the ad's text with the query directly.</p>
      <h2>How they're sold</h2>
      <ul>
        <li>A results page has <b>several ad slots</b>, so the auction has to fill positions 1, 2, 3 and so on in one go.</li>
        <li>Google Search uses a ${T('gsp', 'Generalized Second-Price (GSP)')} style auction. Google's own help pages say you pay only what's needed to clear the Ad Rank threshold and beat the ad directly below you.</li>
        <li>Ads are ordered by ${T('ad-rank')}, not by ${T('bid')} alone.</li>
        <li>They're usually paid per click (${T('cpc')}).</li>
      </ul>
      <h2>Compared with other surfaces</h2>
      <div class="tbl-wrap"><table>
        <tr><th>Surface</th><th>What triggers the ad</th><th>How the price is set</th></tr>
        <tr><td>Search ads</td><td>The search query</td><td>GSP: just enough to beat the ad below</td></tr>
        <tr><td>${T('display', 'Display ads')} on exchanges</td><td>A page or app being viewed</td><td>First-Price: you pay your bid</td></tr>
        <tr><td>${T('youtube', 'YouTube ads')} in Google Ads</td><td>A video being watched</td><td>Second-price style: just enough to beat the ad below</td></tr>
      </table></div>` };
