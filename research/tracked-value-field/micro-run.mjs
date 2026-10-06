/**
 * Compares builds of ember-source on the micro cases of `micro.mjs`.
 *
 *   node research/tracked-value-field/micro-run.mjs \
 *     --sources=before=<ember-source folder>,after=<ember-source folder> \
 *     [--rounds=6] [--cpu=1] [--min-cpu-ms=500] [--case=<regex>] [--out=<file without extension>]
 *
 * - the first source is the baseline
 * - each case of each build runs in its own process
 * - the order of the builds rotates, and is mirrored between rounds
 * - a cell is the median of the rounds
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    sources: { type: 'string' },
    rounds: { type: 'string', default: '6' },
    cpu: { type: 'string' },
    'min-cpu-ms': { type: 'string', default: '500' },
    case: { type: 'string' },
    out: { type: 'string' },
  },
});

const worker = fileURLToPath(new URL('./micro.mjs', import.meta.url));
const rounds = Number(values.rounds);
const filter = values.case ? new RegExp(values.case) : null;

const sides = [];
const sources = {};
for (let pair of values.sources.split(',')) {
  let [side, path] = pair.split('=');
  sides.push(side);
  sources[side] = resolve(path);
}

function node(extra, env) {
  let args = ['--expose-gc', worker].concat(extra);
  let command = process.execPath;

  if (values.cpu) {
    args.unshift('-c', values.cpu, command);
    command = 'taskset';
  }

  let { status, stdout } = spawnSync(command, args, {
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'inherit'],
  });

  if (status !== 0) throw new Error(`micro.mjs ${extra.join(' ')} failed with exit code ${status}`);

  return String(stdout);
}

function runOne(side, index) {
  let out = `${tmpdir()}/tracked-value-micro-${process.pid}.json`;

  node([`--index=${index}`, `--out=${out}`, `--min-cpu-ms=${values['min-cpu-ms']}`], {
    EMBER_SOURCE: sources[side],
  });

  let report = JSON.parse(readFileSync(out, 'utf8'));

  rmSync(out);

  return report;
}

function median(list) {
  let sorted = list.slice().sort((a, b) => a - b);
  let middle = sorted.length >> 1;

  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function time(ns) {
  if (Math.abs(ns) >= 1e6) return `${(ns / 1e6).toFixed(2)} ms`;
  if (Math.abs(ns) >= 1e4) return `${(ns / 1e3).toFixed(2)} µs`;

  return `${ns.toFixed(0)} ns`;
}

/**
 * The order of round `r`: the list starts at side `r / 2`,
 * and each odd round runs the order of the round before it in reverse.
 */
function orderOf(round) {
  let shift = (round >> 1) % sides.length;
  let order = sides.slice(shift).concat(sides.slice(0, shift));

  return round % 2 === 0 ? order : order.reverse();
}

const names = JSON.parse(node(['--list'], {}));
const samples = names.map(() => Object.fromEntries(sides.map((side) => [side, []])));

for (let round = 0; round < rounds; round++) {
  let order = orderOf(round);
  let started = Date.now();

  for (let index = 0; index < names.length; index++) {
    if (filter && !filter.test(names[index])) continue;

    for (let side of order) {
      samples[index][side].push(runOne(side, index).p50);
    }
  }

  console.error(`round ${round + 1}/${rounds} (${Math.round((Date.now() - started) / 1000)} s)`);
}

const base = sides[0];
const lines = [];
const eventLines = [];

for (let index = 0; index < names.length; index++) {
  if (filter && !filter.test(names[index])) continue;

  let row = samples[index];
  let baseline = median(row[base]);
  let isEvent = names[index].endsWith(': first number');
  let cells = [names[index].replace(': first number', '')];

  for (let side of sides) {
    let value = median(row[side]);

    if (isEvent || side === base) {
      cells.push(time(value));
      continue;
    }

    let ratios = row[side].map((sample, round) => sample / row[base][round]).sort((x, y) => x - y);
    let low = ratios[0].toFixed(2);
    let high = ratios[ratios.length - 1].toFixed(2);

    cells.push(`${time(value)} (${(value / baseline).toFixed(2)}x, ${low} to ${high})`);
  }

  (isEvent ? eventLines : lines).push(`| ${cells.join(' | ')} |`);
}

const head = `| ${sides.join(' | ')} |`;
const rule = `| --- |${sides.map(() => ' ---: |').join('')}`;

const report = [`| case, 1,000 tracked values ${head}`, rule]
  .concat(lines, ['', `| extra time of 5,000 read loops after the first number ${head}`, rule])
  .concat(eventLines, [
    '',
    `- Median of ${rounds} rounds. A time is the p50 from mitata for one pass over 1,000 tracked values.`,
    `- The ratio compares with "${base}". The range is the lowest and the highest ratio of one round.`,
    '- The extra time is the time of 5,000 read loops after one cell gets a number, minus the time of 5,000 read loops before it.',
    `- node ${process.version}`,
  ])
  .join('\n');

console.log(report);

if (values.out) {
  writeFileSync(`${values.out}.md`, `${report}\n`);
  writeFileSync(`${values.out}.json`, JSON.stringify({ names, samples, node: process.version }));
}
