| case | ember: tracked() + createCache (base) | ember: tracked() + createCache (v1) | ember: tracked() + createCache (v2) | ember: tracked() + createCache (v3) | ember: tracked() + createCache (v4) | ember: tracked() + createCache (v5) | alien-signals |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| propagate: 1 chains x 1 deep | 99 ns | 85 ns (0.9x) | 57 ns (0.6x) | 56 ns (0.6x) | 56 ns (0.6x) | 54 ns (0.5x) | 48 ns (0.5x) |
| propagate: 10 chains x 10 deep | 5.27 µs | 4.38 µs (0.8x) | 2.65 µs (0.5x) | 2.46 µs (0.5x) | 2.44 µs (0.5x) | 2.48 µs (0.5x) | 2.70 µs (0.5x) |
| propagate: 100 chains x 100 deep | 598.57 µs | 531.03 µs (0.9x) | 301.26 µs (0.5x) | 275.13 µs (0.5x) | 270.03 µs (0.5x) | 273.83 µs (0.5x) | 503.71 µs (0.8x) |
| propagate: 1 chains x 1000 deep | 50.44 µs | 46.99 µs (0.9x) | 27.48 µs (0.5x) | 23.10 µs (0.5x) | 22.68 µs (0.4x) | 22.25 µs (0.4x) | 24.14 µs (0.5x) |
| propagate: 1000 chains x 1 deep | 88.02 µs | 72.43 µs (0.8x) | 47.81 µs (0.5x) | 43.52 µs (0.5x) | 43.35 µs (0.5x) | 43.57 µs (0.5x) | 49.00 µs (0.6x) |
| kairo: avoidable propagation | 319 ns | 250 ns (0.8x) | 145 ns (0.5x) | 145 ns (0.5x) | 147 ns (0.5x) | 143 ns (0.4x) | 72 ns (0.2x) |
| kairo: broad propagation | 6.50 µs | 5.10 µs (0.8x) | 3.51 µs (0.5x) | 3.14 µs (0.5x) | 3.16 µs (0.5x) | 3.15 µs (0.5x) | 3.59 µs (0.6x) |
| kairo: deep propagation | 2.48 µs | 2.06 µs (0.8x) | 1.25 µs (0.5x) | 1.21 µs (0.5x) | 1.23 µs (0.5x) | 1.21 µs (0.5x) | 1.11 µs (0.4x) |
| kairo: diamond | 357 ns | 360 ns (1.0x) | 220 ns (0.6x) | 208 ns (0.6x) | 207 ns (0.6x) | 208 ns (0.6x) | 161 ns (0.5x) |
| kairo: mux | 17.99 µs | 13.91 µs (0.8x) | 9.19 µs (0.5x) | 8.92 µs (0.5x) | 8.57 µs (0.5x) | 8.53 µs (0.5x) | 5.73 µs (0.3x) |
| kairo: repeated observers | 338 ns | 220 ns (0.7x) | 103 ns (0.3x) | 188 ns (0.6x) | 187 ns (0.6x) | 187 ns (0.6x) | 97 ns (0.3x) |
| kairo: triangle | 633 ns | 642 ns (1.0x) | 405 ns (0.6x) | 397 ns (0.6x) | 395 ns (0.6x) | 392 ns (0.6x) | 290 ns (0.5x) |
| kairo: unstable | 489 ns | 361 ns (0.7x) | 298 ns (0.6x) | 302 ns (0.6x) | 277 ns (0.6x) | 277 ns (0.6x) | 288 ns (0.6x) |
| rows: 1000 rows, write 1 | 6.58 µs | 6.75 µs (1.0x) | 7.92 µs (1.2x) | 5.68 µs (0.9x) | 5.42 µs (0.8x) | 5.21 µs (0.8x) | 5.76 µs (0.9x) |
| rows: 1000 rows, write all | 102.11 µs | 87.71 µs (0.9x) | 60.33 µs (0.6x) | 54.86 µs (0.5x) | 54.34 µs (0.5x) | 49.46 µs (0.5x) | 59.64 µs (0.6x) |
| batch: 10 writes, 1 output | 555 ns | 315 ns (0.6x) | 242 ns (0.4x) | 233 ns (0.4x) | 262 ns (0.5x) | 237 ns (0.4x) | 221 ns (0.4x) |
| avoidable: write the same value | 5 ns | 5 ns (1.0x) | 5 ns (1.0x) | 5 ns (1.0x) | 5 ns (1.0x) | 4 ns (0.8x) | 9 ns (1.7x) |
| create: 1000 signals | 12.45 µs | 13.05 µs (1.0x) | 12.87 µs (1.0x) | 12.98 µs (1.0x) | 12.94 µs (1.0x) | 4.66 µs (0.4x) | 3.33 µs (0.3x) |
| create: 1000 computeds, read each | 37.65 µs | 29.63 µs (0.8x) | 21.05 µs (0.6x) | 20.98 µs (0.6x) | 23.13 µs (0.6x) | 23.45 µs (0.6x) | 24.24 µs (0.6x) |
| create: 1000 outputs | 46.05 µs | 34.73 µs (0.8x) | 28.88 µs (0.6x) | 27.36 µs (0.6x) | 27.26 µs (0.6x) | 29.58 µs (0.6x) | 30.80 µs (0.7x) |
| weighted geometric mean | 1.0x | 0.8x | 0.6x | 0.6x | 0.6x | 0.5x | 0.6x |

- Time for the writes of one frame and the flush of that frame. Median of 4 rounds of the p50 from mitata.
- The ratio in parentheses compares with "ember: tracked() + createCache (base)". A ratio above 1 is slower.
- The weighted geometric mean is the mean of the ratios. Each group of cases has the same total weight.
- Largest difference between rounds for one cell: 67% (create: 1000 signals, ember: tracked() + createCache (v5)).
- alien-signals 3.2.1, ember-source 7.3.0, node v24.20.0, AMD Ryzen 9 7900X 12-Core Processor.

