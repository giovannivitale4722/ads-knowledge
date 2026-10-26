// tests.cpp
// Checks your two TODOs against the spec in the README. Run with:  make test
#include <cmath>
#include <cstdio>

#include "tcpa_bidder.hpp"

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

}  // namespace

int main() {
    std::printf("TODO 1: bid()\n");
    {
        TargetCpaBidder b(20.0, 1.0, 0.5);
        check_near("bid = alpha * pconv * target (alpha 1, pconv 5%)", b.bid(0.05), 1.0);
        TargetCpaBidder c(20.0, 1.3, 0.5);
        check_near("bid scales with alpha (alpha 1.3, pconv 10%)", c.bid(0.10), 2.6);
        check_near("bid is 0 when pconv is 0", c.bid(0.0), 0.0);
    }

    std::printf("\nTODO 2: end_window()\n");
    {
        TargetCpaBidder b(20.0, 1.0, 0.5);
        b.observe(true, 10.0, true);  // CPA $10, below the $20 target
        b.end_window();
        check_near("cheaper than target -> alpha goes up by exp(step * (T - CPA) / T)", b.alpha(),
                   std::exp(0.5 * (20.0 - 10.0) / 20.0));
    }
    {
        TargetCpaBidder b(20.0, 1.0, 0.5);
        b.observe(true, 40.0, true);  // CPA $40, above target
        b.end_window();
        check_near("more expensive than target -> alpha goes down", b.alpha(), std::exp(0.5 * (20.0 - 40.0) / 20.0));
    }
    {
        TargetCpaBidder b(20.0, 1.0, 0.5);
        b.observe(true, 20.0, true);  // exactly on target
        b.end_window();
        check_near("on target -> alpha unchanged", b.alpha(), 1.0);
    }
    {
        TargetCpaBidder b(20.0, 1.7, 0.5);
        b.observe(true, 5.0, false);  // spent money, no conversions yet
        b.observe(false, 0.0, false);
        b.end_window();
        check_near("no conversions yet -> alpha unchanged", b.alpha(), 1.7);
    }
    {
        TargetCpaBidder b(20.0, 1.0, 0.5);
        b.observe(true, 10.0, true);  // window 1: CPA $10
        b.end_window();
        b.observe(true, 30.0, false);  // window 2: cumulative spend $40, 1 conversion -> CPA $40
        b.end_window();
        const double want = std::exp(0.5 * 0.5) * std::exp(0.5 * (20.0 - 40.0) / 20.0);
        check_near("uses cumulative spend and conversions, not just this window", b.alpha(), want);
    }
    {
        TargetCpaBidder b(20.0, 9.0, 50.0);  // huge step
        b.observe(true, 1.0, true);
        b.end_window();
        check_near("alpha is clamped to max_alpha (10)", b.alpha(), 10.0);
        TargetCpaBidder c(20.0, 0.2, 50.0);
        c.observe(true, 500.0, true);
        c.end_window();
        check_near("alpha is clamped to min_alpha (0.1)", c.alpha(), 0.1);
    }
    {
        TargetCpaBidder b(20.0, 1.25, 0.0);
        b.observe(true, 3.0, true);
        b.end_window();
        check_near("step 0 -> alpha never changes", b.alpha(), 1.25);
    }

    std::printf("\n%s\n", failures == 0 ? "All tests passed." : "Some tests failed. See the README for the spec.");
    return failures == 0 ? 0 : 1;
}
