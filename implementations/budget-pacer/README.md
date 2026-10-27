# Maximize Conversions budget pacer (C++)

A small simulator of Google-style **Maximize Conversions** bidding. The advertiser says "get me as
many conversions as possible today, and don't spend more than $6,000". There's no target cost per
conversion, only the budget. The bidder has to spread that money over 100,000 auctions arriving
through a 24-hour day.

You write the three core pieces. Everything else is done.

**Start with the visual walkthrough:** https://www.giovitale.com/ads-knowledge/#t-max-conversions
It explains the strategy step by step, with a demo of spending through the day, and maps each idea to the code here.

## The strategy in one page

**The goal.** Maximize conversions while total spend stays at or below the budget `B`.

**The bid.** For each auction, a model predicts `pconv`, the chance this impression leads to a
conversion. The bid is that chance times one shared multiplier `m`:

```
bid = m × pconv
```

`m` is the most the bidder will pay for one conversion. Just as for Target CPA, one shared
multiplier is the best policy in a second-price auction: attach a price λ to each dollar of
budget, and an impression is worth winning exactly when its cost is below `pconv / λ`. So
`m = 1/λ`, the same for every impression.

**The problem: when to spend.** Bid too high and the budget is gone by mid-morning, missing every
afternoon auction. Bid too low and money is left over at midnight, which is conversions you could
have had. The right `m` depends on the competition, so it has to be learned during the day.

**The plan.** Decide in advance how much should be spent by the end of each 15-minute window.
Traffic isn't flat: 3am has an eighth of noon's auctions. So the plan follows expected traffic:

```
plan[w] = B × (traffic[0] + … + traffic[w]) / (total traffic)
```

**The controller.** After every window, compare actual spend with the plan and nudge `m`:

```
error = (planned − spent) / planned      positive: behind plan, so bid more
m     = m × exp(step × error)
```

It's the Target CPA thermostat again, pointed at spending instead of cost per conversion.

**The hard cap.** Never bid more than the budget that's left. In a second-price auction you never
pay more than your bid, so this alone guarantees you can't overspend.

## Your three TODOs

All are in [`src/budget_pacer.cpp`](src/budget_pacer.cpp). It's the only file you edit.

| | Function | What it does |
|---|---|---|
| TODO 1 | `make_plan(budget, traffic)` | Return the cumulative planned spend for each window |
| TODO 2 | `bid(pconv)` | Return `m × pconv`, capped at the remaining budget |
| TODO 3 | `end_window()` | Update `m` from spend versus plan, as specified in the comments |

The spec for TODO 3:

1. `planned = plan_[window_]`
2. If `planned > 0`: `error = (planned - total_spend_) / planned`
3. Then `m_ *= exp(step_ * error)`, clamped to `[min_m_, max_m_]`.
4. Always add 1 to `window_`.

Until the TODOs are done, the compiler warns that some private fields are unused. The warnings
disappear once you use them.

## Build, test, run

```
make test     # checks your TODOs against the spec
make run      # simulates a day and compares strategies
make clean
```

`make run` compares four strategies on the same simulated day:

- **No pacing:** `m` fixed at a confident $40. It wins a lot early and runs out of money in the morning.
- **Best fixed m (hindsight):** tries every `m` after the day is over and keeps the one with the most
  conversions. Impossible in real life, but it shows what optimal looks like.
- **Your pacer, even plan:** starts at `m` = 20 and follows a straight-line plan.
- **Your pacer, traffic plan:** the same controller, following a plan shaped like the day's traffic.

When your code is right, the traffic-plan pacer should get over 90% of the hindsight-best
conversions and spend the whole budget. The even plan does noticeably worse. Working out why is
the most interesting part of the project. (Hint: what does the even plan ask for at 3am?)
Per-window `m` and spend are written to `results/even_plan_windows.csv` and
`results/traffic_plan_windows.csv`.

## Files

| File | What's in it |
|---|---|
| `src/budget_pacer.cpp` | **Your code:** the plan, the bid and the pacing controller |
| `src/budget_pacer.hpp` | The bidder's interface |
| `src/market.hpp` | Generates 100,000 auctions over 96 windows, with daily traffic, from a fixed seed |
| `src/auction.hpp` | A second-price auction against the best competing bid |
| `src/simulate.hpp/.cpp` | Runs a day, calling your bidder for every auction and every window |
| `src/main.cpp` | Compares the four strategies |
| `src/tests.cpp` | Unit tests for the TODOs |

## Ideas once it works

- **Try other step sizes** in `main.cpp`. The traffic plan is fairly forgiving. The even plan isn't.
- **A wrong forecast.** Make the real traffic differ from `expected_traffic()`, say a quiet
  afternoon. How far off can the forecast be before the pacer suffers?
- **Throttling instead of bid scaling.** Some systems keep bids fixed and randomly skip a share of
  auctions instead. Try it and compare the conversions.
- **Combine with Target CPA:** bid `alpha × pacing × pconv × T`, with pacing at most 1, so whichever
  limit is tighter wins.
