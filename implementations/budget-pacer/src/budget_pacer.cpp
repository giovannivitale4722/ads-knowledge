// budget_pacer.cpp
// This is the file you edit. Everything else in the project is already done.
// Run `make test` to check your work and `make run` to simulate a day.
#include "budget_pacer.hpp"

#include <algorithm>
#include <cmath>

// ---------------------------------------------------------------------------
// TODO 1: the spending plan
//
// Return one number per window: how much of the budget should be spent by the
// END of that window. Spend in proportion to expected traffic, so busy hours
// get more of the budget than quiet ones:
//
//   plan[w] = budget * (traffic[0] + ... + traffic[w]) / (sum of all traffic)
//
// Example: budget $100, traffic {1, 3}  ->  plan {25, 100}
//
// The last entry always equals the whole budget. If every traffic value is the
// same, you get a straight line: the "even" plan.
// Hint: add up the total first, then loop again keeping a running sum.
// ---------------------------------------------------------------------------
std::vector<double> make_plan(double budget, const std::vector<double>& expected_traffic) {
    (void)budget;  // remove this line once you use budget
    return std::vector<double>(expected_traffic.size(), 0.0);  // TODO 1
}

BudgetPacer::BudgetPacer(double budget, const std::vector<double>& plan, double initial_m, double step,
                         double min_m, double max_m)
    : budget_(budget), plan_(plan), m_(initial_m), step_(step), min_m_(min_m), max_m_(max_m) {}

// ---------------------------------------------------------------------------
// TODO 2: the bid
//
// Return how much to bid in one auction:
//
//   bid = m * pconv,  but never more than the budget that's left (remaining())
//
// m is the most we'll pay for one conversion, so m * pconv is what this
// impression is worth to us. The cap keeps us from ever going over budget: in a
// second-price auction you never pay more than your bid.
// ---------------------------------------------------------------------------
double BudgetPacer::bid(double pconv) const {
    (void)pconv;  // remove this line once you use pconv
    return 0.0;   // TODO 2
}

// Already done: keeps running totals of what we won, spent and converted.
void BudgetPacer::observe(bool won, double price, bool converted) {
    if (!won) return;
    ++total_wins_;
    total_spend_ += price;
    if (converted) ++total_conversions_;
}

// ---------------------------------------------------------------------------
// TODO 3: the pacing controller
//
// Called at the end of every 15-minute window. Update m_ so spending follows
// the plan:
//
//   1. Look up planned = plan_[window_], what we should have spent by now.
//   2. If planned > 0:
//
//        error = (planned - total_spend_) / planned
//
//      Positive error means we're behind plan (spent too little), so bid more.
//      Negative means we're ahead of plan, so bid less.
//   3.   Multiply m_ by exp(step_ * error), then keep m_ between min_m_ and max_m_.
//   4. Move on to the next window: add 1 to window_. Always do this, even when
//      planned is 0.
//
// It's the same thermostat as the Target CPA controller, pointed at spending
// instead of cost per conversion.
// ---------------------------------------------------------------------------
void BudgetPacer::end_window() {
    // TODO 3
}

double BudgetPacer::cpa() const {
    return total_conversions_ > 0 ? total_spend_ / total_conversions_ : 0.0;
}
