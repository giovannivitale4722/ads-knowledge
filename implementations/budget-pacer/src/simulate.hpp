// simulate.hpp
// Runs one simulated day for a bidder and reports what happened.
#pragma once

#include <string>
#include <vector>

#include "budget_pacer.hpp"
#include "market.hpp"

struct WindowStats {
    int window;
    double m;                 // m used during this window
    double cumulative_spend;  // spend so far, at the end of the window
    double planned_spend;     // what the plan said we should have spent by now
    int cumulative_conversions;
};

struct DayResult {
    int conversions;
    double spend;
    double cpa;
    double final_m;
    int budget_gone_window;  // first window that ended with 99% of the budget spent, or -1
    std::vector<WindowStats> windows;
};

// Calls the bidder for every auction, and its end_window() after the last auction
// of each 15-minute window. `plan` is only used for reporting.
DayResult run_day(const std::vector<Impression>& day, BudgetPacer& bidder, const std::vector<double>& plan);

// Writes one row per window, for charting.
void write_csv(const DayResult& result, const std::string& path);

// "13:45" for the end of a window.
std::string clock_time(int window);
