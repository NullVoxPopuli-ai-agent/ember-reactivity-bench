| case, 1,000 tracked values | before | after | after / before | ratio of each round |
| --- | ---: | ---: | ---: | ---: |
| small integer: create | 18.06 µs | 17.71 µs | 0.98x | 0.92 to 1.03 |
| small integer: read | 1.80 µs | 1.79 µs | 0.99x | 0.94 to 1.02 |
| small integer: write | 4.77 µs | 4.79 µs | 1.00x | 0.98 to 1.02 |
| double: create | 19.82 µs | 19.48 µs | 0.98x | 0.91 to 1.08 |
| double: read | 2.14 µs | 2.14 µs | 1.00x | 0.95 to 1.35 |
| double: write | 10.38 µs | 10.38 µs | 1.00x | 0.89 to 1.78 |
| string: create | 19.48 µs | 20.34 µs | 1.04x | 0.93 to 1.14 |
| string: read | 2.09 µs | 2.29 µs | 1.10x | 0.98 to 1.14 |
| string: write | 9.38 µs | 9.38 µs | 1.00x | 0.99 to 1.01 |
| boolean: create | 19.03 µs | 19.38 µs | 1.02x | 0.89 to 1.50 |
| boolean: read | 1.74 µs | 1.68 µs | 0.97x | 0.95 to 1.00 |
| boolean: write | 5.68 µs | 5.63 µs | 0.99x | 0.98 to 1.00 |
| undefined and null: create | 18.56 µs | 18.75 µs | 1.01x | 0.93 to 1.06 |
| undefined and null: read | 1.69 µs | 1.68 µs | 0.99x | 0.94 to 1.07 |
| undefined and null: write | 5.69 µs | 5.63 µs | 0.99x | 0.98 to 0.99 |
| object: create | 40.96 µs | 41.41 µs | 1.01x | 0.98 to 1.02 |
| object: read | 2.16 µs | 2.18 µs | 1.01x | 0.92 to 1.09 |
| object: write | 6.29 µs | 5.67 µs | 0.90x | 0.89 to 0.99 |
| array: create | 30.04 µs | 30.25 µs | 1.01x | 1.00 to 1.26 |
| array: read | 2.12 µs | 2.18 µs | 1.03x | 0.98 to 1.17 |
| array: write | 5.79 µs | 5.68 µs | 0.98x | 0.96 to 0.99 |
| function: create | 19.80 µs | 19.94 µs | 1.01x | 0.98 to 1.07 |
| function: read | 2.06 µs | 2.09 µs | 1.01x | 0.94 to 1.05 |
| function: write | 5.70 µs | 5.62 µs | 0.99x | 0.97 to 0.99 |
| symbol: create | 19.61 µs | 19.64 µs | 1.00x | 0.93 to 1.15 |
| symbol: read | 1.65 µs | 1.69 µs | 1.02x | 0.95 to 1.10 |
| symbol: write | 5.74 µs | 5.65 µs | 0.98x | 0.98 to 1.02 |
| bigint: create | 20.13 µs | 20.36 µs | 1.01x | 0.97 to 1.08 |
| bigint: read | 4.18 µs | 3.84 µs | 0.92x | 0.84 to 1.00 |
| bigint: write | 10.11 µs | 10.05 µs | 0.99x | 0.99 to 1.01 |
| all kinds mixed: create | 22.66 µs | 22.94 µs | 1.01x | 0.96 to 1.06 |
| all kinds mixed: read | 1.89 µs | 2.01 µs | 1.06x | 0.94 to 1.14 |
| all kinds mixed: write | 5.85 µs | 5.87 µs | 1.00x | 0.98 to 1.02 |
| string: read, after the first number | 2.13 µs | 2.24 µs | 1.05x | 0.98 to 1.13 |
| boolean: read, after the first number | 1.69 µs | 1.72 µs | 1.02x | 0.96 to 1.23 |
| undefined and null: read, after the first number | 1.69 µs | 1.73 µs | 1.02x | 0.95 to 1.15 |
| object: read, after the first number | 2.02 µs | 2.08 µs | 1.03x | 0.98 to 1.06 |
| array: read, after the first number | 2.25 µs | 2.22 µs | 0.98x | 0.94 to 1.04 |
| function: read, after the first number | 2.09 µs | 2.20 µs | 1.05x | 1.01 to 1.16 |
| symbol: read, after the first number | 1.64 µs | 1.71 µs | 1.04x | 0.97 to 1.08 |
| bigint: read, after the first number | 4.13 µs | 4.62 µs | 1.12x | 1.01 to 1.28 |

| extra time of 5,000 read loops after the first number | before | after |
| --- | ---: | ---: |
| string | 2.66 ms | -304.68 µs |
| boolean | 2.62 ms | -834.07 µs |
| undefined and null | 2.98 ms | -1.02 ms |
| object | 15.05 ms | -968.29 µs |
| array | 4.66 ms | -266.12 µs |
| function | 3.64 ms | 917.50 µs |
| symbol | 1.93 ms | 332.49 µs |
| bigint | 2.48 ms | -2.69 ms |

- Median of 6 rounds. A time is the p50 from mitata for one pass over 1,000 tracked values.
- A ratio above 1 means that the build with the store of `0` is slower.
- The extra time is the time of 5,000 read loops after one cell gets a number, minus the time of 5,000 read loops before it.
- node v26.10.0
