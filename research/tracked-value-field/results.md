| case | ember: tracked() + createCache (wt-before) | ember: tracked() + createCache (wt-after) |
| --- | ---: | ---: |
| propagate: 1 chains x 1 deep | 62 ns | 63 ns (1.0x) |
| propagate: 10 chains x 10 deep | 2.65 µs | 2.60 µs (1.0x) |
| propagate: 100 chains x 100 deep | 306.57 µs | 303.82 µs (1.0x) |
| propagate: 1 chains x 1000 deep | 23.57 µs | 23.56 µs (1.0x) |
| propagate: 1000 chains x 1 deep | 47.16 µs | 47.21 µs (1.0x) |
| kairo: avoidable propagation | 180 ns | 183 ns (1.0x) |
| kairo: broad propagation | 3.50 µs | 3.78 µs (1.1x) |
| kairo: deep propagation | 1.30 µs | 1.28 µs (1.0x) |
| kairo: diamond | 193 ns | 195 ns (1.0x) |
| kairo: mux | 10.17 µs | 9.90 µs (1.0x) |
| kairo: repeated observers | 252 ns | 254 ns (1.0x) |
| kairo: triangle | 364 ns | 365 ns (1.0x) |
| kairo: unstable | 350 ns | 348 ns (1.0x) |
| rows: 1000 rows, write 1 | 6.71 µs | 6.73 µs (1.0x) |
| rows: 1000 rows, write all | 56.07 µs | 56.45 µs (1.0x) |
| batch: 10 writes, 1 output | 276 ns | 273 ns (1.0x) |
| avoidable: write the same value | 6 ns | 6 ns (1.0x) |
| create: 1000 signals | 9.43 µs | 9.44 µs (1.0x) |
| create: 1000 computeds, read each | 23.57 µs | 23.56 µs (1.0x) |
| create: 1000 outputs | 35.25 µs | 35.59 µs (1.0x) |
| weighted geometric mean | 1.0x | 1.0x |

- Time for the writes of one frame and the flush of that frame. Median of 6 rounds of the p50 from mitata.
- The ratio in parentheses compares with "ember: tracked() + createCache (wt-before)". A ratio above 1 is slower.
- The weighted geometric mean is the mean of the ratios. Each group of cases has the same total weight.
- Largest difference between rounds for one cell: 41% (kairo: repeated observers, ember: tracked() + createCache (wt-before)).
- alien-signals 3.2.1, signal-polyfill 0.2.2, solid-js 1.9.15, svelte 5.57.1, signalium 3.0.3, ember-source 7.5.0-alpha.1 (wt-before), ember-source 7.5.0-alpha.1 (wt-after), node v24.20.0, AMD Ryzen 9 7900X 12-Core Processor.
