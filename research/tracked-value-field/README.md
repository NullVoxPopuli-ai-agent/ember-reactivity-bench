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
A run of the 20 cases with the `ember-tracked` adapter, 6 mirrored rounds, Node 24.20.0,
on the PR head before the commit (`50eef0f8c1`) and on the commit (`bd88a65ab1`):
every case is 1.0x, the weighted mean is 1.0x. The table is in [`results.md`](./results.md).

## Verdict

The deopt is real, but it is one event for each page load.
The store of `0` removes that event and costs nothing measurable.
It is a V8 detail, so the comment in the constructor has to explain it.

Command:

```bash
pnpm bench --rounds=6 --adapters=ember-tracked --cpu=1 --ember-source=<before>,<after>
```

