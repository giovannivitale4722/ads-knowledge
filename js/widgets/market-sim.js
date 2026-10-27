/* "When everyone autobids": several Target CPA advertisers competing in the same second-price auctions.
   Each autobidder runs the same alpha controller as the Target CPA page; manual bidders keep alpha at 1. */
const MKT = (() => {
  const ADS = [
    { id: 'A', target: 20 }, { id: 'B', target: 20 }, { id: 'C', target: 28 }, { id: 'D', target: 14 }
  ];
  const N = 60000, WINDOWS = 100, RESERVE = 0.05;

  let dayCache = null;
  const day = () => {
    if (dayCache) return dayCache;
    let seed = 2024;
    const r = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const normal = () => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
    dayCache = Array.from({ length: N }, () => {
      const base = Math.exp(Math.log(0.015) + 0.7 * normal());          // how valuable this impression is overall
      return { pconv: ADS.map(() => Math.min(0.3, base * Math.exp(0.5 * normal()))), draw: r() };  // each advertiser's own view
    });
    return dayCache;
  };

  // autobid: array of booleans, which advertisers run the controller
  const run = (autobid, step) => {
    const d = day(), per = N / WINDOWS, k = ADS.length;
    const alpha = ADS.map(() => 1), spend = ADS.map(() => 0), convs = ADS.map(() => 0), wins = ADS.map(() => 0);
    const windows = [];
    for (let w = 0; w < WINDOWS; w++) {
      let paid = 0, sold = 0;
      for (let i = w * per; i < (w + 1) * per; i++) {
        const imp = d[i];
        let best = -1, top = 0, second = 0;
        for (let j = 0; j < k; j++) {
          const b = alpha[j] * imp.pconv[j] * ADS[j].target;
          if (b > top) { second = top; top = b; best = j; } else if (b > second) second = b;
        }
        if (best < 0 || top < RESERVE) continue;
        const price = Math.max(second, RESERVE);
        spend[best] += price; wins[best]++; paid += price; sold++;
        if (imp.draw < imp.pconv[best]) convs[best]++;
      }
      windows.push({ alpha: alpha.slice(), price: sold ? paid / sold : 0, cpa: spend.map((s, j) => (convs[j] ? s / convs[j] : 0)) });
      for (let j = 0; j < k; j++) {
        if (!autobid[j] || convs[j] === 0) continue;
        const cpa = spend[j] / convs[j];
        alpha[j] = Math.min(10, Math.max(0.1, alpha[j] * Math.exp(step * (ADS[j].target - cpa) / ADS[j].target)));
      }
    }
    const totalPaid = spend.reduce((a, b) => a + b, 0), totalWins = wins.reduce((a, b) => a + b, 0);
    return {
      ads: ADS.map((a, j) => ({ ...a, autobid: autobid[j], alpha: alpha[j], spend: spend[j], convs: convs[j], wins: wins[j], cpa: convs[j] ? spend[j] / convs[j] : 0 })),
      windows, avgPrice: totalWins ? totalPaid / totalWins : 0, totalConvs: convs.reduce((a, b) => a + b, 0)
    };
  };

  return { ADS, N, WINDOWS, run };
})();
