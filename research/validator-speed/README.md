# How can the validator of Ember get faster?

```bash
python3 research/validator-speed/make-variants.py
pnpm bench --adapters=ember-tracked,alien-signals \
  --ember-source=research/validator-speed/variants/base,research/validator-speed/variants/best
```

Three changes make `@glimmer/validator` about 2 times faster in this benchmark.
With them, Ember is level with alien-signals.

1. `Tracker` uses an array and a stamp on the tag, not a `Set`.
2. Trackers come from a pool, and a computation keeps its combinator tag when its dependencies did not change.
3. `TrackedValue` has its methods on the prototype, and no options object.

[`patches/best.diff`](./patches/best.diff) has the three changes, plus an indexed loop in `COMPUTE`.

## Result

`ember-source` 7.3.0, `tracked(value)` with `createCache`, median of 4 rounds. The full table is in [`results/best.md`](./results/best.md).

| case | 7.3.0 | best patch | alien-signals |
| --- | ---: | ---: | ---: |
| propagate: 100 chains x 100 deep | 599 µs | 284 µs | 503 µs |
| kairo: diamond | 363 ns | 213 ns | 162 ns |
| kairo: mux | 17.91 µs | 9.20 µs | 5.67 µs |
| rows: 1000 rows, write 1 | 6.62 µs | 6.94 µs | 5.75 µs |
| rows: 1000 rows, write all | 102.5 µs | 49.9 µs | 59.0 µs |
| create: 1000 signals | 12.54 µs | 4.66 µs | 3.36 µs |
| create: 1000 computeds, read each | 37.7 µs | 21.4 µs | 24.3 µs |
| weighted geometric mean, against 7.3.0 | 1.0x | 0.5x | 0.6x |

## Where the time goes in 7.3.0

A CPU profile of three cases. The numbers are the part of the samples in each function, after V8 inlined what it could.

| function | propagate 10 x 10 | kairo: diamond | kairo: mux |
| --- | ---: | ---: | ---: |
| the computeds of the case | 49% | 28% | 7% |
| `Tracker` constructor, with `new Set()` | 17% | 15% | 13% |
| `Tracker#add`, with `Set#add` | 8% | 12% | 11% |
| `beginTrackFrame` | 2% | 17% | 21% |
| `getValue` | 11% | 13% | 22% |
| garbage collector | 5% | 5% | 7% |
| `COMPUTE` of a tag | 1% | 2% | 5% |

The tracking frame costs more than the tags.
Each computation that runs makes one `Tracker`, one `Set`, and one array from that `Set`.

## The steps

Each step is on top of the step before it. [`results/steps.md`](./results/steps.md) has all cases.

| step | change | mean against 7.3.0 | patch |
| --- | --- | ---: | --- |
| v1 | `Tracker`: an array and a stamp on the tag, no `Set` | 0.8x | [`v1.diff`](./patches/v1.diff) |
| v2 | pooled trackers, and reuse of the previous combinator tag | 0.6x | [`v2.diff`](./patches/v2.diff) |
| v3 | indexed loop in `COMPUTE`, with a compare in place of `Math.max` | 0.6x | [`v3.diff`](./patches/v3.diff) |
| v4 | `Cache` as a class, in place of an object with symbol keys | 0.6x | [`v4.diff`](./patches/v4.diff) |
| v5 | `TrackedValue`: methods on the prototype, no options object | 0.5x | [`v5.diff`](./patches/v5.diff) |

### v1: the stamp

Each tracking frame has a number.
`Tracker#add` writes that number on the tag, and skips a tag that has the number already.

A tag that an inner frame reads between two reads of an outer frame is added two times to the outer frame.
That is correct, because a combinator tag takes the maximum of its tags.

### v2: the pool and the reuse

`beginTrackFrame` takes the tracker for the current depth from a pool.
`endTrackFrame(previous)` compares the tags of the frame with the tags of the previous combinator tag.
If they are the same, the computation keeps its tag, and the frame allocates nothing.

This is the large gain: 0.8x to 0.6x.

### v3: the loop

v3 changes two cases in opposite directions, and it changes behavior.

- `rows: 1000 rows, write 1` gets faster: 7.92 µs to 5.68 µs.
- `kairo: repeated observers` gets slower: 103 ns to 188 ns.
- A cache that reads `VOLATILE_TAG` runs one time, not on each read. The revision of that tag is `NaN`. `Math.max(NaN, x)` is `NaN`, but `NaN > x` is `false`, so the compare ignores the tag.

An indexed loop that keeps `Math.max` has the gain without the loss and without the behavior change. [`results/loop.md`](./results/loop.md) has that comparison. The best patch uses this form.

### v4: the cache class

No case changes by more than the noise.

### v5: `TrackedValue`

`TrackedValue` makes four arrow functions and one options object for each instance.
With methods on the prototype, 1000 signals need 4.7 µs, not 12.5 µs.

## Which patch to use

Use `best.diff`: v1, v2, the `TrackedValue` change of v5, and the loop that keeps `Math.max`.

- v1 and v2 belong together. v2 needs the tracker of v1.
- The `TrackedValue` change is independent. It only changes the creation of signals.
- Leave out v3 as written, because of the volatile tag.
- Leave out v4, because it has no effect.

## What a real patch must also do

