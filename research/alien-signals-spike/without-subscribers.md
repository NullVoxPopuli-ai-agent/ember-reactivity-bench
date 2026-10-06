| case | alien-signals | ember: tracked() + createCache (main) | ember: tracked() + createCache (alien) |
| --- | ---: | ---: | ---: |
| propagate: 1 chains x 1 deep | 54 ns | 111 ns (2.0x) | 137 ns (2.5x) |
| propagate: 10 chains x 10 deep | 2.96 µs | 5.43 µs (1.8x) | 7.47 µs (2.5x) |
| propagate: 100 chains x 100 deep | 613.83 µs | 661.54 µs (1.1x) | 1.17 ms (1.9x) |
| propagate: 1 chains x 1000 deep | 26.30 µs | 55.09 µs (2.1x) | 93.60 µs (3.6x) |
| propagate: 1000 chains x 1 deep | 56.28 µs | 95.58 µs (1.7x) | 140.14 µs (2.5x) |
| kairo: avoidable propagation | 77 ns | 360 ns (4.7x) | 426 ns (5.6x) |
| kairo: broad propagation | 3.87 µs | 7.15 µs (1.8x) | 9.66 µs (2.5x) |
| kairo: deep propagation | 1.21 µs | 2.77 µs (2.3x) | 3.98 µs (3.3x) |
| kairo: diamond | 174 ns | 401 ns (2.3x) | 498 ns (2.9x) |
| kairo: mux | 7.26 µs | 19.87 µs (2.7x) | 24.31 µs (3.3x) |
| kairo: repeated observers | 109 ns | 308 ns (2.8x) | 238 ns (2.2x) |
| kairo: triangle | 326 ns | 709 ns (2.2x) | 852 ns (2.6x) |
| kairo: unstable | 308 ns | 548 ns (1.8x) | 440 ns (1.4x) |
| rows: 1000 rows, write 1 | 6.25 µs | 8.84 µs (1.4x) | 30.76 µs (4.9x) |
| rows: 1000 rows, write all | 65.58 µs | 115.07 µs (1.8x) | 164.41 µs (2.5x) |
| batch: 10 writes, 1 output | 248 ns | 634 ns (2.6x) | 327 ns (1.3x) |
| avoidable: write the same value | 10 ns | 6 ns (0.6x) | 6 ns (0.6x) |
| create: 1000 signals | 2.64 µs | 17.44 µs (6.6x) | 20.11 µs (7.6x) |
| create: 1000 computeds, read each | 26.54 µs | 39.34 µs (1.5x) | 40.01 µs (1.5x) |
| create: 1000 outputs | 32.92 µs | 52.45 µs (1.6x) | 47.98 µs (1.5x) |
| weighted geometric mean | 1.0x | 1.8x | 2.2x |

- Time for the writes of one frame and the flush of that frame. Median of 3 rounds of the p50 from mitata.
- The ratio in parentheses compares with "alien-signals". A ratio above 1 is slower.
- The weighted geometric mean is the mean of the ratios. Each group of cases has the same total weight.
- Largest difference between rounds for one cell: 40% (kairo: unstable, ember: tracked() + createCache (alien)).
- alien-signals 3.2.1, signal-polyfill 0.2.2, solid-js 1.9.15, svelte 5.57.1, signalium 3.0.3, ember-source 7.5.0-alpha.1 (main), ember-source 7.5.0-alpha.1 (alien), node v24.20.0, AMD Ryzen 9 7900X 12-Core Processor.
