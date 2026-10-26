/* The four autobidding strategies on one simulated day (used by the Autobidding strategies page).
   Builds on the Target CPA day in tcpa-sim.js and adds a click prediction and an order value per impression.
   Every strategy bids  multiplier × value,  with its own value and its own way of setting the multiplier. */
const ABID = (() => {
  const T_CPA = 20, T_ROAS = 3, WINDOWS = 100;
  const STRATS = [
    { id: 'clicks', name: 'Maximize Clicks', goal: 'Clicks', limit: 'Budget' },
    { id: 'conv', name: 'Maximize Conversions', goal: 'Conversions', limit: 'Budget' },
    { id: 'tcpa', name: 'Target CPA', goal: 'Conversions', limit: 'Cost per conversion, budget' },
    { id: 'troas', name: 'Target ROAS', goal: 'Conversion value', limit: 'Value per $ spent, budget' }
  ];

  // add pCTR (always above pConv: a conversion needs a click) and an order value to each impression
  let dayCache = null;
  const day = () => {
    if (dayCache) return dayCache;
    let seed = 99;
    const r = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const normal = () => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
    dayCache = TCPA.day().map(imp => ({
      ...imp,
      pctr: Math.min(0.9, imp.pconv * Math.exp(Math.log(2.5) + 0.4 * normal())),
      order: 60 * Math.exp(0.6 * normal() - 0.18)   // average about $60
    }));
    return dayCache;
  };

  // the value each strategy puts on one impression, in $
  const VALUE = {
    clicks: imp => imp.pctr * 1,                       // $1 per expected click, scaled by the multiplier
    conv: imp => imp.pconv * T_CPA,                    // $20 per expected conversion, scaled
    tcpa: imp => imp.pconv * T_CPA,                    // pConv × target CPA
    troas: imp => imp.pconv * imp.order / T_ROAS       // expected order value ÷ target ROAS
  };

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  // Spend for one constant multiplier over the whole day, with no budget cap.
  const spendAt = (id, mult) => day().reduce((s, imp) => { const b = mult * VALUE[id](imp); return b > imp.competitor && b >= 0.01 ? s + Math.max(imp.competitor, 0.01) : s; }, 0);
  // Real systems carry yesterday's multiplier into today. As a stand-in, start from the constant
  // multiplier that would spend about the budget (found by bisection on a log scale).
  const startCache = {};
  const startMultiplier = (id, budget) => {
    const key = id + ':' + budget;
    if (startCache[key]) return startCache[key];
    let lo = Math.log(0.01), hi = Math.log(500);
    for (let k = 0; k < 22; k++) { const mid = (lo + hi) / 2; if (spendAt(id, Math.exp(mid)) > budget) hi = mid; else lo = mid; }
    return (startCache[key] = Math.exp(lo));
  };

  const run = (id, budget, opts = {}) => {
    const d = day(), per = d.length / WINDOWS;
    const paceStep = opts.paceStep ?? 0.5, effStep = opts.effStep ?? 0.25;
    const isTarget = id === 'tcpa' || id === 'troas';
    // Maximize strategies: one pacing multiplier, free to go anywhere.
    // Target strategies: an efficiency multiplier α, times a pacing factor p that can only slow bidding (p ≤ 1).
    let m = isTarget ? 1 : startMultiplier(id, budget), alpha = 1, p = 1;
    let spend = 0, clicks = 0, convs = 0, value = 0;
    const win = [];
    for (let w = 0; w < WINDOWS; w++) {
      const mult = isTarget ? alpha * p : m;
      for (let i = Math.round(w * per); i < Math.round((w + 1) * per); i++) {
        const imp = d[i], bid = mult * VALUE[id](imp);
        if (bid <= imp.competitor || bid < 0.01) continue;
        const price = Math.max(imp.competitor, 0.01);
        if (spend + price > budget) continue;            // never go over the daily budget
        spend += price;
        if (imp.draw < imp.pctr) clicks++;
        if (imp.draw < imp.pconv) { convs++; value += imp.order; }
      }
      // pacing: compare spend so far with an even plan through the day
      const plan = budget * (w + 1) / WINDOWS, paceErr = (plan - spend) / plan;
      if (isTarget) {
        p = clamp(p * Math.exp(paceStep * paceErr), 0.02, 1);
        if (id === 'tcpa' && convs > 0) alpha = clamp(alpha * Math.exp(effStep * (T_CPA - spend / convs) / T_CPA), 0.1, 10);
        if (id === 'troas' && spend > 0 && convs > 0) alpha = clamp(alpha * Math.exp(effStep * (value / spend - T_ROAS) / T_ROAS), 0.1, 10);
      } else {
        m = clamp(m * Math.exp(paceStep * paceErr), 0.05, 200);
      }
      win.push({ spend, mult, limited: isTarget ? (p < 0.97 ? 'budget' : 'target') : 'budget' });
    }
    const limitedBy = !isTarget ? 'Budget' : win.slice(-20).filter(x => x.limited === 'budget').length > 10 ? 'Budget' : id === 'tcpa' ? 'CPA target' : 'ROAS target';
    return { id, budget, spend, clicks, convs, value, cpa: convs ? spend / convs : 0, roas: spend ? value / spend : 0, windows: win, limitedBy };
  };

  return { T_CPA, T_ROAS, WINDOWS, STRATS, day, run, startMultiplier };
})();
