"""tests.py
Checks your three TODOs against the spec in the README. Run with:  make test
Uses tiny hand-made matrices, so no download is needed.
"""
import math

import numpy as np

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

print("\n" + ("All tests passed." if failures == 0 else "Some tests failed. See the README for the spec."))
raise SystemExit(1 if failures else 0)
