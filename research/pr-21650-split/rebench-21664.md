# PR 21664 against main, after the other parts merged

`main` is `9bec1cb2a8`. The PR is `6ab63a155e`: a cache returns the combined tag of its last run, if it consumed the same tags again.

| case | `main` | this PR | ratio | ratio of each round |
| --- | ---: | ---: | ---: | ---: |
| propagate: 1 chains x 1 deep | 58 ns | 56 ns | 0.97x | 0.69 to 1.07 |
| propagate: 10 chains x 10 deep | 2.60 µs | 2.57 µs | 0.99x | 0.88 to 1.05 |
| propagate: 100 chains x 100 deep | 308.41 µs | 298.03 µs | 0.97x | 0.95 to 1.00 |
| propagate: 1 chains x 1000 deep | 23.09 µs | 22.94 µs | 0.99x | 0.85 to 1.00 |
| propagate: 1000 chains x 1 deep | 46.55 µs | 46.17 µs | 0.99x | 0.70 to 1.01 |
| kairo: avoidable propagation | 139 ns | 141 ns | 1.01x | 0.98 to 1.09 |
| kairo: broad propagation | 3.43 µs | 3.40 µs | 0.99x | 0.97 to 1.01 |
| kairo: deep propagation | 1.24 µs | 1.19 µs | 0.96x | 0.91 to 1.02 |
| kairo: diamond | 186 ns | 186 ns | 1.00x | 0.97 to 1.02 |
| kairo: mux | 12.06 µs | 9.70 µs | 0.80x | 0.77 to 0.82 |
| kairo: repeated observers | 246 ns | 246 ns | 1.00x | 0.65 to 1.08 |
| kairo: triangle | 327 ns | 326 ns | 1.00x | 0.92 to 1.06 |
| kairo: unstable | 334 ns | 331 ns | 0.99x | 0.98 to 1.00 |
| rows: 1000 rows, write 1 | 6.70 µs | 6.69 µs | 1.00x | 0.96 to 1.24 |
| rows: 1000 rows, write all | 54.52 µs | 54.43 µs | 1.00x | 0.92 to 1.01 |
| batch: 10 writes, 1 output | 322 ns | 291 ns | 0.90x | 0.80 to 0.92 |
| avoidable: write the same value | 6 ns | 6 ns | 1.00x | 1.00 to 1.00 |
| create: 1000 signals | 9.36 µs | 9.35 µs | 1.00x | 1.00 to 1.00 |
| create: 1000 computeds, read each | 23.43 µs | 23.83 µs | 1.02x | 0.90 to 1.10 |
| create: 1000 outputs | 34.16 µs | 34.15 µs | 1.00x | 0.99 to 1.00 |
| wide: 2 signals, same signals | 127 ns | 92 ns | 0.72x | 0.68 to 0.73 |
| wide: 2 signals, other signals | 148 ns | 148 ns | 1.00x | 0.98 to 1.08 |
| wide: 10 signals, same signals | 297 ns | 221 ns | 0.75x | 0.74 to 0.84 |
| wide: 10 signals, other signals | 300 ns | 299 ns | 1.00x | 0.96 to 1.04 |
| wide: 100 signals, same signals | 1.88 µs | 1.41 µs | 0.75x | 0.74 to 0.75 |
| wide: 100 signals, other signals | 2.14 µs | 2.15 µs | 1.00x | 0.99 to 1.17 |
- Median of 8 mirrored rounds, `ember-tracked` adapter, one core, Node 24.20.
- A ratio above 1 means that the PR is slower.
- `kairo: repeated observers` has two stable speeds in this benchmark, so its ratio is not a result of the PR.
- The `wide` cases are new. They have one cache that reads 2, 10 or 100 signals.

## A cache that reads other signals from run to run

A later run, 10 rounds, with three more cases in a `branch` group.

| case | `main` | this PR | ratio | ratio of each round |
| --- | ---: | ---: | ---: | ---: |
| kairo: unstable | 334 ns | 334 ns | 1.00x | 0.99 to 1.01 |
| wide: 2 signals, same signals | 127 ns | 92 ns | 0.72x | 0.71 to 0.76 |
| wide: 2 signals, other signals | 149 ns | 149 ns | 1.00x | 0.91 to 1.04 |
| wide: 10 signals, same signals | 288 ns | 221 ns | 0.77x | 0.73 to 0.83 |
| wide: 10 signals, other signals | 299 ns | 309 ns | 1.03x | 0.99 to 1.07 |
| wide: 100 signals, same signals | 1.91 µs | 1.41 µs | 0.74x | 0.73 to 0.74 |
| wide: 100 signals, other signals | 2.16 µs | 2.17 µs | 1.00x | 0.97 to 1.02 |
| branch: a \|\| b \|\| c | 105 ns | 100 ns | 0.95x | 0.90 to 1.01 |
| branch: 10 or 20 signals | 378 ns | 377 ns | 1.00x | 0.95 to 1.01 |
| branch: 100 signals, another last signal | 1.87 µs | 1.97 µs | 1.05x | 1.04 to 1.06 |

- A change of the number of tags costs nothing. The check compares the two lengths first.
- `a || b || c` is not slower. With `a` true, the cache reads one tag, and a frame with one tag has no check.
- The worst case is a list that is equal up to the last entry: the check compares every tag and then fails.
  With 100 tags that is 5%, about 1 ns for each tag. A read of one tracked value costs about 19 ns here.
- `wide: 10 signals, other signals` is 1.03x in this run and 1.00x in the run above.

## What the versions of the PR showed

1. The check inside `Tracker#combine` (`8610111ebe`): three cases with small frames were 4% to 13% slower than `main`.
   The larger `combine` was not put inline into the end of the frame.
2. The check in a function of its own (`4048c0cca3`): the loss went away, apart from 1% to 4% in two cases.
3. The reuse in code that only `getValue` calls (`6ab63a155e`): no case is slower than `main` outside the noise.
   The frames of the render VM run the code of `main`.
