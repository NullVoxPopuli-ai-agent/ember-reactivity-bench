| case | ember: main | ember: this PR | alien-signals |
| --- | ---: | ---: | ---: |
| propagate: 1 chains x 1 deep | 96 ns | 52 ns (0.5x) | 51 ns (0.5x) |
| propagate: 10 chains x 10 deep | 5.28 µs | 2.39 µs (0.5x) | 2.88 µs (0.5x) |
| propagate: 100 chains x 100 deep | 585.61 µs | 274.10 µs (0.5x) | 490.80 µs (0.8x) |
| propagate: 1 chains x 1000 deep | 50.19 µs | 26.17 µs (0.5x) | 24.80 µs (0.5x) |
| propagate: 1000 chains x 1 deep | 84.97 µs | 44.53 µs (0.5x) | 48.30 µs (0.6x) |
| kairo: avoidable propagation | 326 ns | 130 ns (0.4x) | 69 ns (0.2x) |
| kairo: broad propagation | 6.46 µs | 3.18 µs (0.5x) | 3.64 µs (0.6x) |
| kairo: deep propagation | 2.65 µs | 1.23 µs (0.5x) | 1.12 µs (0.4x) |
| kairo: diamond | 367 ns | 206 ns (0.6x) | 168 ns (0.5x) |
| kairo: mux | 17.84 µs | 8.43 µs (0.5x) | 5.77 µs (0.3x) |
| kairo: repeated observers | 277 ns | 182 ns (0.7x) | 104 ns (0.4x) |
| kairo: triangle | 604 ns | 367 ns (0.6x) | 292 ns (0.5x) |
| kairo: unstable | 470 ns | 282 ns (0.6x) | 283 ns (0.6x) |
| rows: 1000 rows, write 1 | 6.46 µs | 5.89 µs (0.9x) | 5.76 µs (0.9x) |
| rows: 1000 rows, write all | 99.41 µs | 49.81 µs (0.5x) | 60.68 µs (0.6x) |
| batch: 10 writes, 1 output | 522 ns | 223 ns (0.4x) | 222 ns (0.4x) |
| avoidable: write the same value | 4 ns | 4 ns (1.0x) | 9 ns (2.6x) |
| create: 1000 signals | 15.75 µs | 9.74 µs (0.6x) | 2.37 µs (0.2x) |
| create: 1000 computeds, read each | 33.45 µs | 21.74 µs (0.6x) | 25.08 µs (0.7x) |
| create: 1000 outputs | 40.51 µs | 27.98 µs (0.7x) | 34.98 µs (0.9x) |
| weighted geometric mean | 1.0x | 0.6x | 0.6x |

- Time for the writes of one frame and the flush of that frame. Median of 4 rounds of the p50 from mitata.
- The ratio in parentheses compares with "ember: main". A ratio above 1 is slower.
- The weighted geometric mean is the mean of the ratios. Each group of cases has the same total weight.
- Largest difference between rounds for one cell: 47% (create: 1000 signals, alien-signals).
- ember-source 7.5.0-alpha.1 at f693f240ee (main) and at c59a238d61 (this PR), alien-signals 3.2.1, node v26.10.0, AMD Ryzen 9 7900X 12-Core Processor.

