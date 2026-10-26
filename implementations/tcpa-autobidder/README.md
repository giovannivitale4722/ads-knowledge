# Target CPA autobidder (C++)

A small simulator of Google-style **Target CPA** bidding. The advertiser says "get me as many
conversions as possible at an average of $20 each", and the bidder has to choose a bid for every
one of 100,000 auctions to make that happen.

You write the two core pieces. Everything else is done.

## The strategy in one page

**The goal.** Maximize conversions while keeping the average cost per conversion (CPA) at or
below the target `T`.

**The bid.** For each auction, a model predicts `pconv`, the chance this impression leads to a
conversion. The impression is worth `pconv × T` to the advertiser. The bid is that value times
one shared multiplier:

```
bid = alpha × pconv × T
```

**Why one multiplier is enough.** In a second-price auction, the best policy for "maximize
conversions subject to average CPA ≤ T" is to scale every impression's value by the same
number (Aggarwal, Badanidiyuru & Mehta, *Autobidding with Constraints*, 2019). The whole
problem reduces to finding one number, alpha.

**Why alpha usually ends up above 1.** The target is an average. Cheap conversions leave room
for some more expensive ones, and in a second-price auction you pay less than your bid. So
bidding exactly `pconv × T` leaves the advertiser's room unused.

**Finding alpha.** Nobody knows the right alpha in advance, because it depends on the
competition. So the bidder learns it during the day, like a thermostat. After every window of
auctions it compares the CPA so far with the target and nudges alpha:

```
error = (T - CPA) / T          positive: cheaper than target, so bid more
alpha = alpha × exp(step × error)
```

## Your two TODOs

Both are in [`src/tcpa_bidder.cpp`](src/tcpa_bidder.cpp). It's the only file you edit.

| | Function | What it does |
|---|---|---|
| TODO 1 | `bid(pconv)` | Return `alpha × pconv × target_cpa` |
| TODO 2 | `end_window()` | Update alpha from the cumulative CPA, as specified in the comments |

The spec for TODO 2:

1. No conversions yet: leave alpha unchanged.
2. `error = (target_cpa_ - cpa()) / target_cpa_`, using the cumulative CPA.
3. `alpha_ *= exp(step_ * error)`
4. Clamp alpha to `[min_alpha_, max_alpha_]`.

Until TODO 2 is done, the compiler warns that `step_`, `min_alpha_` and `max_alpha_` are
unused. The warnings disappear once you use them.

## Build, test, run

```
make test     # checks your TODOs against the spec
make run      # simulates a day and compares strategies
make clean
```

`make run` compares three strategies on the same simulated day:

- **Naive:** alpha fixed at 1, bidding exactly `pconv × T`.
- **Best fixed alpha (hindsight):** tries every alpha after the day is over and keeps the best
  one that respects the target. Impossible in real life, but it shows what optimal looks like.
- **Your autobidder:** starts at alpha = 1 and has to find a good alpha while the day runs.

When your code is right, the autobidder should get close to the hindsight-best number of
conversions, with a CPA close to $20, and far more conversions than the naive bidder. Per-window
alpha and CPA are written to `results/autobidder_windows.csv`.

## Files

| File | What's in it |
|---|---|
| `src/tcpa_bidder.cpp` | **Your code:** the bid and the alpha controller |
| `src/tcpa_bidder.hpp` | The bidder's interface |
| `src/market.hpp` | Generates 100,000 auctions from a fixed seed, so every strategy faces the same day |
| `src/auction.hpp` | A second-price auction against the best competing bid |
| `src/simulate.hpp/.cpp` | Runs a day, calling your bidder for every auction and every window |
| `src/main.cpp` | Compares the three strategies |
| `src/tests.cpp` | Unit tests for the TODOs |

## Ideas once it works

- **Try other step sizes** in `main.cpp`. Too small and alpha learns slowly. Too large and it
  overshoots and swings.
- **Add a daily budget,** with a second multiplier that slows spending when it runs ahead of
  plan (budget pacing).
- **Add conversion delay:** conversions that arrive hours later make the recent CPA look worse
  than it is. How should the controller handle that?
- **Switch to a first-price auction** and add bid shading on top of the bid.
