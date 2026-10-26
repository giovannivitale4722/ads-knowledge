// tcpa_bidder.hpp
// A Target CPA autobidder.
//
// The advertiser's goal: as many conversions as possible, with an average cost per
// conversion (CPA) at or below `target_cpa`.
//
// The strategy: bid  alpha * pconv * target_cpa  in every auction, using one shared
// multiplier alpha. After each window of auctions, look at the CPA so far and nudge
// alpha: up if we're cheaper than the target, down if we're more expensive.
#pragma once

class TargetCpaBidder {
public:
    // step: how strongly alpha reacts after each window. 0 means alpha never changes.
    TargetCpaBidder(double target_cpa, double initial_alpha, double step,
                    double min_alpha = 0.1, double max_alpha = 10.0);

    // The bid for one auction, given the predicted conversion probability.
    double bid(double pconv) const;

    // Record what happened in one auction we took part in.
    void observe(bool won, double price, bool converted);

    // Called after each window of auctions: update alpha from the results so far.
    void end_window();

    double alpha() const { return alpha_; }
    double target_cpa() const { return target_cpa_; }
    double total_spend() const { return total_spend_; }
    int total_conversions() const { return total_conversions_; }
    int total_wins() const { return total_wins_; }
    // Spend / conversions so far, or 0 if there are no conversions yet.
    double cpa() const;

private:
    double target_cpa_;
    double alpha_;
    double step_;
    double min_alpha_;
    double max_alpha_;

    double total_spend_ = 0.0;
    int total_conversions_ = 0;
    int total_wins_ = 0;
};
