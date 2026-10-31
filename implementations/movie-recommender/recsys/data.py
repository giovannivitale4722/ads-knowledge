"""data.py
Downloads MovieLens 100K and turns it into the matrix every recommender works on.

MovieLens 100K: 100,000 ratings (1 to 5 stars) from 943 people on 1,682 movies, collected by
GroupLens Research at the University of Minnesota. Its license doesn't allow redistributing it,
so it isn't in the repo: the first run downloads it into data/ (about 5 MB).

We treat it as implicit feedback: if someone rated a movie, they watched it. The stars are
ignored. That's how most real systems work, with clicks and views instead of ratings.
"""
import io
import urllib.request
import zipfile
from pathlib import Path

import numpy as np

URL = "https://files.grouplens.org/datasets/movielens/ml-100k.zip"
DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def download():
    """Fetch and unzip MovieLens 100K into data/, unless it's already there."""
    target = DATA_DIR / "ml-100k"
    if (target / "u.data").exists():
        return target
    print(f"Downloading MovieLens 100K from {URL} ...")
    with urllib.request.urlopen(URL) as response:
        zipfile.ZipFile(io.BytesIO(response.read())).extractall(DATA_DIR)
    return target


def load():
    """Returns (ratings, titles).

    ratings: a list of (user, movie, timestamp), with user and movie ids starting at 0.
    titles:  titles[movie] is the movie's name.
    """
    folder = download()
    ratings = []
    for line in (folder / "u.data").read_text().splitlines():
        user, movie, _stars, timestamp = line.split("\t")
        ratings.append((int(user) - 1, int(movie) - 1, int(timestamp)))
    titles = []
    for line in (folder / "u.item").read_text(encoding="latin-1").splitlines():
        titles.append(line.split("|")[1])
    return ratings, titles


def train_test_split(ratings, n_users, n_items):
    """Hide each person's most recent movie. Recommenders learn from the rest and are scored
    on whether they can guess the hidden one.

    Returns (train, test):
      train: a users x items matrix of 0s and 1s. train[u, i] = 1 means user u watched movie i.
      test:  test[u] is the movie hidden for user u.
    """
    by_user = [[] for _ in range(n_users)]
    for user, movie, timestamp in ratings:
        by_user[user].append((timestamp, movie))

    train = np.zeros((n_users, n_items))
    test = np.zeros(n_users, dtype=int)
    for user, history in enumerate(by_user):
        history.sort()
        test[user] = history[-1][1]
        for _timestamp, movie in history[:-1]:
            train[user, movie] = 1.0
    return train, test
