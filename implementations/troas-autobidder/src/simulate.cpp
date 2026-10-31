// simulate.cpp
#include "simulate.hpp"

#include <fstream>

#include "auction.hpp"

DayResult run_day(const std::vector<Impression>& day, TargetRoasBidder& bidder, std::size_t window_size,
                  double value_blind) {
    DayResult result{};
    int window = 0;
    for (std::size_t i = 0; i < day.size(); ++i) {
        const Impression& imp = day[i];
        const double value_seen = value_blind > 0 ? value_blind : imp.order_value;
        const AuctionResult auction = second_price(bidder.bid(imp.pconv, value_seen), imp.competitor_bid);
        const bool converted = auction.won && imp.conv_draw < imp.pconv;
        bidder.observe(auction.won, auction.price, converted ? imp.actual_value : 0.0);

        const bool window_done = (i + 1) % window_size == 0 || i + 1 == day.size();
        if (window_done) {
            const double alpha_used = bidder.alpha();
            bidder.end_window();
            result.windows.push_back({window++, alpha_used, bidder.roas(), bidder.total_sales(),
                                      bidder.total_spend()});
        }
    }
    result.conversions = bidder.total_conversions();
    result.sales = bidder.total_sales();
    result.spend = bidder.total_spend();
    result.roas = bidder.roas();
    result.final_alpha = bidder.alpha();
    return result;
}

void write_csv(const DayResult& result, const std::string& path) {
    std::ofstream out(path);
    out << "window,alpha,cumulative_roas,cumulative_sales,cumulative_spend\n";
    for (const WindowStats& w : result.windows) {
        out << w.window << ',' << w.alpha << ',' << w.cumulative_roas << ',' << w.cumulative_sales << ','
            << w.cumulative_spend << '\n';
    }
}
