#!/usr/bin/env node
// Static blog generator. Zero dependencies: `node scripts/build-blog.mjs`.
//
// Reads  blog-src/posts/*.mjs   (one metadata + body module per post)
// Writes blog/index.html, blog/<slug>/index.html, blog/feed.xml, sitemap.xml,
//        robots.txt, and the "Recent platform and market updates" list inside
//        index.html (between the RECENT-POSTS markers).
//
// The blog pages borrow CSS, Tailwind config, nav and footer from index.html
// at build time, so they cannot drift from the main site. Output is committed;
// the host needs no build step.

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://valadisse.com';
const INDEX = join(ROOT, 'index.html');

// ── helpers ─────────────────────────────────────────────────────────────
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const fmtDate = (iso) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });

function inline(text) {
  let h = esc(text);
  h = h.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return h;
}

function renderBody(md) {
  const out = [];
  let list = null;
  const flush = () => { if (list) { out.push(`<ol>${list.join('')}</ol>`); list = null; } };
  for (const raw of md.trim().split('\n')) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    let m;
    if ((m = line.match(/^###\s+(.*)$/))) { flush(); out.push(`<h2>${inline(m[1])}</h2>`); }
    else if ((m = line.match(/^\d+\.\s+(.*)$/))) { (list ||= []).push(`<li>${inline(m[1])}</li>`); }
    else { flush(); out.push(`<p>${inline(line)}</p>`); }
  }
  flush();
  return out.join('\n          ');
}

// "Author. (Date). Title. Publication. URL. Accessed Month D, YYYY."
function renderSource(s) {
  const dot = (t) => (/[.?!]$/.test(t) ? t : t + '.');
  const title = s.italic === 'title' ? `<em>${esc(s.title)}</em>` : esc(s.title);
  const desc = s.descriptor ? ` ${esc(s.descriptor)}` : '';
  const pub = s.publication
    ? (s.italic === 'publication' ? `<em>${esc(s.publication)}</em>` : esc(s.publication)) + '. '
    : '';
  const titlePart = s.italic === 'title' ? `${title}${desc}.` : `${dot(title)}${desc ? desc + '.' : ''}`;
  return `<li>${esc(dot(s.author))} (${esc(s.date)}). ${titlePart} ${pub}<a href="${esc(s.url)}">${esc(s.url)}</a>. Accessed ${esc(s.accessed)}.</li>`;
}

// ── load posts ──────────────────────────────────────────────────────────
const dir = join(ROOT, 'blog-src', 'posts');
const posts = [];
for (const f of (await readdir(dir)).filter((f) => f.endsWith('.mjs'))) {
  const p = (await import(pathToFileURL(join(dir, f)).href)).default;
  for (const k of ['title', 'slug', 'date', 'author', 'category', 'readTime', 'excerpt', 'sources', 'body']) {
    if (!p[k]) throw new Error(`${f}: missing "${k}"`);
  }
  if (f !== `${p.slug}.mjs`) throw new Error(`${f}: filename must match slug "${p.slug}"`);
  // Site rule: no em dashes in copy.
  const flat = JSON.stringify(p);
  if (flat.includes('\u2014')) throw new Error(`${f}: contains an em dash`);
  posts.push(p);
}
posts.sort((a, b) => b.date.localeCompare(a.date));

// ── shared chrome, borrowed from index.html ────────────────────────────
const home = await readFile(INDEX, 'utf8');
const between = (s, a, b) => {
  const i = s.indexOf(a); const j = s.indexOf(b, i);
  if (i < 0 || j < 0) throw new Error(`index.html: cannot find ${a} .. ${b}`);
  return s.slice(i, j + b.length);
};
const siteStyle = between(home, '<style>', '</style>');
const tailwindCfg = between(home, '<script>\n    tailwind.config', '</script>');
const fonts = between(home, '<link rel="preconnect" href="https://fonts.googleapis.com">', 'rel="stylesheet">');

function rewriteLinks(html) {
  return html
    .replace(/<a\b[^>]*showPage\('([a-z-]+)'\)[^>]*>/g, (tag, id) => {
      const href = id === 'home' ? '/' : `/#${id}`;
      return tag
        .replace(/href="#"/, `href="${href}"`)
        .replace(/\s+onclick="[^"]*"/, (m) => (m.includes('closeMobileMenu') ? ' onclick="closeMobileMenu();"' : ''))
        .replace(/\s+class="nav-link active"/, ' class="nav-link"')
        .replace(/\s+data-page="[^"]*"/, '');
    })
    .replace(/src="logo/g, 'src="/logo')
    .replace(/href="(privacy|terms)\.html"/g, 'href="/$1.html"');
}

const nav = rewriteLinks(between(home, '<nav id="site-nav"', '</nav>'))
  .replace('<a href="/blog/" class="nav-link" data-page="blog">', '<a href="/blog/" class="nav-link active" aria-current="page">');
// Mobile menu: from its opening tag to the comment that follows it.
const mobileStart = home.indexOf('<div id="mobile-menu"');
const mobileEnd = home.indexOf('<!-- ═', mobileStart);
const mobileFull = rewriteLinks(home.slice(mobileStart, mobileEnd).trimEnd());
const footer = rewriteLinks(between(home, '<footer class="site-footer"', '</footer>'));

const blogCss = `
  /* ── Blog ── */
  .blog-prose { max-width: 760px; }
  .blog-prose p, .blog-prose li { color: #4A4A4A; font-size: 17px; line-height: 1.75; }
  .blog-prose p { margin: 0 0 1.25rem; }
  .blog-prose h2 { font-family: 'DM Serif Display', Georgia, serif; font-size: 1.65rem; line-height: 1.25; color: #070033; margin: 2.5rem 0 1rem; }
  .blog-prose ol { list-style: decimal; padding-left: 1.5rem; margin: 0 0 1.25rem; }
  .blog-prose li { margin-bottom: 0.75rem; padding-left: 0.25rem; }
  .blog-prose strong { color: #070033; font-weight: 600; }
  /* Ink links with an accent underline: orange text alone fails contrast on white. */
  .blog-prose a, .sources-list a { color: #070033; text-decoration: underline; text-decoration-color: #FF6632; text-decoration-thickness: 2px; text-underline-offset: 3px; }
  .blog-prose a:hover, .sources-list a:hover { color: #FF6632; }
  .sources-list { list-style: none; padding: 0; margin: 0; }
  .sources-list li { color: #4A4A4A; font-size: 14px; line-height: 1.7; margin-bottom: 1rem; padding-left: 1.5rem; text-indent: -1.5rem; overflow-wrap: anywhere; }
  .glance { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 1px; background: #EEEEEE; border: 1px solid #EEEEEE; border-radius: 8px; overflow: hidden; }
  .glance > div { background: #f8f8fc; padding: 14px 18px; }
  .glance dt { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #4A4A4A; margin-bottom: 4px; }
  .glance dd { margin: 0; font-weight: 600; color: #070033; font-size: 15px; }
  .back-link { font-family: 'DM Mono', monospace; font-size: 12px; color: #4A4A4A; text-decoration: none; }
  .back-link:hover { color: #FF6632; }
  .feature-card { border: 1px solid #EEEEEE; border-radius: 12px; overflow: hidden; background: #fff; }
  .feature-card:hover { border-color: rgba(255,102,50,0.4); box-shadow: 0 4px 32px rgba(7,0,51,0.06); }
  .feature-panel { background: #070033; color: #fff; }
  .feature-panel .big { font-family: 'DM Serif Display', Georgia, serif; font-size: 3.25rem; line-height: 1; }
  .title-link { color: #070033; text-decoration: none; }
  .title-link:hover { color: #FF6632; }
`;

const blogScript = `
<script>
  window.addEventListener('scroll', () => {
    document.getElementById('site-nav').classList.toggle('scrolled', window.scrollY > 10);
  });
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  function openMobileMenu() { mobileMenu.classList.add('open'); hamburger.classList.add('open'); hamburger.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; }
  function closeMobileMenu() { mobileMenu.classList.remove('open'); hamburger.classList.remove('open'); hamburger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
  hamburger.addEventListener('click', () => (mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu()));
  document.getElementById('mobile-close').addEventListener('click', closeMobileMenu);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMobileMenu(); });
</script>`;

function page({ title, description, canonical, ogType = 'website', extraHead = '', main }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" type="application/rss+xml" title="Valadisse Blog" href="${SITE}/blog/feed.xml">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="Valadisse">
  <meta property="og:image" content="${SITE}/logo.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${SITE}/logo.png">
${extraHead}
  ${fonts}
  <script src="https://cdn.tailwindcss.com"></script>
  ${tailwindCfg}
  ${siteStyle}
  <style>${blogCss}</style>
</head>
<body>
<!-- GENERATED by scripts/build-blog.mjs. Edit blog-src/ or index.html, then rebuild. -->
${nav}

${mobileFull}

${main}

${footer}
${blogScript}
</body>
</html>
`;
}

const ctaBand = `
  <section class="py-20 bg-ink" aria-label="Call to action">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <h2 class="font-serif text-3xl md:text-4xl text-white mb-4">Start with the free scan.</h2>
      <p class="text-white/50 mb-8 leading-relaxed">No commitment. No pitch. A clear picture of what your stack is doing, and what it should be doing.</p>
      <a href="https://app.valadisse.com/scan" target="_blank" class="btn-primary">Run Your Free Scan →</a>
    </div>
  </section>`;

// ── blog index ──────────────────────────────────────────────────────────
const topics = ['Agentic buying', 'Curation', 'Supply verification', 'Agentic marketplaces', 'Market shifts'];
const postUrl = (p) => `/blog/${p.slug}/`;

function featured(p) {
  const panel = p.sidePanel
    ? `<div class="feature-panel md:w-72 flex-shrink-0 p-8 flex flex-col justify-center">
          <p class="font-mono text-xs uppercase tracking-widest mb-3" style="color:rgba(255,255,255,0.7);">${esc(p.sidePanel.label)}</p>
          <p class="big mb-4">${esc(p.sidePanel.value)}</p>
          <p class="text-sm leading-relaxed" style="color:rgba(255,255,255,0.75);">${esc(p.sidePanel.note)}</p>
        </div>`
    : '';
  return `
      <article class="feature-card flex flex-col md:flex-row">
        <div class="p-8 md:p-10 flex-1">
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <span class="meta-pill accent">${esc(p.category)}</span>
            <span class="font-mono text-xs text-muted">${fmtDate(p.date)} · ${esc(p.readTime)} read</span>
          </div>
          <h3 class="font-serif text-2xl md:text-3xl leading-snug mb-4"><a class="title-link" href="${postUrl(p)}">${esc(p.title)}</a></h3>
          <p class="text-muted leading-relaxed mb-6">${esc(p.excerpt)}</p>
          <a href="${postUrl(p)}" class="btn-primary">Read the post →</a>
        </div>
        ${panel}
      </article>`;
}

const indexMain = `<main role="main">
  <section class="py-16 border-b border-rule" aria-label="Blog header">
    <div class="max-w-6xl mx-auto px-6">
      <p class="eyebrow mb-4">Blog</p>
      <h1 class="font-serif text-4xl md:text-5xl text-ink max-w-3xl leading-tight">What changed in adtech, and what it means for your inventory.</h1>
      <p class="text-muted text-lg mt-5 max-w-3xl leading-relaxed">The programmatic market is being rebuilt around software agents that discover, evaluate, and buy supply on their own. Most independent publishers will not hear about these shifts until they show up in revenue. This blog tracks them as they happen, from standards releases to buyer-side changes, and explains what each one means for how publisher inventory is found, verified, and bought.</p>
      <p class="font-mono text-sm text-ink mt-5">The same monitoring that keeps the platform current, written down.</p>
      <ul class="flex flex-wrap gap-2 mt-6" aria-label="Topics">
        ${topics.map((t) => `<li class="meta-pill">${esc(t)}</li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="py-16" aria-label="Latest post">
    <div class="max-w-6xl mx-auto px-6">
      <p class="eyebrow mb-4">Latest</p>${featured(posts[0])}
${posts.length > 1 ? `
      <h3 class="font-serif text-2xl text-ink mt-14 mb-4">Earlier posts</h3>
      <ul class="divide-y divide-rule border-y border-rule">
        ${posts.slice(1).map((p) => `<li class="py-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1"><a class="title-link font-semibold" href="${postUrl(p)}">${esc(p.title)}</a><span class="font-mono text-xs text-muted">${fmtDate(p.date)} · ${esc(p.category)}</span></li>`).join('\n        ')}
      </ul>` : ''}
    </div>
  </section>

${ctaBand}
</main>`;

// ── post pages ──────────────────────────────────────────────────────────
function postPage(p) {
  const url = `${SITE}/blog/${p.slug}/`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    description: p.excerpt,
    datePublished: p.date,
    dateModified: p.date,
    articleSection: p.category,
    mainEntityOfPage: url,
    image: `${SITE}/logo.png`,
    author: { '@type': 'Person', name: p.author },
    publisher: { '@type': 'Organization', name: 'Valadisse', logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` } },
  };
  const glance = p.atAGlance?.length
    ? `<dl class="glance mb-10" aria-label="At a glance">
${p.atAGlance.map(([k, v]) => `        <div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n')}
      </dl>`
    : '';
  const cta = p.cta
    ? `<aside class="git-band p-8 md:p-10 my-12" aria-label="Free scan">
          <p class="font-mono text-xs uppercase tracking-widest mb-3" style="color:rgba(255,255,255,0.6);">Free scan</p>
          <p class="mb-6" style="color:rgba(255,255,255,0.85); font-size:17px; line-height:1.7;">${esc(p.cta.text)}</p>
          <a href="${esc(p.cta.href)}" target="_blank" class="btn-primary">${esc(p.cta.button)} →</a>
        </aside>`
    : '';
  const main = `<main role="main">
  <article>
    <header class="pt-12 pb-8">
      <div class="max-w-6xl mx-auto px-6">
        <a href="/blog/" class="back-link">← All posts</a>
        <p class="eyebrow mt-8 mb-3">${esc(p.category)}</p>
        <h1 class="font-serif text-4xl md:text-5xl text-ink leading-tight max-w-4xl">${esc(p.title)}</h1>
        <p class="font-mono text-sm text-muted mt-5">By ${esc(p.author)} · <time datetime="${p.date}">${fmtDate(p.date)}</time> · ${esc(p.readTime)} read</p>
      </div>
    </header>
    <div class="max-w-6xl mx-auto px-6 pb-16">
      ${glance}
      <div class="blog-prose">
        <div>
          ${renderBody(p.body)}
        </div>
        ${cta}
        <section aria-labelledby="sources-h" class="pt-8 border-t border-rule">
          <h2 id="sources-h" style="margin-top:0;">Sources</h2>
          <ul class="sources-list">
            ${p.sources.map(renderSource).join('\n            ')}
          </ul>
        </section>
      </div>
    </div>
  </article>
${ctaBand}
</main>`;
  return page({
    title: `${p.title} | Valadisse Blog`,
    description: p.excerpt,
    canonical: url,
    ogType: 'article',
    extraHead: `  <meta property="article:published_time" content="${p.date}">
  <meta property="article:section" content="${esc(p.category)}">
  <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
    main,
  });
}

// ── write everything ────────────────────────────────────────────────────
await mkdir(join(ROOT, 'blog'), { recursive: true });
await writeFile(
  join(ROOT, 'blog', 'index.html'),
  page({
    title: 'Blog | Valadisse',
    description:
      'What changed in adtech, and what it means for your inventory. Standards releases and buyer-side shifts, sourced and explained for independent publishers.',
    canonical: `${SITE}/blog/`,
    main: indexMain,
  }),
);
for (const p of posts) {
  await mkdir(join(ROOT, 'blog', p.slug), { recursive: true });
  await writeFile(join(ROOT, 'blog', p.slug, 'index.html'), postPage(p));
}

// RSS
const rfc822 = (iso) => new Date(iso + 'T12:00:00Z').toUTCString();
await writeFile(
  join(ROOT, 'blog', 'feed.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Valadisse Blog</title>
    <link>${SITE}/blog/</link>
    <atom:link href="${SITE}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <description>What changed in adtech, and what it means for your inventory.</description>
    <language>en-us</language>
    <lastBuildDate>${rfc822(posts[0].date)}</lastBuildDate>
${posts.map((p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE}/blog/${p.slug}/</link>
      <guid isPermaLink="true">${SITE}/blog/${p.slug}/</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <category>${esc(p.category)}</category>
      <description>${esc(p.excerpt)}</description>
    </item>`).join('\n')}
  </channel>
</rss>
`,
);

// Sitemap + robots
const urls = [
  [`${SITE}/`, posts[0].date],
  [`${SITE}/blog/`, posts[0].date],
  ...posts.map((p) => [`${SITE}/blog/${p.slug}/`, p.date]),
  [`${SITE}/privacy`, null],
  [`${SITE}/terms`, null],
];
await writeFile(
  join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, d]) => `  <url><loc>${u}</loc>${d ? `<lastmod>${d}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`,
);
await writeFile(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

// Home: three newest posts into the How It Works block
const recent = posts.slice(0, 3);
const list = `<!-- RECENT-POSTS:START -->
        <ul class="divide-y divide-rule border-y border-rule">
          ${recent.map((p) => `<li class="py-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1"><a class="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4 hover:text-accent" href="${postUrl(p)}">${esc(p.title)}</a><span class="font-mono text-xs text-muted">${fmtDate(p.date)}</span></li>`).join('\n          ')}
        </ul>
        <p class="font-mono text-xs mt-4"><a href="/blog/" class="underline hover:text-accent">All posts →</a></p>
        <!-- RECENT-POSTS:END -->`;
const updated = home.replace(/<!-- RECENT-POSTS:START -->[\s\S]*?<!-- RECENT-POSTS:END -->/, () => list);
if (updated !== home) await writeFile(INDEX, updated);

console.log(`Built ${posts.length} post(s), blog index, feed, sitemap, robots.`);
