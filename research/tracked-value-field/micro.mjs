/**
 * Measures one micro case of `tracked(value)` in this process.
 *
 * `micro-run.mjs` starts this file one time per build, per case, per round,
 * so the `#value` field of the class sees only the values of one case.
 *
 *   EMBER_SOURCE=<ember-source folder> node --expose-gc micro.mjs --index=0
 *   node micro.mjs --list
 */
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { measure } from 'mitata';

import { COUNT, kinds } from './kinds.mjs';

const { values: args } = parseArgs({
  options: {
    index: { type: 'string' },
    list: { type: 'boolean', default: false },
    out: { type: 'string' },
    'min-cpu-ms': { type: 'string', default: '500' },
  },
});

const cases = [];
for (let kind of kinds) {
  cases.push({ kind, op: 'create' }, { kind, op: 'read' }, { kind, op: 'write' });
}
for (let kind of kinds) {
  if (kind.number) continue;
  cases.push({ kind, op: 'read, after the first number' }, { kind, op: 'first number' });
}
for (let c of cases) c.name = `${c.kind.name}: ${c.op}`;

if (args.list) {
  console.log(JSON.stringify(cases.map((c) => c.name)));
  process.exit(0);
}

const { load } = await import('../../adapters/ember-source.mjs');
const { tracked } = await load('@glimmer/tracking');
const { default: setGlobalContext } = await load('@glimmer/global-context');

setGlobalContext({ scheduleRevalidate() {} });

const { kind, op, name } = cases[Number(args.index)];

const A = [];
const B = [];
for (let i = 0; i < COUNT; i++) {
  A.push(kind.a(i));
  B.push(kind.b(i));
}

function create(target) {
  for (let i = 0; i < COUNT; i++) target[i] = tracked(A[i]);
}

const cells = new Array(COUNT);
create(cells);

/**
 * The spare cell is not in `cells`,
 * so the read loop never gets the number.
 */
const spare = tracked(A[0]);

let sink = 0;
let flip = false;

function write() {
  flip = !flip;
  let from = flip ? B : A;
  for (let i = 0; i < COUNT; i++) cells[i].value = from[i];
}

function read() {
  sink += kind.read(cells);
}

let result;

if (op === 'first number') {
  /**
   * The cost of the event itself:
   * the read loop is hot, then one cell gets the first number.
   *
   * `extra` is the time of the next calls above the time before the write.
   */
  const CALLS = 5000;
  const now = process.hrtime.bigint;

  for (let r = 0; r < 20000; r++) read();

  let before = now();
  for (let r = 0; r < CALLS; r++) read();
  let steady = Number(now() - before);

  spare.value = 1;

  let start = now();
  read();
  let first = Number(now() - start);
  for (let r = 1; r < CALLS; r++) read();
  let after = Number(now() - start);

  result = { case: name, p50: after - steady, first, steady: steady / CALLS };
} else {
  let run = read;

  if (op === 'create') {
    let target = new Array(COUNT);
    run = () => create(target);
  } else if (op === 'write') {
    run = write;
  } else if (op === 'read, after the first number') {
    for (let r = 0; r < 20000; r++) read();
    spare.value = 1;
  }

  let stats = await measure(run, { min_cpu_time: Number(args['min-cpu-ms']) * 1e6 });

  result = { case: name, p50: stats.p50, min: stats.min };
}

if (sink === -1) console.log(sink);

if (args.out) {
  writeFileSync(args.out, JSON.stringify(result));
} else {
  console.log(result);
}
