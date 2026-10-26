// main.cpp
// Simulates one day and compares three ways of bidding for a $20 target CPA:
//   1. Naive:      bid pconv * target with alpha fixed at 1
//   2. Hindsight:  the best fixed alpha, found by trying many after the day is over
//                  (impossible in real life, but it shows what "optimal" looks like)
//   3. Autobidder: your controller, which has to find alpha while the day runs
#include <cstdio>
#include <filesystem>

#include "market.hpp"
#include "simulate.hpp"
#include "tcpa_bidder.hpp"

namespace {

constexpr double kTargetCpa = 20.0;
constexpr std::size_t kAuctions = 100000;
constexpr std::size_t kWindow = 1000;
constexpr std::uint64_t kSeed = 42;

void print_row(const char* name, const DayResult& r) {
    std::printf("  %-28s %8d %12.2f %10.2f %10.3f\n", name, r.conversions, r.spend, r.cpa, r.final_alpha);
}

}  // namespace

int main() {
    const std::vector<Impression> day = make_market(kAuctions, kSeed, kTargetCpa);
    std::printf("Simulated day: %zu auctions, target CPA $%.2f\n\n", day.size(), kTargetCpa);

    // 1. Naive
    TargetCpaBidder naive(kTargetCpa, 1.0, /*step=*/0.0);
    const DayResult naive_result = run_day(day, naive, kWindow);

    // 2. Best fixed alpha in hindsight: most conversions with CPA at or below target
    DayResult best{};
    for (double a = 0.50; a <= 4.0001; a += 0.01) {
        TargetCpaBidder fixed(kTargetCpa, a, /*step=*/0.0);
        const DayResult r = run_day(day, fixed, kWindow);
        if (r.cpa <= kTargetCpa && r.conversions > best.conversions) best = r;
    }

    // 3. Your autobidder: starts at alpha = 1 and learns as it goes
    TargetCpaBidder autobidder(kTargetCpa, 1.0, /*step=*/0.5);
    const DayResult auto_result = run_day(day, autobidder, kWindow);

    std::printf("  %-28s %8s %12s %10s %10s\n", "Strategy", "Convs", "Spend ($)", "CPA ($)", "Alpha");
    print_row("Naive (alpha = 1)", naive_result);
    print_row("Best fixed alpha (hindsight)", best);
    print_row("Your autobidder", auto_result);

    if (best.conversions > 0) {
        std::printf("\nYour autobidder got %.1f%% of the hindsight-best conversions at a $%.2f CPA.\n",
                    100.0 * auto_result.conversions / best.conversions, auto_result.cpa);
    }

    std::filesystem::create_directories("results");
    write_csv(auto_result, "results/autobidder_windows.csv");
    std::printf("Per-window alpha and CPA written to results/autobidder_windows.csv\n");
    return 0;
}
