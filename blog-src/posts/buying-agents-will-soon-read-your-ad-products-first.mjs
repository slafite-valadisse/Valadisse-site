// Post metadata and body. Body is a small markdown subset: ### headings,
// paragraphs, numbered lists, **bold**, *italic*, [text](url).
// Run `node scripts/build-blog.mjs` after editing.
export default {
  title: 'Buying agents will soon read your ad products first',
  slug: 'buying-agents-will-soon-read-your-ad-products-first',
  date: '2026-10-09',
  author: 'Stephan Lafite',
  category: 'Agentic buying',
  readTime: '3 min',
  excerpt:
    'A new draft specification gives publishers a standard way to describe ad products so buying agents can read and compare them against a campaign brief. Inventory that an agent cannot read, verify, or price is unlikely to be part of that comparison.',
  atAGlance: [
    ['Released', 'September 22, 2026'],
    ['Status', 'Draft, not ratified'],
    ['Comment closes', 'October 22, 2026'],
  ],
  // Shown beside the featured card on /blog/ when this is the newest post.
  sidePanel: {
    label: 'Public comment closes',
    value: 'Oct 22',
    note: 'OpenProposal is an IAB Tech Lab draft, not yet a ratified standard.',
  },
  cta: {
    text: "Valadisse's free scan reads the seller declarations a site already publishes and returns a Supply Chain Health Score, a floor signal, and how much premium demand is missing. Starter puts a revenue-impact range against each gap.",
    button: 'Run your free scan',
    href: 'https://app.valadisse.com/scan',
  },
  // italic: which part is italicised, per the citation format ('title' or 'publication').
  sources: [
    {
      author: 'IAB Tech Lab',
      date: 'September 22, 2026',
      title: 'AAMP 3.0 with OpenProposal Specification released',
      descriptor: '[Press release]',
      url: 'https://iabtechlab.com/press-releases/iab-tech-lab-introduces-aamp-3-0-with-openproposal/',
      accessed: 'October 9, 2026',
      italic: 'title',
    },
    {
      author: 'IAB Tech Lab',
      date: '2026',
      title: 'OpenProposal, draft 3.0 (public comment)',
      descriptor: '[Specification repository]',
      publication: 'GitHub',
      url: 'https://github.com/IABTechLab/OpenProposal',
      accessed: 'October 9, 2026',
      italic: 'title',
    },
    {
      author: 'Rijo, L.',
      date: 'July 30, 2026',
      title: 'AAMP 2.3 blocks AI agents from inventing ad prices, IAB Tech Lab says',
      publication: 'PPC Land',
      url: 'https://ppc.land/aamp-2-3-blocks-ai-agents-from-inventing-ad-prices-iab-tech-lab-says/',
      accessed: 'October 9, 2026',
      italic: 'publication',
    },
  ],
  body: `
On September 22, 2026, IAB Tech Lab published OpenProposal, a draft specification that gives publishers a standard way to describe their ad products so buying agents can interpret them, according to [IAB Tech Lab's announcement](https://iabtechlab.com/press-releases/iab-tech-lab-introduces-aamp-3-0-with-openproposal/). Agents can then compare those products against a campaign brief. Inventory that an agent cannot read, verify, or price is unlikely to be part of that comparison.

### What was released

According to the announcement, sellers can publish a catalog of public packages that buyer agents browse, while keeping some products for custom proposals. A buyer agent can also submit a full brief to request a custom proposal. The draft specification's [GitHub repository](https://github.com/IABTechLab/OpenProposal) states that each line item maps to an existing IAB Tech Lab execution standard, with OpenDirect 2.1, the Deals API, and OpenRTB 2.6 listed as options. The same repository states that nothing in it is a ratified IAB Tech Lab standard, and that public comment closes October 22, 2026.

### Why it matters for independent publishers

Today, a publisher is considered when a planner happens to think of it. Agents process far more proposals than people can, which cuts both ways. More publishers can enter consideration. Any publisher whose products cannot be described, authorized, and priced in machine-readable form drops out before a bid exists. This is Valadisse's reading of the direction, not a stated rule of the standard, and it is the same eligibility problem ads.txt created for unauthorized sellers, one layer up.

### How early this is

This is early. Per the [AAMP 3.0 announcement](https://iabtechlab.com/press-releases/iab-tech-lab-introduces-aamp-3-0-with-openproposal/), IAB Australia has opened expressions of interest for a seller-side pilot using the reference software, which would let publishers test discovery, proposal, and approval workflows in a sandbox before any live spend. The same announcement says the AAMP software development kits aim to build more trust in agent identities. Earlier, [PPC Land reported](https://ppc.land/aamp-2-3-blocks-ai-agents-from-inventing-ad-prices-iab-tech-lab-says/) that AAMP 2.3, released July 30, 2026, added a field that records where each price in a negotiation comes from, plus an optional vendor approval gate in the Buyer Agent. Standards that arrive before volume set the entry requirements for when it does.

### What to do now

1. **Check that declared sellers are accurate and current.** ads.txt is the authorization record buyers already check against.
2. **Package inventory as defined deals,** not only open-exchange impressions. Curated and direct deal structures translate into line items; unpackaged impressions do not.
3. **Use the comment window.** It closes October 22, 2026, and IAB Tech Lab's announcement directs feedback to iabtechlab.com/AAMPv3.
`,
};
