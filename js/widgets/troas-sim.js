/* Shared Target ROAS simulation used by the Target ROAS page's demos.
   A JavaScript copy of implementations/troas-autobidder (market.hpp, auction.hpp, simulate.cpp),
   with the same day length, window size and target. Same rules, different random numbers. */
const TROAS = (() => {
  const TARGET = 3, AUCTIONS = 100000, WINDOW = 1000;
  const BUCKETS = [[0, 25, 'under $25'], [25, 50, '$25–50'], [50, 100, '$50–100'], [100, 200, '$100–200'], [200, Infinity, '$200+']];

  // seeded random numbers, so every visitor sees the same day
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const normal = r => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());

  // same shape as market.hpp
  const makeDay = (n = AUCTIONS, seed = 42) => {
    const r = rng(seed), day = [];
    for (let i = 0; i < n; i++) {
      const pconv = Math.min(0.30, Math.max(0.0005, Math.exp(Math.log(0.015) + 0.8 * normal(r))));
      const value = Math.min(1000, Math.max(5, Math.exp(Math.log(45) + 0.9 * normal(r))));
      const theirValue = pconv * value / TARGET * Math.exp(0.45 * normal(r));
      const competitor = Math.max(0.01, theirValue * Math.exp(Math.log(1.15) + 0.35 * normal(r)));
      const actual = value * Math.exp(-0.045 + 0.3 * normal(r));
      day.push({ pconv, value, competitor, draw: r(), actual });
    }
    return day;
  };

  // same rules as troas_bidder.cpp and simulate.cpp. blind > 0: every order is treated as worth `blind`.
  const runDay = (day, alpha0, step, blind = 0) => {
    let alpha = alpha0, spend = 0, sales = 0, orders = 0;
    const byBucket = BUCKETS.map(() => ({ sales: 0, orders: 0, spend: 0 }));
    day.forEach((imp, i) => {
      const bid = alpha * imp.pconv * (blind || imp.value) / TARGET;
      if (bid > imp.competitor && bid >= 0.01) {
        const price = Math.max(imp.competitor, 0.01), b = byBucket[BUCKETS.findIndex(([lo, hi]) => imp.value >= lo && imp.value < hi)];
        spend += price; b.spend += price;
        if (imp.draw < imp.pconv) { orders++; sales += imp.actual; b.orders++; b.sales += imp.actual; }
      }
      if ((i + 1) % WINDOW === 0 && spend > 0) alpha = Math.min(10, Math.max(0.1, alpha * Math.exp(step * (sales / spend - TARGET) / TARGET)));
    });
    return { alpha, spend, sales, orders, roas: spend ? sales / spend : 0, byBucket };
  };

  // best fixed alpha (most sales with ROAS at or above target), for value-aware and value-blind bidding
  let cache = null;
  const compare = () => {
    if (cache) return cache;
    const d = day(), avg = d.reduce((s, x) => s + x.value, 0) / d.length;
    const best = blind => {
      let top = null;
      for (let a = 0.3; a <= 5.0001; a += 0.05) { const r = runDay(d, a, 0, blind); if (r.roas >= TARGET && (!top || r.sales > top.sales)) top = { ...r, alpha: a }; }
      return top;
    };
    return (cache = { avg, aware: best(0), blind: best(avg) });
  };

  let dayCache = null;
  const day = () => dayCache || (dayCache = makeDay());
  return { TARGET, BUCKETS, day, runDay, compare };
})();
