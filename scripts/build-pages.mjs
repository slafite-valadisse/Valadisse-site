// Site pages generator, called by scripts/build-blog.mjs (zero dependencies).
//
// site-src/index.html is the one source for Home, Services, How It Works and
// Contact. Each generated file is that same one-page site, unchanged in
// navigation and behavior (the top menu still switches sections in place with
// showPage), but opening on its own section and carrying its own title,
// description, canonical URL and JSON-LD. That gives search and AI answer tools
// a crawlable URL per page without touching the menu.
//
// Output is committed (the host needs no build step); `build-blog.mjs --check`
// fails if it drifts from this generator or the source.

const SITE = 'https://valadisse.com';

// Paste the value Google Search Console gives for the "HTML tag" method here
// (only the content="..." part), then run `node scripts/build-blog.mjs`.
// Empty means no tag is emitted.
export const GOOGLE_SITE_VERIFICATION = '';

// Verbatim, per the Services-Pricing decision (2026-11-23). check-claims pins it
// on Home and Services; keep the visible copy in site-src/index.html identical.
export const CANONICAL_DEFINITION =
  'Valadisse is a programmatic ad monetization diagnostics platform for independent digital publishers. A free scan shows where inventory is being filtered out of demand, and paid plans add the full findings, scheduled monitoring and change alerts. Valadisse has no revenue share and no platform ties.';

export const PAGES = [
  {
    id: 'home',
    file: 'index.html',
    path: '/',
    title: 'Valadisse | Ad monetization diagnostics for independent publishers',
    description:
      'Free ads.txt scan for independent publishers. Find where inventory is filtered out of demand, then monitor it. No revenue share. No platform ties.',
  },
  {
    id: 'services',
    file: 'services/index.html',
    path: '/services/',
    title: 'Services | Valadisse ad monetization diagnostics',
    description:
      'What the free ads.txt scan shows, what Starter and Pro add, and Advisory work scoped by engagement. No revenue share. No platform ties.',
  },
  {
    id: 'how-it-works',
    file: 'how-it-works/index.html',
    path: '/how-it-works/',
    title: 'How It Works | Valadisse ad monetization diagnostics',
    description:
      'Run the free ads.txt scan, then Starter for named findings and ad server report scores, then Pro for scheduled monitoring and change alerts.',
  },
  {
    id: 'contact',
    file: 'contact/index.html',
    path: '/contact/',
    title: 'Contact | Valadisse',
    description:
      'Get in touch with Valadisse, or run the free ads.txt scan first and bring the findings to the conversation.',
  },
];

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const text = (html) =>
  html.replace(/<[^>]+>/g, '').replace(/&rsquo;/g, '\u2019').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
// JSON inside <script>: escape "<" so no string can close the tag.
const jsonLd = (obj) =>
  `  <script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

function organization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Valadisse',
    url: `${SITE}/`,
    logo: `${SITE}/logo.png`,
    description: CANONICAL_DEFINITION,
    email: 'hello@valadisse.com',
    sameAs: ['https://www.linkedin.com/company/valadisse/'],
  };
}

function faqPage(main) {
  const items = [...main.matchAll(/<details class="faq-item">\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>\s*<\/details>/g)];
  if (!items.length) throw new Error('site-src/index.html: Services has no FAQ items for FAQPage JSON-LD');
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(([, q, a]) => ({
      '@type': 'Question',
      name: text(q),
      acceptedAnswer: { '@type': 'Answer', text: text(a) },
    })),
  };
}

function setMeta(head, page, extra) {
  const url = SITE + page.path;
  const swap = (re, value) => {
    if (!re.test(head)) throw new Error(`site-src/index.html: <head> is missing ${re}`);
    head = head.replace(re, (_, a, b) => a + esc(value) + b);
  };
  swap(/(<title>)[^<]*(<\/title>)/, page.title);
  swap(/(<meta name="description" content=")[^"]*(">)/, page.description);
  swap(/(<meta property="og:title" content=")[^"]*(">)/, page.title);
  swap(/(<meta property="og:description" content=")[^"]*(">)/, page.description);
  swap(/(<meta property="og:url" content=")[^"]*(">)/, url);
  swap(/(<meta name="twitter:title" content=")[^"]*(">)/, page.title);
  swap(/(<meta name="twitter:description" content=")[^"]*(">)/, page.description);
  return head.replace(
    /(<meta name="description" content="[^"]*">)/,
    (m) => `${m}\n  <link rel="canonical" href="${url}">\n${extra}`,
  );
}

// The generated files sit at /services/ and the like, so relative asset paths
// in the source must become absolute. Links and menu are left as they are.
const absoluteAssets = (html) =>
  html.replace(/src="logo/g, 'src="/logo').replace(/href="(privacy|terms)\.html"/g, 'href="/$1.html"');

export function buildPages(source) {
  const headStart = source.indexOf('<head>');
  const headEnd = source.indexOf('</head>');
  const bodyStart = source.indexOf('<body>');
  if (headStart < 0 || headEnd < 0 || bodyStart < 0) throw new Error('site-src/index.html: unexpected structure');

  const ids = [...source.matchAll(/<main id="page-([a-z-]+)"/g)].map((m) => m[1]);
  for (const p of PAGES) if (!ids.includes(p.id)) throw new Error(`site-src/index.html: no <main id="page-${p.id}">`);
  const services = source.match(/<main id="page-services"[\s\S]*?<\/main>/)[0];

  const head = source.slice(headStart, headEnd);
  const out = {};
  for (const page of PAGES) {
    const ld = [];
    if (page.id === 'home') ld.push(jsonLd(organization()));
    if (page.id === 'services') ld.push(jsonLd(faqPage(services)));
    if (page.id === 'home' && GOOGLE_SITE_VERIFICATION) {
      ld.push(`  <meta name="google-site-verification" content="${esc(GOOGLE_SITE_VERIFICATION)}">`);
    }
    // Open on this page's section, with its nav link marked active, exactly as
    // showPage would leave it after a click.
    const body = source
      .slice(bodyStart)
      .replace(
        '<body>',
        '<body>\n<!-- GENERATED by scripts/build-pages.mjs from site-src/index.html. Edit the source, then run node scripts/build-blog.mjs. -->',
      )
      .replace(/<main id="page-([a-z-]+)" class="page-section[^"]*"/g, (_, id) =>
        `<main id="page-${id}" class="page-section${id === page.id ? ' active' : ''}"`)
      .replace(/<a ([^>]*)class="nav-link( active)?"([^>]*data-page="([a-z-]+)")/g, (_, pre, __, post, id) =>
        `<a ${pre}class="nav-link${id === page.id ? ' active' : ''}"${post}`);
    out[page.file] = source.slice(0, headStart) + setMeta(head, page, ld.join('\n')) + absoluteAssets(body);
  }
  return out;
}
