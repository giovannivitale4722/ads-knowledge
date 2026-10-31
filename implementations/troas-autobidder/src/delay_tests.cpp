// delay_tests.cpp
// Checks the three conversion delay TODOs. Run with:  make test-delay
#include <cmath>
#include <cstdio>

#include "delayed_bidder.hpp"

namespace {

int failures = 0;

void check_near(const char* name, double got, double want) {
    if (std::fabs(got - want) < 1e-9) {
        std::printf("  PASS  %s\n", name);
    } else {
        std::printf("  FAIL  %s  (got %.6f, expected %.6f)\n", name, got, want);
        ++failures;
    }
}

// Mean delay 1 window. Two click windows: $10 then $20 spent, models predict $100 then $60
// of sales, and $80 then $30 have been reported so far.
DelayedRoasBidder make(DelayMode mode, double alpha = 1.0, double step = 0.25) {
    DelayedRoasBidder b(3.0, alpha, step, mode, 1.0, 4);
    b.observe_click(0, 10.0, 100.0);
    b.observe_click(1, 20.0, 60.0);
    b.observe_sale(0, 80.0);
    b.observe_sale(1, 30.0);
    return b;
}

const double c0 = 1 - std::exp(-2.0);  // completion of window 0, one window later
const double c1 = 1 - std::exp(-1.0);  // completion of window 1, just finished

}  // namespace

int main() {
    std::printf("TODO 1: scaled_sales()\n");
    {
        const DelayedRoasBidder b = make(DelayMode::ScaleUp);
        check_near("each window's sales divided by its completion: 80/0.865 + 30/0.632", b.scaled_sales(1),
                   80 / c0 + 30 / c1);
        check_near("only windows up to `now` count (now = 0: just window 0)", b.scaled_sales(0),
                   80 / (1 - std::exp(-1.0)));
    }

    std::printf("\nTODO 2: blended_sales()\n");
    {
        const DelayedRoasBidder b = make(DelayMode::Blend);
        check_near("reported + (1 - completion) * predicted, per window", b.blended_sales(1),
                   80 + (1 - c0) * 100 + 30 + (1 - c1) * 60);
        check_near("only windows up to `now` count (now = 0)", b.blended_sales(0),
                   80 + std::exp(-1.0) * 100);
    }

    std::printf("\nTODO 3: end_window()\n");
    {
        DelayedRoasBidder b = make(DelayMode::Naive);  // reported: $110 / $30 = 367%
        b.end_window(1);
        check_near("naive uses reported sales", b.alpha(), std::exp(0.25 * (110.0 / 30 - 3) / 3));
    }
    {
        DelayedRoasBidder b = make(DelayMode::ScaleUp);
        b.end_window(1);
        const double roas = (80 / c0 + 30 / c1) / 30;
        check_near("scale up uses scaled_sales", b.alpha(), std::exp(0.25 * (roas - 3) / 3));
    }
    {
        DelayedRoasBidder b = make(DelayMode::Blend);
        b.end_window(1);
        const double roas = (80 + (1 - c0) * 100 + 30 + (1 - c1) * 60) / 30;
        check_near("blend uses blended_sales", b.alpha(), std::exp(0.25 * (roas - 3) / 3));
    }
    {
        DelayedRoasBidder b(3.0, 1.7, 0.25, DelayMode::Blend, 1.0, 4);
        b.end_window(0);
        check_near("nothing spent yet -> alpha unchanged", b.alpha(), 1.7);
    }
    {
        DelayedRoasBidder b = make(DelayMode::Naive, 9.0, 50.0);
        b.end_window(1);
        check_near("alpha is clamped to max_alpha (10)", b.alpha(), 10.0);
    }

    std::printf("\n%s\n", failures == 0 ? "All tests passed." : "Some tests failed. See the README for the spec.");
    return failures == 0 ? 0 : 1;
}
