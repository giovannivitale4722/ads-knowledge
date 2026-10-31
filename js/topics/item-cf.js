/* Topic: item-cf  ·  subject: Implementations  ·  registered in js/config.js
   The visual walkthrough for implementations/movie-recommender (the Python project). */
TERMS['item-cf'] = { name: 'Item-based collaborative filtering', needs: ['pctr'],
    short: 'The first recommendation algorithm: score each item by how similar it is to the items you already watched, where two items are similar when the same people watched both.',
    body: () => `
      <h2>What you're building</h2>
      <p>A movie recommender: <b>"people who watched what you watched also watched…"</b>. Amazon made this idea famous with "customers who bought this also bought". It needs no information about the movies themselves, only who watched what.</p>
      <p class="callout"><b>Recommendation is the same problem as picking an ad.</b> A system has millions of things it could show you and room for a handful. ${T('pctr')} ranks ads by how likely you are to click. A recommender ranks movies by how likely you are to watch.</p>
      <ol class="pipe" style="--n:4">
        <li><b>The matrix</b><span>who watched what: one row per person, one column per movie</span></li>
        <li><b>Similarity</b><span>two movies are close when the same people watched both</span></li>
        <li><b>Score</b><span>add up each movie's similarity to the ones you watched</span></li>
        <li><b>Recommend</b><span>the top 10 you haven't seen</span></li>
      </ol>
      <div class="facts">
        <div><span class="v">100,000</span><span class="l">real ratings in MovieLens 100K</span></div>
        <div><span class="v">943</span><span class="l">people</span></div>
        <div><span class="v">1,682</span><span class="l">movies</span></div>
        <div><span class="v">3</span><span class="l">functions you write in Python</span></div>
      </div>

      <h2>Step 1: The matrix</h2>
      <p>Everything starts with one table: a row for each person, a column for each movie, and a 1 where that person watched that movie. MovieLens has star ratings, but the project ignores the stars and keeps only "watched". That's called <b>implicit feedback</b>, and it's what most real systems have: clicks, views and purchases, not ratings.</p>
      <p>A movie's <b>column</b> is a list of who watched it. That list is all the algorithm knows about the movie.</p>

      <h2>Step 2: How similar are two movies?</h2>
      <p>Compare their columns. The more people watched both, the more similar they are. Dividing by the square roots of each movie's audience gives the <b>cosine similarity</b>, a number from 0 to 1:</p>
      <div class="formula">similarity(i, j) = watched both ÷ ( √watched i × √watched j )</div>
      <p><b>Why divide?</b> Without it, a blockbuster everyone has seen would look similar to every movie, just because it shares viewers with everything. Dividing asks a fairer question: of the people who could have watched both, how many did?</p>
      <div class="tbl-wrap"><table>
        <tr><th>Pair (from the demo below)</th><th class="num">Watched both</th><th class="num">Audiences</th><th class="num">Similarity</th></tr>
        <tr><td>Toy Story and Nemo</td><td class="num">3</td><td class="num">4 and 4</td><td class="num">3 ÷ (2 × 2) = 0.75</td></tr>
        <tr><td>Alien and Terminator</td><td class="num">2</td><td class="num">3 and 3</td><td class="num">2 ÷ (1.73 × 1.73) = 0.67</td></tr>
        <tr><td>Toy Story and Alien</td><td class="num">1</td><td class="num">4 and 3</td><td class="num">1 ÷ (2 × 1.73) = 0.29</td></tr>
        <tr><td>Toy Story and Notebook</td><td class="num">0</td><td class="num">4 and 2</td><td class="num">0</td></tr>
      </table></div>

      <h2>Step 3: Score and recommend</h2>
      <p>To score a movie for you, add up its similarity to every movie you've watched. A movie close to many of yours scores high. Then recommend the highest scores you haven't seen.</p>
      <div class="formula">score(j) = Σ over movies i you watched of similarity(i, j)</div>
      <div class="widget" data-widget="cfdemo"></div>
      <p>What to notice:</p>
      <ul>
        <li><b>With only Toy Story picked, Nemo wins easily</b>, at 0.75. Three of Toy Story's four viewers also watched it.</li>
        <li><b>Add Alien and the list changes.</b> Terminator jumps up, because it's close to Alien. Your recommendations always come from your whole history.</li>
        <li><b>Pick nothing and nothing can be scored.</b> A brand-new user has no history to compare against. That's the <b>cold-start problem</b>, and it's why sites ask new users to pick a few favorites.</li>
      </ul>

      <h2>How do you know it works?</h2>
      <p>You can't ask people, so you hide something and see if the algorithm finds it. For every person, the project hides their <b>most recent</b> movie, learns from everything else, and checks whether the hidden movie lands in their top 10.</p>
      <div class="tbl-wrap"><table>
        <tr><th>Metric</th><th>What it measures</th></tr>
        <tr><td><b>Hit rate @ 10</b></td><td>The share of people whose hidden movie was in their top 10</td></tr>
        <tr><td><b>NDCG @ 10</b></td><td>The same, but a hit near the top counts more: 1.0 at position 1, about 0.29 at position 10</td></tr>
        <tr><td><b>Coverage</b></td><td>The share of all movies recommended to anyone. A list that's the same for everyone covers very little</td></tr>
      </table></div>
      <p>Two baselines keep the results honest. <b>Random</b> picks any 10 movies. <b>Popularity</b> shows everyone the 10 most-watched movies. It's simple, but on many datasets it's surprisingly hard to beat.</p>

      <h2>How this maps to your code</h2>
      <p>The Python project in <a href="https://github.com/giovannivitale4722/ads-knowledge/tree/main/implementations/movie-recommender" target="_blank" rel="noopener"><code>implementations/movie-recommender</code></a> downloads MovieLens and runs exactly this test. Everything is built except the three pieces that <i>are</i> the algorithm:</p>
      <div class="tbl-wrap"><table>
        <tr><th>Idea on this page</th><th>Where in the code</th><th>Status</th></tr>
        <tr><td>Downloading MovieLens, building the matrix, hiding the latest movie</td><td><code>recsys/data.py</code></td><td><span class="conf">Done</span></td></tr>
        <tr><td><b>Popularity: how many people watched each movie</b></td><td><code>PopularityRecommender.fit</code></td><td><span class="conf lo">TODO 1: you write it</span></td></tr>
        <tr><td><b>Step 2: the similarity matrix</b></td><td><code>ItemKNNRecommender.fit</code></td><td><span class="conf lo">TODO 2: you write it</span></td></tr>
        <tr><td><b>Step 3: scores for one person</b></td><td><code>ItemKNNRecommender.scores</code></td><td><span class="conf lo">TODO 3: you write it</span></td></tr>
        <tr><td>Top 10 unseen movies</td><td><code>recommend()</code></td><td><span class="conf">Done</span></td></tr>
        <tr><td>Hit rate and NDCG</td><td><code>recsys/metrics.py</code></td><td><span class="conf">Done</span></td></tr>
        <tr><td>Comparing the three recommenders</td><td><code>run.py</code></td><td><span class="conf">Done</span></td></tr>
      </table></div>
      <p>All three TODOs are in <code>recsys/recommenders.py</code>, and each is a few lines of numpy. The matrix trick for TODO 2: <code>train.T @ train</code> counts, for every pair of movies at once, how many people watched both. Its diagonal is each movie's audience.</p>
<pre class="code">cd implementations/movie-recommender
make test     <span class="c"># checks the three TODOs on tiny hand-made matrices</span>
make run      <span class="c"># downloads MovieLens once, then compares the recommenders</span></pre>
      <p>When your code is right, <code>make run</code> should print:</p>
      <div class="tbl-wrap"><table>
        <tr><th>Recommender</th><th class="num">Hit rate @ 10</th><th class="num">NDCG @ 10</th><th class="num">Coverage</th></tr>
        <tr><td>Random</td><td class="num">1.1%</td><td class="num">0.004</td><td class="num">99.7%</td></tr>
        <tr><td>Popularity</td><td class="num">5.0%</td><td class="num">0.025</td><td class="num">5.4%</td></tr>
        <tr><td>Item-based CF</td><td class="num">5.9%</td><td class="num">0.028</td><td class="num">14.1%</td></tr>
      </table></div>
      <p>Item-based CF wins, but only just. That's where the first optimization comes in.</p>

      <h2>Optimizations to try next</h2>
      <ul>
        <li><b>Keep only the closest neighbors.</b> Every movie currently votes, even ones that are barely similar, and thousands of weak votes add up to a popularity bias. Keep only each movie's 20 most similar movies. That's the "k" in <b>k-nearest neighbors</b>. On this test it lifts the hit rate from about 6% to about 9% and doubles coverage.</li>
        <li><b>Down-weight heavy watchers.</b> Someone who watched 700 movies says less about any one pair than someone who watched 20.</li>
        <li><b>User-based CF.</b> The mirror image: find people like you and recommend what they watched.</li>
        <li><b>Matrix factorization</b>, the next project: learn a short "taste vector" for every person and movie instead of comparing raw columns. It's the idea behind the Netflix Prize, and behind the embeddings that modern ad and video systems use.</li>
      </ul>
      <p class="sources">Data: <a href="https://grouplens.org/datasets/movielens/100k/" target="_blank" rel="noopener">MovieLens 100K, GroupLens Research</a> (Harper &amp; Konstan, ACM TiiS 2015)</p>` };

/* Check-yourself questions shown at the end of the page */
CHECKS['item-cf'] = [
  { q: 'Movie A has 4 viewers, movie B has 9, and 3 people watched both. What is their cosine similarity?', opts: ['0.25', '0.50', '0.75'], a: 1,
    why: '3 ÷ (√4 × √9) = 3 ÷ (2 × 3) = 0.50.' },
  { q: 'You watched movies 1 and 2. Movie 5 has similarity 0.4 to movie 1 and 0.3 to movie 2. What is its score?', opts: ['0.3', '0.4', '0.7'], a: 2,
    why: 'A score is the sum of similarities to every movie you watched: 0.4 + 0.3 = 0.7.' },
  { q: 'Why can\'t item-based CF recommend anything to a brand-new user?', opts: ['The similarity matrix is empty', 'They have no watched movies to compare against', 'Popular movies get filtered out'], a: 1,
    why: 'Scores are sums over the movies you watched. With no history, every score is 0. That is the cold-start problem.' }
];
