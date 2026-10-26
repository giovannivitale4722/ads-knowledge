/* Site settings: the "Updated" date and how topics are grouped into subjects.
   Every topic id must appear in exactly one subject (checked in js/app.js). */
const UPDATED = 'Oct 26, 2026';
const SECTIONS = [
  { name: 'Where ads appear', q: 'Where can an ad show up, and how is that space sold?', terms: ['impression', 'search-ads', 'display', 'youtube', 'adx'] },
  { name: 'What advertisers pay', q: 'How is an ad priced, and how are different prices compared?', terms: ['bid', 'cpc', 'cpm', 'expected-value', 'ecpm'] },
  { name: 'How ads are ranked', q: 'Why does one ad beat another when the bids differ?', terms: ['pctr', 'ad-quality', 'ad-rank'], key: 'Ad Rank = Bid × pCTR × Ad Quality' },
  { name: 'How auctions work', q: 'Who wins, what do they pay, and how should you bid?', terms: ['auction-mechanism', 'vickrey', 'gsp', 'first-price', 'bid-shading'] },
  { name: 'Autobidding', q: 'How does Google set bids for advertisers automatically?', terms: ['autobidding'] },
  { name: 'Machine learning in ads', q: 'How do machines learn to predict clicks and pick ads?', terms: ['logistic-regression'] },
  { name: 'Implementations', q: 'Can I build these algorithms myself?', terms: ['target-cpa'] }
];
