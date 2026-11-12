// Post metadata and body. Body is a small markdown subset: ### headings,
// paragraphs, numbered lists, **bold**, *italic*, [text](url).
// Run `node scripts/build-blog.mjs` after editing.
export default {
  title: 'Buyers are buying from fewer places, and the shortlist is decided before the auction',
  slug: 'buyers-are-buying-from-fewer-places',
  date: '2026-11-11',
  author: 'Stephan Lafite',
  category: 'Market shifts',
  readTime: '4 min',
  excerpt:
    'ANA benchmark data shows buyers are shrinking their supply lists, and the cut happens before the auction. What it means for independent publishers.',
  sources: [
    {
      author: 'ANA',
      date: '2026a, August 6',
      title: 'Programmatic Transparency Benchmark: Q2 2026 working-media efficiency reaches a record 45%',
      publication: 'Fiducia',
      url: 'https://www.fiducia.eco/post/ana-programmatic-transparency-benchmark-q2-2026-working-media-efficiency-reaches-a-record-45',
      linkTitle: true,
    },
    {
      author: 'ANA',
      date: '2026b, May 27',
      title: 'ANA Programmatic Transparency Benchmark reveals widening gap between top and bottom advertisers',
      url: 'https://www.ana.net/content/show/id/pr-2026-05-programmatic',
      linkTitle: true,
    },
    {
      author: 'Inside Radio',
      date: '2026, June 2',
      title: 'As audio goes programmatic, ANA sees growing demand for premium supply',
      url: 'https://www.insideradio.com/free/as-audio-goes-programmatic-ana-sees-growing-demand-for-premium-supply/article_caea4586-2695-4a51-8b7d-93f28458c7cc.html',
      linkTitle: true,
    },
    {
      author: 'McCoy, K.',
      date: '2026, October 21',
      title: '[Independent agencies seek negotiating leverage with large DSPs]',
      publication: 'Digiday',
      url: 'https://digiday.com/marketing/indie-agencies-want-the-trade-desk-and-amazon-dsp-to-acknowledge-their-buying-power-with-negotiating-leverage/',
      linkTitle: true,
    },
    {
      author: 'PPC Land',
      date: '2026',
      title: 'Ads ran on AI recipe sites with fake chefs, DecryptAds finds',
      url: 'https://ppc.land/adobe-and-pepsi-ads-ran-on-ai-recipe-sites-with-fake-chefs-decryptads-finds/',
      linkTitle: true,
    },
    {
      author: 'Schiff, A.',
      date: '2026, October 6',
      title: 'AdExchanger Talks: Value over volume, with NYT\'s Courtney Glaze',
      descriptor: '[Podcast]',
      publication: 'AdExchanger',
      url: 'https://www.adexchanger.com/adexchanger-talks/value-over-volume-with-nyts-courtney-glaze/',
      linkTitle: true,
    },
    {
      author: 'Vargas, A.',
      date: '2026, October 20',
      title: 'AI slop sites are on the rise. Is ad tech ready for its new MFA challenge?',
      publication: 'AdExchanger',
      url: 'https://www.adexchanger.com/programmatic/ai-slop-sites-are-on-the-rise-is-ad-tech-ready-for-its-new-mfa-challenge/',
      linkTitle: true,
    },
  ],
  body: `
Two figures from the buy side explain more about independent publisher demand than most SSP dashboards. In the second quarter of 2026, transaction costs rose to 27.2% of programmatic spend. And the advertisers who turned the most spend into quality impressions operated across about 19,000 fewer domains and apps than the advertisers who turned the least (ANA, 2026a).

### What buyers measured

The ANA's Programmatic Transparency Benchmark reached a record 45.1% TrueAdSpend in Q2 2026, up from 43.3% in Q1 after volatility in late 2025. TrueAdSpend counts only spend that lands on impressions that are measurable, viewable, fraud-free and not on made-for-advertising sites. Higher-performing advertisers converted 52.3% of spend into those impressions. Lower performers converted 31.1% (ANA, 2026a). The gap was nearly the same in Q1, at 54.0% against 32.1% (ANA, 2026b).

In Q2, lower performers lost 22.7% of spend to non-measurable inventory, against 10.4% for higher performers (ANA, 2026a). The Q1 report is explicit that quality, not cost, separated the groups: transaction costs differed by only 2.4% between them, while lower performers lost 38.4% of spend to quality issues against 19% for top performers (Inside Radio, 2026). The ANA describes the winners as buying across a concentrated, carefully curated supply footprint.

### What access costs

Fees sit on top of that quality bar. Digiday reported on October 21 that a 15-person agency had cleared a major DSP's $100,000 monthly spend threshold and still paid a 17% DSP fee plus a 12% fee to the reseller that gave it access. A 25-person agency in Washington state paid a 10% reseller fee on top of another DSP's 15% fee. Agencies told Digiday that smaller buyers are steered to resellers with the promise of a direct seat later, and that the path keeps shifting (McCoy, 2026).

A buyer that gives up roughly a quarter of each dollar before a bid is placed cannot afford to spend the rest on inventory it cannot measure.

### Why the shortlist is shrinking

Cost is one pressure. Risk is the other. In October, DecryptAds reported about 400 recipe sites run under AI-made or borrowed author identities, and traced them to a wider pool of more than 2,100 related ad-funded domains monetized through programmatic ads (Vargas, 2026; PPC Land, 2026). Every new batch of low-quality supply gives buyers another reason to prefer a short list of known places over the open market.

Publishers have long handled uncertainty by adding SSPs "like insurance," as AdExchanger put it. More partners bring more demand and more competition for each impression. But even large publishers are tightening: a New York Times revenue operations executive told AdExchanger that every ad tech partner in its stack must justify its place, and that the Times wants value rather than extra transactions (Schiff, 2026). That logic reaches only so far: an added path is worth what buyers still route through.

### What it means for an independent publisher

These readings are analysis, not findings from the sources.

First, the decision happens upstream of the auction. If a domain falls outside a buyer's footprint, or its supply path is one the buyer has trimmed, the bid never arrives. A floor change cannot recover a bid that was never sent.

Second, measurability is a revenue variable. Spend lost to non-measurable inventory is the clearest quality gap in the benchmark. A publisher whose impressions cannot be verified is the first to be cut by a disciplined buyer.

Third, blanket quality filters built for low-quality sites can also catch legitimate small publishers. Independents often learn this only when demand quietly thins.

Fourth, more SSPs do not fix any of this. Eligibility depends on what a buyer's filters can see and verify about the publisher and its declared supply chain.

Valadisse reads the ads.txt declarations that buyer-side path filters check, and shows an independent publisher how that declared picture looks from the buy side.

**Dates to watch:** the ANA Q3 2026 benchmark release, and whether transaction costs keep rising.
`,
};
