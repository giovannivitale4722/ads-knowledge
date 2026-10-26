// market.hpp
// A simulated day of ad auctions. Each impression has:
//   - pconv:          our model's predicted chance this impression leads to a conversion
//   - competitor_bid: the highest bid from everyone else in the auction
//   - conv_draw:      a uniform random number in [0, 1); if we win, the impression
//                     converts when conv_draw < pconv
//
// The whole day is generated up front from a fixed seed, so every strategy we test
// faces exactly the same auctions and the same conversion luck. That makes the
// comparison fair.
#pragma once

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <random>
#include <vector>

struct Impression {
    double pconv;
    double competitor_bid;
    double conv_draw;
};

// Competitors value impressions roughly like we do (they see similar signals),
// but with their own noise and their own targets, so the best price to beat varies.
inline std::vector<Impression> make_market(std::size_t n, std::uint64_t seed, double target_cpa) {
    std::mt19937_64 rng(seed);
    std::normal_distribution<double> log_pconv(std::log(0.015), 0.8);   // median 1.5%
    std::normal_distribution<double> their_view(0.0, 0.45);             // competitors' model noise
    std::normal_distribution<double> their_scale(std::log(1.15), 0.35); // competitors' bid levels
    std::uniform_real_distribution<double> unit(0.0, 1.0);

    std::vector<Impression> day;
    day.reserve(n);
    for (std::size_t i = 0; i < n; ++i) {
        const double pconv = std::clamp(std::exp(log_pconv(rng)), 0.0005, 0.30);
        const double their_value = pconv * std::exp(their_view(rng)) * target_cpa;
        const double competitor_bid = std::max(0.01, their_value * std::exp(their_scale(rng)));
        day.push_back({pconv, competitor_bid, unit(rng)});
    }
    return day;
}
