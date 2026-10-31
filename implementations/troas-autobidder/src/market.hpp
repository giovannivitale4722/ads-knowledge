// market.hpp
// A simulated day of ad auctions for an online shop. Each impression has:
//   - pconv:          our model's predicted chance this impression leads to a purchase
//   - order_value:    our model's predicted value of that purchase, in $
//   - competitor_bid: the highest bid from everyone else in the auction
//   - conv_draw:      a uniform random number in [0, 1); if we win, the impression
//                     converts when conv_draw < pconv
//   - actual_value:   what the order is really worth if it converts. On average it
//                     equals order_value, but any single order can come in higher or lower.
//
// The shop sells everything from $10 phone cases to $500 headphones, so order values
// vary a lot. The whole day is generated up front from a fixed seed, so every strategy
// faces exactly the same auctions and the same luck.
#pragma once

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <random>
#include <vector>

struct Impression {
    double pconv;
    double order_value;
    double competitor_bid;
    double conv_draw;
    double actual_value;
};

// Competitors value impressions roughly like we do (they see similar signals, including
// what the shopper is likely to buy), but with their own noise and their own bid levels.
inline std::vector<Impression> make_market(std::size_t n, std::uint64_t seed, double target_roas) {
    std::mt19937_64 rng(seed);
    std::normal_distribution<double> log_pconv(std::log(0.015), 0.8);    // median 1.5%
    std::normal_distribution<double> log_value(std::log(45.0), 0.9);     // median $45, average about $68
    std::normal_distribution<double> their_view(0.0, 0.45);              // competitors' model noise
    std::normal_distribution<double> their_scale(std::log(1.15), 0.35);  // competitors' bid levels
    std::normal_distribution<double> order_luck(-0.045, 0.3);            // actual / predicted, average 1
    std::uniform_real_distribution<double> unit(0.0, 1.0);

    std::vector<Impression> day;
    day.reserve(n);
    for (std::size_t i = 0; i < n; ++i) {
        const double pconv = std::clamp(std::exp(log_pconv(rng)), 0.0005, 0.30);
        const double order_value = std::clamp(std::exp(log_value(rng)), 5.0, 1000.0);
        const double their_value = pconv * order_value / target_roas * std::exp(their_view(rng));
        const double competitor_bid = std::max(0.01, their_value * std::exp(their_scale(rng)));
        const double actual_value = order_value * std::exp(order_luck(rng));
        day.push_back({pconv, order_value, competitor_bid, unit(rng), actual_value});
    }
    return day;
}
