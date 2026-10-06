/**
 * Measures the bytes that V8 allocates for create, read and write
 * of a `tracked(value)`, for one kind of value, in this process.
 *
 *   EMBER_SOURCE=<ember-source folder> node --expose-gc \
 *     --max-semi-space-size=256 --min-semi-space-size=256 alloc.mjs --index=0
 *   node alloc.mjs --list
 *
 * The young generation is large, so no GC runs inside a measurement.
 * The bytes are then the growth of the used heap.
 */
import { parseArgs } from 'node:util';
import v8 from 'node:v8';

import { COUNT, kinds } from './kinds.mjs';

const { values: args } = parseArgs({
  options: {
    index: { type: 'string' },
    list: { type: 'boolean', default: false },
  },
});

if (args.list) {
  console.log(JSON.stringify(kinds.map((kind) => kind.name)));
  process.exit(0);
}

const { load } = await import('../../adapters/ember-source.mjs');
const { tracked } = await load('@glimmer/tracking');
const { default: setGlobalContext } = await load('@glimmer/global-context');

setGlobalContext({ scheduleRevalidate() {} });

const kind = kinds[Number(args.index)];

const A = [];
const B = [];
for (let i = 0; i < COUNT; i++) {
  A.push(kind.a(i));
  B.push(kind.b(i));
}

const cells = new Array(COUNT);
const target = new Array(COUNT);

function create(into) {
  for (let i = 0; i < COUNT; i++) into[i] = tracked(A[i]);
}

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

create(cells);

/**
 * Newer versions of V8 count every allocated byte.
 * Older versions report only the used heap, which is the same number while no GC runs.
 */
function allocated() {
  let total = v8.getHeapStatistics().total_allocated_bytes;

  return total === undefined ? process.memoryUsage().heapUsed : total;
}

function bytesPerOperation(run, passes) {
  for (let r = 0; r < 20000; r++) run();

  globalThis.gc();

  let before = allocated();
  for (let r = 0; r < passes; r++) run();
  let after = allocated();

  return (after - before) / (passes * COUNT);
}

const result = {
  kind: kind.name,
  create: bytesPerOperation(() => create(target), 1000),
  read: bytesPerOperation(read, 5000),
  write: bytesPerOperation(write, 5000),
};

if (sink === -1) console.log(sink);

console.log(JSON.stringify(result));
