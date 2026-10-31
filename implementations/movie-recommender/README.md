# Movie recommender (Python)

Recommendation algorithms on MovieLens 100K, 100,000 real movie ratings from 943 people, all
scored on the same test and compared with a random and a popularity baseline:

1. **Item-based collaborative filtering:** "people who watched what you watched also watched…".
   Your code: [`recsys/recommenders.py`](recsys/recommenders.py).
2. **Matrix factorization (implicit ALS):** learns a short taste vector for every person and movie.
   Your code: [`recsys/mf.py`](recsys/mf.py). See [the section below](#algorithm-2-matrix-factorization-implicit-als).

Each algorithm has three TODOs. Everything else is done.

**Start with the visual walkthrough:** https://www.giovitale.com/ads-knowledge/#t-item-cf
It explains the algorithm step by step on a tiny example you can click through, and maps each idea to the code here.

## Algorithm 1: Item-based collaborative filtering

**The data.** A matrix with one row per person and one column per movie. A 1 means that person
watched that movie. We ignore the star ratings: having watched it is the signal. That's
**implicit feedback**, which is what most real systems have (clicks, views, purchases).

**Step 1: How similar are two movies?** Look at their columns. Two movies are similar when the
same people watched both. **Cosine similarity** turns that into a number from 0 to 1:

```
similarity(i, j) = (people who watched both) / ( sqrt(people who watched i) × sqrt(people who watched j) )
```

Dividing by the square roots stops popular movies from looking similar to everything just
because lots of people watched them.

**Step 2: Score every movie for one person.** Add up how similar each movie is to the movies they
already watched:

```
score(j) = Σ over movies i the person watched of similarity(i, j)
```

A movie that's close to many of your movies scores high.

**Step 3: Recommend.** The 10 highest-scoring movies the person hasn't watched yet.

## How it's tested

For every person, their **most recent** movie is hidden. Each recommender learns from everything
else and makes a top-10 list. We count how often the hidden movie made the list:

- **Hit rate @ 10:** the share of people whose hidden movie was in their top 10.
- **NDCG @ 10:** the same, but a hit near the top of the list counts more.
- **Coverage:** the share of all movies recommended to anyone. Popularity shows everyone the
  same 10 movies, so its coverage is tiny.

### Your three TODOs

All are in [`recsys/recommenders.py`](recsys/recommenders.py). It's the only file you edit.

| | Where | What it does |
|---|---|---|
| TODO 1 | `PopularityRecommender.fit` | Count how many people watched each movie: the column sums |
| TODO 2 | `ItemKNNRecommender.fit` | The items × items cosine similarity matrix, with a zero diagonal |
| TODO 3 | `ItemKNNRecommender.scores` | One user's score for every movie: their row times the similarity matrix |

Each TODO's comment has a tiny worked example and numpy hints. Each one is a few lines of numpy.

## Run it

```
make test     # checks your TODOs on tiny hand-made matrices (no download needed)
make run      # downloads MovieLens once (~5 MB), then compares the three recommenders
make clean    # deletes the downloaded data
```

You need Python 3 and numpy (`pip install numpy`).

When your item-based CF code is right, `make run` should print these rows (plus a matrix
factorization row, all zeros until you do algorithm 2):

| Recommender | Hit rate@10 | NDCG@10 | Coverage |
|---|---|---|---|
| Random | 1.1% | 0.004 | 99.7% |
| Popularity | 5.0% | 0.025 | 5.4% |
| Item-based CF | 5.9% | 0.028 | 14.1% |

Then it shows one person's movies, their hidden movie and what each recommender suggests.

Item-based CF beats popularity, but not by much. That's the starting point for the first optimization.

### Optimizations to try once it works

- **Keep only the closest neighbors (the "k" in kNN).** Right now every movie votes, including
  ones that are only slightly similar, and those weak votes add up to a popularity bias. In `fit`,
  keep only each movie's 20 most similar movies and set the rest to 0. On this test, that lifts
  the hit rate from about 6% to about 9%, and doubles coverage. Try other k values.
- **Down-weight heavy watchers.** Someone who watched 700 movies tells you less about any one pair
  than someone who watched 20. Weight each person by 1 / log(movies watched) when counting.
- **User-based CF.** The mirror image: find people similar to you, and recommend what they
  watched. Compare it with item-based.
- **Use the stars.** Treat only 4 and 5 star ratings as "liked", and see whether the hit rate on
  liked movies changes.

## Algorithm 2: Matrix factorization (implicit ALS)

**Walkthrough:** https://www.giovitale.com/ads-knowledge/#t-matrix-factorization

**The idea.** Item-based CF describes a movie by its whole column: 943 numbers, mostly zeros.
Matrix factorization **learns** a short vector of 32 numbers for every person and every movie,
so that

```
person vector · movie vector  ≈  1 if they watched it, 0 if not
```

Nobody says what the numbers mean. Training finds "taste dimensions" on its own, such as
animation versus action, or old versus new. To score a movie, take the dot product of your
vector and the movie's.

**Training: ALS (alternating least squares).** If every movie vector is held fixed, the best
vector for one person is a small least-squares problem with an exact answer. Holding the people
fixed makes it the same problem for each movie. So alternate: solve all people, then all movies,
then repeat. Ten rounds is plenty here.

**Implicit feedback** (Hu, Koren & Volinsky, 2008). A 1 means "watched", and we're confident
about it. A 0 might mean "didn't like it" or just "never saw it". So watched movies count more
in the fit: confidence `1 + alpha` for a watched movie, `1` for the rest. Each person's vector is
then the solution of

```
A x = b,   A = YᵀY + alpha × (Y_watched)ᵀ Y_watched + reg × I,   b = (1 + alpha) × Σ y_watched
```

where Y holds the movie vectors. `reg` (regularization) keeps vectors small, so they don't
memorize noise.

### Your three TODOs

All are in [`recsys/mf.py`](recsys/mf.py).

| | Where | What it does |
|---|---|---|
| TODO 1 | `solve_one` | One person's (or movie's) vector: build `A` and `b`, then `np.linalg.solve` |
| TODO 2 | `MatrixFactorizationRecommender.fit` | The alternating loop: people, then movies, `iterations` times |
| TODO 3 | `MatrixFactorizationRecommender.scores` | One person's vector times every movie's vector |

