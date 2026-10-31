"""run.py
Compares the recommenders on MovieLens 100K. Run with:  make run

For each of the 943 people, their most recent movie is hidden. Each recommender learns from
everything else, makes a top-10 list for every person, and is scored on how often the hidden
movie is in that list.
"""
import numpy as np

from recsys import data, metrics
from recsys.mf import MatrixFactorizationRecommender
from recsys.recommenders import ItemKNNRecommender, PopularityRecommender, RandomRecommender, recommend

K = 10
EXAMPLE_USER = 0


def evaluate(model, train, test):
    hits, ndcgs, shown = [], [], set()
    for user in range(train.shape[0]):
        top = recommend(model, train, user, K)
        hits.append(metrics.hit(top, test[user]))
        ndcgs.append(metrics.ndcg(top, test[user]))
        shown.update(top)
    return np.mean(hits), np.mean(ndcgs), len(shown) / train.shape[1]


def main():
    ratings, titles = data.load()
    n_users = max(u for u, _, _ in ratings) + 1
    n_items = len(titles)
    train, test = data.train_test_split(ratings, n_users, n_items)
    print(f"MovieLens 100K: {n_users} people, {n_items} movies, {int(train.sum()):,} views to learn from")
    print(f"Each person's most recent movie is hidden. Can a top-{K} list find it?\n")

    models = [("Random", RandomRecommender()), ("Popularity", PopularityRecommender()),
              ("Item-based CF", ItemKNNRecommender()), ("Matrix factorization", MatrixFactorizationRecommender())]
    print(f"  {'Recommender':<22} {'Hit rate@10':>12} {'NDCG@10':>10} {'Coverage':>10}")
    for name, model in models:
        model.fit(train)
        hit_rate, ndcg, coverage = evaluate(model, train, test)
        print(f"  {name:<22} {hit_rate:>11.1%} {ndcg:>10.3f} {coverage:>9.1%}")

    watched = np.flatnonzero(train[EXAMPLE_USER])
    print(f"\nPerson {EXAMPLE_USER + 1} watched {len(watched)} movies, including:")
    for movie in watched[:5]:
        print(f"    {titles[movie]}")
    print(f"Their hidden most recent movie: {titles[test[EXAMPLE_USER]]}")
    for name, model in models[1:]:
        print(f"\n{name} recommends:")
        for movie in recommend(model, train, EXAMPLE_USER, 5):
            mark = "   <- the hidden movie!" if movie == test[EXAMPLE_USER] else ""
            print(f"    {titles[movie]}{mark}")


if __name__ == "__main__":
    main()
