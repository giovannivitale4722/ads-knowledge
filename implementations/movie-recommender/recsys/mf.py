"""mf.py
The second recommender: matrix factorization, trained with implicit ALS.
This is the file you edit for this algorithm. Run `make test` and `make run` as before.

Item-based CF described each movie by its whole column: 943 numbers, mostly zeros.
Matrix factorization instead LEARNS a short vector of `factors` numbers for every person and
every movie, chosen so that

    person_vector · movie_vector  ≈  1 if they watched it, 0 if not

Nobody tells it what the numbers mean. Training discovers "taste dimensions" on its own, such as
how much someone likes animation, or how old a film is.

How it trains (ALS, alternating least squares):
  Fixing all the movie vectors makes finding each person's vector a small least-squares problem
  with an exact answer. Fixing the people makes it the same problem for each movie. So alternate:
  solve all people, then all movies, then all people again, and so on. Each round fits better.

Implicit feedback (Hu, Koren and Volinsky, 2008): a 1 means "watched", so we're confident they
like it. A 0 might be dislike, or might just be "never saw it". So every watched movie gets more
weight in the fit, called confidence: 1 + alpha for a watched movie, 1 for the rest.
"""
import numpy as np


def solve_one(fixed, gram, watched, alpha, reg):
    # -----------------------------------------------------------------------------------
    # TODO 1: one person's vector (or one movie's: it's the same math)
    #
    # fixed:   the other side's vectors, one row each (e.g. all movie vectors), n x factors
    # gram:    fixed.T @ fixed, computed once and passed in, factors x factors
    # watched: the row indices in `fixed` this person interacted with (e.g. their movies)
    # Return the vector x (length factors) that solves  A x = b,  where
    #
    #   Y = fixed[watched]                       the vectors of the watched movies only
    #   A = gram + alpha * (Y.T @ Y) + reg * I   I is the factors x factors identity matrix
    #   b = (1 + alpha) * (sum of the rows of Y)
    #
    # Where it comes from: minimize the weighted squared error
    #   sum over all movies i of  confidence_i * (preference_i - x · y_i)^2  +  reg * |x|^2
    # with preference 1 and confidence 1 + alpha for watched movies, preference 0 and
    # confidence 1 for the rest. Setting the gradient to zero gives exactly A x = b. Starting
    # from gram and adding only the watched rows is the speed trick from the paper: most
    # movies have confidence 1, so they're already counted in gram.
    #
    # Hints: np.eye(k) is the k x k identity. Y.sum(axis=0) adds up the rows.
    #        np.linalg.solve(A, b) returns x with A @ x == b. Don't compute an inverse.
    # -----------------------------------------------------------------------------------
    return np.zeros(gram.shape[0])  # TODO 1


def als_step(fixed, matrix, alpha, reg):
    """Already done: a new vector for every row of `matrix`, with the other side held fixed."""
    gram = fixed.T @ fixed
    return np.array([solve_one(fixed, gram, np.flatnonzero(row), alpha, reg) for row in matrix])


class MatrixFactorizationRecommender:
    """Learns a vector per person and per movie. A movie's score is the dot product."""

    def __init__(self, factors=32, alpha=10.0, reg=1.0, iterations=10, seed=0):
        self.factors, self.alpha, self.reg, self.iterations, self.seed = factors, alpha, reg, iterations, seed

    def fit(self, train):
        rng = np.random.default_rng(self.seed)
        n_users, n_items = train.shape
        # small random starting vectors, so the two sides aren't all identical
        self.user_vectors = rng.normal(0.0, 0.01, (n_users, self.factors))
        self.item_vectors = rng.normal(0.0, 0.01, (n_items, self.factors))
        # -------------------------------------------------------------------------------
        # TODO 2: the alternating loop
        #
        # Repeat self.iterations times:
        #   1. new user vectors from the item vectors:  als_step(self.item_vectors, train, ...)
        #   2. new item vectors from the user vectors:  als_step(self.user_vectors, train.T, ...)
        # Pass self.alpha and self.reg as the last two arguments.
        #
        # Step 2 uses train.T: flipping the matrix turns "each person's movies" into "each
        # movie's people", so the same als_step works for both sides. Do the steps in this
        # order, and use the NEW user vectors when solving for the items.
        # -------------------------------------------------------------------------------
        pass  # TODO 2

    def scores(self, user):
        # -------------------------------------------------------------------------------
        # TODO 3: score every movie for one person
        #
        # Return one number per movie: the dot product of this person's vector with each
        # movie's vector.
        #
        # Hint: self.user_vectors[user] is one row. self.item_vectors.T has one column per
        # movie. Multiplying them with @ does every dot product at once.
        # -------------------------------------------------------------------------------
        return np.zeros(self.item_vectors.shape[0])  # TODO 3
