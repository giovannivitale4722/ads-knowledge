"""tests.py
Checks the TODOs for both algorithms against the spec in the README. Run with:  make test
Uses tiny hand-made matrices, so no download is needed.
"""
import math

import numpy as np

from recsys.mf import MatrixFactorizationRecommender, als_step, solve_one
from recsys.recommenders import ItemKNNRecommender, PopularityRecommender, recommend

failures = 0


def check(name, got, want):
    global failures
    ok = np.allclose(np.asarray(got, dtype=float), np.asarray(want, dtype=float), atol=1e-9)
    if ok:
        print(f"  PASS  {name}")
    else:
        print(f"  FAIL  {name}  (got {np.round(got, 6).tolist()}, expected {np.round(want, 6).tolist()})")
        failures += 1


#  3 users x 4 movies. Movie 1 is the most popular, movie 2 has no viewers.
TRAIN = np.array([
    [0, 1, 0, 1],
    [1, 1, 0, 0],
    [0, 1, 0, 1],
], dtype=float)

print("TODO 1: popularity")
pop = PopularityRecommender()
pop.fit(TRAIN)
check("counts viewers per movie (column sums)", pop.popularity, [1, 3, 0, 2])
check("recommends the most popular unseen movies, best first", recommend(pop, TRAIN, 1, 2), [3, 2])

print("\nTODO 2: item-item similarity")
knn = ItemKNNRecommender()
knn.fit(TRAIN)
s = knn.similarity
check("shape is items x items", s.shape, (4, 4))
check("movies 1 and 3: 2 shared viewers / (sqrt 3 * sqrt 2)", s[1, 3], 2 / (math.sqrt(3) * math.sqrt(2)))
check("movies 0 and 1: 1 shared viewer / (sqrt 1 * sqrt 3)", s[0, 1], 1 / math.sqrt(3))
check("movies 0 and 3: no shared viewers -> 0", s[0, 3], 0.0)
check("symmetric: similarity[i, j] == similarity[j, i]", s, s.T)
check("diagonal is 0 (a movie isn't its own neighbor)", np.diag(s), [0, 0, 0, 0])
check("a movie nobody watched (movie 2) -> 0, not a division error", s[2], [0, 0, 0, 0])

print("\nTODO 3: scores for one user")
# A hand-made similarity matrix, so TODO 3 can be checked even before TODO 2 works.
knn = ItemKNNRecommender()
knn.fit(TRAIN)
knn.similarity = np.array([
    [0.0, 0.5, 0.1, 0.2],
    [0.5, 0.0, 0.3, 0.9],
    [0.1, 0.3, 0.0, 0.4],
    [0.2, 0.9, 0.4, 0.0],
])
check("user 1 watched movies 0 and 1: scores = row 0 + row 1", knn.scores(1), [0.5, 0.5, 0.4, 1.1])
check("user 0 watched 1 and 3: movie 2's score is 0.3 + 0.4", knn.scores(0)[2], 0.7)
check("recommends movie 3 to user 1 first (1.1 beats 0.4)", recommend(knn, TRAIN, 1, 1), [3])

print("\nMatrix factorization, TODO 1: solve_one")
Y_ALL = np.array([[1.0, 0.0], [0.5, 1.0], [0.0, 2.0]])   # 3 movie vectors, 2 factors
alpha, reg = 2.0, 0.5
# Independent check: solve the weighted least-squares problem directly, over all movies.
conf = np.array([1 + alpha, 1.0, 1 + alpha])             # watched movies 0 and 2
pref = np.array([1.0, 0.0, 1.0])
want = np.linalg.solve(Y_ALL.T @ (conf[:, None] * Y_ALL) + reg * np.eye(2), Y_ALL.T @ (conf * pref))
check("matches weighted least squares (watched movies 0 and 2)",
      solve_one(Y_ALL, Y_ALL.T @ Y_ALL, np.array([0, 2]), alpha, reg), want)
check("watched nothing -> all-zero vector", solve_one(Y_ALL, Y_ALL.T @ Y_ALL, np.array([], dtype=int), alpha, reg), [0, 0])

print("\nMatrix factorization, TODO 2: the alternating loop")
mf = MatrixFactorizationRecommender(factors=2, alpha=2.0, reg=0.5, iterations=1, seed=3)
mf.fit(TRAIN)
rng = np.random.default_rng(3)
_users0, i0 = rng.normal(0.0, 0.01, (3, 2)), rng.normal(0.0, 0.01, (4, 2))  # same draws as fit()
users = als_step(i0, TRAIN, 2.0, 0.5)
check("users are solved first, from the starting item vectors", mf.user_vectors, users)
check("items are solved next, from the NEW user vectors (via train.T)", mf.item_vectors, als_step(users, TRAIN.T, 2.0, 0.5))
mf3 = MatrixFactorizationRecommender(factors=2, alpha=2.0, reg=0.5, iterations=3, seed=3)
mf3.fit(TRAIN)
u, i = users, als_step(users, TRAIN.T, 2.0, 0.5)
for _ in range(2):
    u = als_step(i, TRAIN, 2.0, 0.5)
    i = als_step(u, TRAIN.T, 2.0, 0.5)
check("runs `iterations` rounds (3 here)", mf3.item_vectors, i)

print("\nMatrix factorization, TODO 3: scores")
mf = MatrixFactorizationRecommender(factors=2)
mf.user_vectors = np.array([[1.0, 2.0], [0.0, 1.0]])
mf.item_vectors = np.array([[1.0, 0.0], [0.0, 1.0], [2.0, 1.0]])
check("person 0's scores are dot products with each movie: [1, 2, 4]", mf.scores(0), [1, 2, 4])
check("person 1's scores: [0, 1, 1]", mf.scores(1), [0, 1, 1])

print("\n" + ("All tests passed." if failures == 0 else "Some tests failed. See the README for the spec."))
raise SystemExit(1 if failures else 0)
