// main.cpp
// Simulates one day for an online shop with a 300% ROAS target, and compares:
//   1. Naive:        bid pconv * order_value / target with alpha fixed at 1
//   2. Hindsight:    the best fixed alpha, found by trying many after the day is over
//                    (impossible in real life, but it shows what "optimal" looks like)
//   3. Value-blind:  the best fixed alpha for a bidder that treats every order as
//                    average-sized, like Target CPA does. Also tuned in hindsight.
//   4. Autobidder:   your controller, which has to find alpha while the day runs
#include <cstdio>
#include <filesystem>

#include "market.hpp"
#include "simulate.hpp"
#include "troas_bidder.hpp"

namespace {

constexpr double kTargetRoas = 3.0;
constexpr std::size_t kAuctions = 100000;
constexpr std::size_t kWindow = 1000;
constexpr std::uint64_t kSeed = 42;

void print_row(const char* name, const DayResult& r) {
    std::printf("  %-30s %8d %12.0f %10.0f %8.0f%% %8.3f\n", name, r.conversions, r.sales, r.spend, 100 * r.roas,
                r.final_alpha);
}

// Most sales with ROAS at or above the target, over fixed alphas from 0.3 to 5.
DayResult best_fixed(const std::vector<Impression>& day, double value_blind) {
    DayResult best{};
    for (double a = 0.30; a <= 5.0001; a += 0.01) {
        TargetRoasBidder fixed(kTargetRoas, a, /*step=*/0.0);
        const DayResult r = run_day(day, fixed, kWindow, value_blind);
        if (r.roas >= kTargetRoas && r.sales > best.sales) best = r;
    }
    return best;
}

}  // namespace

int main() {
    const std::vector<Impression> day = make_market(kAuctions, kSeed, kTargetRoas);
    double value_sum = 0.0;
    for (const Impression& imp : day) value_sum += imp.order_value;
    const double average_order = value_sum / day.size();
    std::printf("Simulated day: %zu auctions, target ROAS %.0f%%, average order $%.2f\n\n", day.size(),
                100 * kTargetRoas, average_order);

    TargetRoasBidder naive(kTargetRoas, 1.0, /*step=*/0.0);
    const DayResult naive_result = run_day(day, naive, kWindow);
    const DayResult best = best_fixed(day, 0.0);
    const DayResult blind = best_fixed(day, average_order);
    TargetRoasBidder autobidder(kTargetRoas, 1.0, /*step=*/0.25);
    const DayResult auto_result = run_day(day, autobidder, kWindow);

    std::printf("  %-30s %8s %12s %10s %9s %8s\n", "Strategy", "Orders", "Sales ($)", "Spend ($)", "ROAS", "Alpha");
    print_row("Naive (alpha = 1)", naive_result);
    print_row("Best fixed alpha (hindsight)", best);
    print_row("Value-blind, best alpha", blind);
    print_row("Your autobidder", auto_result);

    if (best.sales > 0 && blind.sales > 0) {
        std::printf("\nUsing order values earns %.0f%% more sales than ignoring them, at the same ROAS target.\n",
                    100.0 * (best.sales / blind.sales - 1.0));
        std::printf("Your autobidder got %.1f%% of the hindsight-best sales at a %.0f%% ROAS.\n",
                    100.0 * auto_result.sales / best.sales, 100 * auto_result.roas);
    }

    std::filesystem::create_directories("results");
    write_csv(auto_result, "results/autobidder_windows.csv");
    std::printf("Per-window alpha and ROAS written to results/autobidder_windows.csv\n");
    return 0;
}
