/* Topic: display  ·  subject: Where ads appear  ·  registered in js/config.js */
TERMS['display'] = { name: 'Display ads', needs: [],
    short: 'Image and banner ads shown on websites and apps, outside of Google Search.',
    body: () => `
      <h2>What they are</h2>
      <p>Display ads are the banners, images and rich media ads on news sites, blogs and apps. Google places them across millions of third-party sites and apps (the Google Display Network) and through exchanges like ${T('adx', 'AdX')}.</p>
      <h2>How they differ from search</h2>
      <ul>
        <li><b>No query.</b> Nobody typed what they want, so interest is inferred from the page's content and the audience.</li>
        <li><b>Often bought for awareness.</b> Many display campaigns care about being seen, so they're often priced per thousand impressions (${T('cpm')}) as well as per click.</li>
        <li><b>Sold one impression at a time.</b> When a page loads, its ad space is auctioned in real time on an exchange.</li>
      </ul>
      <h2>How they're sold</h2>
      <p>Display ads sold on ad exchanges now mostly use ${T('first-price', 'First-Price')} auctions. Most exchanges switched in 2017 and 2018, and Google's ${T('adx', 'AdX')} followed in September 2019. You pay what you bid, so buyers use ${T('bid-shading')} to avoid overpaying.</p>
      <p>Google's AdSense, which places ads on smaller sites, is moving its display, video and game ads to first-price as well. Its search and shopping ads stay second-price.</p>` };
