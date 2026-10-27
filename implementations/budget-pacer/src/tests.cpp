// tests.cpp
// Checks your three TODOs against the spec in the README. Run with:  make test
#include <cmath>
#include <cstdio>
#include <vector>

#include "budget_pacer.hpp"

namespace {

int failures = 0;

void check(bool ok, const char* name, double got, double want) {
    if (ok) {
        std::printf("  PASS  %s\n", name);
    } else {
        std::printf("  FAIL  %s  (got %.6f, expected %.6f)\n", name, got, want);
        ++failures;
    }
}

void check_near(const char* name, double got, double want) {
    check(std::fabs(got - want) < 1e-9, name, got, want);
}

double at(const std::vector<double>& v, std::size_t i) { return i < v.size() ? v[i] : NAN; }

}  // namespace

int main() {
    std::printf("TODO 1: make_plan()\n");
    {
        const std::vector<double> plan = make_plan(100.0, {1.0, 3.0});
        check(plan.size() == 2, "one entry per window", static_cast<double>(plan.size()), 2.0);
        check_near("plan[0] = budget * 1 / 4", at(plan, 0), 25.0);
        check_near("last entry is the whole budget", at(plan, 1), 100.0);
    }
    {
        const std::vector<double> plan = make_plan(80.0, {1.0, 1.0, 1.0, 1.0});
        check_near("equal traffic -> straight line (window 2 of 4)", at(plan, 1), 40.0);
    }
    {
        const std::vector<double> plan = make_plan(90.0, {0.5, 2.0, 0.5});
        check_near("cumulative, not per window (busy middle window)", at(plan, 1), 75.0);
    }

    std::printf("\nTODO 2: bid()\n");
    {
        BudgetPacer b(100.0, {100.0}, 20.0, 0.5);
        check_near("bid = m * pconv (m 20, pconv 5%)", b.bid(0.05), 1.0);
        check_near("bid is 0 when pconv is 0", b.bid(0.0), 0.0);
    }
    {
        BudgetPacer b(100.0, {100.0}, 20.0, 0.5);
        b.observe(true, 99.5, false);  // only $0.50 left
        check_near("bid is capped at the remaining budget", b.bid(0.05), 0.5);
    }

    std::printf("\nTODO 3: end_window()\n");
    {
        BudgetPacer b(100.0, {50.0, 100.0}, 10.0, 0.5);
        b.observe(true, 25.0, false);  // spent $25, plan says $50: behind
        b.end_window();
        check_near("behind plan -> m goes up by exp(step * (planned - spent) / planned)", b.m(),
                   10.0 * std::exp(0.5 * 0.5));
    }
    {
        BudgetPacer b(100.0, {50.0, 100.0}, 10.0, 0.5);
        b.observe(true, 75.0, false);  // spent $75, plan says $50: ahead
        b.end_window();
        check_near("ahead of plan -> m goes down", b.m(), 10.0 * std::exp(0.5 * -0.5));
    }
    {
        BudgetPacer b(100.0, {50.0, 100.0}, 10.0, 0.5);
        b.observe(true, 50.0, false);
        b.end_window();
        check_near("on plan -> m unchanged", b.m(), 10.0);
    }
    {
        BudgetPacer b(100.0, {20.0, 50.0, 100.0}, 10.0, 0.5);
        b.end_window();
        check_near("window_ moves on after each window", b.window(), 1.0);
        b.observe(true, 50.0, false);  // window 2's plan is $50: now exactly on plan
        b.end_window();
        check_near("second window compares with plan[1], not plan[0]", b.m(), 10.0 * std::exp(0.5));
    }
    {
        BudgetPacer b(100.0, {0.0, 100.0}, 10.0, 0.5);
        b.end_window();
        check_near("planned 0 -> m unchanged", b.m(), 10.0);
        check_near("planned 0 -> window_ still moves on", b.window(), 1.0);
    }
    {
        BudgetPacer b(100.0, {50.0, 100.0}, 150.0, 50.0);  // huge step, spent nothing
        b.end_window();
        check_near("m is clamped to max_m (200)", b.m(), 200.0);
        BudgetPacer c(100.0, {10.0, 100.0}, 2.0, 50.0);
        c.observe(true, 90.0, false);
        c.end_window();
        check_near("m is clamped to min_m (1)", c.m(), 1.0);
    }
    {
        BudgetPacer b(100.0, {50.0, 100.0}, 12.5, 0.0);
        b.observe(true, 5.0, false);
        b.end_window();
        check_near("step 0 -> m never changes", b.m(), 12.5);
    }

    std::printf("\n%s\n", failures == 0 ? "All tests passed." : "Some tests failed. See the README for the spec.");
    return failures == 0 ? 0 : 1;
}
