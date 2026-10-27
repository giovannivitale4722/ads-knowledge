// main.cpp
// Simulates one day and compares four ways of spending a daily budget:
//   1. No pacing:  m fixed at a confident $40, bidding until the money runs out
//   2. Hindsight:  the best fixed m, found by trying many after the day is over
//                  (impossible in real life, but it shows what "optimal" looks like)
//   3. Even plan:  your pacer, following a straight-line plan through the day
//   4. Traffic plan: your pacer, following a plan shaped like the day's traffic
#include <cstdio>
#include <filesystem>
#include <string>

#include "budget_pacer.hpp"
#include "market.hpp"
#include "simulate.hpp"

namespace {

constexpr double kBudget = 6000.0;
constexpr std::size_t kAuctions = 100000;
constexpr std::uint64_t kSeed = 42;
constexpr double kStartM = 20.0;  // where the pacers start: yesterday's m, say
constexpr double kStep = 0.5;

void print_row(const char* name, const DayResult& r) {
    const std::string gone = r.budget_gone_window >= 0 ? clock_time(r.budget_gone_window) : "never";
    std::printf("  %-26s %8d %12.2f %10.2f %8.2f %12s\n", name, r.conversions, r.spend, r.cpa, r.final_m,
                gone.c_str());
}

}  // namespace

int main() {
    const std::vector<Impression> day = make_market(kAuctions, kSeed);
    const std::vector<double> traffic = expected_traffic();
    const std::vector<double> traffic_plan = make_plan(kBudget, traffic);
    const std::vector<double> even_plan = make_plan(kBudget, std::vector<double>(traffic.size(), 1.0));
    std::printf("Simulated day: %zu auctions over 24 hours, daily budget $%.2f\n\n", day.size(), kBudget);

    // 1. No pacing
    BudgetPacer greedy(kBudget, traffic_plan, 40.0, /*step=*/0.0);
    const DayResult greedy_result = run_day(day, greedy, traffic_plan);

    // 2. Best fixed m in hindsight: most conversions within the budget
    DayResult best{};
    for (double m = 2.0; m <= 60.0001; m += 0.1) {
        BudgetPacer fixed(kBudget, traffic_plan, m, /*step=*/0.0);
        const DayResult r = run_day(day, fixed, traffic_plan);
        if (r.conversions > best.conversions) best = r;
    }

    // 3 and 4. Your pacer, with each plan
    BudgetPacer even(kBudget, even_plan, kStartM, kStep);
    const DayResult even_result = run_day(day, even, even_plan);
    BudgetPacer shaped(kBudget, traffic_plan, kStartM, kStep);
    const DayResult shaped_result = run_day(day, shaped, traffic_plan);

    std::printf("  %-26s %8s %12s %10s %8s %12s\n", "Strategy", "Convs", "Spend ($)", "CPA ($)", "m", "Budget gone");
    print_row("No pacing (m = 40)", greedy_result);
    print_row("Best fixed m (hindsight)", best);
    print_row("Your pacer, even plan", even_result);
    print_row("Your pacer, traffic plan", shaped_result);

    if (best.conversions > 0) {
        std::printf("\nWith the traffic plan, your pacer got %.1f%% of the hindsight-best conversions.\n",
                    100.0 * shaped_result.conversions / best.conversions);
    }

    std::filesystem::create_directories("results");
    write_csv(even_result, "results/even_plan_windows.csv");
    write_csv(shaped_result, "results/traffic_plan_windows.csv");
    std::printf("Per-window m and spend written to results/even_plan_windows.csv and results/traffic_plan_windows.csv\n");
    return 0;
}
