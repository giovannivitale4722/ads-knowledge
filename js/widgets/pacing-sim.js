/* Shared budget pacing simulation used by the Maximize Conversions page's demos.
   A JavaScript copy of implementations/budget-pacer (market.hpp, auction.hpp, budget_pacer.cpp,
   simulate.cpp), with the same budget, traffic curve and window length. Same rules, different random numbers. */
const PACE = (() => {
  const BUDGET = 6000, AUCTIONS = 100000, WINDOWS = 96, START_M = 20, MIN_M = 1, MAX_M = 200;
  const HOURLY = [0.25, 0.18, 0.14, 0.12, 0.13, 0.20, 0.40, 0.65, 0.85, 0.95, 1.00, 1.00,
    0.98, 0.95, 0.92, 0.90, 0.90, 0.92, 0.98, 1.00, 0.95, 0.80, 0.60, 0.40];
  const TRAFFIC = Array.from({ length: WINDOWS }, (_, w) => HOURLY[Math.floor(w / 4)]);

  // seeded random numbers, so every visitor sees the same day
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const normal = r => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());

  // same as make_plan() in budget_pacer.cpp: cumulative spend by the end of each window
  const makePlan = (budget, traffic) => {
    const total = traffic.reduce((s, t) => s + t, 0);
    let run = 0;
    return traffic.map(t => budget * (run += t) / total);
  };
  const PLANS = { traffic: makePlan(BUDGET, TRAFFIC), even: makePlan(BUDGET, TRAFFIC.map(() => 1)) };

  // same shape as market.hpp: auctions split across windows by traffic
  const makeDay = (n = AUCTIONS, seed = 42) => {
    const r = rng(seed), day = [], total = TRAFFIC.reduce((s, t) => s + t, 0);
    let cum = 0, made = 0;
    TRAFFIC.forEach((t, w) => {
      cum += t;
      for (const until = Math.round(n * cum / total); made < until; made++) {
        const pconv = Math.min(0.30, Math.max(0.0005, Math.exp(Math.log(0.015) + 0.8 * normal(r))));
        const theirValue = pconv * Math.exp(0.45 * normal(r)) * 20;
        const competitor = Math.max(0.01, theirValue * Math.exp(Math.log(1.15) + 0.35 * normal(r)));
        day.push({ w, pconv, competitor, draw: r() });
      }
    });
    return day;
  };

  // same rules as budget_pacer.cpp (bid, observe, end_window) and simulate.cpp (run_day)
  const runDay = (day, m0, step, plan = PLANS.traffic) => {
    let m = m0, spend = 0, convs = 0, gone = -1;
    const windows = [];
    day.forEach((imp, i) => {
      const bid = Math.min(m * imp.pconv, BUDGET - spend);
      if (bid > imp.competitor && bid >= 0.01) {
        spend += Math.max(imp.competitor, 0.01);
        if (imp.draw < imp.pconv) convs++;
      }
      if (i + 1 === day.length || day[i + 1].w !== imp.w) {
        const used = m, planned = plan[imp.w];
        if (planned > 0) m = Math.min(MAX_M, Math.max(MIN_M, m * Math.exp(step * (planned - spend) / planned)));
        windows.push({ m: used, spend, planned, convs });
        if (gone < 0 && spend >= 0.99 * BUDGET) gone = imp.w;
      }
    });
    return { convs, spend, cpa: convs ? spend / convs : 0, m, gone, windows };
  };

  // fixed m from 2 to 60: the curve behind the m dial
  let sweepCache = null;
  const sweep = day => {
    if (sweepCache) return sweepCache;
    const pts = [];
    for (let m = 2; m <= 60.0001; m += 0.5) pts.push({ mult: +m.toFixed(1), ...runDay(day, m, 0) });
    const best = pts.reduce((b, p) => (p.convs > b.convs ? p : b), pts[0]);
    return (sweepCache = { pts, best });
  };

  // "13:45" for the end of window w
  const clock = w => { const mins = (w + 1) * 15; return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`; };

  let dayCache = null;
  const day = () => dayCache || (dayCache = makeDay());

  return { BUDGET, WINDOWS, START_M, HOURLY, TRAFFIC, PLANS, day, runDay, sweep, clock };
})();
