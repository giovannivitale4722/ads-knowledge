// simulate.hpp
// Runs one simulated day for a bidder and reports what happened.
#pragma once

#include <cstddef>
#include <string>
#include <vector>

#include "market.hpp"
#include "tcpa_bidder.hpp"

struct WindowStats {
    int window;
    double alpha;            // alpha used during this window
    double cumulative_cpa;   // spend / conversions so far
    int cumulative_conversions;
    double cumulative_spend;
};

struct DayResult {
    int conversions;
    double spend;
    double cpa;
    double final_alpha;
    std::vector<WindowStats> windows;
};

// Every `window_size` auctions, the bidder's end_window() is called.
DayResult run_day(const std::vector<Impression>& day, TargetCpaBidder& bidder, std::size_t window_size);

// Writes one row per window, for charting.
void write_csv(const DayResult& result, const std::string& path);
