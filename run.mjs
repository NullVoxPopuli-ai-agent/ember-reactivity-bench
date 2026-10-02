/**
 * Runs each case of each column in its own process, for a number of rounds,
 * and prints one table.
 *
 * A column is one adapter.
 * With more than one `--ember-source`, each Ember adapter has one column per source.
 *
 * For one case, the columns run one after the other,
 * and their order is mirrored between rounds:
 *
 *   round 1: a, b, c
 *   round 2: c, b, a
 *
 * A slow drift of the machine then has the same effect on each column.
 *
 * `--from=<file>` prints the table of a saved run again, and measures nothing.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { cpus } from 'node:os';
import { basename, resolve } from 'node:path';
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
    from: { type: 'string' },
  },
});

const here = fileURLToPath(new URL('.', import.meta.url));
const resultsDir = `${here}results`;

function version(folder) {
  return JSON.parse(readFileSync(`${folder}/package.json`, 'utf8')).version;
}

/**
 * The chain of 1000 computeds is deeper than the default stack of V8
 * allows for Svelte, so each process gets a larger stack.
 */
const nodeFlags = ['--expose-gc', '--stack-size=3000'];

function runOne(column, index) {
  let out = `${resultsDir}/.tmp-${column.adapter}.json`;
  let args = nodeFlags.concat(`${here}bench.mjs`, `--adapter=${column.adapter}`, `--out=${out}`);

  args.push(`--index=${index}`, `--min-cpu-ms=${values['min-cpu-ms']}`);

  let command = process.execPath;

  if (values.cpu) {
    args.unshift('-c', values.cpu, command);
    command = 'taskset';
  }

  let env = column.source ? { ...process.env, EMBER_SOURCE: column.source } : process.env;
  let { status } = spawnSync(command, args, { env, stdio: ['ignore', 'inherit', 'inherit'] });

  if (status !== 0) {
    throw new Error(`The process for "${column.id}", case ${index}, failed with exit code ${status}`);
  }

  let report = JSON.parse(readFileSync(out, 'utf8'));

  rmSync(out);

  return report;
}

/**
 * A run has:
 *
 * - `columns`: the name of each column, by column id
 * - `samples`: for each case and each column id, the p50 times, one per round
 * - `environment`: the versions of the libraries, and the machine
 */
function measure() {
  let rounds = Number(values.rounds);
  let filter = values.case ? new RegExp(values.case) : null;
  let sources = values['ember-source']?.split(',').map((path) => resolve(path)) ?? [];
  let columns = [];

  for (let adapter of values.adapters.split(',')) {
    if (adapter.startsWith('ember-') && sources.length > 0) {
      for (let source of sources) {
        let suffix = sources.length > 1 ? ` (${basename(source)})` : '';

        columns.push({ id: `${adapter}@${source}`, adapter, source, suffix });
      }
    } else {
      columns.push({ id: adapter, adapter, source: undefined, suffix: '' });
    }
  }

  let names = {};
  let samples = {};

  for (let round = 0; round < rounds; round++) {
    let order = round % 2 === 0 ? columns : columns.toReversed();
    let start = performance.now();

    for (let index = 0; index < cases.length; index++) {
      let { name } = cases[index];

      if (filter && !filter.test(name)) continue;

      let byColumn = (samples[name] ??= {});

      for (let column of order) {
        let report = runOne(column, index);

        names[column.id] = `${report.name}${column.suffix}`;
        (byColumn[column.id] ??= []).push(report.results[0].p50);
      }
    }

    let seconds = ((performance.now() - start) / 1000).toFixed(0);

    console.error(`round ${round + 1}/${rounds} (${seconds} s)`);
  }

  let libraries = ['alien-signals', 'signal-polyfill', 'solid-js', 'svelte'].map(
    (name) => `${name} ${version(`${here}node_modules/${name}`)}`
  );

  if (sources.length > 0) {
    for (let source of sources) {
      libraries.push(`ember-source ${version(source)} (${basename(source)})`);
    }
  } else {
    libraries.push(`ember-source ${version(`${here}node_modules/ember-source`)}`);
  }

  let environment = `${libraries.join(', ')}, node ${process.version}, ${cpus()[0].model}.`;

  // The order of the keys is the order of the columns in the table.
  let ordered = {};

  for (let { id } of columns) ordered[id] = names[id];

  return { columns: ordered, samples, environment };
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

function render({ columns, samples, environment }) {
  let ids = Object.keys(columns);
  let baseline = ids[0];
  let weights = new Map(cases.map((c) => [c.name, c.weight]));
  let lines = [];
  let worst = { spread: 0, where: '' };
  let rounds = 0;

  // For each column: the sum of weight * ln(ratio), for the geometric mean.
  let logSums = ids.map(() => 0);
  let weightSum = 0;

  lines.push(`| case | ${ids.map((id) => columns[id]).join(' | ')} |`);
  lines.push(`| --- | ${ids.map(() => '---:').join(' | ')} |`);

  for (let name of Object.keys(samples)) {
    let byColumn = samples[name];
    let base = summarize(byColumn[baseline]).median;
    let weight = weights.get(name) ?? 1;
    let cells = [];

    weightSum += weight;
    rounds = byColumn[baseline].length;

    for (let i = 0; i < ids.length; i++) {
      let id = ids[i];
      let { median, spread } = summarize(byColumn[id]);

      if (spread > worst.spread) worst = { spread, where: `${name}, ${columns[id]}` };

      logSums[i] += weight * Math.log(median / base);
      cells.push(id === baseline ? time(median) : `${time(median)} (${ratio(median / base)})`);
    }

    lines.push(`| ${name} | ${cells.join(' | ')} |`);
  }

  let means = logSums.map((sum) => ratio(Math.exp(sum / weightSum)));

  lines.push(`| weighted geometric mean | ${means.join(' | ')} |`);

  let notes = [
    `Time for the writes of one frame and the flush of that frame. Median of ${rounds} rounds of the p50 from mitata.`,
    `The ratio in parentheses compares with "${columns[baseline]}". A ratio above 1 is slower.`,
    `The last row is the geometric mean of the ratios. Each group of cases has the same total weight.`,
    `Largest difference between rounds for one cell: ${(worst.spread * 100).toFixed(0)}% (${worst.where}).`,
    environment,
  ];

  return `${lines.join('\n')}\n\n${notes.map((note) => `- ${note}`).join('\n')}\n`;
}

if (values.from) {
  console.log(render(JSON.parse(readFileSync(values.from, 'utf8'))));
} else {
  mkdirSync(resultsDir, { recursive: true });

  let run = measure();
  let table = render(run);
  let stamp = new Date().toISOString().replace(/[:.]/g, '-');

  writeFileSync(`${resultsDir}/${stamp}.md`, table);
  writeFileSync(`${resultsDir}/${stamp}.json`, JSON.stringify(run, null, 2));

  console.log(table);
  console.error(`Saved: ${resultsDir}/${stamp}.md`);
}
