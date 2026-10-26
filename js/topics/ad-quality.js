/* Topic: ad-quality  ·  subject: How ads are ranked  ·  registered in js/config.js */
TERMS['ad-quality'] = { name: 'Ad Quality', needs: [],
    short: 'Google\'s assessment of how good and relevant an ad is for the person seeing it.',
    body: () => `
      <h2>What it is</h2>
      <p>Ad Quality is Google's judgement of whether an ad will be a good experience for the person who sees it. Google measures it with three parts:</p>
      <div class="split three">
        <div><h3>Expected CTR</h3><p>How likely people are to click this ad for this search. Closely tied to ${T('pctr')}.</p></div>
        <div><h3>Ad relevance</h3><p>How well the ad matches the <i>intent</i> behind the search, not just its words.</p></div>
        <div><h3>Landing page experience</h3><p>How relevant and useful the page is after someone clicks.</p></div>
      </div>
      <div class="facts">
        <div><span class="v">3</span><span class="l">parts of ad quality</span></div>
        <div><span class="v">3</span><span class="l">ratings: below average, average, above average</span></div>
        <div><span class="v">1–10</span><span class="l">Quality Score scale, per keyword</span></div>
        <div><span class="v">90 days</span><span class="l">comparison window, same exact search</span></div>
      </div>

      <h2>How an ad gets picked for a search</h2>
      <p>Quality is one step in a chain that runs in milliseconds every time someone searches:</p>
      <ol class="pipe" style="--n:6">
        <li><b>Eligible</b><span>keywords, location, schedule, budget and ad policies allow it</span></li>
        <li><b>Relevant</b><span>the ad matches what the search means</span></li>
        <li><b>Predicted</b><span>expected CTR, relevance and landing page scored live</span></li>
        <li><b>Ranked</b><span>${T('ad-rank')} combines bid, quality and context</span></li>
        <li><b>Threshold</b><span>must clear a minimum, higher for the top spots</span></li>
        <li><b>Priced</b><span>pay just enough to beat the ad below (${T('gsp', 'GSP')})</span></li>
      </ol>

      <h2>The six things Google says go into Ad Rank</h2>
      <div class="tbl-wrap"><table>
        <tr><th>Factor</th><th>What it means</th></tr>
        <tr><td>Your ${T('bid')}</td><td>The most you'll pay per click. You often pay less.</td></tr>
        <tr><td>Quality of your ad and landing page</td><td>Usefulness, relevance and ease of navigation. This page.</td></tr>
        <tr><td>Ad Rank thresholds</td><td>Minimum scores needed to show at all, set partly by ad quality.</td></tr>
        <tr><td>Competitiveness of the auction</td><td>If two ads have similar Ad Ranks, they have similar chances. A big gap favors the higher one.</td></tr>
        <tr><td>Context of the search</td><td>Search terms, location, device, time, the nature of the terms, other ads and results on the page.</td></tr>
        <tr><td>Expected impact of assets</td><td>How extras like sitelinks or a phone number are expected to help the ad perform.</td></tr>
      </table></div>
      <p>The formula used across this site, Ad Rank = ${T('bid')} × ${T('pctr')} × Ad Quality, is the simplified core of this list.</p>

      <h2>Live quality vs Quality Score</h2>
      <p>This trips up a lot of people. There are two different things:</p>
      <div class="split">
        <div><h3>Auction-time quality</h3><p>Calculated <b>live, for every single auction</b>, using that exact search, device and moment. This is what actually feeds Ad Rank.</p></div>
        <div><h3>Quality Score (1–10)</h3><p>A <b>report card</b> shown to advertisers per keyword, summarizing the last 90 days. Google says plainly: "Quality Score is not an input in the ad auction."</p></div>
      </div>
      <p>Think of Quality Score as your grade average, and auction-time quality as the score on today's test. A good average suggests you'll do well, but today's test is what counts.</p>

      <h2>Part 1: Expected CTR</h2>
      <p>This is the click prediction from the ${T('pctr')} page, applied to this keyword and ad. Google compares it against other advertisers who showed for the same search.</p>
      <p>The tricky part is fairness. An ad at the top of the page gets more clicks just because it's at the top. So expected CTR tries to judge the <b>ad itself</b>, setting aside where it was shown and which extras it had. See the ${T('pctr')} page for the models used.</p>

      <h2>Part 2: Ad relevance</h2>
      <p>Does the ad answer what the person was looking for? Computers have judged this in increasingly smart ways:</p>
      <div class="tbl-wrap"><table>
        <tr><th>Method</th><th>How it works</th><th>Strength</th><th>Weakness</th></tr>
        <tr><td><b>Keyword match</b></td><td>The advertiser picks keywords. Match types control how close the search must be: exact, phrase or broad.</td><td>Simple and predictable</td><td>The advertiser has to guess every phrasing</td></tr>
        <tr><td><b>Word overlap</b></td><td>Count shared words, giving rare words more weight (methods like TF-IDF and BM25)</td><td>Fast, easy to explain</td><td>"sneakers" and "running shoes" share no words</td></tr>
        <tr><td><b>Embeddings</b></td><td>A neural network turns the search and the ad into lists of numbers that capture meaning. Similar meaning gives nearby numbers (a two-tower model).</td><td>Understands synonyms and intent. Ad vectors can be computed ahead of time.</td><td>Misses fine detail, because the search and ad are read separately</td></tr>
        <tr><td><b>Cross-encoders</b></td><td>A language model like BERT reads the search and ad <i>together</i> and scores the pair</td><td>The most accurate</td><td>Too slow to run on every ad, so it's used on a short list</td></tr>
      </table></div>
      <p>Large systems combine them: fast embeddings narrow millions of ads to hundreds, then a heavier model scores the survivors. These models learn from people's clicks and from human raters who label search and ad pairs as relevant or not. Google describes its broad match as using AI to understand the meaning of searches, not just their words.</p>
      <div class="widget" data-widget="relevance"></div>

      <h2>Part 3: Landing page experience</h2>
      <p>After the click, does the person find what the ad promised? Google's crawler, <b>AdsBot</b>, visits landing pages to check them. Google's guidance for a good landing page:</p>
      <ul>
        <li><b>Relevant, useful, original content</b> that matches the ad and the search.</li>
        <li><b>Transparency and trust:</b> clear information about the business, what it offers, and how it uses personal data.</li>
        <li><b>Easy navigation</b> on both phones and computers.</li>
        <li><b>Fast loading</b>, since people leave pages that are slow to load.</li>
      </ul>
      <p>There's also a hard floor. Google's destination requirements reject pages that are broken, return errors, or can't be crawled. A page that fails here doesn't just score low. The ad can be disapproved.</p>

      <h2>Try it: build a Quality Score</h2>
      <p>Google doesn't publish how the three ratings combine into the 1–10 score. Analysts have worked backwards from thousands of keywords and found a consistent pattern, which this builder uses.</p>
      <div class="widget" data-widget="qscore"></div>

      <h2>Why quality is in the auction at all</h2>
      <p>Without it, an advertiser could buy the top spot with a big bid on an irrelevant or spammy ad. People would stop trusting ads, and fewer would click on any of them. Quality keeps ads useful, which keeps the whole system valuable.</p>
      <p><b>Example:</b> two ads both bid $2.00 with a 3% pCTR. One has quality 1.2, the other 0.8. Their Ad Ranks are 0.072 and 0.048, so the higher-quality ad wins the top slot with the same bid.</p>
      <p><b>It changes the price too.</b> In a ${T('gsp', 'GSP')} auction your price per click is the Ad Rank of the ad below you <i>divided by</i> your own pCTR × quality. Better quality means you pay less for the same position.</p>
      <p class="sources">Sources: <a href="https://support.google.com/google-ads/answer/1722122" target="_blank" rel="noopener">Google Ads: About Ad Rank</a> · <a href="https://support.google.com/google-ads/answer/6167118" target="_blank" rel="noopener">Google Ads: About Quality Score</a> · <a href="https://support.google.com/google-ads/answer/2404197" target="_blank" rel="noopener">Google Ads: landing page experience</a> · <a href="https://support.google.com/adspolicy/answer/6368661" target="_blank" rel="noopener">Google Ads policy: destination requirements</a> · <a href="https://adalysis.com/quality-score/" target="_blank" rel="noopener">Adalysis: Quality Score analysis</a> · <a href="https://arxiv.org/abs/1810.04805" target="_blank" rel="noopener">BERT (2018)</a></p>` };

/* Check-yourself questions shown at the end of the page */
CHECKS['ad-quality'] = [
    { q: 'Is the 1–10 Quality Score you see in your account used in the auction?', opts: ['Yes, it multiplies your bid', 'No, the auction uses live quality measurements', 'Only for the top ad slot'], a: 1,
      why: 'Google says Quality Score is a diagnostic and "not an input in the ad auction". The auction calculates quality live for each search.' },
    { q: 'A search for "sneakers on sale" and an ad for "discount running shoes" share no words. Which method can still tell they match?', opts: ['Word overlap (BM25)', 'Embeddings', 'Exact match keywords'], a: 1,
      why: 'Embeddings capture meaning, so "sneakers" sits near "running shoes" and "on sale" near "discount".' },
    { q: 'In the reverse-engineered Quality Score formula, which parts weigh the most?', opts: ['Ad relevance', 'Expected CTR and landing page experience', 'All three equally'], a: 1,
      why: 'Analysts found about 39% each for expected CTR and landing page experience, and 22% for ad relevance.' }];
