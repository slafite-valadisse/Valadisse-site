#!/usr/bin/env node
// Fails if a claim removed from the site (see CLAUDE.md, "Removed") comes back.
// Zero dependencies: `node scripts/check-claims.mjs`.
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILES = ['index.html', 'blog/index.html', 'scripts/build-blog.mjs'];

const BANNED = [
  'AI-native', 'AI-assisted', 'AI agents', 'agents scan', 'AI infrastructure',
  'engines', 'Swap:', 'Learn</h3>', 'more accurate the longer', 'predictions and recommendations',
  'Priority support', 'around the clock', 'continuous', 'structured intake',
  'only practice', 'display-first practice', 'Advisory add-on', 'on top of whichever tier',
  'not standalone retainers', 'Available standalone', 'same monitoring that keeps the platform',
  'sees across every exchange', 'ad ops function', 'faster than enterprise vendors',
];

let failed = 0;
for (const file of FILES) {
  const text = await readFile(join(ROOT, file), 'utf8');
  for (const phrase of BANNED) {
    if (text.toLowerCase().includes(phrase.toLowerCase())) {
      console.error(`${file}: removed claim is back: "${phrase}"`);
      failed++;
    }
  }
}
if (failed) process.exit(1);
console.log(`claims check passed (${FILES.length} files, ${BANNED.length} phrases)`);
