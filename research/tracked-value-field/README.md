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
node research/tracked-value-field/micro-run.mjs --cpu=1 --rounds=8 \
  --sources=before=<ember-source>,after=<ember-source>
```

`micro.mjs` makes 1,000 `tracked(value)` cells of one kind of value and measures one pass with mitata:
create, read and write. Each case of each build runs in its own process.

The kinds are small integer, double, string, boolean, `undefined` and `null`, object, array,
function, symbol, bigint, and all kinds mixed. They are in `kinds.mjs`.

The run has five builds, 8 rounds, on Node 24.20 and Node 26.10:

| build | constructor | deopt on the first number |
| --- | --- | --- |
| before | `50eef0f8c1`: one store | yes |
| control | the build of "after", with the store of `0` removed | yes |
| after | `54ee916923`: `this.#value = 0`, then the value | no |
| undefined-store | `this.#value = undefined`, then the value | yes |
| prime | one store. The module makes two instances at load, with `0` and with `undefined` | no |

"Control" has the code of "before", so it shows the noise of the method.
"Undefined-store" has the cost of a second store without the effect on the field.
"Prime" has the effect on the field without a second store.

### Time

The numbers are the geometric mean of the ratios to "before", for the cases of one group.
Above 1 is slower.

| group | control | after | undefined-store | prime |
| --- | ---: | ---: | ---: | ---: |
| Node 24.20: create, 11 kinds | 0.993 | 0.988 | 0.984 | 0.968 |
| Node 24.20: read, 11 kinds | 0.988 | 0.993 | 0.990 | 1.003 |
| Node 24.20: write, 11 kinds | 0.999 | 0.994 | 1.007 | 0.991 |
| Node 24.20: read, after another cell got the first number, 8 kinds | 1.002 | 1.038 | 1.000 | 1.044 |
| Node 26.10: create, 11 kinds | 0.997 | 0.991 | 1.004 | 0.991 |
| Node 26.10: read, 11 kinds | 0.984 | 1.005 | 0.985 | 0.989 |
| Node 26.10: write, 11 kinds | 0.989 | 0.996 | 0.996 | 0.986 |
| Node 26.10: read, after another cell got the first number, 8 kinds | 0.990 | 1.040 | 0.993 | 1.031 |

- Create, read and write: "after" is inside the range of "control". The store has no cost in time.
- "Undefined-store" equals "before" in all groups, so a second store in the constructor is free.
- In the last group, "after" and "prime" are 3% to 4% slower. That is 0.06 ns to 0.09 ns for each read.
  "Prime" has no second store, so the store is not the cause.
- The two slower builds are the two that have no deopt.
  `--trace-opt` shows the cause: in the other builds, the deopt makes V8 compile the read loop a second time,
  and that second code is the faster one. In "after", V8 keeps the code of the first compile.
  The field has the same representation in all five builds at that point.
- So that difference comes from which compile of the loop the benchmark measures.
  It is not a cost of each read that the store adds.

The cost of the event: a read loop is hot, then one other cell gets the first number.
The time is what the next 5,000 read loops take above 5,000 read loops before the write.

| | Node 24.20 | Node 26.10 |
| --- | ---: | ---: |
| before, control, undefined-store: 8 kinds | 14 ms to 31 ms | 1.1 ms to 16 ms |
| after, prime: 8 kinds | -1.3 ms to 1.0 ms | -1.1 ms to 1.2 ms |

Full tables: [`builds-node24.md`](./builds-node24.md), [`builds-node26.md`](./builds-node26.md).
The first run, with two builds and 6 rounds: [`micro-node24.md`](./micro-node24.md), [`micro-node26.md`](./micro-node26.md).

### Memory

```bash
EMBER_SOURCE=<ember-source> node --expose-gc --max-semi-space-size=256 --min-semi-space-size=256 \
  research/tracked-value-field/alloc.mjs --index=0
```

`alloc.mjs` measures the bytes that V8 allocates for one create, one read and one write.

The store of `0` allocates nothing.
The bytes are the same before and after, for each of the 11 kinds, on the two versions of Node.
The table is in [`alloc.md`](./alloc.md).

| operation | Node 24.20, before and after | Node 26.10, before and after |
| --- | ---: | ---: |
| create, most kinds | 184 bytes | 240 bytes |
| create, double | 200 bytes | 256 bytes |
| read | 0 bytes | 0 bytes |
| write, double | 16 bytes | 16 bytes |
| write, other kinds | 0 bytes | 0 bytes |

A write of a double allocates 16 bytes in all builds.
The class field starts as `undefined`, so the field never has the double representation,
and V8 puts each double in a new heap number.

A field initializer `#value = 0` in place of the store changes this:
a create of a double allocates 16 more bytes, and a write allocates none.

## Verdict

The store of `0` removes one deopt for each page load, of 1 ms to 31 ms for one hot loop.
It allocates nothing, and it adds no time to create, read or write.
It is a V8 detail, so the comment in the constructor has to explain it.
