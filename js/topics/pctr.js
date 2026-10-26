/* Topic: pctr  ·  subject: How ads are ranked  ·  registered in js/config.js */
TERMS['pctr'] = { name: 'pCTR', needs: ['impression'],
    short: 'Predicted Click-Through Rate: a model\'s estimate of the chance that a person clicks this ad if it\'s shown.',
    body: () => `
      <h2>CTR first</h2>
      <p><b>CTR</b> (click-through rate) is measured after the fact: clicks ÷ ${T('impression', 'impressions')}. 3 clicks out of 100 impressions is a 3% CTR.</p>
      <h2>Then pCTR</h2>
      <p><b>pCTR</b> is the <i>predicted</i> CTR, estimated <b>before</b> the ad is shown, for this specific person, search and ad. Google can't wait to see whether someone clicks. It has to decide which ad to show in milliseconds, so it uses a machine-learning model that predicts the click rate from signals such as the query, the ad's text, the device and how similar ads have done before.</p>
      <p>A pCTR of 2% means the model expects about 2 clicks per 100 showings in this situation.</p>
      <h2>Where it's used</h2>
      <ul>
        <li><b>Ranking:</b> it's a factor in ${T('ad-rank')}, so a high bid on an ad nobody clicks can't win.</li>
        <li><b>Comparing bids:</b> it turns a per-click bid into ${T('expected-value', 'expected value')} per impression, which is what ${T('ecpm')} measures.</li>
        <li><b>Pricing:</b> in ${T('gsp', 'GSP')}, your pCTR is part of the formula for what you pay.</li>
      </ul>
      <h2>Why accuracy matters so much</h2>
      <p>Because pCTR is <i>multiplied</i> by the bid, an error goes straight into the ranking and the price. If the model says 4% but the true rate is 2%, the ad's Ad Rank and eCPM are twice what they should be. It wins auctions it shouldn't, and the platform earns less than expected. Predictions need to match reality on average, not just put ads in the right order.</p>

      <h2>How pCTR is predicted</h2>
      <p>Predicting a click is a <b>yes-or-no question</b>: will this person click this ad, here, now? Machine learning calls this binary classification. The model outputs a probability between 0 and 1, and that probability is the pCTR.</p>
      <ol class="pipe">
        <li><b>Logged impressions</b><span>billions of past showings, each labeled clicked or not</span></li>
        <li><b>Features</b><span>facts about the query, ad, person and context</span></li>
        <li><b>Model</b><span>learns which combinations lead to clicks</span></li>
        <li><b>Calibration</b><span>adjusts scores so 2% really means 2%</span></li>
        <li><b>pCTR</b><span>feeds ${T('ad-rank')} and ${T('ecpm')}</span></li>
      </ol>
      <h2>What the model looks at</h2>
      <div class="tbl-wrap"><table>
        <tr><th>About</th><th>Example features</th></tr>
        <tr><td>The search or page</td><td>The query's words, the page topic, the language</td></tr>
        <tr><td>The ad</td><td>Its text, the advertiser, the ad's own past click rate, how well it matches the query</td></tr>
        <tr><td>The person</td><td>Device, rough location, time of day, past interactions (where privacy rules allow)</td></tr>
        <tr><td>The placement</td><td>Position on the page and the ad format</td></tr>
      </table></div>
      <p>Most of these are <b>IDs</b>: which advertiser, which word, which website. There are millions of possible values, so models turn each ID into a short list of numbers called an <b>embedding</b>, and learn those numbers from data.</p>

      <h2>Try it: a tiny pCTR model</h2>
      <p>The simplest serious model is <b>logistic regression</b>. Each feature adds or subtracts points from a score, and a squashing function turns the score into a probability. Google's search ads ran on a giant version of this for years.</p>
      <div class="widget" data-widget="pctr"></div>

      <h2>The models used in industry</h2>
      <p>The field moved from simple linear models to deep neural networks. Each step was published by a company that runs ads or recommendations at huge scale:</p>
      <div class="tbl-wrap"><table>
        <tr><th>Year</th><th>Model</th><th>From</th><th>The big idea</th></tr>
        <tr><td class="num">2010</td><td>Factorization Machines</td><td>Steffen Rendle</td><td>Learn how <i>pairs</i> of features interact, such as "this advertiser × mobile", even for pairs rarely seen together</td></tr>
        <tr><td class="num">2013</td><td>Logistic regression with FTRL</td><td>Google</td><td>One enormous, mostly-zero linear model, updated continuously as new clicks arrive</td></tr>
        <tr><td class="num">2014</td><td>Boosted trees + logistic regression</td><td>Facebook</td><td>Decision trees build feature combinations, then a linear model scores them. Found that good features matter more than the model</td></tr>
        <tr><td class="num">2016</td><td>Field-aware FM</td><td>National Taiwan University</td><td>A sharper factorization machine that won the Criteo and Avazu click-prediction contests on Kaggle</td></tr>
        <tr><td class="num">2016</td><td>Wide &amp; Deep</td><td>Google</td><td>A linear part that <i>memorizes</i> known patterns plus a neural part that <i>generalizes</i> to new ones</td></tr>
        <tr><td class="num">2017</td><td>DeepFM</td><td>Huawei</td><td>A factorization machine and a neural network side by side, with no hand-built feature combinations</td></tr>
        <tr><td class="num">2017</td><td>Deep &amp; Cross Network</td><td>Google</td><td>Special "cross" layers that build feature combinations automatically. DCN-V2 (2020) improved it for production</td></tr>
        <tr><td class="num">2018</td><td>Deep Interest Network</td><td>Alibaba</td><td>Attention: weigh the person's past clicks by how relevant each one is to <i>this</i> ad</td></tr>
        <tr><td class="num">2019</td><td>DLRM</td><td>Facebook</td><td>Embeddings for every ID plus small neural networks. Released as an open reference design</td></tr>
        <tr><td class="num">2022</td><td>"On the Factory Floor"</td><td>Google</td><td>Not a new model. A rare look at the engineering behind Google's production ads click models</td></tr>
      </table></div>
      <p>Today's systems are deep networks with huge embedding tables, increasingly using sequences of a person's past behavior and transformer-style attention. Many predict several things at once from one model: click, conversion, and more.</p>
      <p class="note">Click prediction is a recommendation problem: which item will this person engage with? The same model families power product and video recommendations.</p>

      <h2>The hard parts</h2>
      <ul>
        <li><b>Position bias.</b> Ads at the top get more clicks just for being at the top. Models learn position as a separate feature, so pCTR reflects the ad itself, not where it happened to be shown.</li>
        <li><b>Clicks are rare.</b> Most impressions get no click, so the model sees few positive examples. Teams often downsample the no-clicks during training, then correct the probabilities afterward.</li>
        <li><b>Calibration.</b> Raw model scores drift. A final step, such as isotonic regression or Platt scaling, maps scores back onto real click rates.</li>
        <li><b>New ads (cold start).</b> A brand-new ad has no click history. The model leans on what it knows about similar ads and advertisers until data comes in.</li>
        <li><b>Freshness.</b> Trends and campaigns change by the hour, so models are retrained or updated continuously.</li>
        <li><b>Speed.</b> Predictions happen inside an auction that takes milliseconds, often for hundreds of candidate ads. The heaviest models run only on a short list.</li>
      </ul>

      <h2>How a model is judged</h2>
      <div class="tbl-wrap"><table>
        <tr><th>Measure</th><th>What it checks</th></tr>
        <tr><td>AUC</td><td>Ranking: does the model score clicked impressions above non-clicked ones?</td></tr>
        <tr><td>Log loss</td><td>Accuracy of the probabilities themselves, punishing confident mistakes</td></tr>
        <tr><td>Calibration ratio</td><td>Predicted clicks ÷ actual clicks. Should be close to 1.0</td></tr>
        <tr><td>Online A/B test</td><td>The final word: does the new model improve clicks, revenue and user experience on live traffic?</td></tr>
      </table></div>
      <p class="sources">Papers: <a href="https://research.google/pubs/ad-click-prediction-a-view-from-the-trenches/" target="_blank" rel="noopener">Google: Ad Click Prediction (2013)</a> · <a href="https://ai.meta.com/research/publications/practical-lessons-from-predicting-clicks-on-ads-at-facebook/" target="_blank" rel="noopener">Facebook: Practical Lessons (2014)</a> · <a href="https://arxiv.org/abs/1606.07792" target="_blank" rel="noopener">Wide &amp; Deep</a> · <a href="https://arxiv.org/abs/1703.04247" target="_blank" rel="noopener">DeepFM</a> · <a href="https://arxiv.org/abs/1708.05123" target="_blank" rel="noopener">DCN</a> · <a href="https://arxiv.org/abs/2008.13535" target="_blank" rel="noopener">DCN-V2</a> · <a href="https://arxiv.org/abs/1706.06978" target="_blank" rel="noopener">Deep Interest Network</a> · <a href="https://arxiv.org/abs/1906.00091" target="_blank" rel="noopener">DLRM</a> · <a href="https://arxiv.org/abs/2209.05310" target="_blank" rel="noopener">On the Factory Floor</a></p>` };
