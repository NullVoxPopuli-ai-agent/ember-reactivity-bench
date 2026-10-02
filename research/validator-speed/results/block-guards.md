| case | ember: tags (base) | ember: tags (v2) | ember: tags (nvp/block-guards) | alien-signals |
| --- | ---: | ---: | ---: | ---: |
| propagate: 10 chains x 10 deep | 5.35 µs | 2.74 µs (0.5x) | 2.80 µs (0.5x) | 2.84 µs (0.5x) |
| propagate: 100 chains x 100 deep | 609.82 µs | 298.50 µs (0.5x) | 293.68 µs (0.5x) | 517.38 µs (0.8x) |
| kairo: broad propagation | 6.53 µs | 3.60 µs (0.6x) | 3.71 µs (0.6x) | 3.76 µs (0.6x) |
| kairo: diamond | 374 ns | 221 ns (0.6x) | 193 ns (0.5x) | 165 ns (0.4x) |
| kairo: mux | 17.59 µs | 9.13 µs (0.5x) | 13.98 µs (0.8x) | 6.48 µs (0.4x) |
| rows: 1000 rows, write 1 | 6.93 µs | 8.05 µs (1.2x) | 8.02 µs (1.2x) | 5.87 µs (0.8x) |
| rows: 1000 rows, write all | 95.84 µs | 54.01 µs (0.6x) | 54.00 µs (0.6x) | 60.92 µs (0.6x) |
| batch: 10 writes, 1 output | 523 ns | 174 ns (0.3x) | 266 ns (0.5x) | 228 ns (0.4x) |
| create: 1000 computeds, read each | 35.58 µs | 20.83 µs (0.6x) | 27.25 µs (0.8x) | 24.70 µs (0.7x) |
| create: 1000 outputs | 45.33 µs | 30.13 µs (0.7x) | 33.09 µs (0.7x) | 31.75 µs (0.7x) |
| weighted geometric mean | 1.0x | 0.6x | 0.7x | 0.6x |

- Time for the writes of one frame and the flush of that frame. Median of 3 rounds of the p50 from mitata.
- The ratio in parentheses compares with "ember: tags (base)". A ratio above 1 is slower.
- The weighted geometric mean is the mean of the ratios. Each group of cases has the same total weight.
- Largest difference between rounds for one cell: 22% (rows: 1000 rows, write 1, ember: tags (v2)).
- alien-signals 3.2.1, ember-source 7.3.0 (base, v2), ember-source 7.4.0-alpha.1 at e6b21cda46 (nvp/block-guards), node v24.20.0, AMD Ryzen 9 7900X 12-Core Processor.

