// troas_bidder.hpp
// A Target ROAS autobidder.
//
// The advertiser's goal: as much sales value as possible, while every $1 of ads brings
// back at least `target_roas` dollars of sales. ROAS = return on ad spend = sales / spend.
// A target ROAS of 3.0 (often written 300%) means $3 of sales for every $1 spent.
//
// The strategy: bid  alpha * pconv * order_value / target_roas  in every auction, using
// one shared multiplier alpha. After each window of auctions, look at the ROAS so far and
// nudge alpha: up if we're beating the target, down if we're falling short.
#pragma once

class TargetRoasBidder {
public:
    // step: how strongly alpha reacts after each window. 0 means alpha never changes.
    TargetRoasBidder(double target_roas, double initial_alpha, double step,
                     double min_alpha = 0.1, double max_alpha = 10.0);

    // The bid for one auction, given the predicted conversion probability and order value.
    double bid(double pconv, double order_value) const;

    // Record what happened in one auction we took part in. sales is the order's value
    // if it converted, otherwise 0.
    void observe(bool won, double price, double sales);

    // Called after each window of auctions: update alpha from the results so far.
    void end_window();

    // Sales / spend so far, or 0 if nothing has been spent yet.
    double roas() const;

    double alpha() const { return alpha_; }
    double target_roas() const { return target_roas_; }
    double total_spend() const { return total_spend_; }
    double total_sales() const { return total_sales_; }
    int total_conversions() const { return total_conversions_; }
    int total_wins() const { return total_wins_; }

private:
    double target_roas_;
    double alpha_;
    double step_;
    double min_alpha_;
    double max_alpha_;

    double total_spend_ = 0.0;
    double total_sales_ = 0.0;
    int total_conversions_ = 0;
    int total_wins_ = 0;
};
