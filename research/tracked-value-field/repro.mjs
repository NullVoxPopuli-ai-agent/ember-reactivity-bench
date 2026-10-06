/**
 * Shows the deopt that the first number in a TrackedValue causes.
 * One store of `0` in the constructor avoids it.
 *
 *   node --trace-deopt research/tracked-value-field/repro.mjs <shape> <first>
 *
 * - shape: `main` has one store. `pr` stores 0, then the value.
 * - first: the kind of value in the 1,000 hot instances.
 *   One of str, smi, dbl, undef.
 *
 * The script makes 1,000 instances and reads them in a hot loop,
 * until V8 optimizes the loop and `get value`.
 * Then it writes one number, one object and one string.
 *
 * Count the lines with "dependent field representation".
 */

const [shape, first] = process.argv.slice(2);

function consumeTag() {}

class Main {
  #isFrozen = false;
  #value;
  #options;
  #tag;
  constructor(value, options) {
    this.#value = value;
    this.#options = options;
    this.#tag = {};
  }
  get value() {
    consumeTag(this.#tag);
    return this.#value;
  }
  set value(v) {
    if (this.#options.equals(this.#value, v)) return;
    this.#value = v;
  }
}

class Pr {
  #isFrozen = false;
  #value;
  #options;
  #tag;
  constructor(value, options) {
    this.#value = 0;
    this.#value = value;
    this.#options = options;
    this.#tag = {};
  }
  get value() {
    consumeTag(this.#tag);
    return this.#value;
  }
  set value(v) {
    if (this.#options.equals(this.#value, v)) return;
    this.#value = v;
  }
}

const Klass = { main: Main, pr: Pr }[shape];
const kinds = {
  str: (i) => `s${i}`,
  smi: (i) => i,
  dbl: (i) => i + 0.5,
  undef: () => undefined,
};

const options = { equals: Object.is };
const values = [];
for (let i = 0; i < 1000; i++) values.push(new Klass(kinds[first](i), options));

let sink = 0;
function hot() {
  let n = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i].value;
    if (v !== undefined && v !== null) n++;
  }
  return n;
}
for (let r = 0; r < 20000; r++) sink += hot();

console.log(`--- ${shape}, first ${first}: write one number`);
values[3].value = 10;
for (let r = 0; r < 100; r++) sink += hot();
console.log(`--- write one object`);
values[4].value = { x: 1 };
for (let r = 0; r < 100; r++) sink += hot();
console.log(`--- write one string`);
values[5].value = 'z';
for (let r = 0; r < 100; r++) sink += hot();
console.log('sink', sink);
