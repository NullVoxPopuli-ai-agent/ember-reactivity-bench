/**
 * Makes sure that all adapters do the same work.
 *
 * For each case:
 *
 * - all adapters must see the same values after 5 frames
 * - a frame must change the values that the outputs saw,
 *   unless the case is `constant`
 */
import { adapters, loadAdapter } from './adapters/index.mjs';
import { cases } from './cases.mjs';

const FRAMES = 5;

/**
 * An adapter can need a build of ember-source that is not installed.
 * Such an adapter is left out, with its reason.
 */
const usable = [];

for (let id of adapters) {
  try {
    await loadAdapter(id);
    usable.push(id);
  } catch (error) {
    console.log(`skip ${id}: ${error.message}`);
  }
}

let failures = 0;

for (let { name, setup, constant } of cases) {
  let expected;
  let problems = [];

  for (let id of usable) {
    let fw = await loadAdapter(id);

    fw.reset();

    let { run, result } = setup(fw);
    let before = JSON.stringify(result());

    for (let i = 0; i < FRAMES; i++) run();

    let after = JSON.stringify(result());

    if (!constant && before === after) {
      problems.push(`${id}: the frame did not update the outputs`);
    }

    expected ??= after;

    if (after !== expected) {
      problems.push(`${id}: the result is different from ${usable[0]}`);
    }
  }

  failures += problems.length;

  console.log(`${problems.length ? 'FAIL' : 'ok  '} ${name}`);

  for (let problem of problems) console.log(`       ${problem}`);
}

process.exit(failures ? 1 : 0);
