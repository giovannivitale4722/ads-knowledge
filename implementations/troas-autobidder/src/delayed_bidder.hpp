// delayed_bidder.hpp
// Target ROAS when sales arrive late.
//
// In the main project, a sale reaches the bidder in the same auction it was won. In real
// life it arrives hours or days later. This bidder keeps its books by CLICK WINDOW (the
// window the auction was won in): spend is known right away, sales trickle in later and
// are credited back to the window of the click that caused them.
//
// The controller is the same as TargetRoasBidder's. What changes is which sales it trusts.
#pragma once

#include <vector>

// The share of a click's eventual sales that has usually arrived `age` windows after the
// click window ended. age 0 means the window that just finished. Real systems measure this
// curve from past days. Here it comes straight from the simulation's delay model.
double completion(int age, double mean_delay_windows);

// How the controller handles sales that haven't arrived yet.
enum class DelayMode {
    Naive,    // trust the sales reported so far
    ScaleUp,  // scale each window's reported sales up by how much has usually arrived
    Blend,    // reported sales, plus the model's prediction for the part still missing
};

class DelayedRoasBidder {
public:
    DelayedRoasBidder(double target_roas, double initial_alpha, double step, DelayMode mode,
                      double mean_delay_windows, int n_windows,
                      double min_alpha = 0.1, double max_alpha = 10.0);

    double bid(double pconv, double order_value) const;

    // Already done: an auction won in click window `window`, at `price`. predicted_sales is
    // pconv * order_value for that impression: the sales the models expect it to bring.
    void observe_click(int window, double price, double predicted_sales);
    // Already done: sales that just arrived, from a click made in window `click_window`.
    void observe_sale(int click_window, double sales);

    // Called when window `now` ends: update alpha.
    void end_window(int now);

    double reported_sales() const;
    double total_spend() const;
    double reported_roas() const;

    // TODO 1 and TODO 2: two ways to estimate the final sales of click windows 0 .. now.
    double scaled_sales(int now) const;
    double blended_sales(int now) const;

    double alpha() const { return alpha_; }

private:
    double target_roas_;
    double alpha_;
    double step_;
    DelayMode mode_;
    double mean_delay_;
    double min_alpha_;
    double max_alpha_;

    std::vector<double> spend_by_window_;      // spend on clicks made in window w
    std::vector<double> predicted_by_window_;  // predicted sales from clicks made in window w
    std::vector<double> sales_by_window_;      // sales reported so far from clicks made in window w
};
