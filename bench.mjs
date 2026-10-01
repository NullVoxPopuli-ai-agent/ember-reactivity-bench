/**
 * Measures cases for one adapter.
 *
 * `run.mjs` starts this file one time per adapter, per case, per round:
 *
 * - only one library is in the V8 process
 * - the graphs of one case cannot change how V8 compiles the next case
 *
 * Without `--index`, all cases run in one process.
 * The `create:` cases of Ember are then up to 6 times slower in some runs.
 */
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { measure } from 'mitata';

import { loadAdapter } from './adapters/index.mjs';
import { cases } from './cases.mjs';

const { values } = parseArgs({
  options: {
    adapter: { type: 'string' },
    case: { type: 'string' },
    index: { type: 'string' },
    out: { type: 'string' },
    'min-cpu-ms': { type: 'string', default: '1000' },
  },
});

if (typeof globalThis.gc !== 'function') {
  throw new Error('Start node with --expose-gc. Without it, mitata allocates 1 GiB per case.');
}

const fw = await loadAdapter(values.adapter);
const filter = values.case ? new RegExp(values.case) : null;
const selected = values.index ? [cases[Number(values.index)]] : cases;
const results = [];

for (let { name, setup } of selected) {
  if (filter && !filter.test(name)) continue;

  fw.reset();

  let { run } = setup(fw);
  let stats = await measure(run, { min_cpu_time: Number(values['min-cpu-ms']) * 1e6 });

  results.push({
    case: name,
    p25: stats.p25,
    p50: stats.p50,
    p75: stats.p75,
    min: stats.min,
    avg: stats.avg,
    ticks: stats.ticks,
  });
}

const report = { adapter: values.adapter, name: fw.name, results };

if (values.out) {
  writeFileSync(values.out, JSON.stringify(report));
} else {
  for (let r of results) {
    console.log(`${r.case.padEnd(40)} ${r.p50.toFixed(1).padStart(12)} ns`);
  }
}
