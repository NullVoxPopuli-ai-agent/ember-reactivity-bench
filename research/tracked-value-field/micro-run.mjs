/**
 * Compares two builds of ember-source on the micro cases of `micro.mjs`.
 *
 *   node research/tracked-value-field/micro-run.mjs \
 *     --before=<ember-source folder> --after=<ember-source folder> \
 *     [--rounds=6] [--cpu=1] [--min-cpu-ms=500] [--out=<file without extension>]
 *
 * - each case of each build runs in its own process
 * - the order of the builds is mirrored between rounds
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
    before: { type: 'string' },
    after: { type: 'string' },
    rounds: { type: 'string', default: '6' },
    cpu: { type: 'string' },
    'min-cpu-ms': { type: 'string', default: '500' },
    out: { type: 'string' },
  },
});

const worker = fileURLToPath(new URL('./micro.mjs', import.meta.url));
const sources = { before: resolve(values.before), after: resolve(values.after) };
const rounds = Number(values.rounds);

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
  if (Math.abs(ns) >= 1e3) return `${(ns / 1e3).toFixed(2)} µs`;

  return `${ns.toFixed(0)} ns`;
}

const names = JSON.parse(node(['--list'], {}));
const samples = names.map(() => ({ before: [], after: [] }));

for (let round = 0; round < rounds; round++) {
  let order = round % 2 === 0 ? ['before', 'after'] : ['after', 'before'];
  let started = Date.now();

  for (let index = 0; index < names.length; index++) {
    for (let side of order) {
      samples[index][side].push(runOne(side, index).p50);
    }
  }

  console.error(`round ${round + 1}/${rounds} (${Math.round((Date.now() - started) / 1000)} s)`);
}

const lines = [];
const eventLines = [];

for (let index = 0; index < names.length; index++) {
  let { before, after } = samples[index];
  let b = median(before);
  let a = median(after);

  if (names[index].endsWith(': first number')) {
    eventLines.push(`| ${names[index].replace(': first number', '')} | ${time(b)} | ${time(a)} |`);
    continue;
  }

  let ratios = before.map((value, round) => after[round] / value);
  let sorted = ratios.slice().sort((x, y) => x - y);
  let low = sorted[0].toFixed(2);
  let high = sorted[sorted.length - 1].toFixed(2);

  lines.push(
    `| ${names[index]} | ${time(b)} | ${time(a)} | ${(a / b).toFixed(2)}x | ${low} to ${high} |`
  );
}

const report = [
  '| case, 1,000 tracked values | before | after | after / before | ratio of each round |',
  '| --- | ---: | ---: | ---: | ---: |',
]
  .concat(lines, [
    '',
    '| extra time of 5,000 read loops after the first number | before | after |',
    '| --- | ---: | ---: |',
  ])
  .concat(eventLines, [
    '',
    `- Median of ${rounds} rounds. A time is the p50 from mitata for one pass over 1,000 tracked values.`,
    '- A ratio above 1 means that the build with the store of `0` is slower.',
    '- The extra time is the time of 5,000 read loops after one cell gets a number, minus the time of 5,000 read loops before it.',
    `- node ${process.version}`,
  ])
  .join('\n');

console.log(report);

if (values.out) {
  writeFileSync(`${values.out}.md`, `${report}\n`);
  writeFileSync(`${values.out}.json`, JSON.stringify({ names, samples, node: process.version }));
}
