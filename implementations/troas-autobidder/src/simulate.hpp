// simulate.hpp
// Runs one simulated day for a bidder and reports what happened.
#pragma once

#include <cstddef>
#include <string>
#include <vector>

#include "market.hpp"
#include "troas_bidder.hpp"

struct WindowStats {
    int window;
    double alpha;            // alpha used during this window
    double cumulative_roas;  // sales / spend so far
    double cumulative_sales;
    double cumulative_spend;
};

struct DayResult {
    int conversions;
    double sales;
    double spend;
    double roas;
    double final_alpha;
    std::vector<WindowStats> windows;
};

// Every `window_size` auctions, the bidder's end_window() is called.
// If value_blind is above 0, the bidder is told every order is worth exactly that much,
// instead of each impression's predicted order value. That's how a strategy that ignores
// order value (like Target CPA) bids.
DayResult run_day(const std::vector<Impression>& day, TargetRoasBidder& bidder, std::size_t window_size,
                  double value_blind = 0.0);

// Writes one row per window, for charting.
void write_csv(const DayResult& result, const std::string& path);
