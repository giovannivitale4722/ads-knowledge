// simulate.cpp
#include "simulate.hpp"

#include <cstdio>
#include <fstream>

#include "auction.hpp"

DayResult run_day(const std::vector<Impression>& day, BudgetPacer& bidder, const std::vector<double>& plan) {
    DayResult result{};
    result.budget_gone_window = -1;
    for (std::size_t i = 0; i < day.size(); ++i) {
        const Impression& imp = day[i];
        const AuctionResult auction = second_price(bidder.bid(imp.pconv), imp.competitor_bid);
        const bool converted = auction.won && imp.conv_draw < imp.pconv;
        bidder.observe(auction.won, auction.price, converted);

        const bool window_done = i + 1 == day.size() || day[i + 1].window != imp.window;
        if (window_done) {
            const double m_used = bidder.m();
            bidder.end_window();
            const double planned = imp.window < static_cast<int>(plan.size()) ? plan[imp.window] : 0.0;
            result.windows.push_back({imp.window, m_used, bidder.total_spend(), planned, bidder.total_conversions()});
            if (result.budget_gone_window < 0 && bidder.total_spend() >= 0.99 * bidder.budget()) {
                result.budget_gone_window = imp.window;
            }
        }
    }
    result.conversions = bidder.total_conversions();
    result.spend = bidder.total_spend();
    result.cpa = bidder.cpa();
    result.final_m = bidder.m();
    return result;
}

void write_csv(const DayResult& result, const std::string& path) {
    std::ofstream out(path);
    out << "window,time,m,cumulative_spend,planned_spend,cumulative_conversions\n";
    for (const WindowStats& w : result.windows) {
        out << w.window << ',' << clock_time(w.window) << ',' << w.m << ',' << w.cumulative_spend << ','
            << w.planned_spend << ',' << w.cumulative_conversions << '\n';
    }
}

std::string clock_time(int window) {
    const int minutes = (window + 1) * 15;
    char buf[8];
    std::snprintf(buf, sizeof buf, "%02d:%02d", minutes / 60, minutes % 60);
    return buf;
}
