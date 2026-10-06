/**
 * The kinds of value that the micro cases store in a tracked value.
 */
export const COUNT = 1000;

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
export const kinds = [
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
