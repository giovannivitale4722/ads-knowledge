/* Topic: first-price  ·  subject: How auctions work  ·  registered in js/config.js */
TERMS['first-price'] = { name: 'First-Price auction', needs: ['auction-mechanism', 'adx'],
    short: 'The highest bid wins, and the winner pays exactly what they bid.',
    body: () => `
      <h2>The rules</h2>
      <p>The highest bid wins and pays exactly what it bid.</p>
      <h2>Who uses it</h2>
      <ul>
        <li><b>Google Ad Manager and ${T('adx', 'AdX')}</b>, since September 2019.</li>
        <li><b>Most other ad exchanges</b>, since 2017–2018.</li>
        <li><b>AdSense</b> display, video and game ads, which are moving to it.</li>
      </ul>
      <p>In short: ${T('display', 'display ads')} bought programmatically. Not ${T('search-ads', 'Google Search ads')} and not ${T('youtube', 'YouTube ads')} in Google Ads, which both use second-price style pricing.</p>
      <h2>Why it's attractive</h2>
      <p>It's simple and transparent. The price is the bid, with no hidden second bid setting it.</p>
      <h2>Why it changes how you bid</h2>
      <p>If you bid exactly what the ${T('impression')} is worth to you, winning leaves you with zero profit. To come out ahead you bid <b>below</b> your value, and how far below depends on what you think others will bid. That's ${T('bid-shading')}.</p>
      <h2>Try it</h2>
      <p>Keep your bid at your $10 value and move the rival's bid around. Under second-price you profit whenever you win. Under first-price you never do.</p>
      <div class="widget" data-widget="playground"></div>` };

/* Check-yourself questions shown at the end of the page */
CHECKS['first-price'] = [
    { q: 'Where did the shift to First-Price auctions mostly happen?', opts: ['Google Search ads', 'Ad exchanges like AdX', 'YouTube ads in Google Ads'], a: 1,
      why: 'Programmatic display exchanges switched in 2017–2019, AdX in September 2019. Google Search and YouTube ads in Google Ads stay second-price style.' },
    { q: 'Before 2019, AdX sold each impression to the highest bidder at the second-highest price. Which auction is that?', opts: ['First-Price', 'Vickrey (second-price)', 'GSP with several slots'], a: 1,
      why: 'One item, winner pays the second-highest bid: that is a Vickrey auction.' }];
