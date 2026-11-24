// Site pages generator, called by scripts/build-blog.mjs (zero dependencies).
//
// site-src/index.html is the one source for Home, Services, How It Works and
// Contact. Opened directly it still works as the old one-page site (showPage
// switches sections), which keeps local preview simple. What Netlify serves is
// generated from it: one static file per page, each with only its own <main>,
// its own title, description and canonical URL, real links between pages, and
// JSON-LD. That gives search and AI answer tools a crawlable URL per
// page instead of four sections hidden behind "#" links.
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

const PATH_OF = Object.fromEntries(PAGES.map((p) => [p.id, p.path]));

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

function rewriteLinks(html, current) {
  return html
    .replace(/<a\b[^>]*showPage\('([a-z-]+)'\)[^>]*>/g, (tag, id) => {
      if (!PATH_OF[id]) throw new Error(`site-src/index.html: link to unknown page "${id}"`);
      let t = tag
        .replace(/href="#"/, `href="${PATH_OF[id]}"`)
        .replace(/\s+onclick="[^"]*"/, '')
        .replace(/\s+data-page="[^"]*"/, '');
      if (/class="nav-link( active)?"/.test(t)) {
        t = t.replace(/class="nav-link( active)?"/, id === current ? 'class="nav-link active" aria-current="page"' : 'class="nav-link"');
      }
      return t;
    })
    .replace(/src="logo/g, 'src="/logo')
    .replace(/href="(privacy|terms)\.html"/g, 'href="/$1.html"');
}

// The one-page section switcher is not needed on real pages. Home keeps a small
// redirect so old in-page links (/#services and the like) land on the new URLs.
const HASH_REDIRECT = `// ── Old in-page links (/#services, /#how-it-works, /#contact) ──
  (function () {
    const to = { services: '/services/', 'how-it-works': '/how-it-works/', contact: '/contact/', 'stays-current': '/how-it-works/' };
    const id = location.hash.slice(1);
    if (to[id]) location.replace(to[id]);
  })();

  `;

export function buildPages(source) {
  const headStart = source.indexOf('<head>');
  const headEnd = source.indexOf('</head>');
  const bodyStart = source.indexOf('<body>');
  const firstMain = source.indexOf('<main id="page-');
  if (headStart < 0 || headEnd < 0 || bodyStart < 0 || firstMain < 0) throw new Error('site-src/index.html: unexpected structure');

  const mains = {};
  for (const m of source.matchAll(/<main id="page-([a-z-]+)"[\s\S]*?<\/main>/g)) mains[m[1]] = m;
  const lastMain = Object.values(mains).reduce((a, m) => Math.max(a, m.index + m[0].length), 0);
  for (const p of PAGES) if (!mains[p.id]) throw new Error(`site-src/index.html: no <main id="page-${p.id}">`);

  const stripBanners = (s) => s.replace(/<!-- ═+\s*[A-Z ]+ PAGE\s*═+ -->\s*/g, '');
  const head = source.slice(headStart, headEnd);
  const chrome = stripBanners(source.slice(bodyStart, firstMain));
  const tail = stripBanners(source.slice(lastMain));

  const switcherStart = tail.indexOf('// ── Page meta per section');
  const switcherEnd = tail.indexOf('// ── Nav scroll shadow');
  if (switcherStart < 0 || switcherEnd < 0) throw new Error('site-src/index.html: cannot find the page switcher script');

  const out = {};
  for (const page of PAGES) {
    const main = mains[page.id][0].replace(/class="page-section[^"]*"/, 'class="page-section active"');
    const ld = [];
    if (page.id === 'home') ld.push(jsonLd(organization()));
    if (page.id === 'services') ld.push(jsonLd(faqPage(main)));
    if (page.id === 'home' && GOOGLE_SITE_VERIFICATION) {
      ld.push(`  <meta name="google-site-verification" content="${esc(GOOGLE_SITE_VERIFICATION)}">`);
    }
    const script = tail.slice(0, switcherStart) + (page.id === 'home' ? HASH_REDIRECT : '') + tail.slice(switcherEnd);
    const body = chrome.replace(
      '<body>',
      '<body>\n<!-- GENERATED by scripts/build-pages.mjs from site-src/index.html. Edit the source, then run node scripts/build-blog.mjs. -->',
    );
    out[page.file] =
      source.slice(0, headStart) +
      setMeta(head, page, ld.join('\n')) +
      '</head>\n\n' +
      rewriteLinks(body, page.id) +
      rewriteLinks(main, page.id) + '\n\n' +
      rewriteLinks(script, page.id);
  }
  return out;
}
