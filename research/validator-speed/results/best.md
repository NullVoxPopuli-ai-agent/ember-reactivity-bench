| case | ember: tracked() + createCache (base) | ember: tracked() + createCache (best) | alien-signals |
| --- | ---: | ---: | ---: |
| propagate: 1 chains x 1 deep | 101 ns | 54 ns (0.5x) | 51 ns (0.5x) |
| propagate: 10 chains x 10 deep | 5.24 µs | 2.48 µs (0.5x) | 2.77 µs (0.5x) |
| propagate: 100 chains x 100 deep | 599.14 µs | 283.90 µs (0.5x) | 502.94 µs (0.8x) |
| propagate: 1 chains x 1000 deep | 50.67 µs | 22.21 µs (0.4x) | 24.07 µs (0.5x) |
| propagate: 1000 chains x 1 deep | 89.20 µs | 43.73 µs (0.5x) | 51.17 µs (0.6x) |
| kairo: avoidable propagation | 330 ns | 147 ns (0.4x) | 71 ns (0.2x) |
| kairo: broad propagation | 6.38 µs | 3.22 µs (0.5x) | 3.67 µs (0.6x) |
| kairo: deep propagation | 2.46 µs | 1.21 µs (0.5x) | 1.10 µs (0.4x) |
| kairo: diamond | 363 ns | 213 ns (0.6x) | 162 ns (0.4x) |
| kairo: mux | 17.91 µs | 9.20 µs (0.5x) | 5.67 µs (0.3x) |
| kairo: repeated observers | 340 ns | 103 ns (0.3x) | 98 ns (0.3x) |
| kairo: triangle | 634 ns | 405 ns (0.6x) | 295 ns (0.5x) |
| kairo: unstable | 495 ns | 289 ns (0.6x) | 291 ns (0.6x) |
| rows: 1000 rows, write 1 | 6.62 µs | 6.94 µs (1.0x) | 5.75 µs (0.9x) |
| rows: 1000 rows, write all | 102.54 µs | 49.87 µs (0.5x) | 59.00 µs (0.6x) |
| batch: 10 writes, 1 output | 567 ns | 220 ns (0.4x) | 224 ns (0.4x) |
| avoidable: write the same value | 5 ns | 4 ns (0.8x) | 9 ns (1.7x) |
| create: 1000 signals | 12.54 µs | 4.66 µs (0.4x) | 3.36 µs (0.3x) |
| create: 1000 computeds, read each | 37.71 µs | 21.37 µs (0.6x) | 24.33 µs (0.6x) |
| create: 1000 outputs | 43.38 µs | 27.57 µs (0.6x) | 30.57 µs (0.7x) |
| weighted geometric mean | 1.0x | 0.5x | 0.6x |

- Time for the writes of one frame and the flush of that frame. Median of 4 rounds of the p50 from mitata.
- The ratio in parentheses compares with "ember: tracked() + createCache (base)". A ratio above 1 is slower.
- The weighted geometric mean is the mean of the ratios. Each group of cases has the same total weight.
- Largest difference between rounds for one cell: 26% (rows: 1000 rows, write 1, ember: tracked() + createCache (best)).
- alien-signals 3.2.1, ember-source 7.3.0, node v24.20.0, AMD Ryzen 9 7900X 12-Core Processor.

