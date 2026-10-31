"""metrics.py
How good is a list of 10 recommendations, when one movie was hidden?

  hit rate @ 10: was the hidden movie anywhere in the list? Averaged over everyone, it's the
                 share of people we "got right".
  NDCG @ 10:     like hit rate, but a hit near the top counts more. A hit at position 1 scores
                 1.0, at position 2 about 0.63, at position 10 about 0.29, a miss 0.
  coverage:      the share of all movies that got recommended to at least one person. A
                 recommender that shows everyone the same 10 hits has tiny coverage.
"""
import math


def hit(recommended, hidden):
    return 1.0 if hidden in recommended else 0.0


def ndcg(recommended, hidden):
    for position, movie in enumerate(recommended):
        if movie == hidden:
            return 1.0 / math.log2(position + 2)
    return 0.0
