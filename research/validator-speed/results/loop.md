| case | ember (base) | ember (v2 + TrackedValue) | ember (v2 + TrackedValue + loop with a compare) | ember (v2 + TrackedValue + loop with Math.max) |
| --- | ---: | ---: | ---: | ---: |
| propagate: 100 chains x 100 deep | 608.45 µs | 313.17 µs (0.5x) | 284.98 µs (0.5x) | 293.25 µs (0.5x) |
| kairo: diamond | 373 ns | 228 ns (0.6x) | 218 ns (0.6x) | 217 ns (0.6x) |
| kairo: mux | 18.29 µs | 9.48 µs (0.5x) | 9.13 µs (0.5x) | 9.05 µs (0.5x) |
| kairo: repeated observers | 354 ns | 106 ns (0.3x) | 193 ns (0.5x) | 106 ns (0.3x) |
| rows: 1000 rows, write 1 | 7.24 µs | 8.09 µs (1.1x) | 5.80 µs (0.8x) | 6.43 µs (0.9x) |
| weighted geometric mean | 1.0x | 0.7x | 0.6x | 0.6x |

- Time for the writes of one frame and the flush of that frame. Median of 3 rounds of the p50 from mitata.
- The ratio in parentheses compares with "ember (base)". A ratio above 1 is slower.
- The weighted geometric mean is the mean of the ratios. Each group of cases has the same total weight.
- Largest difference between rounds for one cell: 19% (rows: 1000 rows, write 1, ember (base)).
- ember-source 7.3.0, node v24.20.0, AMD Ryzen 9 7900X 12-Core Processor.

