"""recommenders.py
This is the file you edit. Everything else in the project is already done.
Run `make test` to check your work and `make run` to compare the recommenders on real data.

Every recommender has the same two methods:
  fit(train):    learn from the users x items matrix of 0s and 1s (1 = watched)
  scores(user):  return one number per movie; higher means "recommend this more"
recommend() then turns those scores into a top-10 list, skipping movies the user has seen.
"""
import numpy as np


class RandomRecommender:
    """Already done. Scores every movie at random. Any real method must beat this."""

    def fit(self, train):
        self.n_items = train.shape[1]
        self.rng = np.random.default_rng(0)

    def scores(self, user):
        return self.rng.random(self.n_items)


class PopularityRecommender:
    """Recommends the movies the most people have watched, the same list for everyone."""

    def fit(self, train):
        # -------------------------------------------------------------------------------
        # TODO 1: popularity
        #
        # Set self.popularity to one number per movie: how many users watched it.
        # That's the sum of each COLUMN of train (each column is one movie).
        #
        # Example: train = [[1, 0, 1],
        #                   [1, 1, 0]]   ->   popularity = [2, 1, 1]
        #
        # Hint: numpy arrays have .sum(axis=...). axis=0 adds up down the columns.
        # -------------------------------------------------------------------------------
        self.popularity = np.zeros(train.shape[1])  # TODO 1

    def scores(self, user):
        return self.popularity


class ItemKNNRecommender:
    """Item-based collaborative filtering: "people who watched what you watched also watched...".

    Two movies are similar when the same people watched both. To score a movie for you, add up
    how similar it is to each movie you've already watched.
    """

    def fit(self, train):
        self.train = train
        # -------------------------------------------------------------------------------
        # TODO 2: item-item similarity
        #
        # Set self.similarity to an items x items matrix, where similarity[i, j] is the
        # COSINE SIMILARITY of movie i's column and movie j's column:
        #
        #   similarity[i, j] = (users who watched both i and j)
        #                      / ( sqrt(users who watched i) * sqrt(users who watched j) )
        #
        # It's 1 when exactly the same people watched both, and 0 when no one watched both.
        # Set the diagonal (a movie compared with itself) to 0, so a movie never counts as
        # its own neighbor. If a movie has no viewers, its row and column should be 0, not
        # a division by zero.
        #
        # Example: train = [[1, 1, 0],      movie 0 and 1: both watched by user 0 -> 1 shared
        #                   [1, 0, 1]]      viewers: movie 0 has 2, movie 1 has 1
        #   similarity[0, 1] = 1 / (sqrt(2) * sqrt(1)) = 0.707
        #
        # Hints:
        #   - train.T @ train gives an items x items matrix: entry [i, j] counts users who
        #     watched both i and j. Its diagonal [i, i] counts users who watched i.
        #   - np.diag(m) pulls out a diagonal. np.sqrt works on whole arrays.
        #   - np.outer(a, b)[i, j] = a[i] * b[j]
        #   - np.fill_diagonal(m, 0.0) changes m in place.
        #   - To avoid dividing by zero: replace zeros in the bottom with 1 before dividing
        #     (the top is 0 there anyway), for example with np.where(norms > 0, norms, 1.0).
        # -------------------------------------------------------------------------------
        n_items = train.shape[1]
        self.similarity = np.zeros((n_items, n_items))  # TODO 2

    def scores(self, user):
        # -------------------------------------------------------------------------------
        # TODO 3: score every movie for one user
        #
        # Return one number per movie: the sum of its similarities to every movie this user
        # watched.
        #
        #   score[j] = sum over movies i the user watched of similarity[i, j]
        #
        # Example: the user watched movies 0 and 2. Then score[1] =
        # similarity[0, 1] + similarity[2, 1].
        #
        # Hint: self.train[user] is the user's row of 0s and 1s. Multiplying that row by
        # the similarity matrix (with @) adds up exactly the rows for watched movies.
        # -------------------------------------------------------------------------------
        return np.zeros(self.similarity.shape[1])  # TODO 3


def recommend(model, train, user, k=10):
    """Already done: the k highest-scoring movies the user hasn't watched, best first."""
    scores = np.array(model.scores(user), dtype=float)
    scores[train[user] > 0] = -np.inf  # never recommend something already watched
    top = np.argsort(-scores, kind="stable")[:k]
    return [int(movie) for movie in top]
