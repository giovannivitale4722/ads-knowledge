/* Topic: matrix-factorization  ·  subject: Implementations  ·  registered in js/config.js
   The visual walkthrough for algorithm 2 in implementations/movie-recommender (recsys/mf.py). */
TERMS['matrix-factorization'] = { name: 'Matrix factorization (implicit ALS)', needs: ['item-cf'],
    short: 'The second recommendation algorithm: learn a short vector of numbers for every person and every movie, so that their dot product predicts who watches what.',
    body: () => `
      <h2>What you're building</h2>
      <p>${T('item-cf', 'Item-based collaborative filtering')} describes each movie by its whole column: 943 numbers, one per person, almost all of them zero. Matrix factorization replaces that with something much smaller that it <b>learns</b>: a vector of 32 numbers for every person and every movie.</p>
      <p class="callout"><b>The whole model is one dot product.</b> How much you'll like a movie = your vector · the movie's vector. Training picks all the vectors so those dot products reproduce who watched what.</p>
      <ol class="pipe" style="--n:4">
        <li><b>Start random</b><span>a tiny random vector for every person and movie</span></li>
        <li><b>Solve people</b><span>hold movies fixed, find each person's best vector exactly</span></li>
        <li><b>Solve movies</b><span>hold people fixed, the same for each movie</span></li>
        <li><b>Repeat</b><span>10 rounds, then score with dot products</span></li>
      </ol>
      <div class="facts">
        <div><span class="v">32</span><span class="l">numbers per person and per movie</span></div>
        <div><span class="v">10</span><span class="l">rounds of training</span></div>
        <div><span class="v">9.8%</span><span class="l">hit rate, against 5.9% for item-based CF</span></div>
        <div><span class="v">3</span><span class="l">functions you write in Python</span></div>
      </div>

      <h2>Step 1: Taste as a vector</h2>
      <p>Imagine describing every movie with just two numbers: how animated it is, and how action-packed. And every person with two numbers: how much they like animation, and how much they like action.</p>
      <div class="tbl-wrap"><table>
        <tr><th></th><th class="num">Animation</th><th class="num">Action</th></tr>
        <tr><td>Toy Story</td><td class="num">0.9</td><td class="num">0.1</td></tr>
        <tr><td>Terminator</td><td class="num">0.0</td><td class="num">0.9</td></tr>
        <tr><td>You (love animation, so-so on action)</td><td class="num">1.0</td><td class="num">0.3</td></tr>
      </table></div>
      <p>Your match with each movie is the <b>dot product</b>: multiply matching numbers and add.</p>
      <div class="formula">you · Toy Story = 1.0 × 0.9 + 0.3 × 0.1 = 0.93&nbsp;&nbsp;&nbsp;&nbsp;you · Terminator = 1.0 × 0.0 + 0.3 × 0.9 = 0.27</div>
      <p>So Toy Story ranks higher. Matrix factorization works exactly like this, with one twist: <b>nobody writes the numbers down</b>. There's no "animation" column in the data. The algorithm invents its own dimensions, whatever best explains who watched what. Those learned vectors are called <b>embeddings</b>, and they're the core of nearly every modern recommendation and ad system.</p>

      <h2>Step 2: Why "factorization"?</h2>
      <p>Stack every person's vector into a matrix U (943 × 32) and every movie's into a matrix V (1,682 × 32). Then U × V<sup>T</sup> is a 943 × 1,682 matrix of every dot product at once, the same shape as the watch matrix. Training makes it close to the real one:</p>
      <div class="formula">watch matrix ≈ U × V<sup>T</sup></div>
      <p>That's "factoring" the big matrix into two thin ones, like 12 = 3 × 4. It also squeezes it: 1.6 million entries become (943 + 1,682) × 32 ≈ 84,000 numbers. To fit, the model has to find patterns, so similar people and similar movies end up with similar vectors.</p>

      <h2>Step 3: Training with ALS</h2>
      <p>Finding U and V together is hard. But <b>fix every movie vector, and finding one person's best vector is easy</b>: it's a small least-squares problem, the same kind of fit as drawing the best line through points, with an exact answer. Fixing the people makes it the same problem for each movie. So <b>ALS (alternating least squares)</b> takes turns:</p>
      <ol>
        <li>Hold the movie vectors fixed and solve every person's vector exactly.</li>
        <li>Hold the new person vectors fixed and solve every movie's vector.</li>
        <li>Repeat. Each half-step can only lower the error, so it settles quickly.</li>
      </ol>
      <div class="widget" data-widget="mfdemo"></div>
      <p>What to notice:</p>
      <ul>
        <li><b>The error falls fast.</b> Most of the work happens in the first round or two. That's typical of ALS, and why 10 rounds is plenty.</li>
        <li><b>The groups appear on their own.</b> The data has no genres, only who watched what. Yet Toy Story and Nemo end up together, apart from Alien and Terminator, which is the same grouping the item-based CF similarities found.</li>
        <li><b>Two numbers is very few.</b> With 2, the model can only capture the biggest pattern. The real project uses 32, which leaves room for finer tastes.</li>
      </ul>

      <h2>Step 4: The twist for "watched" data</h2>
      <p>MovieLens here is implicit: a 1 means "watched", a 0 means "didn't watch". Those aren't equally trustworthy. A 1 is solid evidence of interest. A 0 might mean "didn't like it", or just "never came across it". So the fit trusts them differently (Hu, Koren and Volinsky, 2008):</p>
      <div class="tbl-wrap"><table>
        <tr><th>Entry</th><th class="num">Target</th><th class="num">Confidence (weight in the fit)</th></tr>
        <tr><td>Watched</td><td class="num">1</td><td class="num">1 + α = 11</td></tr>
        <tr><td>Not watched</td><td class="num">0</td><td class="num">1</td></tr>
      </table></div>
      <p>With α = 10, missing a watched movie costs 11 times as much as a wrong guess on an unwatched one. Each person's best vector x then has a closed-form answer:</p>
      <div class="formula">A x = b,&nbsp;&nbsp;&nbsp;A = Y<sup>T</sup>Y + α · Y<sub>w</sub><sup>T</sup>Y<sub>w</sub> + reg · I,&nbsp;&nbsp;&nbsp;b = (1 + α) · Σ y<sub>w</sub></div>
      <p>Y holds all the movie vectors, and Y<sub>w</sub> only the ones this person watched. Y<sup>T</sup>Y is the same for everyone, so it's computed once per round. Then each person only adds their own watched movies, which keeps training fast. <b>reg</b> (regularization) keeps vectors small, so they don't memorize noise.</p>

      <h2>How this maps to your code</h2>
      <p>Algorithm 2 lives in <code>recsys/mf.py</code> in <a href="https://github.com/giovannivitale4722/ads-knowledge/tree/main/implementations/movie-recommender" target="_blank" rel="noopener"><code>implementations/movie-recommender</code></a>, on the same data and the same test as item-based CF:</p>
      <div class="tbl-wrap"><table>
        <tr><th>Idea on this page</th><th>Where in the code</th><th>Status</th></tr>
        <tr><td><b>Step 4: one person's best vector, A x = b</b></td><td><code>solve_one()</code></td><td><span class="conf lo">TODO 1: you write it</span></td></tr>
        <tr><td>Solving every row with the other side fixed</td><td><code>als_step()</code></td><td><span class="conf">Done</span></td></tr>
        <tr><td><b>Step 3: alternate people and movies</b></td><td><code>MatrixFactorizationRecommender.fit</code></td><td><span class="conf lo">TODO 2: you write it</span></td></tr>
        <tr><td><b>Step 1: score = dot product</b></td><td><code>MatrixFactorizationRecommender.scores</code></td><td><span class="conf lo">TODO 3: you write it</span></td></tr>
        <tr><td>Comparing all the recommenders</td><td><code>run.py</code></td><td><span class="conf">Done</span></td></tr>
      </table></div>
      <p>One trick worth noticing: <code>als_step</code> solves for people when given <code>train</code>, and for movies when given <code>train.T</code>. Flipping the matrix turns "each person's movies" into "each movie's people", so the same code does both halves.</p>
<pre class="code">cd implementations/movie-recommender
make test     <span class="c"># checks the TODOs for both algorithms</span>
make run      <span class="c"># compares all four recommenders</span></pre>
      <div class="tbl-wrap"><table>
        <tr><th>Recommender</th><th class="num">Hit rate @ 10</th><th class="num">NDCG @ 10</th><th class="num">Coverage</th></tr>
        <tr><td>Random</td><td class="num">1.1%</td><td class="num">0.004</td><td class="num">99.7%</td></tr>
        <tr><td>Popularity</td><td class="num">5.0%</td><td class="num">0.025</td><td class="num">5.4%</td></tr>
        <tr><td>Item-based CF</td><td class="num">5.9%</td><td class="num">0.028</td><td class="num">14.1%</td></tr>
        <tr><td><b>Matrix factorization</b></td><td class="num"><b>9.8%</b></td><td class="num"><b>0.053</b></td><td class="num"><b>46.6%</b></td></tr>
      </table></div>
      <p>Two thirds more hits than item-based CF, nearly twice the NDCG, and three times as many different movies recommended. Learned vectors capture tastes that raw overlap counts miss.</p>

      <h2>Where this leads</h2>
      <ul>
        <li><b>Tune it.</b> Try 8 or 128 factors, and different α and reg. More factors capture finer tastes but overfit sooner.</li>
        <li><b>Cold start is still a problem.</b> A new person or movie has no vector until it has history. That's the gap the next algorithm closes.</li>
        <li><b>Two-tower models</b>, next in the series: instead of storing one vector per ID, a small neural network <i>computes</i> each vector from features such as genre, age and recent history. New items get vectors immediately. It's how Google and YouTube retrieve candidates from billions of items.</li>
      </ul>
      <p class="sources">Sources: <a href="https://doi.org/10.1109/ICDM.2008.22" target="_blank" rel="noopener">Hu, Koren &amp; Volinsky: Collaborative Filtering for Implicit Feedback Datasets (ICDM 2008)</a> · <a href="https://grouplens.org/datasets/movielens/100k/" target="_blank" rel="noopener">MovieLens 100K, GroupLens Research</a></p>` };

/* Check-yourself questions shown at the end of the page */
CHECKS['matrix-factorization'] = [
  { q: 'Your vector is [2, 1] and a movie\'s is [0.5, 3]. What is its score for you?', opts: ['3.5', '4.0', '6.5'], a: 1,
    why: 'The dot product: 2 × 0.5 + 1 × 3 = 1 + 3 = 4.0.' },
  { q: 'Why does ALS alternate instead of solving people and movies together?', opts: ['It is required by numpy', 'With one side fixed, the other side has an exact least-squares answer', 'It uses less data'], a: 1,
    why: 'Solving both at once is hard, but fixing one side turns each vector into a small least-squares problem with a closed-form solution.' },
  { q: 'In implicit ALS with α = 10, why does a watched movie get confidence 11 but an unwatched one only 1?', opts: ['Watched movies are rarer', 'A watch is strong evidence of interest, while a 0 might just mean never seen', 'It keeps the vectors small'], a: 1,
    why: 'A 0 is ambiguous: dislike, or never came across it. So the fit trusts the 1s much more.' }
];
