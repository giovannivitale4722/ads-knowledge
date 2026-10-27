// budget_pacer.hpp
// A Maximize Conversions autobidder with budget pacing.
//
// The advertiser's goal: as many conversions as possible today, spending at most
// `budget`. There's no cost-per-conversion target, only the budget.
//
// The strategy: bid  m * pconv  in every auction, using one shared multiplier m
// (think of it as the most we'll pay for one conversion). Follow a spending plan
// through the day. After each 15-minute window, compare what we've spent with the
// plan and nudge m: up if we're behind plan, down if we're ahead.
#pragma once

#include <vector>

// The spending plan: how much of the budget should be spent by the END of each window.
// plan[w] = budget * (traffic[0] + ... + traffic[w]) / (sum of all traffic)
std::vector<double> make_plan(double budget, const std::vector<double>& expected_traffic);

class BudgetPacer {
public:
    // plan: from make_plan(), one entry per window.
    // step: how strongly m reacts after each window. 0 means m never changes.
    BudgetPacer(double budget, const std::vector<double>& plan, double initial_m, double step,
                double min_m = 1.0, double max_m = 200.0);

    // The bid for one auction, given the predicted conversion probability.
    double bid(double pconv) const;

    // Record what happened in one auction we took part in.
    void observe(bool won, double price, bool converted);

    // Called at the end of each window: update m from spending versus the plan.
    void end_window();

    double m() const { return m_; }
    double budget() const { return budget_; }
    double remaining() const { return budget_ - total_spend_; }
    double total_spend() const { return total_spend_; }
    int total_conversions() const { return total_conversions_; }
    int total_wins() const { return total_wins_; }
    int window() const { return window_; }
    // Spend / conversions so far, or 0 if there are no conversions yet.
    double cpa() const;

private:
    double budget_;
    std::vector<double> plan_;
    double m_;
    double step_;
    double min_m_;
    double max_m_;

    int window_ = 0;  // which window we're in, starting at 0
    double total_spend_ = 0.0;
    int total_conversions_ = 0;
    int total_wins_ = 0;
};
