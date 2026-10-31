# Movie recommender: item-based collaborative filtering (Python)

The first recommendation algorithm: **"people who watched what you watched also watched…"**.
It runs on MovieLens 100K, 100,000 real movie ratings from 943 people, and is compared with a
random baseline and a popularity baseline on the same test.

You write the three core pieces. Everything else is done.

**Start with the visual walkthrough:** https://www.giovitale.com/ads-knowledge/#t-item-cf
It explains the algorithm step by step on a tiny example you can click through, and maps each idea to the code here.

## The algorithm in one page

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

## Your three TODOs

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

When your code is right, `make run` should print:

| Recommender | Hit rate@10 | NDCG@10 | Coverage |
|---|---|---|---|
| Random | 1.1% | 0.004 | 99.7% |
| Popularity | 5.0% | 0.025 | 5.4% |
| Item-based CF | 5.9% | 0.028 | 14.1% |

Then it shows one person's movies, their hidden movie and what each recommender suggests.

Item-based CF beats popularity, but not by much. That's the starting point for the first optimization.

## Optimizations to try once it works

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

Next in the series: **matrix factorization**, which learns a short "taste vector" for every
person and movie instead of comparing raw columns.

## Files

| File | What's in it |
|---|---|
| `recsys/recommenders.py` | **Your code:** popularity and item-based CF |
| `recsys/data.py` | Downloads MovieLens, builds the matrix, hides each person's latest movie |
| `recsys/metrics.py` | Hit rate and NDCG |
| `run.py` | Compares the recommenders and shows example recommendations |
| `tests.py` | Unit tests for the TODOs |

MovieLens 100K is from GroupLens Research: F. Maxwell Harper and Joseph A. Konstan, "The
MovieLens Datasets: History and Context", ACM Transactions on Interactive Intelligent Systems,
2015. Its license allows research use but not redistribution, so it's downloaded, not committed.
