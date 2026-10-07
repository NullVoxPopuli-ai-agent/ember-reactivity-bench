# PR 21664 against main, after the other parts merged

`main` is `9bec1cb2a8`. The PR is `8610111ebe`, one commit on top of it: the reuse of the combined tag.

| case | `main` | this PR | ratio | ratio of each round |
| --- | ---: | ---: | ---: | ---: |
| propagate: 1 chains x 1 deep | 57 ns | 61 ns | 1.07x | 1.04 to 1.19 |
| propagate: 10 chains x 10 deep | 2.59 µs | 2.62 µs | 1.01x | 1.00 to 1.02 |
| propagate: 100 chains x 100 deep | 306.75 µs | 309.54 µs | 1.01x | 0.95 to 1.45 |
| propagate: 1 chains x 1000 deep | 23.13 µs | 23.65 µs | 1.02x | 0.92 to 1.32 |
| propagate: 1000 chains x 1 deep | 46.63 µs | 47.25 µs | 1.01x | 0.97 to 1.04 |
| kairo: avoidable propagation | 140 ns | 158 ns | 1.13x | 1.00 to 1.14 |
| kairo: broad propagation | 3.48 µs | 3.61 µs | 1.04x | 0.98 to 1.08 |
| kairo: deep propagation | 1.23 µs | 1.23 µs | 0.99x | 0.91 to 1.09 |
| kairo: diamond | 186 ns | 190 ns | 1.03x | 0.96 to 1.03 |
| kairo: mux | 11.99 µs | 10.07 µs | 0.84x | 0.80 to 0.85 |
| kairo: repeated observers | 246 ns | 246 ns | 1.00x | 1.00 to 1.06 |
| kairo: triangle | 327 ns | 349 ns | 1.07x | 1.01 to 1.10 |
| kairo: unstable | 331 ns | 337 ns | 1.02x | 0.99 to 1.02 |
| rows: 1000 rows, write 1 | 6.74 µs | 6.77 µs | 1.00x | 0.98 to 1.27 |
| rows: 1000 rows, write all | 54.51 µs | 54.87 µs | 1.01x | 1.00 to 1.04 |
| batch: 10 writes, 1 output | 322 ns | 262 ns | 0.81x | 0.70 to 0.94 |
| avoidable: write the same value | 6 ns | 6 ns | 1.00x | 1.00 to 1.00 |
| create: 1000 signals | 9.37 µs | 9.38 µs | 1.00x | 0.99 to 1.01 |
| create: 1000 computeds, read each | 24.28 µs | 23.59 µs | 0.97x | 0.93 to 1.06 |
| create: 1000 outputs | 34.49 µs | 34.20 µs | 0.99x | 0.74 to 1.16 |
| weighted geometric mean | 1.0x | 1.0x | | |

- Median of 8 mirrored rounds, `ember-tracked` adapter, one core, Node 24.20.
- A ratio above 1 means that the PR is slower.
- Faster in all 8 rounds: `kairo: mux` and `batch`.
- Slower in 7 or 8 of the 8 rounds: `propagate: 1 chains x 1 deep`, `kairo: avoidable propagation` and `kairo: triangle`.
