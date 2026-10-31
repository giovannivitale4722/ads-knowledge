// tests.cpp
// Checks your three TODOs against the spec in the README. Run with:  make test
#include <cmath>
#include <cstdio>

#include "troas_bidder.hpp"

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
        TargetRoasBidder b(3.0, 1.0, 0.25);
        check_near("bid = alpha * pconv * value / target (2%, $150, target 3)", b.bid(0.02, 150.0), 1.0);
        TargetRoasBidder c(4.0, 1.5, 0.25);
        check_near("bid scales with alpha (alpha 1.5, 4%, $100, target 4)", c.bid(0.04, 100.0), 1.5);
        check_near("a bigger order gets a bigger bid ($300 vs $100)", c.bid(0.04, 300.0), 4.5);
        check_near("bid is 0 when pconv is 0", c.bid(0.0, 100.0), 0.0);
    }

    std::printf("\nTODO 2: observe()\n");
    {
        TargetRoasBidder b(3.0, 1.0, 0.25);
        b.observe(true, 2.0, 0.0);    // won, paid $2, no purchase
        b.observe(true, 3.0, 90.0);   // won, paid $3, $90 order
        b.observe(false, 0.0, 0.0);   // lost: nothing changes
        check_near("counts wins", b.total_wins(), 2.0);
        check_near("adds up spend", b.total_spend(), 5.0);
        check_near("adds up sales", b.total_sales(), 90.0);
        check_near("counts a conversion only when sales > 0", b.total_conversions(), 1.0);
        check_near("roas() = sales / spend", b.roas(), 18.0);
    }

    std::printf("\nTODO 3: end_window()\n");
    {
        TargetRoasBidder b(3.0, 1.0, 0.25);
        b.observe(true, 10.0, 45.0);  // ROAS 450%, above the 300% target
        b.end_window();
        check_near("beating the target -> alpha goes up by exp(step * (ROAS - T) / T)", b.alpha(),
                   std::exp(0.25 * (4.5 - 3.0) / 3.0));
    }
    {
        TargetRoasBidder b(3.0, 1.0, 0.25);
        b.observe(true, 10.0, 15.0);  // ROAS 150%, below target
        b.end_window();
        check_near("below the target -> alpha goes down", b.alpha(), std::exp(0.25 * (1.5 - 3.0) / 3.0));
    }
    {
        TargetRoasBidder b(3.0, 1.0, 0.25);
        b.observe(true, 10.0, 30.0);  // exactly on target
        b.end_window();
        check_near("on target -> alpha unchanged", b.alpha(), 1.0);
    }
    {
        TargetRoasBidder b(3.0, 1.7, 0.25);
        b.observe(false, 0.0, 0.0);  // nothing won, nothing spent
        b.end_window();
        check_near("nothing spent yet -> alpha unchanged", b.alpha(), 1.7);
    }
    {
        TargetRoasBidder b(3.0, 1.0, 0.25);
        b.observe(true, 10.0, 0.0);  // spent $10, no sales yet: ROAS 0
        b.end_window();
        check_near("spent but no sales -> ROAS 0, alpha goes down", b.alpha(), std::exp(0.25 * -1.0));
    }
    {
        TargetRoasBidder b(3.0, 1.0, 0.25);
        b.observe(true, 10.0, 60.0);  // window 1: ROAS 600%
        b.end_window();
        b.observe(true, 10.0, 0.0);   // window 2: cumulative $60 / $20 = 300%
        b.end_window();
        const double want = std::exp(0.25 * 1.0) * std::exp(0.25 * 0.0);
        check_near("uses cumulative sales and spend, not just this window", b.alpha(), want);
    }
    {
        TargetRoasBidder b(3.0, 9.0, 50.0);  // huge step
        b.observe(true, 1.0, 100.0);
        b.end_window();
        check_near("alpha is clamped to max_alpha (10)", b.alpha(), 10.0);
        TargetRoasBidder c(3.0, 0.2, 50.0);
        c.observe(true, 100.0, 1.0);
        c.end_window();
        check_near("alpha is clamped to min_alpha (0.1)", c.alpha(), 0.1);
    }

    std::printf("\n%s\n", failures == 0 ? "All tests passed." : "Some tests failed. See the README for the spec.");
    return failures == 0 ? 0 : 1;
}
