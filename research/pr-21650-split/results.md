| case | main | tracker pool | pool + tag reuse | index loop | lazy functions | store of 0 | all five, PR 21650 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| propagate: 1 chains x 1 deep | 124 ns | 63 ns (0.5x) | 63 ns (0.5x) | 121 ns (1.0x) | 122 ns (1.0x) | 121 ns (1.0x) | 64 ns (0.5x) |
| propagate: 10 chains x 10 deep | 5.51 µs | 2.89 µs (0.5x) | 2.88 µs (0.5x) | 5.47 µs (1.0x) | 5.49 µs (1.0x) | 5.58 µs (1.0x) | 2.61 µs (0.5x) |
| propagate: 100 chains x 100 deep | 724.68 µs | 337.41 µs (0.5x) | 343.96 µs (0.5x) | 708.19 µs (1.0x) | 713.81 µs (1.0x) | 713.25 µs (1.0x) | 316.76 µs (0.4x) |
| propagate: 1 chains x 1000 deep | 57.18 µs | 31.34 µs (0.5x) | 29.50 µs (0.5x) | 57.29 µs (1.0x) | 57.57 µs (1.0x) | 57.03 µs (1.0x) | 23.95 µs (0.4x) |
| propagate: 1000 chains x 1 deep | 103.01 µs | 51.98 µs (0.5x) | 52.16 µs (0.5x) | 101.40 µs (1.0x) | 100.65 µs (1.0x) | 101.02 µs (1.0x) | 48.34 µs (0.5x) |
| kairo: avoidable propagation | 382 ns | 166 ns (0.4x) | 171 ns (0.4x) | 361 ns (0.9x) | 374 ns (1.0x) | 374 ns (1.0x) | 181 ns (0.5x) |
| kairo: broad propagation | 7.35 µs | 3.81 µs (0.5x) | 3.89 µs (0.5x) | 7.10 µs (1.0x) | 7.25 µs (1.0x) | 7.33 µs (1.0x) | 3.52 µs (0.5x) |
| kairo: deep propagation | 3.09 µs | 1.45 µs (0.5x) | 1.40 µs (0.5x) | 3.08 µs (1.0x) | 3.04 µs (1.0x) | 3.04 µs (1.0x) | 1.30 µs (0.4x) |
| kairo: diamond | 428 ns | 212 ns (0.5x) | 213 ns (0.5x) | 424 ns (1.0x) | 422 ns (1.0x) | 423 ns (1.0x) | 197 ns (0.5x) |
| kairo: mux | 20.23 µs | 12.90 µs (0.6x) | 10.32 µs (0.5x) | 19.72 µs (1.0x) | 20.17 µs (1.0x) | 20.15 µs (1.0x) | 10.23 µs (0.5x) |
| kairo: repeated observers | 365 ns | 173 ns (0.5x) | 175 ns (0.5x) | 323 ns (0.9x) | 332 ns (0.9x) | 332 ns (0.9x) | 254 ns (0.7x) |
| kairo: triangle | 755 ns | 386 ns (0.5x) | 387 ns (0.5x) | 689 ns (0.9x) | 749 ns (1.0x) | 743 ns (1.0x) | 376 ns (0.5x) |
| kairo: unstable | 574 ns | 374 ns (0.7x) | 382 ns (0.7x) | 570 ns (1.0x) | 577 ns (1.0x) | 577 ns (1.0x) | 352 ns (0.6x) |
| rows: 1000 rows, write 1 | 7.19 µs | 7.03 µs (1.0x) | 7.15 µs (1.0x) | 7.10 µs (1.0x) | 7.09 µs (1.0x) | 7.23 µs (1.0x) | 6.77 µs (0.9x) |
| rows: 1000 rows, write all | 118.18 µs | 67.92 µs (0.6x) | 69.33 µs (0.6x) | 118.70 µs (1.0x) | 111.87 µs (0.9x) | 118.28 µs (1.0x) | 57.55 µs (0.5x) |
| batch: 10 writes, 1 output | 667 ns | 368 ns (0.6x) | 299 ns (0.4x) | 664 ns (1.0x) | 634 ns (1.0x) | 651 ns (1.0x) | 273 ns (0.4x) |
| avoidable: write the same value | 6 ns | 6 ns (1.0x) | 6 ns (1.0x) | 6 ns (1.0x) | 6 ns (1.1x) | 6 ns (1.0x) | 6 ns (1.1x) |
| create: 1000 signals | 17.84 µs | 18.60 µs (1.0x) | 18.58 µs (1.0x) | 17.85 µs (1.0x) | 9.39 µs (0.5x) | 18.14 µs (1.0x) | 9.47 µs (0.5x) |
| create: 1000 computeds, read each | 41.11 µs | 23.68 µs (0.6x) | 24.61 µs (0.6x) | 37.95 µs (0.9x) | 40.06 µs (1.0x) | 39.86 µs (1.0x) | 24.55 µs (0.6x) |
| create: 1000 outputs | 50.30 µs | 35.34 µs (0.7x) | 33.10 µs (0.7x) | 49.03 µs (1.0x) | 52.33 µs (1.0x) | 53.29 µs (1.1x) | 35.86 µs (0.7x) |
| weighted geometric mean | 1.0x | 0.6x | 0.6x | 1.0x | 0.9x | 1.0x | 0.6x |

- Time for the writes of one frame and the flush of that frame. Median of 6 rounds of the p50 from mitata.
- The ratio in parentheses compares with "main". A ratio above 1 is slower.
- The weighted geometric mean is the mean of the ratios. Each group of cases has the same total weight.
- Largest difference between rounds for one cell: 52% (rows: 1000 rows, write 1, lazy functions).
- ember-source 7.5.0-alpha.1 for every column, node v24.20.0, AMD Ryzen 9 7900X.