`als_step`, which runs `solve_one` for every row, is already done. Passing `train.T` makes the same
function solve for movies instead of people.

When your code is right, `make run` adds a fourth row:

| Recommender | Hit rate@10 | NDCG@10 | Coverage |
|---|---|---|---|
| Item-based CF | 5.9% | 0.028 | 14.1% |
| Matrix factorization | 9.8% | 0.053 | 46.6% |

That's two thirds more hits than item-based CF, and three times as many different movies
recommended. It trains in about a second.

### Things to try

- **Change `factors`.** 8, 32, 128: more factors can capture finer tastes, but overfit sooner.
- **Change `alpha` and `reg`.** Higher alpha trusts "watched" more. Higher reg keeps vectors smaller.
- **Look at the vectors.** Find the movies whose vectors are closest to Toy Story's. Do they make sense?
- **Compare with item-based CF plus top-k neighbors**, the optimization above. Which wins?

Next in the series: **two-tower models**, which compute the vectors from features (age, genre,
history) instead of storing one per ID, so brand-new people and movies get vectors too.

## Files

| File | What's in it |
|---|---|
| `recsys/recommenders.py` | **Your code:** popularity and item-based CF |
| `recsys/mf.py` | **Your code:** matrix factorization with implicit ALS |
| `recsys/data.py` | Downloads MovieLens, builds the matrix, hides each person's latest movie |
| `recsys/metrics.py` | Hit rate and NDCG |
| `run.py` | Compares the recommenders and shows example recommendations |
| `tests.py` | Unit tests for the TODOs of both algorithms |

MovieLens 100K is from GroupLens Research: F. Maxwell Harper and Joseph A. Konstan, "The
MovieLens Datasets: History and Context", ACM Transactions on Interactive Intelligent Systems,
2015. Implicit ALS is from Yifan Hu, Yehuda Koren and Chris Volinsky, "Collaborative Filtering for
Implicit Feedback Datasets", ICDM 2008. MovieLens's license allows research use but not redistribution, so it's downloaded, not committed.
