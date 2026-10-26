// tcpa_bidder.cpp
// This is the file you edit. Everything else in the project is already done.
// Run `make test` to check your work and `make run` to simulate a day.
#include "tcpa_bidder.hpp"

#include <algorithm>
#include <cmath>

TargetCpaBidder::TargetCpaBidder(double target_cpa, double initial_alpha, double step,
                                 double min_alpha, double max_alpha)
    : target_cpa_(target_cpa), alpha_(initial_alpha), step_(step),
      min_alpha_(min_alpha), max_alpha_(max_alpha) {}

// ---------------------------------------------------------------------------
// TODO 1: the bid
//
// Return how much to bid in one auction.
//
//   bid = alpha * pconv * target_cpa
//
// pconv * target_cpa is what this impression is worth to the advertiser: a 5%
// chance of a conversion they'd pay $20 for is worth $1. alpha scales every bid
// up or down together. You'll need alpha_ and target_cpa_.
// ---------------------------------------------------------------------------
double TargetCpaBidder::bid(double pconv) const {
    (void)pconv;  // remove this line once you use pconv
    return 0.0;   // TODO 1
}

// Already done: keeps running totals of what we won, spent and converted.
void TargetCpaBidder::observe(bool won, double price, bool converted) {
    if (!won) return;
    ++total_wins_;
    total_spend_ += price;
    if (converted) ++total_conversions_;
}

// ---------------------------------------------------------------------------
// TODO 2: the alpha controller
//
// Called after every window of 1,000 auctions. Update alpha_ so the CPA moves
// toward the target:
//
//   1. If there are no conversions yet (total_conversions_ == 0), leave alpha_
//      alone. The CPA isn't defined yet.
//   2. Otherwise compute the error, using the CUMULATIVE CPA (cpa() does that):
//
//        error = (target_cpa_ - cpa()) / target_cpa_
//
//      Positive error means we're cheaper than the target, so we can afford to
//      bid more. Negative means we're too expensive.
//   3. Multiply alpha_ by exp(step_ * error).
//   4. Keep alpha_ between min_alpha_ and max_alpha_ (std::clamp helps).
//
// Why multiply by exp(...)? alpha stays positive, and equal-sized errors move
// it by equal percentages whether alpha is 0.5 or 5.
// ---------------------------------------------------------------------------
void TargetCpaBidder::end_window() {
    // TODO 2
}

double TargetCpaBidder::cpa() const {
    return total_conversions_ > 0 ? total_spend_ / total_conversions_ : 0.0;
}
