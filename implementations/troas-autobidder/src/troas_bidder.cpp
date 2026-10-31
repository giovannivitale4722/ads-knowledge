// troas_bidder.cpp
// This is the file you edit. Everything else in the project is already done.
// Run `make test` to check your work and `make run` to simulate a day.
#include "troas_bidder.hpp"

#include <algorithm>
#include <cmath>

TargetRoasBidder::TargetRoasBidder(double target_roas, double initial_alpha, double step,
                                   double min_alpha, double max_alpha)
    : target_roas_(target_roas), alpha_(initial_alpha), step_(step),
      min_alpha_(min_alpha), max_alpha_(max_alpha) {}

// ---------------------------------------------------------------------------
// TODO 1: the bid
//
// Return how much to bid in one auction:
//
//   bid = alpha * pconv * order_value / target_roas
//
// pconv * order_value is the sales this impression brings in on average: a 2% chance
// of a $150 order is worth $3 of sales. Dividing by the target ROAS turns sales into
// what the advertiser will pay for them: at a target of 3, $3 of sales is worth $1 of
// ads. alpha scales every bid up or down together. You'll need alpha_ and target_roas_.
// ---------------------------------------------------------------------------
double TargetRoasBidder::bid(double pconv, double order_value) const {
    (void)pconv;        // remove these two lines once you use pconv and order_value
    (void)order_value;
    return 0.0;  // TODO 1
}

// ---------------------------------------------------------------------------
// TODO 2: record one auction
//
// If we won: add 1 to total_wins_, add price to total_spend_, and add sales to
// total_sales_. If sales is above 0, the shopper bought something, so also add 1 to
// total_conversions_. If we lost, change nothing.
// ---------------------------------------------------------------------------
void TargetRoasBidder::observe(bool won, double price, double sales) {
    (void)won;  // remove these three lines once you use them
    (void)price;
    (void)sales;
    // TODO 2
}

// Already done: sales per dollar of spend so far.
double TargetRoasBidder::roas() const {
    return total_spend_ > 0 ? total_sales_ / total_spend_ : 0.0;
}

// ---------------------------------------------------------------------------
// TODO 3: the alpha controller
//
// Called after every window of 1,000 auctions. Update alpha_ so the ROAS moves
// toward the target:
//
//   1. If nothing has been spent yet (total_spend_ == 0), leave alpha_ alone.
//      ROAS isn't defined yet.
//   2. Otherwise compute the error, using the CUMULATIVE ROAS (roas() does that):
//
//        error = (roas() - target_roas_) / target_roas_
//
//      Careful, it's the other way round from Target CPA. A HIGH ROAS is good: we're
//      earning more per dollar than required, so we can afford to bid more. Positive
//      error means bid more, negative means bid less.
//   3. Multiply alpha_ by exp(step_ * error).
//   4. Keep alpha_ between min_alpha_ and max_alpha_ (std::clamp helps).
// ---------------------------------------------------------------------------
void TargetRoasBidder::end_window() {
    // TODO 3
}
