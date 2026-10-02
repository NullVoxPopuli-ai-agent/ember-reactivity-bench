| case | ember: main | ember: this PR | alien-signals |
| --- | ---: | ---: | ---: |
| propagate: 1 chains x 1 deep | 100 ns | 56 ns (0.6x) | 54 ns (0.5x) |
| propagate: 10 chains x 10 deep | 5.44 µs | 2.43 µs (0.4x) | 2.78 µs (0.5x) |
| propagate: 100 chains x 100 deep | 619.49 µs | 276.72 µs (0.4x) | 505.74 µs (0.8x) |
| propagate: 1 chains x 1000 deep | 51.78 µs | 22.75 µs (0.4x) | 24.93 µs (0.5x) |
| propagate: 1000 chains x 1 deep | 87.07 µs | 43.77 µs (0.5x) | 50.89 µs (0.6x) |
| kairo: avoidable propagation | 326 ns | 146 ns (0.4x) | 74 ns (0.2x) |
| kairo: broad propagation | 6.63 µs | 3.22 µs (0.5x) | 3.67 µs (0.6x) |
| kairo: deep propagation | 2.52 µs | 1.14 µs (0.5x) | 1.13 µs (0.4x) |
| kairo: diamond | 371 ns | 178 ns (0.5x) | 164 ns (0.4x) |
| kairo: mux | 18.43 µs | 9.01 µs (0.5x) | 5.78 µs (0.3x) |
| kairo: repeated observers | 345 ns | 223 ns (0.6x) | 99 ns (0.3x) |
| kairo: triangle | 649 ns | 316 ns (0.5x) | 299 ns (0.5x) |
| kairo: unstable | 506 ns | 310 ns (0.6x) | 295 ns (0.6x) |
| rows: 1000 rows, write 1 | 6.88 µs | 6.22 µs (0.9x) | 5.94 µs (0.9x) |
| rows: 1000 rows, write all | 103.75 µs | 51.16 µs (0.5x) | 60.02 µs (0.6x) |
| batch: 10 writes, 1 output | 580 ns | 248 ns (0.4x) | 228 ns (0.4x) |
| avoidable: write the same value | 5 ns | 6 ns (1.1x) | 9 ns (1.7x) |
| create: 1000 signals | 16.94 µs | 9.96 µs (0.6x) | 3.37 µs (0.2x) |
| create: 1000 computeds, read each | 38.20 µs | 21.59 µs (0.6x) | 24.80 µs (0.6x) |
| create: 1000 outputs | 44.18 µs | 28.59 µs (0.6x) | 30.71 µs (0.7x) |
| weighted geometric mean | 1.0x | 0.6x | 0.6x |

- Time for the writes of one frame and the flush of that frame. Median of 4 rounds of the p50 from mitata.
- The ratio in parentheses compares with "ember: main". A ratio above 1 is slower.
- The weighted geometric mean is the mean of the ratios. Each group of cases has the same total weight.
- Largest difference between rounds for one cell: 39% (create: 1000 outputs, ember: main).
- ember-source 7.5.0-alpha.1 at f693f240ee (main) and at c5544a2699 (this PR), alien-signals 3.2.1, node v24.20.0, AMD Ryzen 9 7900X 12-Core Processor.

