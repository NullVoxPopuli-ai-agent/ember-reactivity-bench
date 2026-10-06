# The first number in the value field of a TrackedValue

```bash
node --trace-deopt research/tracked-value-field/repro.mjs main str
node --trace-deopt research/tracked-value-field/repro.mjs pr str
```

Ember PR [21650](https://github.com/emberjs/ember.js/pull/21650), commit `bd88a65ab1`,
stores `0` in the `#value` field of a `TrackedValue` before the real value.
This page checks what that store does.

## What V8 does

All instances of a class share one hidden class.
For each field, V8 records the kind of value that the field held so far.
If the first instance holds a heap object, for example a string or `undefined`,
the field has the representation "heap object".
Optimized code that reads the field depends on that representation.
The first number in any instance changes the representation to "tagged",
and V8 throws away all dependent optimized code.

A field that holds a number first has the representation "small integer" or "double".
In this test, V8 did not throw away code when a later value was a string or an object.

## Result

Node 26.10.0. The script reads 1,000 instances in a hot loop, then writes one number,
one object and one string. The count is the lines with "dependent field representation changed".

| first value | one store (`main`) | store `0` first (PR) |
| --- | ---: | ---: |
| string | 4 | 0 |
| `undefined` | 4 | 0 |
| small integer | 0 | 0 |
| double | 0 | 0 |

The deopt happens one time for each page load, when the first number arrives.
After it, V8 optimizes the functions again with the general representation.
The store of `0` moves the change to the first instance, before any code is optimized.

## Cost of the store

The store costs nothing that this benchmark can measure.
The run has the 20 cases of the `ember-tracked` adapter, in 6 mirrored rounds on Node 24.20.0.
It compares the PR head before the commit (`50eef0f8c1`) with the commit (`bd88a65ab1`).
Every case is 1.0x, and the weighted mean is 1.0x. The table is in [`results.md`](./results.md).

```bash
pnpm bench --rounds=6 --adapters=ember-tracked --cpu=1 --ember-source=<before>,<after>
```

## Micro benchmark, by kind of value

```bash
node research/tracked-value-field/micro-run.mjs --before=<ember-source> --after=<ember-source> --cpu=1
```

`micro.mjs` makes 1,000 `tracked(value)` cells of one kind of value and measures one pass with mitata:
create, read and write. Each case of each build runs in its own process, 6 mirrored rounds.

The kinds are small integer, double, string, boolean, `undefined` and `null`, object, array,
function, symbol, bigint, and all kinds mixed.

"Before" is `50eef0f8c1`. "After" is `54ee916923`, with the store of `0`.
The numbers are after / before, lowest to highest case. Above 1 means that the store is slower.

| group | Node 24.20 | Node 26.10 |
| --- | ---: | ---: |
| create, 11 kinds | 0.92x to 1.08x | 0.98x to 1.04x |
| write, 11 kinds | 0.98x to 1.00x | 0.90x to 1.00x |
| read, small integer and double | 0.99x to 1.04x | 0.99x to 1.00x |
| read, the other 9 kinds | 1.00x to 1.07x | 0.92x to 1.10x |
| read, after another cell got the first number, 8 kinds | 1.04x to 1.09x | 0.98x to 1.12x |

The cost of the event: a read loop is hot, then one other cell gets the first number.
The time is what the next 5,000 read loops take above 5,000 read loops before the write.

| | Node 24.20 | Node 26.10 |
| --- | ---: | ---: |
| before, 8 kinds | 15 ms to 32 ms | 1.9 ms to 15 ms |
| after, 8 kinds | -0.8 ms to 1.0 ms | -2.7 ms to 0.9 ms |

Full tables: [`micro-node24.md`](./micro-node24.md), [`micro-node26.md`](./micro-node26.md).

What the numbers say:

- Create and write do not change.
- The store removes the event. Without it, one hot loop lost 2 ms to 32 ms one time.
- A read of a value that is not a number is about 5% slower with the store on Node 24.20.
  That is 0.1 ns to 0.2 ns for each read. Ten more runs of two cases gave the same result.
  On Node 26.10 the difference is smaller and inside the spread of the rounds.
- The cause of the slower read is not known. After the first number, the field has the same
  representation in the two builds.

## Verdict

The deopt is real, but it is one event for each page load.
The store of `0` removes that event. It costs nothing in create and write,
and at most 0.2 ns for each read of a value that is not a number.
It is a V8 detail, so the comment in the constructor has to explain it.
