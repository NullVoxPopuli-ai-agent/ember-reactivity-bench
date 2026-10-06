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

const { values: args } = parseArgs({
  options: {
    index: { type: 'string' },
    list: { type: 'boolean', default: false },
    out: { type: 'string' },
    'min-cpu-ms': { type: 'string', default: '500' },
  },
});

const COUNT = 1000;

/**
 * Each read loop does the work that fits the kind of value,
 * so that V8 has a reason to use what it knows about the field.
 */
function sumNumber(cells) {
  let n = 0;
  for (let i = 0; i < cells.length; i++) n += cells[i].value;
  return n;
}

function sumLength(cells) {
  let n = 0;
  for (let i = 0; i < cells.length; i++) n += cells[i].value.length;
  return n;
}

function sumField(cells) {
  let n = 0;
  for (let i = 0; i < cells.length; i++) n += cells[i].value.i;
  return n;
}

function countTrue(cells) {
  let n = 0;
  for (let i = 0; i < cells.length; i++) if (cells[i].value === true) n++;
  return n;
}

function countUndefined(cells) {
  let n = 0;
  for (let i = 0; i < cells.length; i++) if (cells[i].value === undefined) n++;
  return n;
}

function countFunction(cells) {
  let n = 0;
  for (let i = 0; i < cells.length; i++) if (typeof cells[i].value === 'function') n++;
  return n;
}

const PROBE = Symbol('probe');
function countProbe(cells) {
  let n = 0;
  for (let i = 0; i < cells.length; i++) if (cells[i].value === PROBE) n++;
  return n;
}

function countBig(cells) {
  let n = 0;
  for (let i = 0; i < cells.length; i++) if (cells[i].value > 500n) n++;
  return n;
}

function countNumber(cells) {
  let n = 0;
  for (let i = 0; i < cells.length; i++) if (typeof cells[i].value === 'number') n++;
  return n;
}

/**
 * `a` is the first value of cell `i`. A write pass stores `b`, then `a` again.
 * `number` says that the kind stores a number in the field without help.
 */
const kinds = [
  { name: 'small integer', number: true, a: (i) => i, b: (i) => i + 1, read: sumNumber },
  { name: 'double', number: true, a: (i) => i + 0.5, b: (i) => i + 1.5, read: sumNumber },
  { name: 'string', a: (i) => `a${i}`, b: (i) => `b${i}`, read: sumLength },
  { name: 'boolean', a: (i) => i % 2 === 0, b: (i) => i % 2 === 1, read: countTrue },
  {
    name: 'undefined and null',
    a: (i) => (i % 2 === 0 ? undefined : null),
    b: (i) => (i % 2 === 0 ? null : undefined),
    read: countUndefined,
  },
  { name: 'object', a: (i) => ({ i }), b: (i) => ({ i: i + 1 }), read: sumField },
  { name: 'array', a: (i) => [i], b: (i) => [i, i], read: sumLength },
  { name: 'function', a: (i) => () => i, b: (i) => () => i + 1, read: countFunction },
  {
    name: 'symbol',
    a: (i) => (i % 2 === 0 ? PROBE : Symbol()),
    b: (i) => (i % 2 === 1 ? PROBE : Symbol()),
    read: countProbe,
  },
  { name: 'bigint', a: (i) => BigInt(i), b: (i) => BigInt(i + 1), read: countBig },
];

const mixedKinds = kinds.slice();
kinds.push({
  name: 'all kinds mixed',
  number: true,
  a: (i) => mixedKinds[i % mixedKinds.length].a(i),
  b: (i) => mixedKinds[(i + 1) % mixedKinds.length].b(i),
  read: countNumber,
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

  result = { case: name, p50: stats.p50 };
}

if (sink === -1) console.log(sink);

if (args.out) {
  writeFileSync(args.out, JSON.stringify(result));
} else {
  console.log(result);
}
