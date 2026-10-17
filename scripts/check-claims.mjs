#!/usr/bin/env node
// Keeps the site honest. Zero dependencies: `node scripts/check-claims.mjs`.
//
//  1. A claim removed from the site (CLAUDE.md, "Removed") must not come back.
//  2. Status wording ("rolling out", "coming soon") appears only inside a status
//     pill, never in the sentence next to it.
//  3. The pills match the CLAUDE.md tables: seven "Coming soon" (no working
//     code) and one "Rolling out" (Floor Optimization Index and Demand
//     Diversity scores, which are partly live). Change these numbers only
//     together with the tables.
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILES = ['index.html', 'blog/index.html', 'scripts/build-blog.mjs'];
const PAGES = ['index.html', 'blog/index.html'];

const EXPECTED_COMING_SOON = 7;
const EXPECTED_ROLLING_OUT = 1;
const ROLLING_OUT_LINE_MUST_CONTAIN = 'Floor Optimization Index';

const BANNED = [
  'AI-native', 'AI-assisted', 'AI agents', 'agents scan', 'AI infrastructure',
  'engines', 'Swap:', 'Learn</h3>', 'more accurate the longer', 'predictions and recommendations',
  'Priority support', 'around the clock', 'continuous', 'structured intake',
  'only practice', 'display-first practice', 'Advisory add-on', 'on top of whichever tier',
  'not standalone retainers', 'Available standalone', 'same monitoring that keeps the platform',
  'sees across every exchange', 'ad ops function', 'faster than enterprise vendors',
];

const PILL = /<span class="meta-pill status-pill[^"]*"[^>]*>(.*?)<\/span>/gs;
let failed = 0;
const fail = (msg) => { console.error(msg); failed++; };

for (const file of FILES) {
  const text = await readFile(join(ROOT, file), 'utf8');
  for (const phrase of BANNED) {
    if (text.toLowerCase().includes(phrase.toLowerCase())) {
      fail(`${file}: removed claim is back: "${phrase}"`);
    }
  }
}

let coming = 0;
let rolling = 0;
for (const file of PAGES) {
  const text = await readFile(join(ROOT, file), 'utf8');
  for (const m of text.matchAll(PILL)) {
    const label = m[1].trim();
    if (label === 'Coming soon') coming++;
    else if (label === 'Rolling out') {
      rolling++;
      const line = text.slice(text.lastIndexOf('\n', m.index) + 1, text.indexOf('\n', m.index));
      if (!line.includes(ROLLING_OUT_LINE_MUST_CONTAIN)) {
        fail(`${file}: a "Rolling out" pill is on something other than ${ROLLING_OUT_LINE_MUST_CONTAIN}`);
      }
    } else {
      fail(`${file}: unknown status pill label "${label}"`);
    }
  }
  const prose = text.replace(PILL, '');
  for (const m of prose.matchAll(/rolling out|coming soon/gi)) {
    const around = prose.slice(Math.max(0, m.index - 50), m.index + 40).replace(/\s+/g, ' ');
    fail(`${file}: status wording outside a pill: "...${around}..."`);
  }
}
if (coming !== EXPECTED_COMING_SOON) fail(`expected ${EXPECTED_COMING_SOON} "Coming soon" pills, found ${coming}`);
if (rolling !== EXPECTED_ROLLING_OUT) fail(`expected ${EXPECTED_ROLLING_OUT} "Rolling out" pill, found ${rolling}`);

if (failed) process.exit(1);
console.log(`claims check passed (${coming} Coming soon, ${rolling} Rolling out, ${BANNED.length} banned phrases)`);
