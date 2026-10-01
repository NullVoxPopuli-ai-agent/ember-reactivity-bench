/**
 * Runs each case of each adapter in its own process, for a number of rounds,
 * and prints one table.
 *
 * For one case, the adapters run one after the other,
 * and their order is mirrored between rounds:
 *
 *   round 1: a, b, c
 *   round 2: c, b, a
 *
 * A slow drift of the machine then has the same effect on each adapter.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { cpus } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { adapters as allAdapters } from './adapters/index.mjs';
import { cases } from './cases.mjs';

const { values } = parseArgs({
  options: {
    rounds: { type: 'string', default: '4' },
    adapters: { type: 'string', default: allAdapters.join(',') },
    case: { type: 'string' },
    cpu: { type: 'string' },
    'min-cpu-ms': { type: 'string', default: '1000' },
    'ember-source': { type: 'string' },
  },
});

const here = fileURLToPath(new URL('.', import.meta.url));
const resultsDir = `${here}results`;
const rounds = Number(values.rounds);
const adapters = values.adapters.split(',');
const filter = values.case ? new RegExp(values.case) : null;

if (values['ember-source']) process.env.EMBER_SOURCE = resolve(values['ember-source']);

const ember = await import('./adapters/ember-source.mjs');

mkdirSync(resultsDir, { recursive: true });

function runOne(adapter, index) {
  let out = `${resultsDir}/.tmp-${adapter}.json`;
  let args = ['--expose-gc', `${here}bench.mjs`, `--adapter=${adapter}`, `--out=${out}`];

  args.push(`--index=${index}`, `--min-cpu-ms=${values['min-cpu-ms']}`);

  let command = process.execPath;

  if (values.cpu) {
    args.unshift('-c', values.cpu, command);
    command = 'taskset';
  }

  let { status } = spawnSync(command, args, { stdio: ['ignore', 'inherit', 'inherit'] });

  if (status !== 0) {
    throw new Error(`The process for "${adapter}", case ${index}, failed with exit code ${status}`);
  }

  let report = JSON.parse(readFileSync(out, 'utf8'));

  rmSync(out);

  return report;
}

/**
 * samples[case][adapter] is the list of the p50 times, one per round.
 */
const samples = new Map();
const names = new Map();

for (let round = 0; round < rounds; round++) {
  let order = round % 2 === 0 ? adapters : adapters.toReversed();
  let start = performance.now();

  for (let index = 0; index < cases.length; index++) {
    let { name } = cases[index];

    if (filter && !filter.test(name)) continue;
    if (!samples.has(name)) samples.set(name, new Map());

    let byAdapter = samples.get(name);

    for (let adapter of order) {
      let report = runOne(adapter, index);

      names.set(adapter, report.name);

      if (!byAdapter.has(adapter)) byAdapter.set(adapter, []);

      byAdapter.get(adapter).push(report.results[0].p50);
    }
  }

  let seconds = ((performance.now() - start) / 1000).toFixed(0);

  console.error(`round ${round + 1}/${rounds} (${seconds} s)`);
}

function summarize(list) {
  let sorted = list.toSorted((a, b) => a - b);
  let middle = sorted.length >> 1;
  let median = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;

  return { median, spread: (sorted.at(-1) - sorted[0]) / median };
}

function time(ns) {
  if (ns < 1e3) return `${ns.toFixed(0)} ns`;
  if (ns < 1e6) return `${(ns / 1e3).toFixed(2)} µs`;

  return `${(ns / 1e6).toFixed(2)} ms`;
}

function ratio(value) {
  return `${value < 10 ? value.toFixed(1) : value.toFixed(0)}x`;
}

const baseline = adapters[0];
const lines = [];
let worst = { spread: 0, where: '' };

lines.push(`| case | ${adapters.map((id) => names.get(id)).join(' | ')} |`);
lines.push(`| --- | ${adapters.map(() => '---:').join(' | ')} |`);

for (let [name, byAdapter] of samples) {
  let base = summarize(byAdapter.get(baseline)).median;
  let cells = [];

  for (let adapter of adapters) {
    let { median, spread } = summarize(byAdapter.get(adapter));

    if (spread > worst.spread) worst = { spread, where: `${name}, ${names.get(adapter)}` };

    cells.push(adapter === baseline ? time(median) : `${time(median)} (${ratio(median / base)})`);
  }

  lines.push(`| ${name} | ${cells.join(' | ')} |`);
}

const alienVersion = JSON.parse(
  readFileSync(`${here}node_modules/alien-signals/package.json`, 'utf8')
).version;

const notes = [
  `Time for the writes of one frame and the flush of that frame. Median of ${rounds} rounds of the p50 from mitata.`,
  `The ratio in parentheses compares with "${names.get(baseline)}". A ratio above 1 is slower.`,
  `Largest difference between rounds for one cell: ${(worst.spread * 100).toFixed(0)}% (${worst.where}).`,
  `ember-source ${ember.version}, alien-signals ${alienVersion}, node ${process.version}, ${cpus()[0].model}.`,
];

const table = `${lines.join('\n')}\n\n${notes.join('\n')}\n`;
const stamp = new Date().toISOString().replace(/[:.]/g, '-');

writeFileSync(`${resultsDir}/${stamp}.md`, table);
writeFileSync(
  `${resultsDir}/${stamp}.json`,
  JSON.stringify(
    Object.fromEntries(Array.from(samples, ([name, by]) => [name, Object.fromEntries(by)])),
    null,
    2
  )
);

console.log(table);
console.error(`Saved: ${resultsDir}/${stamp}.md`);
