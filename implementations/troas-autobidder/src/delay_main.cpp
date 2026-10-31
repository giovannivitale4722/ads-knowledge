// delay_main.cpp
// The conversion delay extension. Run with:  make run-delay
//
// The same day and the same 300% ROAS target as main.cpp, but now each sale arrives a
// random number of windows after its click, like real purchases arriving hours later.
// Sales that would arrive after midnight are never seen during the day, but they still
// count in the final results, the way a conversion window keeps counting after the day ends.
//
// Compares:
//   1. Instant sales:  no delay, the unrealistic setup of the main project
//   2. Naive:          delayed sales, and the controller trusts what's reported so far
//   3. Scale up:       reported sales divided by the share that has usually arrived (TODO 1)
//   4. Blend:          reported sales plus the models' prediction for the rest (TODO 2)
#include <cstdio>
#include <filesystem>
#include <fstream>
#include <random>
#include <vector>

#include "auction.hpp"
#include "delayed_bidder.hpp"
#include "market.hpp"

namespace {

constexpr double kTargetRoas = 3.0;
constexpr std::size_t kAuctions = 100000;
constexpr std::size_t kWindow = 1000;
constexpr int kWindows = 100;              // 100 windows = 24 hours, so one window is about 15 minutes
constexpr double kMeanDelayWindows = 16;  // about 4 hours on average, sometimes much longer
constexpr double kStep = 0.25;
constexpr std::uint64_t kSeed = 42;
constexpr std::uint64_t kDelaySeed = 7;

struct DelayedResult {
    double spend = 0, true_sales = 0, reported_by_midnight = 0, final_alpha = 0;
    int orders = 0;
    std::vector<double> alpha_by_window, reported_roas_by_window, true_roas_by_window;
};

// Each sale's delay in windows: an exponential wait, rounded down.
std::vector<int> make_delays(std::size_t n, double mean_windows) {
    std::mt19937_64 rng(kDelaySeed);
    std::exponential_distribution<double> wait(mean_windows > 0 ? 1.0 / mean_windows : 1.0);
    std::vector<int> delays(n, 0);
    if (mean_windows > 0) {
        for (int& d : delays) d = static_cast<int>(wait(rng));
    }
    return delays;
}

DelayedResult run_delayed_day(const std::vector<Impression>& day, const std::vector<int>& delays,
                              DelayedRoasBidder& bidder) {
    struct Pending { int click_window; double sales; };
    std::vector<std::vector<Pending>> arriving(kWindows);  // arriving[w]: sales landing at the end of window w
    DelayedResult r;
    double true_sales_so_far = 0;
    for (std::size_t i = 0; i < day.size(); ++i) {
        const int w = static_cast<int>(i / kWindow);
        const Impression& imp = day[i];
        const AuctionResult auction = second_price(bidder.bid(imp.pconv, imp.order_value), imp.competitor_bid);
        if (auction.won) {
            bidder.observe_click(w, auction.price, imp.pconv * imp.order_value);
            r.spend += auction.price;
            if (imp.conv_draw < imp.pconv) {
                ++r.orders;
                r.true_sales += imp.actual_value;
                true_sales_so_far += imp.actual_value;
                const int lands = w + delays[i];
                if (lands < kWindows) arriving[lands].push_back({w, imp.actual_value});
            }
        }
        if ((i + 1) % kWindow == 0) {
            for (const Pending& p : arriving[w]) bidder.observe_sale(p.click_window, p.sales);
            r.alpha_by_window.push_back(bidder.alpha());
            bidder.end_window(w);
            r.reported_roas_by_window.push_back(bidder.reported_roas());
            r.true_roas_by_window.push_back(r.spend > 0 ? true_sales_so_far / r.spend : 0);
        }
    }
    r.reported_by_midnight = bidder.reported_sales();
    r.final_alpha = bidder.alpha();
    return r;
}

DelayedResult simulate(const std::vector<Impression>& day, double mean_delay, DelayMode mode, double alpha0,
                       double step) {
    DelayedRoasBidder bidder(kTargetRoas, alpha0, step, mode, mean_delay, kWindows);
    return run_delayed_day(day, make_delays(day.size(), mean_delay), bidder);
}

void print_row(const char* name, const DelayedResult& r) {
    std::printf("  %-28s %7d %11.0f %10.0f %10.0f%% %15.0f%% %7.2f\n", name, r.orders, r.true_sales, r.spend,
                100 * r.true_sales / r.spend, 100 * r.reported_by_midnight / r.spend, r.final_alpha);
}

}  // namespace

int main() {
    const std::vector<Impression> day = make_market(kAuctions, kSeed, kTargetRoas);
    std::printf("Simulated day: %zu auctions, target ROAS %.0f%%. Sales arrive on average %.0f windows\n"
                "(about %.0f hours) after the click.\n\n", day.size(), 100 * kTargetRoas, kMeanDelayWindows,
                kMeanDelayWindows * 24 / kWindows);

    DelayedResult best{};
    for (double a = 0.30; a <= 5.0001; a += 0.01) {
        const DelayedResult r = simulate(day, 0, DelayMode::Naive, a, 0.0);
        if (r.true_sales / r.spend >= kTargetRoas && r.true_sales > best.true_sales) best = r;
    }
    const DelayedResult instant = simulate(day, 0, DelayMode::Naive, 1.0, kStep);
    const DelayedResult naive = simulate(day, kMeanDelayWindows, DelayMode::Naive, 1.0, kStep);
    const DelayedResult scaled = simulate(day, kMeanDelayWindows, DelayMode::ScaleUp, 1.0, kStep);
    const DelayedResult blended = simulate(day, kMeanDelayWindows, DelayMode::Blend, 1.0, kStep);

    std::printf("  %-28s %7s %11s %10s %11s %16s %7s\n", "Strategy", "Orders", "Sales ($)", "Spend ($)", "True ROAS",
                "Seen by midnight", "Alpha");
    print_row("Best fixed alpha (hindsight)", best);
    print_row("Instant sales (no delay)", instant);
    print_row("Delayed, naive", naive);
    print_row("Delayed, scale up", scaled);
    print_row("Delayed, blend", blended);

    if (best.true_sales > 0) {
        std::printf("\nShare of the hindsight-best sales: naive %.0f%%, scale up %.0f%%, blend %.0f%%.\n",
                    100 * naive.true_sales / best.true_sales, 100 * scaled.true_sales / best.true_sales,
                    100 * blended.true_sales / best.true_sales);
    }
    std::printf("\"Seen by midnight\" is the ROAS the bidder could see at the end of the day. The gap to the\n"
                "true ROAS is the sales still on their way.\n");

    std::filesystem::create_directories("results");
    std::ofstream out("results/delay_windows.csv");
    out << "window,naive_alpha,naive_reported_roas,scale_up_alpha,blend_alpha,blend_true_roas\n";
    for (int w = 0; w < kWindows; ++w) {
        out << w << ',' << naive.alpha_by_window[w] << ',' << naive.reported_roas_by_window[w] << ','
            << scaled.alpha_by_window[w] << ',' << blended.alpha_by_window[w] << ','
            << blended.true_roas_by_window[w] << '\n';
    }
    std::printf("Per-window alpha and ROAS written to results/delay_windows.csv\n");
    return 0;
}
