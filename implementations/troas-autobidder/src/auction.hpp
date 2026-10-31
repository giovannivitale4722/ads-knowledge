// auction.hpp
// A single-slot second-price (Vickrey) auction against the best competing bid.
// If our bid is higher we win, and we pay the competitor's bid, not our own.
#pragma once

#include <algorithm>

struct AuctionResult {
    bool won;
    double price;  // what we pay if we won, otherwise 0
};

inline AuctionResult second_price(double our_bid, double competitor_bid, double reserve = 0.01) {
    if (our_bid > competitor_bid && our_bid >= reserve) {
        return {true, std::max(competitor_bid, reserve)};
    }
    return {false, 0.0};
}
