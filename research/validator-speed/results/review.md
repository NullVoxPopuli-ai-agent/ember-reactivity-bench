| case | ember (frame number) | ember (frame number above 2^31) | ember (index check) | ember (index check and scan) | ember (main) |
| --- | ---: | ---: | ---: | ---: | ---: |
| propagate: 1 chains x 1 deep | 56 ns | 67 ns (1.2x) | 56 ns (1.0x) | 60 ns (1.1x) | 104 ns (1.9x) |
| propagate: 10 chains x 10 deep | 2.46 µs | 3.04 µs (1.2x) | 2.58 µs (1.0x) | 2.54 µs (1.0x) | 5.39 µs (2.2x) |
| propagate: 100 chains x 100 deep | 283.04 µs | 321.68 µs (1.1x) | 283.34 µs (1.0x) | 287.87 µs (1.0x) | 605.95 µs (2.1x) |
| propagate: 1 chains x 1000 deep | 23.49 µs | 28.26 µs (1.2x) | 23.16 µs (1.0x) | 25.59 µs (1.1x) | 51.77 µs (2.2x) |
| propagate: 1000 chains x 1 deep | 44.11 µs | 52.73 µs (1.2x) | 45.19 µs (1.0x) | 45.33 µs (1.0x) | 88.54 µs (2.0x) |
| kairo: avoidable propagation | 148 ns | 194 ns (1.3x) | 148 ns (1.0x) | 150 ns (1.0x) | 330 ns (2.2x) |
| kairo: broad propagation | 3.35 µs | 3.88 µs (1.2x) | 3.34 µs (1.0x) | 3.34 µs (1.0x) | 6.48 µs (1.9x) |
| kairo: deep propagation | 1.22 µs | 1.42 µs (1.2x) | 1.23 µs (1.0x) | 1.25 µs (1.0x) | 2.52 µs (2.1x) |
| kairo: diamond | 220 ns | 253 ns (1.1x) | 181 ns (0.8x) | 180 ns (0.8x) | 365 ns (1.7x) |
| kairo: mux | 8.75 µs | 11.03 µs (1.3x) | 10.04 µs (1.1x) | 9.02 µs (1.0x) | 18.03 µs (2.1x) |
| kairo: repeated observers | 193 ns | 204 ns (1.1x) | 225 ns (1.2x) | 145 ns (0.8x) | 343 ns (1.8x) |
| kairo: triangle | 416 ns | 458 ns (1.1x) | 329 ns (0.8x) | 330 ns (0.8x) | 667 ns (1.6x) |
| kairo: unstable | 293 ns | 308 ns (1.1x) | 310 ns (1.1x) | 351 ns (1.2x) | 509 ns (1.7x) |
| rows: 1000 rows, write 1 | 6.20 µs | 6.08 µs (1.0x) | 6.28 µs (1.0x) | 6.23 µs (1.0x) | 6.67 µs (1.1x) |
| rows: 1000 rows, write all | 50.31 µs | 59.01 µs (1.2x) | 51.71 µs (1.0x) | 52.17 µs (1.0x) | 103.61 µs (2.1x) |
| batch: 10 writes, 1 output | 227 ns | 234 ns (1.0x) | 241 ns (1.1x) | 295 ns (1.3x) | 593 ns (2.6x) |
| avoidable: write the same value | 5 ns | 5 ns (1.0x) | 5 ns (1.0x) | 5 ns (1.0x) | 5 ns (1.1x) |
| create: 1000 signals | 9.98 µs | 9.98 µs (1.0x) | 10.02 µs (1.0x) | 10.02 µs (1.0x) | 16.71 µs (1.7x) |
| create: 1000 computeds, read each | 22.14 µs | 25.74 µs (1.2x) | 22.05 µs (1.0x) | 22.54 µs (1.0x) | 36.43 µs (1.6x) |
| create: 1000 outputs | 27.93 µs | 32.48 µs (1.2x) | 28.65 µs (1.0x) | 28.72 µs (1.0x) | 44.75 µs (1.6x) |
| weighted geometric mean | 1.0x | 1.1x | 1.0x | 1.0x | 1.7x |

- Time for the writes of one frame and the flush of that frame. Median of 3 rounds of the p50 from mitata.
- The ratio in parentheses compares with "ember (frame number)". A ratio above 1 is slower.
- The weighted geometric mean is the mean of the ratios. Each group of cases has the same total weight.
- Largest difference between rounds for one cell: 30% (propagate: 1 chains x 1000 deep, ember (index check)).
- ember-source 7.5.0-alpha.1 at f693f240ee (main) and patched builds of the PR at c59a238d61, node v24.20.0, AMD Ryzen 9 7900X 12-Core Processor.

