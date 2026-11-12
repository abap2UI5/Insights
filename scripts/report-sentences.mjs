#!/usr/bin/env node
// The long sentences of the essays, longest first. A report, not a test:
// `npm run check` does not call it. Many readers read English as a second
// language, and a sentence of fifty words with two asides is where they stop.
//
//   node scripts/report-sentences.mjs            every sentence over 35 words
//   node scripts/report-sentences.mjs --max 30   another limit
//   node scripts/report-sentences.mjs --full     the whole sentence, not its start
//
// The same rules as the report of abap2UI5/docs: an inline code span counts
// as one word, a link counts by its text, and fenced code, tables, headings,
// image lines and the frontmatter are not sentences.

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ESSAYS = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'essays');
const args = process.argv.slice(2);
const maxAt = args.indexOf('--max');
const max = maxAt === -1 ? 35 : Number(args[maxAt + 1]);
const full = args.includes('--full');

export function sentences(markdown) {
  const body = markdown.replace(/^---\n[\s\S]*?\n---\n/, (m) => m.replace(/[^\n]/g, ''));
  const out = [];
  let paragraph = [];
  let start = 0;
  let fence = false;
  const flush = () => {
    const text = paragraph.join(' ').replace(/\s+/g, ' ').trim();
    for (const s of text.split(/(?<=[.!?:]\**[)"”]?)\s+(?=[A-Z*[(]|abap2UI5\b)/)) {
      const words = s.split(' ').filter((w) => /\p{L}/u.test(w));
      const prose = words.filter((w) => w !== 'Code').length;
      if (words.length && prose > words.length / 2) out.push({ line: start, words: words.length, text: s });
    }
    paragraph = [];
  };
  body.split('\n').forEach((line, i) => {
    if (/^\s*```/.test(line)) { fence = !fence; return flush(); }
    if (fence) return;
    if (/^\s*!\[/.test(line)) return flush();
    const t = line
      .replace(/(`+)[\s\S]*?\1/g, ' Code ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .trim();
    if (!t || /^(#|\||!\[|\*[^*].*\*$)/.test(t)) return flush();
    if (/^([-*]|\d+\.)\s/.test(t)) flush();
    if (!paragraph.length) start = i + 1;
    paragraph.push(t.replace(/^([-*]|\d+\.)\s+/, ''));
  });
  flush();
  return out;
}

let total = 0;
let long = 0;
for (const name of readdirSync(ESSAYS).filter((f) => f.endsWith('.md')).sort()) {
  const all = sentences(readFileSync(join(ESSAYS, name), 'utf8'));
  const over = all.filter((s) => s.words > max).sort((a, b) => b.words - a.words);
  total += all.length;
  long += over.length;
  for (const s of over) console.log(`${name}:${s.line}  ${s.words} words  ${full ? s.text : `${s.text.slice(0, 90)}…`}`);
}
console.log(`report-sentences: ${long} of ${total} sentences over ${max} words (${total ? ((100 * long) / total).toFixed(1) : 0}%).`);
