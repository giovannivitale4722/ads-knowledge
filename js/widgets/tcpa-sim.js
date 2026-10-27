/* Shared Target CPA simulation used by the autobidder page's demos.
   A JavaScript copy of implementations/tcpa-autobidder (market.hpp, auction.hpp, simulate.cpp),
   with the same day length and window size. Same rules, different random numbers. */
const TCPA = (() => {
  const TARGET = 20, AUCTIONS = 100000, WINDOW = 1000;

  // seeded random numbers, so every visitor sees the same day
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const normal = r => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());

  // same shape as market.hpp: our pconv, competitors' noisy view of it, their bid levels
  const makeDay = (n = AUCTIONS, seed = 42) => {
    const r = rng(seed), day = [];
    for (let i = 0; i < n; i++) {
      const pconv = Math.min(0.30, Math.max(0.0005, Math.exp(Math.log(0.015) + 0.8 * normal(r))));
      const theirValue = pconv * Math.exp(0.45 * normal(r)) * TARGET;
      const competitor = Math.max(0.01, theirValue * Math.exp(Math.log(1.15) + 0.35 * normal(r)));
      day.push({ pconv, competitor, draw: r() });
    }
    return day;
  };

  // same rules as tcpa_bidder.cpp (bid, observe, end_window) and simulate.cpp (run_day)
  // trust: 0 = fixed step. Otherwise the step is scaled by conversions ÷ (conversions + trust),
  // so early, noisy windows move alpha less than later, data-rich ones.
  const runDay = (day, alpha0, step, window = WINDOW, trust = 0) => {
    let alpha = alpha0, spend = 0, convs = 0, wins = 0;
    const windows = [];
    day.forEach((imp, i) => {
      const bid = alpha * imp.pconv * TARGET;
      if (bid > imp.competitor && bid >= 0.01) {
        wins++; spend += Math.max(imp.competitor, 0.01);
        if (imp.draw < imp.pconv) convs++;
      }
      if ((i + 1) % window === 0 || i + 1 === day.length) {
        const used = alpha;
        const eff = trust ? step * convs / (convs + trust) : step;
        if (convs > 0) alpha = Math.min(10, Math.max(0.1, alpha * Math.exp(eff * (TARGET - spend / convs) / TARGET)));
        windows.push({ alpha: used, cpa: convs ? spend / convs : 0, convs, spend });
      }
    });
    return { convs, spend, wins, cpa: convs ? spend / convs : 0, alpha, windows };
  };

  // fixed alpha from 0.5 to 3: the curve behind the alpha dial
  let sweepCache = null;
  const sweep = day => {
    if (sweepCache) return sweepCache;
    const pts = [];
    for (let a = 0.5; a <= 3.0001; a += 0.05) pts.push({ alpha: +a.toFixed(2), ...runDay(day, a, 0) });
    const best = pts.filter(p => p.cpa <= TARGET).reduce((b, p) => (p.convs > b.convs ? p : b), { convs: -1 });
    return (sweepCache = { pts, best });
  };

  let dayCache = null;
  const day = () => dayCache || (dayCache = makeDay());

  return { TARGET, AUCTIONS, WINDOW, day, runDay, sweep };
})();
