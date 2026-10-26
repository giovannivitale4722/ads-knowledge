// simulate.cpp
#include "simulate.hpp"

#include <fstream>

#include "auction.hpp"

DayResult run_day(const std::vector<Impression>& day, TargetCpaBidder& bidder, std::size_t window_size) {
    DayResult result{};
    int window = 0;
    for (std::size_t i = 0; i < day.size(); ++i) {
        const Impression& imp = day[i];
        const AuctionResult auction = second_price(bidder.bid(imp.pconv), imp.competitor_bid);
        const bool converted = auction.won && imp.conv_draw < imp.pconv;
        bidder.observe(auction.won, auction.price, converted);

        const bool window_done = (i + 1) % window_size == 0 || i + 1 == day.size();
        if (window_done) {
            const double alpha_used = bidder.alpha();
            bidder.end_window();
            result.windows.push_back({window++, alpha_used, bidder.cpa(), bidder.total_conversions(),
                                      bidder.total_spend()});
        }
    }
    result.conversions = bidder.total_conversions();
    result.spend = bidder.total_spend();
    result.cpa = bidder.cpa();
    result.final_alpha = bidder.alpha();
    return result;
}

void write_csv(const DayResult& result, const std::string& path) {
    std::ofstream out(path);
    out << "window,alpha,cumulative_cpa,cumulative_conversions,cumulative_spend\n";
    for (const WindowStats& w : result.windows) {
        out << w.window << ',' << w.alpha << ',' << w.cumulative_cpa << ','
            << w.cumulative_conversions << ',' << w.cumulative_spend << '\n';
    }
}
