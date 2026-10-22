#!/usr/bin/env node
// Keeps the site honest. Zero dependencies: `node scripts/check-claims.mjs`.
// The rules live in CLAUDE.md ("Claims"); this enforces the mechanical ones.
//
//  1. A claim removed from the site must not come back.
//  2. One status vocabulary: "Coming soon". "Rolling out" is retired.
//  3. Status wording appears only inside a pill, never in prose.
//  4. A pill is always the last pill in its row and sits at the end of its
//     block: the only content of its own <p>, or the last child of a pill row.
//     Never mid-paragraph, never in a title.
//  5. A sentence describing a coming-soon feature is in the future tense.
//  6. The pill count matches the CLAUDE.md table (change only together).
//  8. No em dashes in visible site copy (HTML comments do not count).
//  7. Audience claims: no audio, podcast, app-first, newsletter-led or
//     "all qualify" statements in visible copy until the tooling exists.
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILES = ['index.html', 'blog/index.html', 'scripts/build-blog.mjs'];
const PAGES = ['index.html', 'blog/index.html'];

const EXPECTED_COMING_SOON = 8;

// Coming-soon features: any sentence mentioning one must contain "will".
const FUTURE_TENSE_PHRASES = [
  'daily monitoring', 'same-day detection', 'scheduled monitoring',
  'plain-English digest', 'curated deal packages', 'flag an anomaly',
  'other Demand Diversity scores',
];

const BANNED = [
  'AI-native', 'AI-assisted', 'AI agents', 'agents scan', 'AI infrastructure',
  'engines', 'Swap:', 'Learn</h3>', 'more accurate the longer', 'predictions and recommendations',
  'Priority support', 'around the clock', 'continuous', 'structured intake',
  'only practice', 'display-first practice', 'Advisory add-on', 'on top of whichever tier',
  'not standalone retainers', 'Available standalone', 'same monitoring that keeps the platform',
  'sees across every exchange', 'ad ops function', 'faster than enterprise vendors',
  'rolling out', 'rolls out', 'rolled out',
  'revenue range on every finding', 'revenue range to your results', 'annualised figure',
  'how much premium demand', 'revenue-impact ranges', 'every gap named',
];

// Visible-copy only (CSS class names do not count). Audio, podcast and app-first
// publishers are not claimed until the tooling for them exists; community-driven
// publishers are the primary audience.
const PROSE_BANNED = [
  [/\baudio\b/i, 'audio'], [/\bpodcasts?\b/i, 'podcast'], [/\bapp-first\b/i, 'app-first'],
  [/\bnewsletter-led\b/i, 'newsletter-led'], [/\bDAI\b/, 'DAI'], [/\bstreaming\b/i, 'streaming'],
  [/\bUS-based\b/i, 'US-based'],   [/\ball qualify\b/i, 'all qualify'], [/\bany distribution model\b/i, 'any distribution model'],
];

const PILL = /<span class="meta-pill status-pill[^"]*"[^>]*>(.*?)<\/span>/gs;
let failed = 0;
const fail = (msg) => { console.error(msg); failed++; };
const snippet = (t, i) => t.slice(Math.max(0, i - 60), i + 60).replace(/\s+/g, ' ');

for (const file of FILES) {
  const text = await readFile(join(ROOT, file), 'utf8');
  for (const phrase of BANNED) {
    if (text.toLowerCase().includes(phrase.toLowerCase())) {
      fail(`${file}: removed or retired wording is back: "${phrase}"`);
    }
  }
}

// Visible copy, on every page: no em dashes (HTML comments are not copy).
const EM_DASH_FILES = ['index.html', 'privacy.html', 'terms.html', 'intake.html', 'blog/index.html', 'blog/buying-agents-will-soon-read-your-ad-products-first/index.html'];
let emDashes = 0;
for (const file of EM_DASH_FILES) {
  const visible = (await readFile(join(ROOT, file), 'utf8')).replace(/<!--[\s\S]*?-->/g, '');
  const n = (visible.match(/—|&mdash;/g) ?? []).length;
  if (n) fail(`${file}: ${n} em dash(es) in visible copy`);
  emDashes += n;
}

let pills = 0;
for (const file of PAGES) {
  const text = await readFile(join(ROOT, file), 'utf8');

  for (const m of text.matchAll(PILL)) {
    pills++;
    if (m[1].trim() !== 'Coming soon') fail(`${file}: pill label must be "Coming soon", found "${m[1].trim()}"`);

    const before = text.slice(0, m.index).replace(/\s+$/, '');
    const after = text.slice(m.index + m[0].length).replace(/^\s+/, '');
    const soleInP = /<p[^>]*>$/.test(before);
    let lastInRow = false;
    if (before.endsWith('</span>')) {
      const open = before.lastIndexOf('<div');
      const close = before.lastIndexOf('</div>');
      lastInRow = open > close && /flex-wrap/.test(before.slice(open, before.indexOf('>', open)));
    }
    if (!soleInP && !lastInRow) fail(`${file}: pill is not alone in its block or last in its row: "...${snippet(text, m.index)}..."`);
    if (!/^<\/(p|div)>/.test(after)) fail(`${file}: pill is not the last thing in its block: "...${snippet(text, m.index)}..."`);
  }

  const prose = text
    .replace(PILL, ' ')
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
  for (const m of prose.matchAll(/rolling out|coming soon/gi)) {
    fail(`${file}: status wording outside a pill: "...${snippet(prose, m.index)}..."`);
  }
  for (const [re, name] of PROSE_BANNED) {
    const hit = re.exec(prose);
    if (hit) fail(`${file}: audience claim not allowed yet ("${name}"): "...${snippet(prose, hit.index)}..."`);
  }
  for (const sentence of prose.split(/(?<=[.!?])\s+/)) {
    for (const phrase of FUTURE_TENSE_PHRASES) {
      if (sentence.toLowerCase().includes(phrase.toLowerCase()) && !/\bwill\b/i.test(sentence)) {
        fail(`${file}: coming-soon feature not in future tense: "${sentence.slice(0, 120)}"`);
      }
    }
  }
}
if (pills !== EXPECTED_COMING_SOON) fail(`expected ${EXPECTED_COMING_SOON} "Coming soon" pills, found ${pills}`);

if (failed) process.exit(1);
console.log(`claims check passed (${pills} Coming soon pills, ${BANNED.length} banned phrases, ${FUTURE_TENSE_PHRASES.length} future-tense phrases)`);
