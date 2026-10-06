| case, 1,000 tracked values | before | after | after / before | ratio of each round |
| --- | ---: | ---: | ---: | ---: |
| small integer: create | 16.16 µs | 15.86 µs | 0.98x | 0.64 to 1.08 |
| small integer: read | 1.70 µs | 1.77 µs | 1.04x | 0.95 to 1.08 |
| small integer: write | 4.91 µs | 4.90 µs | 1.00x | 0.96 to 1.01 |
| double: create | 17.30 µs | 16.88 µs | 0.98x | 0.88 to 1.07 |
| double: read | 2.03 µs | 2.01 µs | 0.99x | 0.97 to 1.21 |
| double: write | 9.94 µs | 9.89 µs | 1.00x | 0.99 to 1.01 |
| string: create | 17.95 µs | 17.12 µs | 0.95x | 0.83 to 1.07 |
| string: read | 2.05 µs | 2.20 µs | 1.07x | 1.01 to 1.38 |
| string: write | 8.91 µs | 8.88 µs | 1.00x | 0.99 to 1.00 |
| boolean: create | 16.53 µs | 16.26 µs | 0.98x | 0.63 to 1.10 |
| boolean: read | 1.65 µs | 1.65 µs | 1.00x | 0.93 to 1.02 |
| boolean: write | 5.65 µs | 5.62 µs | 0.99x | 0.99 to 1.00 |
| undefined and null: create | 16.43 µs | 16.84 µs | 1.02x | 0.98 to 1.06 |
| undefined and null: read | 1.81 µs | 1.81 µs | 1.00x | 0.92 to 1.21 |
| undefined and null: write | 5.65 µs | 5.61 µs | 0.99x | 0.99 to 1.00 |
| object: create | 33.68 µs | 35.60 µs | 1.06x | 0.93 to 1.08 |
| object: read | 2.13 µs | 2.18 µs | 1.02x | 0.93 to 1.22 |
| object: write | 5.83 µs | 5.71 µs | 0.98x | 0.87 to 1.00 |
| array: create | 24.84 µs | 24.18 µs | 0.97x | 0.79 to 1.03 |
| array: read | 1.94 µs | 2.09 µs | 1.07x | 0.98 to 1.16 |
| array: write | 5.76 µs | 5.71 µs | 0.99x | 0.97 to 1.00 |
| function: create | 17.63 µs | 16.21 µs | 0.92x | 0.75 to 1.08 |
| function: read | 2.13 µs | 2.24 µs | 1.05x | 0.99 to 1.09 |
| function: write | 5.84 µs | 5.81 µs | 0.99x | 0.97 to 1.00 |
| symbol: create | 16.84 µs | 18.19 µs | 1.08x | 0.92 to 1.14 |
| symbol: read | 1.68 µs | 1.72 µs | 1.02x | 0.94 to 1.06 |
| symbol: write | 5.76 µs | 5.69 µs | 0.99x | 0.98 to 1.00 |
| bigint: create | 18.02 µs | 17.83 µs | 0.99x | 0.90 to 1.01 |
| bigint: read | 4.81 µs | 4.80 µs | 1.00x | 0.98 to 1.05 |
| bigint: write | 9.79 µs | 9.67 µs | 0.99x | 0.98 to 1.01 |
| all kinds mixed: create | 20.89 µs | 20.54 µs | 0.98x | 0.93 to 1.07 |
| all kinds mixed: read | 1.85 µs | 1.94 µs | 1.05x | 0.99 to 1.09 |
| all kinds mixed: write | 5.70 µs | 5.71 µs | 1.00x | 0.97 to 1.02 |
| string: read, after the first number | 2.08 µs | 2.23 µs | 1.07x | 1.04 to 1.09 |
| boolean: read, after the first number | 1.65 µs | 1.74 µs | 1.05x | 1.04 to 1.06 |
| undefined and null: read, after the first number | 1.68 µs | 1.74 µs | 1.04x | 1.02 to 1.07 |
| object: read, after the first number | 2.08 µs | 2.19 µs | 1.06x | 1.02 to 1.13 |
| array: read, after the first number | 2.08 µs | 2.19 µs | 1.05x | 1.03 to 1.07 |
| function: read, after the first number | 2.10 µs | 2.29 µs | 1.09x | 1.03 to 1.16 |
| symbol: read, after the first number | 1.68 µs | 1.78 µs | 1.06x | 1.01 to 1.09 |
| bigint: read, after the first number | 4.45 µs | 4.79 µs | 1.08x | 1.05 to 1.12 |

| extra time of 5,000 read loops after the first number | before | after |
| --- | ---: | ---: |
| string | 16.72 ms | 59.74 µs |
| boolean | 15.73 ms | 1.03 ms |
| undefined and null | 15.82 ms | -792.89 µs |
| object | 16.00 ms | -610.27 µs |
| array | 15.71 ms | -540.45 µs |
| function | 14.99 ms | 138.25 µs |
| symbol | 15.83 ms | 347.94 µs |
| bigint | 31.57 ms | 109.68 µs |

- Median of 6 rounds. A time is the p50 from mitata for one pass over 1,000 tracked values.
- A ratio above 1 means that the build with the store of `0` is slower.
- The extra time is the time of 5,000 read loops after one cell gets a number, minus the time of 5,000 read loops before it.
- node v24.20.0
