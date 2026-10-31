// delayed_bidder.cpp
// The file you edit for the conversion delay extension.
// Run `make test-delay` to check your work and `make run-delay` to simulate a day.
#include "delayed_bidder.hpp"

#include <algorithm>
#include <cmath>

// Already done. In the simulation, each sale arrives a random number of windows after its
// click, on average `mean_delay_windows`. This is the chance it has arrived after `age`.
double completion(int age, double mean_delay_windows) {
    if (age < 0) return 0.0;
    if (mean_delay_windows <= 0) return 1.0;
    return 1.0 - std::exp(-(age + 1) / mean_delay_windows);
}

DelayedRoasBidder::DelayedRoasBidder(double target_roas, double initial_alpha, double step, DelayMode mode,
                                     double mean_delay_windows, int n_windows, double min_alpha, double max_alpha)
    : target_roas_(target_roas), alpha_(initial_alpha), step_(step), mode_(mode), mean_delay_(mean_delay_windows),
      min_alpha_(min_alpha), max_alpha_(max_alpha), spend_by_window_(n_windows, 0.0),
      predicted_by_window_(n_windows, 0.0), sales_by_window_(n_windows, 0.0) {}

// Already done: the same bid as TargetRoasBidder.
double DelayedRoasBidder::bid(double pconv, double order_value) const {
    return alpha_ * pconv * order_value / target_roas_;
}

void DelayedRoasBidder::observe_click(int window, double price, double predicted_sales) {
    spend_by_window_[window] += price;
    predicted_by_window_[window] += predicted_sales;
}

void DelayedRoasBidder::observe_sale(int click_window, double sales) { sales_by_window_[click_window] += sales; }

double DelayedRoasBidder::reported_sales() const {
    double total = 0.0;
    for (double s : sales_by_window_) total += s;
    return total;
}

double DelayedRoasBidder::total_spend() const {
    double total = 0.0;
    for (double s : spend_by_window_) total += s;
    return total;
}

double DelayedRoasBidder::reported_roas() const {
    const double spend = total_spend();
    return spend > 0 ? reported_sales() / spend : 0.0;
}

// ---------------------------------------------------------------------------
// TODO 1: scale up what's been reported
//
// Return the estimated FINAL sales of click windows 0 to `now`, scaling each window's
// reported sales up by the share that has usually arrived by now:
//
//   sum over w = 0 .. now of   sales_by_window_[w] / completion(now - w, mean_delay_)
//
// If 40% of a window's sales have usually arrived, the $400 reported so far suggests
// about $400 / 0.4 = $1,000 in the end.
//
// Example: mean delay 1 window, now = 1, sales_by_window_ = {80, 30}
//   window 0, 1 window old:  completion(1, 1) = 1 - e^-2 = 0.865  ->  80 / 0.865 = 92.5
//   window 1, just finished: completion(0, 1) = 1 - e^-1 = 0.632  ->  30 / 0.632 = 47.5
//   total = 140.0
// ---------------------------------------------------------------------------
double DelayedRoasBidder::scaled_sales(int now) const {
    (void)now;  // remove this line once you use now
    return 0.0;  // TODO 1
}

// ---------------------------------------------------------------------------
// TODO 2: blend what's been reported with what the models predict
//
// Scaling up has a weakness: a window that just ended has only a few percent of its sales
// in, so dividing by a tiny completion turns one lucky early sale into a huge estimate.
// Instead, keep the sales that HAVE arrived, and fill in only the missing share with the
// models' prediction for that window:
//
//   sum over w = 0 .. now of
//       sales_by_window_[w]  +  (1 - completion(now - w, mean_delay_)) * predicted_by_window_[w]
//
// Old windows: completion is near 1, so it's almost all real sales.
// The newest window: completion is near 0, so it's almost all prediction.
//
// Example: mean delay 1 window, now = 1, sales_by_window_ = {80, 30},
//          predicted_by_window_ = {100, 60}
//   window 0: 80 + (1 - 0.865) * 100 = 93.5
//   window 1: 30 + (1 - 0.632) * 60  = 52.1
//   total = 145.6
// ---------------------------------------------------------------------------
double DelayedRoasBidder::blended_sales(int now) const {
    (void)now;  // remove this line once you use now
    return 0.0;  // TODO 2
}

// ---------------------------------------------------------------------------
// TODO 3: the controller, delay-aware
//
// Called when window `now` ends. The same controller as TargetRoasBidder::end_window,
// with one choice of which sales to trust:
//
//   1. spend = total_spend(). If it's 0, leave alpha_ alone.
//   2. sales = reported_sales()     if mode_ is DelayMode::Naive
//              scaled_sales(now)    if mode_ is DelayMode::ScaleUp
//              blended_sales(now)   if mode_ is DelayMode::Blend
//   3. error = (sales / spend - target_roas_) / target_roas_
//   4. alpha_ *= exp(step_ * error), then clamp between min_alpha_ and max_alpha_.
//
// Hint: compare an enum with ==, for example  if (mode_ == DelayMode::Naive) { ... }
// ---------------------------------------------------------------------------
void DelayedRoasBidder::end_window(int now) {
    (void)now;  // remove this line once you use now
    // TODO 3
}
