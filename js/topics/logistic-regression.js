/* Topic: logistic-regression  ·  subject: Machine learning in ads  ·  registered in js/config.js */
TERMS['logistic-regression'] = { name: 'Logistic regression for clicks', needs: ['pctr'],
    short: 'The classic machine-learning model for predicting clicks: add up weighted facts about an impression, squash the total into a probability, and learn the weights from past impressions.',
    body: () => `
      <h2>The job</h2>
      <p>Every time an ad could be shown, the system needs a number: the chance this person clicks this ad, here, right now. That's the ${T('pctr')}, and it feeds straight into ${T('ad-rank')} and the price. Nobody can write that number down by hand for billions of situations, so a model <b>learns</b> it from what happened before.</p>
      <p>Logistic regression is the simplest model that does this well. Google's search ads ran on a giant version of it for years. Every modern click model is built on the same ideas, so understanding this one means understanding the core of all of them.</p>
      <div class="facts">
        <div><span class="v">1</span><span class="l">number out: a probability between 0% and 100%</span></div>
        <div><span class="v">1</span><span class="l">weight per feature, learned from data</span></div>
        <div><span class="v">3</span><span class="l">ideas: a weighted sum, a squash, a nudge</span></div>
        <div><span class="v">2013</span><span class="l">Google's paper on running it for search ads</span></div>
      </div>

      <h2>The training data</h2>
      <p>The model learns from <b>logged impressions</b>: every time an ad was shown, the system wrote down the situation and whether a click followed. Here are six, using four simple facts about each impression:</p>
      <div class="tbl-wrap"><table>
        <tr><th>Impression</th><th>Search matches the ad</th><th>Top of page</th><th>On a phone</th><th>Clicked this advertiser before</th><th>Clicked?</th></tr>
        <tr><td>1</td><td>yes</td><td>yes</td><td>no</td><td>no</td><td><b>yes</b></td></tr>
        <tr><td>2</td><td>yes</td><td>no</td><td>yes</td><td>no</td><td>no</td></tr>
        <tr><td>3</td><td>no</td><td>yes</td><td>yes</td><td>no</td><td>no</td></tr>
        <tr><td>4</td><td>yes</td><td>yes</td><td>yes</td><td>yes</td><td><b>yes</b></td></tr>
        <tr><td>5</td><td>no</td><td>no</td><td>no</td><td>no</td><td>no</td></tr>
        <tr><td>6</td><td>yes</td><td>no</td><td>no</td><td>yes</td><td>no</td></tr>
      </table></div>
      <p>The facts are called <b>features</b>. The clicked column is the <b>label</b>: the answer the model is trying to learn to predict. A real system has billions of rows and millions of features, but the algorithm is exactly the same.</p>

      <h2>Step 1: Turn the situation into numbers</h2>
      <p>Models only work with numbers, so each yes becomes 1 and each no becomes 0. Impression 1 becomes:</p>
      <div class="formula">x = [ match 1, top 1, phone 0, past click 0 ]&nbsp;&nbsp;&nbsp;label y = 1</div>
      <p>For facts with many possible values, like which advertiser or which word, each value gets its own on/off feature. That's how real models end up with millions of features, nearly all of them 0 for any one impression.</p>

      <h2>Step 2: Add up a score</h2>
      <p>The model keeps one <b>weight</b> per feature, plus a starting value called the <b>bias</b>. A positive weight means "this makes a click more likely". A negative weight means less likely. The score is a weighted sum:</p>
      <div class="formula">score = bias + w<sub>match</sub>·x<sub>match</sub> + w<sub>top</sub>·x<sub>top</sub> + w<sub>phone</sub>·x<sub>phone</sub> + w<sub>past</sub>·x<sub>past</sub></div>
      <p>Suppose the model has learned bias −3.2, match +1.8, top +0.9, phone −0.3 and past click +1.4. For impression 1, only match and top are switched on:</p>
      <div class="formula">score = −3.2 + 1.8 + 0.9 = −0.5</div>

      <h2>Step 3: Squash the score into a probability</h2>
      <p>A score can be any number, but a probability must sit between 0 and 1. The <b>sigmoid</b> (logistic) function does the squashing, and it's where the model gets its name:</p>
      <div class="formula">probability = 1 ÷ (1 + e<sup>−score</sup>)</div>
      <div class="tbl-wrap"><table>
        <tr><th class="num">Score</th><th class="num">−4</th><th class="num">−2</th><th class="num">−0.5</th><th class="num">0</th><th class="num">2</th><th class="num">4</th></tr>
        <tr><td>Probability</td><td class="num">1.8%</td><td class="num">11.9%</td><td class="num">37.8%</td><td class="num">50%</td><td class="num">88.1%</td><td class="num">98.2%</td></tr>
      </table></div>
      <p>So impression 1's score of −0.5 means a predicted click chance of <b>37.8%</b>. Big negative scores approach 0%, big positive ones approach 100%, and a score of 0 means a coin flip. The "Build a pCTR" demo on the ${T('pctr')} page lets you move along this curve.</p>

      <h2>Step 4: Measure how wrong it is</h2>
      <p>To learn, the model needs a single number for "how bad were my predictions". The standard choice is <b>log loss</b>:</p>
      <div class="formula">loss = −[ y · ln(p) + (1 − y) · ln(1 − p) ]</div>
      <p>It looks scary, but it only ever does one of two things. If a click happened (y = 1), the loss is −ln(p). If not, it's −ln(1 − p). In plain terms:</p>
      <div class="tbl-wrap"><table>
        <tr><th>The model said</th><th>What happened</th><th class="num">Loss</th><th>In words</th></tr>
        <tr><td>90% click</td><td>Clicked</td><td class="num">0.11</td><td>Confident and right: tiny penalty</td></tr>
        <tr><td>50% click</td><td>Either way</td><td class="num">0.69</td><td>A shrug: medium penalty</td></tr>
        <tr><td>90% click</td><td>No click</td><td class="num">2.30</td><td>Confident and wrong: big penalty</td></tr>
        <tr><td>10% click</td><td>No click</td><td class="num">0.11</td><td>Confident and right: tiny penalty</td></tr>
      </table></div>
      <p>Averaging this over every impression gives one number for the whole model. Training means finding the weights that make that average as small as possible. Log loss also rewards <b>honest probabilities</b>, not just the right order, which is exactly what ad pricing needs.</p>

      <h2>Step 5: Learn by nudging the weights</h2>
      <p>The model starts knowing nothing, with every weight at 0. Then it repeats one simple move, called <b>gradient descent</b>:</p>
      <ol>
        <li>Predict a probability <b>p</b> for an impression.</li>
        <li>Compare it with what happened: <b>error = p − y</b>. Positive means it guessed too high, negative means too low.</li>
        <li>Nudge every weight whose feature was switched on, against the error:</li>
      </ol>
      <div class="formula">new weight = old weight − learning rate × error × feature value</div>
      <p>Features that were 0 don't move, because they didn't contribute. The <b>learning rate</b> sets how big each nudge is. This rule comes from calculus (it's the slope of the log loss), but it happens to be very simple: the nudge is just the error times the input.</p>
      <h2>One update, by hand</h2>
      <p>Start with all weights at 0 and a learning rate of 0.5.</p>
      <ul>
        <li><b>Impression 2</b> (match 1, phone 1, no click). The score is 0, so p = 50%. Error = 0.5 − 0 = <b>+0.5</b>: it guessed too high. Each switched-on weight moves by −0.5 × 0.5 = −0.25, so bias, match and phone become <b>−0.25</b>. Top and past click don't move.</li>
        <li><b>Impression 4</b> (all four on, clicked). The score is now −0.25 − 0.25 − 0.25 = −0.75, so p = 32.1%. Error = 0.321 − 1 = <b>−0.679</b>: it guessed too low. Every weight moves up by 0.5 × 0.679 = 0.34. Bias, match and phone become <b>+0.09</b>, and top and past click become <b>+0.34</b>.</li>
      </ul>
      <p>Notice what already happened. Top and past click, which only appeared in the click, ended at +0.34. Match and phone, which also appeared in the non-click, ended at just +0.09. Repeat this over millions of impressions and the weights settle where the predictions match reality. In practice the nudges are averaged over many impressions at a time, which is smoother.</p>

      <h2>Train one yourself</h2>
      <p>Below is a real logistic regression, trained in your browser on 2,000 simulated impressions. The data was generated from hidden "true" weights the model never sees. Watch the loss fall and the learned weights find their way to the true ones.</p>
      <div class="widget" data-widget="lrtrain"></div>

      <h2>Step 6: Check it on new data</h2>
      <p>A model can memorize its training data and still fail on new impressions, so it's always judged on data it never trained on. The demo keeps 1,000 impressions aside for this. Three checks matter most:</p>
      <ul>
        <li><b>Log loss on new data:</b> should be close to the training loss. A big gap means memorizing instead of learning.</li>
        <li><b>AUC:</b> the chance that a random clicked impression scores higher than a random non-clicked one. 0.5 is guessing and 1.0 is perfect.</li>
        <li><b>Calibration:</b> the average predicted click rate should match the actual click rate. If the model says 8% on average, about 8% should click.</li>
      </ul>
      <p>Then comes the real test: an online A/B test on live traffic.</p>

      <h2>From toy to Google scale</h2>
      <p>The algorithm above is the real thing. Google's 2013 paper "Ad Click Prediction: a View from the Trenches" describes how they ran it for search ads at enormous scale. The main changes:</p>
      <div class="tbl-wrap"><table>
        <tr><th>Problem at scale</th><th>What they did</th></tr>
        <tr><td>Billions of possible features</td><td>Hash feature values into a fixed-size table, and keep only the weights that matter</td></tr>
        <tr><td>Most weights should be exactly zero</td><td>FTRL-Proximal, a learning method that pushes useless weights to exactly 0 and saves memory</td></tr>
        <tr><td>Common features need small nudges, rare ones big nudges</td><td>A separate learning rate for every feature, shrinking as that feature is seen more</td></tr>
        <tr><td>Data never stops arriving</td><td>Online learning: update the weights continuously as new clicks come in, instead of retraining from scratch</td></tr>
      </table></div>
      <p>Logistic regression can't spot combinations on its own, such as "this advertiser does well on phones". You have to add those as extra features by hand. That limitation is why the field moved to models that learn combinations themselves: factorization machines, Wide &amp; Deep, Deep &amp; Cross Networks and more. The timeline is on the ${T('pctr')} page.</p>

      <h2>The whole algorithm in code</h2>
      <p>Everything above, in about fifteen lines:</p>
<pre class="code">weights = [0, 0, 0, 0]          <span class="c"># one per feature: match, top, phone, past</span>
bias = 0
learning_rate = 1.0

for step in range(500):
    grad_w = [0, 0, 0, 0]
    grad_b = 0
    for x, clicked in impressions:                       <span class="c"># x is like [1, 1, 0, 0]</span>
        score = bias + sum(w * xi for w, xi in zip(weights, x))
        p = 1 / (1 + exp(-score))                         <span class="c"># Step 3: squash</span>
        error = p - clicked                               <span class="c"># Step 5: too high or too low?</span>
        grad_b += error
        grad_w = [g + error * xi for g, xi in zip(grad_w, x)]
    n = len(impressions)
    bias -= learning_rate * grad_b / n                    <span class="c"># nudge, averaged over all</span>
    weights = [w - learning_rate * g / n for w, g in zip(weights, grad_w)]</pre>
      <p class="sources">Further reading: <a href="https://research.google/pubs/ad-click-prediction-a-view-from-the-trenches/" target="_blank" rel="noopener">Google: Ad Click Prediction, a View from the Trenches (2013)</a> · <a href="https://ai.meta.com/research/publications/practical-lessons-from-predicting-clicks-on-ads-at-facebook/" target="_blank" rel="noopener">Facebook: Practical Lessons from Predicting Clicks on Ads (2014)</a></p>` };

/* Check-yourself questions shown at the end of the page */
CHECKS['logistic-regression'] = [
  { q: 'A model has bias −2 and a single feature with weight +2. The feature is switched on. What click probability does it predict?', opts: ['0%', '50%', '100%'], a: 1,
    why: 'Score = −2 + 2 = 0, and the sigmoid of 0 is exactly 50%.' },
  { q: 'The model predicted 90% and the person did not click. What does gradient descent do to the weights of the features that were on?', opts: ['Raises them', 'Lowers them', 'Leaves them alone'], a: 1,
    why: 'Error = 0.9 − 0 = +0.9, so each switched-on weight moves by −learning rate × 0.9: down.' },
  { q: 'Why is a model judged on impressions it never trained on?', opts: ['It is faster', 'To catch memorizing instead of learning', 'Training data has no labels'], a: 1,
    why: 'A model can fit its training data well and still fail on new data. Held-out data shows how it will really do.' }
];
