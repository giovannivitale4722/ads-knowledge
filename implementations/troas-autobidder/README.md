# Target ROAS autobidder (C++)

A small simulator of Google-style **Target ROAS** bidding for an online shop. The advertiser says
"bring in as much sales revenue as possible, with at least $3 of sales for every $1 of ads". The
shop sells everything from $10 phone cases to $500 headphones, so some sales are worth far more
than others. The bidder has to choose a bid for every one of 100,000 auctions.

You write the three core pieces. Everything else is done.

**Start with the visual walkthrough:** https://www.giovitale.com/ads-knowledge/#t-target-roas
It explains the strategy step by step, shows where each strategy's money goes, and maps each idea to the code here.

## The strategy in one page

**The goal.** Maximize sales value while ROAS (return on ad spend = sales ÷ spend) stays at or
above the target `T`. A target of 3.0, often written 300%, means $3 of sales per $1 spent.

**The bid.** For each auction, models predict `pconv` (the chance of a purchase) and
`order_value` (how much that purchase would be worth). The expected sales from the impression is
`pconv × order_value`. Dividing by `T` turns sales into the most the advertiser will pay:

```
bid = alpha × pconv × order_value / T
```

Example: pconv 2%, order $150, T = 3. Expected sales = $3. At alpha = 1 the bid is $1.

**What's new compared with Target CPA.** Target CPA treats every conversion as worth the same.
Target ROAS bids more on impressions likely to bring big orders. On this simulated day, that
earns 90% more sales at the same ROAS. The value-blind bidder wins nearly as many orders, but
they're mostly small ones.

**Finding alpha.** The same thermostat as Target CPA, with the sign flipped. A high ROAS is good:
you're earning more per dollar than required, so you can afford to bid more.

```
error = (ROAS − T) / T          positive: beating the target, so bid more
alpha = alpha × exp(step × error)
```

## Your three TODOs

All are in [`src/troas_bidder.cpp`](src/troas_bidder.cpp). It's the only file you edit.

| | Function | What it does |
|---|---|---|
| TODO 1 | `bid(pconv, order_value)` | Return `alpha × pconv × order_value / target_roas` |
| TODO 2 | `observe(won, price, sales)` | Add up wins, spend, sales and conversions |
| TODO 3 | `end_window()` | Update alpha from the cumulative ROAS, as specified in the comments |

The spec for TODO 3:

1. Nothing spent yet: leave alpha unchanged.
2. `error = (roas() - target_roas_) / target_roas_`, using the cumulative ROAS.
3. `alpha_ *= exp(step_ * error)`
4. Clamp alpha to `[min_alpha_, max_alpha_]`.

Watch the sign in step 2: it's ROAS minus target, the reverse of Target CPA's target minus CPA.

## Build, test, run

```
make test     # checks your TODOs against the spec
make run      # simulates a day and compares strategies
make clean
```

When your code is right, `make run` should print:

| Strategy | Orders | Sales | Spend | ROAS |
|---|---|---|---|---|
| Naive (alpha = 1) | 852 | $59,969 | $12,854 | 467% |
| Best fixed alpha (hindsight) | 1,701 | $118,370 | $39,408 | 300% |
| Value-blind, best alpha | 1,538 | $62,391 | $20,744 | 301% |
| Your autobidder (step 0.25) | 1,579 | $110,588 | $37,344 | 296% |

- **Naive** beats the ROAS target easily, but leaves half the possible sales on the table.
- **Value-blind** is what Target CPA would do: it ignores order values and is tuned to the same ROAS. Nearly as many orders, half the sales.
- **Your autobidder** should land near 93% of the hindsight-best sales, close to 300% ROAS.

## Why step 0.25 here, not 0.5?

ROAS is lumpier than CPA. One $500 order moves it a lot, so a big step overreacts to lucky and
unlucky windows. On this day:

| Step | Sales vs hindsight best | ROAS |
|---|---|---|
| 0.1 | 108% | 276%: misses the target |
| 0.25 | 93% | 296% |
| 0.5 | 83% | 313% |
| 1.0 | 95% | 287% |
| 2.0 | 73% | 284% |

Step 0.1 "beats" the benchmark only by missing the target, which the benchmark wasn't allowed to do.

## Files

| File | What's in it |
|---|---|
| `src/troas_bidder.cpp` | **Your code:** the bid, the bookkeeping and the alpha controller |
| `src/troas_bidder.hpp` | The bidder's interface |
| `src/market.hpp` | Generates 100,000 auctions with predicted and actual order values, from a fixed seed |
| `src/auction.hpp` | A second-price auction against the best competing bid |
| `src/simulate.hpp/.cpp` | Runs a day, calling your bidder for every auction and every window |
| `src/main.cpp` | Compares the four strategies |
| `src/tests.cpp` | Unit tests for the TODOs |

## Ideas once it works

- **Data-scaled steps,** as on the Target CPA page: move alpha less while there are few orders.
- **A biased value model.** Make `order_value` predictions 30% too high. What happens to ROAS,
  and does the controller save you?
- **Maximize conversion value.** Swap the ROAS controller for the budget pacer from
  `budget-pacer`, keeping the value-aware bid. That's Google's Maximize conversion value.
- **Both limits at once:** bid `alpha × pacing × value`, with pacing at most 1, for a ROAS target plus a daily budget.
