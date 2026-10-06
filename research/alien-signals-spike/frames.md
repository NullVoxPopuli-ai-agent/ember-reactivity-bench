| case | alien-signals | ember: tracked() + createCache, outputs are frames |
| --- | ---: | ---: |
| propagate: 1 chains x 1 deep | 55 ns | 42 ns (0.8x) |
| propagate: 10 chains x 10 deep | 2.95 µs | 2.38 µs (0.8x) |
| propagate: 100 chains x 100 deep | 653.54 µs | 447.45 µs (0.7x) |
| propagate: 1 chains x 1000 deep | 25.57 µs | 21.72 µs (0.8x) |
| propagate: 1000 chains x 1 deep | 52.75 µs | 38.27 µs (0.7x) |
| kairo: avoidable propagation | 78 ns | 115 ns (1.5x) |
| kairo: broad propagation | 3.84 µs | 2.81 µs (0.7x) |
| kairo: deep propagation | 1.22 µs | 1.01 µs (0.8x) |
| kairo: diamond | 176 ns | 162 ns (0.9x) |
| kairo: mux | 6.29 µs | 7.50 µs (1.2x) |
| kairo: repeated observers | 109 ns | 118 ns (1.1x) |
| kairo: triangle | 331 ns | 310 ns (0.9x) |
| kairo: unstable | 300 ns | 413 ns (1.4x) |
| rows: 1000 rows, write 1 | 6.26 µs | 2.66 µs (0.4x) |
| rows: 1000 rows, write all | 65.06 µs | 63.89 µs (1.0x) |
| batch: 10 writes, 1 output | 249 ns | 185 ns (0.7x) |
| avoidable: write the same value | 10 ns | 6 ns (0.6x) |
| create: 1000 signals | 2.62 µs | 19.01 µs (7.3x) |
| create: 1000 computeds, read each | 26.64 µs | 37.50 µs (1.4x) |
| create: 1000 outputs | 33.07 µs | 38.08 µs (1.2x) |
| weighted geometric mean | 1.0x | 0.9x |

- Time for the writes of one frame and the flush of that frame. Median of 4 rounds of the p50 from mitata.
- The ratio in parentheses compares with "alien-signals". A ratio above 1 is slower.
- The weighted geometric mean is the mean of the ratios. Each group of cases has the same total weight.
- Largest difference between rounds for one cell: 23% (batch: 10 writes, 1 output, ember: tracked() + createCache, outputs are frames).
- alien-signals 3.2.1, signal-polyfill 0.2.2, solid-js 1.9.15, svelte 5.57.1, signalium 3.0.3, ember-source 7.5.0-alpha.1 (alien), node v24.20.0, AMD Ryzen 9 7900X 12-Core Processor.
