// market.hpp
// A simulated day of ad auctions, spread over 24 hours. Each impression has:
//   - window:         which 15-minute window of the day it arrives in (0 to 95)
//   - pconv:          our model's predicted chance this impression leads to a conversion
//   - competitor_bid: the highest bid from everyone else in the auction
//   - conv_draw:      a uniform random number in [0, 1); if we win, the impression
//                     converts when conv_draw < pconv
//
// Traffic is not flat: few people search at 3am, many at noon and in the evening.
// The whole day is generated up front from a fixed seed, so every strategy we test
// faces exactly the same auctions and the same conversion luck.
#pragma once

#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>
#include <random>
#include <vector>

constexpr int kWindowsPerDay = 96;  // 15-minute windows
constexpr int kWindowsPerHour = 4;

struct Impression {
    int window;
    double pconv;
    double competitor_bid;
    double conv_draw;
};

// Relative traffic in each hour of the day (midnight to 11pm). The busiest hours are 1.0.
inline const std::array<double, 24> kHourlyTraffic = {
    0.25, 0.18, 0.14, 0.12, 0.13, 0.20, 0.40, 0.65, 0.85, 0.95, 1.00, 1.00,
    0.98, 0.95, 0.92, 0.90, 0.90, 0.92, 0.98, 1.00, 0.95, 0.80, 0.60, 0.40};

// Expected traffic in each 15-minute window. This is the forecast a real system would
// build from previous days. Here it's exact, so the forecast is never wrong.
inline std::vector<double> expected_traffic() {
    std::vector<double> traffic;
    for (int w = 0; w < kWindowsPerDay; ++w) traffic.push_back(kHourlyTraffic[w / kWindowsPerHour]);
    return traffic;
}

// Competitors value impressions roughly like we do (they see similar signals),
// but with their own noise and their own bid levels, so the price to beat varies.
inline std::vector<Impression> make_market(std::size_t n, std::uint64_t seed) {
    std::mt19937_64 rng(seed);
    std::normal_distribution<double> log_pconv(std::log(0.015), 0.8);   // median 1.5%
    std::normal_distribution<double> their_view(0.0, 0.45);             // competitors' model noise
    std::normal_distribution<double> their_scale(std::log(1.15), 0.35); // competitors' bid levels
    std::uniform_real_distribution<double> unit(0.0, 1.0);
    constexpr double kTheirValuePerConversion = 20.0;

    // Split the n auctions across the windows in proportion to the traffic.
    const std::vector<double> traffic = expected_traffic();
    double total = 0.0;
    for (double t : traffic) total += t;

    std::vector<Impression> day;
    day.reserve(n);
    double cumulative = 0.0;
    std::size_t made = 0;
    for (int w = 0; w < kWindowsPerDay; ++w) {
        cumulative += traffic[w];
        const auto until = static_cast<std::size_t>(std::llround(n * cumulative / total));
        for (; made < until; ++made) {
            const double pconv = std::clamp(std::exp(log_pconv(rng)), 0.0005, 0.30);
            const double their_value = pconv * std::exp(their_view(rng)) * kTheirValuePerConversion;
            const double competitor_bid = std::max(0.01, their_value * std::exp(their_scale(rng)));
            day.push_back({w, pconv, competitor_bid, unit(rng)});
        }
    }
    return day;
}