These patches are on the built files of `ember-source`, not on the source. The test suite of Ember did not run.

- The pool keeps the tags of an old frame in its arrays until a new frame writes over them. A real patch must clear them, so that the pool does not keep objects alive.
- The stamp is a new field on the three tag classes in `validators.ts`. No other class implements a tag in ember.js.
- The debug build needs its calls in the new tracker: `markTagAsConsumed` and the tracking transactions.
- The `TrackedValue` change makes `get`, `set`, `update` and `freeze` unbound. `const { set } = tracked(0)` does not work after it. If those functions must stay bound, this change is not possible.

## The same idea on `nvp/block-guards`

The commit `60fc07f802` on the branch `nvp/block-guards` of ember.js has the pool and the reuse of the combinator tag. It clears the pool, and it finds duplicates with a linear scan in place of the stamp.

[`results/block-guards.md`](./results/block-guards.md) compares the head of that branch, `e6b21cda46`, with v2. It uses the `ember-tags` adapter, 3 rounds and 10 cases.

| case | 7.3.0 | v2 | `nvp/block-guards` |
| --- | ---: | ---: | ---: |
| propagate: 100 chains x 100 deep | 610 µs | 299 µs | 294 µs |
| kairo: mux | 17.59 µs | 9.13 µs | 13.98 µs |
| batch: 10 writes, 1 output | 523 ns | 174 ns | 266 ns |
| create: 1000 computeds, read each | 35.6 µs | 20.8 µs | 27.3 µs |
| weighted geometric mean, against 7.3.0 | 1.0x | 0.6x | 0.7x |

The gain is almost the same. The stamp is faster when one computation reads many tags.

## The port to ember.js

https://github.com/emberjs/ember.js/pull/21650 has the best patch on the source of ember.js.

The port differs from `best.diff` in these places:

- A tracker finds a repeat tag by its index, not by a frame number. See the next section.
- `get`, `set`, `update` and `freeze` of a `TrackedValue` stay bound, and code can assign to them. A test of ember.js detaches them from the instance. Each one is an accessor that makes the bound function on its first read.
- A tracker clears its tags when its frame ends, and `resetTracking()` clears the pool.
- The depth of a frame is the length of the stack of open frames, not a separate counter.

[`results/ember-pr.md`](./results/ember-pr.md) compares `main` at `f693f240ee` with the PR at `c5544a2699`, on Node 24.20, median of 4 rounds.

| case | `main` | PR | alien-signals |
| --- | ---: | ---: | ---: |
| propagate: 100 chains x 100 deep | 619 µs | 277 µs | 506 µs |
| kairo: diamond | 371 ns | 178 ns | 164 ns |
| kairo: mux | 18.43 µs | 9.01 µs | 5.78 µs |
| rows: 1000 rows, write all | 103.8 µs | 51.2 µs | 60.0 µs |
| create: 1000 signals | 16.94 µs | 9.96 µs | 3.37 µs |
| weighted geometric mean, against `main` | 1.0x | 0.6x | 0.6x |

`kairo: repeated observers` has two speeds, about 105 ns and about 190 ns. A change in code that the case does not run can move it from one to the other, and so can the version of Node. Do not use this case alone to judge a change.

## The frame number, and why the PR does not use it

The first version of the PR used the stamp of v1: each frame has a number, and the tracker writes it on each tag. A review found two problems, and [`results/review.md`](./results/review.md) has the measurements.

- The counter leaves the small-integer range of V8 after about one billion frames. With the counter above `2 ** 31`, the benchmark is 1.1 to 1.3 times slower.
- A nested frame writes its own number on a shared tag, so the outer frame takes that tag again. A computed that reads 5 computeds of one tag has a combined tag with 5 entries. On `main` it has 1.

The PR now keeps an index on the tag: `tags[tag.slot] === tag`. No counter exists, and a stale index cannot hide a tag, because the entry at that index is then another tag or no tag.

| entries of the combined tag | `main` | frame number | index check | index check and scan |
| --- | ---: | ---: | ---: | ---: |
| 5 computeds read one tag | 1 | 5 | 1 | 1 |
| a block that reads y, x, y, x | 2 | 4 | 3 | 2 |

A linear scan for small frames makes the check exact. It costs 1.3x on `batch: 10 writes, 1 output` and 1.2x on `kairo: unstable`, so the PR does not have it.

## Rendering

`pnpm bench` of ember.js, the tracerbench comparison on its benchmark app, 50 samples for each side. The comments on the PR have the tables and the reports.

- The PR is 2.1% faster in script time for the full run. Select is 9 to 10% faster, and update of each 10th row is up to 13.7% faster.
- `clearItems2` is 7 to 13% slower. A GC of about 20 ms moves from the end of the phase before it into that phase, because the PR allocates less. A run where both sides have that GC in the phase shows no difference.
- One more change gave no gain: the last tag passed from compute references, from the frame opcode of the updating VM, and from the curly component manager. A direct comparison showed no phase with a significant change, so the PR does not have it.

## What stays slower than alien-signals

- `kairo: avoidable propagation`: 147 ns against 71 ns. A cache has no equality check, so a computed that returns the same value does not stop the work after it.
- `kairo: mux`: 9.20 µs against 5.67 µs.
- `kairo: diamond` and `kairo: triangle`: 1.3 to 1.4 times.
