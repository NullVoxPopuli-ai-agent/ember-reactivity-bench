# PR 21664 against main, after the other parts merged

`main` is `9bec1cb2a8`. The PR is `4048c0cca3`: the reuse of the combined tag, with the check in `combineOrReuse`.

| case | `main` | this PR | ratio | ratio of each round |
| --- | ---: | ---: | ---: | ---: |
| propagate: 1 chains x 1 deep | 57 ns | 56 ns | 0.99x | 0.96 to 1.02 |
| propagate: 10 chains x 10 deep | 2.59 µs | 2.54 µs | 0.98x | 0.93 to 0.99 |
| propagate: 100 chains x 100 deep | 305.37 µs | 305.76 µs | 1.00x | 1.00 to 1.07 |
| propagate: 1 chains x 1000 deep | 23.15 µs | 23.62 µs | 1.02x | 0.97 to 1.05 |
| propagate: 1000 chains x 1 deep | 46.66 µs | 46.66 µs | 1.00x | 1.00 to 1.02 |
| kairo: avoidable propagation | 140 ns | 142 ns | 1.01x | 1.01 to 1.02 |
| kairo: broad propagation | 3.44 µs | 3.44 µs | 1.00x | 0.93 to 1.22 |
| kairo: deep propagation | 1.22 µs | 1.22 µs | 1.00x | 0.98 to 1.03 |
| kairo: diamond | 186 ns | 186 ns | 1.00x | 0.96 to 1.00 |
| kairo: mux | 12.13 µs | 9.77 µs | 0.81x | 0.75 to 0.98 |
| kairo: repeated observers | 246 ns | 206 ns | 0.84x | 0.65 to 1.00 |
| kairo: triangle | 327 ns | 328 ns | 1.00x | 0.99 to 1.01 |
| kairo: unstable | 334 ns | 333 ns | 1.00x | 0.99 to 1.01 |
| rows: 1000 rows, write 1 | 6.76 µs | 6.75 µs | 1.00x | 0.77 to 1.24 |
| rows: 1000 rows, write all | 54.69 µs | 54.79 µs | 1.00x | 0.73 to 1.03 |
| batch: 10 writes, 1 output | 338 ns | 291 ns | 0.86x | 0.73 to 0.91 |
| avoidable: write the same value | 6 ns | 6 ns | 1.00x | 1.00 to 1.00 |
| create: 1000 signals | 9.36 µs | 9.37 µs | 1.00x | 0.95 to 1.01 |
| create: 1000 computeds, read each | 23.48 µs | 23.42 µs | 1.00x | 0.87 to 1.00 |
| create: 1000 outputs | 34.44 µs | 34.47 µs | 1.00x | 0.99 to 1.16 |

- Median of 8 mirrored rounds, `ember-tracked` adapter, one core, Node 24.20.
- A ratio above 1 means that the PR is slower.
- `kairo: repeated observers` has two stable speeds in this benchmark, so its ratio is not a result of the PR.

## The first version, with the check inside `Tracker#combine`

The head `8610111ebe` was slower than `main` in three cases with small frames:
`propagate: 1 chains x 1 deep` 1.04x to 1.07x, `kairo: avoidable propagation` 1.13x, `kairo: triangle` 1.07x.

The larger `combine` was not put inline into the end of the frame.
A build that passes the argument with no check equals `main`.
A build with the check in a function of its own has no loss.
