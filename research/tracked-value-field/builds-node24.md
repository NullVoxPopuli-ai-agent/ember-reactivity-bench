| case, 1,000 tracked values | before | control | after | undefined-store | prime |
| --- | ---: | ---: | ---: | ---: | ---: |
| small integer: create | 15.96 µs | 15.83 µs (0.99x, 0.85 to 1.07) | 16.77 µs (1.05x, 0.87 to 1.11) | 15.97 µs (1.00x, 0.83 to 1.11) | 16.07 µs (1.01x, 0.83 to 1.16) |
| small integer: read | 1787 ns | 1740 ns (0.97x, 0.91 to 1.10) | 1734 ns (0.97x, 0.92 to 1.09) | 1755 ns (0.98x, 0.92 to 1.11) | 1810 ns (1.01x, 0.92 to 1.11) |
| small integer: write | 5285 ns | 5280 ns (1.00x, 0.98 to 1.01) | 5296 ns (1.00x, 0.96 to 1.02) | 5296 ns (1.00x, 0.95 to 1.09) | 5291 ns (1.00x, 0.95 to 1.01) |
| double: create | 16.85 µs | 16.93 µs (1.00x, 0.88 to 1.50) | 16.79 µs (1.00x, 0.89 to 1.03) | 17.05 µs (1.01x, 0.87 to 1.14) | 16.75 µs (0.99x, 0.89 to 1.10) |
| double: read | 2071 ns | 2070 ns (1.00x, 0.90 to 1.00) | 2070 ns (1.00x, 0.90 to 1.10) | 2070 ns (1.00x, 0.90 to 1.09) | 2070 ns (1.00x, 0.91 to 1.07) |
| double: write | 10.21 µs | 10.20 µs (1.00x, 0.99 to 1.03) | 10.26 µs (1.00x, 0.99 to 1.02) | 10.91 µs (1.07x, 1.05 to 1.50) | 10.23 µs (1.00x, 0.99 to 1.03) |
| string: create | 17.45 µs | 17.02 µs (0.98x, 0.87 to 1.10) | 17.25 µs (0.99x, 0.85 to 1.04) | 17.34 µs (0.99x, 0.89 to 1.10) | 16.56 µs (0.95x, 0.86 to 1.07) |
| string: read | 2049 ns | 2077 ns (1.01x, 0.91 to 1.05) | 2089 ns (1.02x, 0.92 to 1.10) | 2046 ns (1.00x, 0.92 to 1.03) | 2090 ns (1.02x, 0.94 to 1.05) |
| string: write | 9150 ns | 9185 ns (1.00x, 1.00 to 1.03) | 9160 ns (1.00x, 1.00 to 1.00) | 9175 ns (1.00x, 1.00 to 1.73) | 9156 ns (1.00x, 0.99 to 1.55) |
| boolean: create | 16.18 µs | 16.57 µs (1.02x, 0.92 to 1.11) | 16.02 µs (0.99x, 0.88 to 1.07) | 16.27 µs (1.01x, 0.96 to 1.14) | 15.76 µs (0.97x, 0.97 to 0.99) |
| boolean: read | 1721 ns | 1650 ns (0.96x, 0.90 to 1.06) | 1679 ns (0.98x, 0.90 to 1.10) | 1720 ns (1.00x, 0.91 to 1.06) | 1650 ns (0.96x, 0.90 to 1.08) |
| boolean: write | 5960 ns | 5955 ns (1.00x, 0.99 to 1.02) | 5925 ns (0.99x, 0.98 to 1.08) | 5960 ns (1.00x, 0.99 to 1.01) | 5880 ns (0.99x, 0.98 to 0.99) |
| undefined and null: create | 16.21 µs | 16.73 µs (1.03x, 1.00 to 1.53) | 15.94 µs (0.98x, 0.94 to 1.11) | 16.98 µs (1.05x, 0.98 to 1.12) | 15.88 µs (0.98x, 0.96 to 1.06) |
| undefined and null: read | 1747 ns | 1680 ns (0.96x, 0.90 to 1.05) | 1725 ns (0.99x, 0.90 to 1.01) | 1680 ns (0.96x, 0.93 to 1.02) | 1693 ns (0.97x, 0.92 to 1.02) |
| undefined and null: write | 5965 ns | 5965 ns (1.00x, 0.99 to 1.01) | 5905 ns (0.99x, 0.97 to 1.18) | 5970 ns (1.00x, 0.99 to 1.02) | 5901 ns (0.99x, 0.98 to 1.01) |
| object: create | 36.27 µs | 36.32 µs (1.00x, 0.93 to 1.06) | 36.26 µs (1.00x, 0.94 to 1.73) | 36.23 µs (1.00x, 0.92 to 1.22) | 34.88 µs (0.96x, 0.92 to 1.05) |
| object: read | 2157 ns | 2157 ns (1.00x, 0.85 to 1.14) | 2071 ns (0.96x, 0.90 to 1.04) | 2143 ns (0.99x, 0.89 to 1.58) | 2210 ns (1.02x, 0.86 to 1.17) |
| object: write | 6164 ns | 6110 ns (0.99x, 0.91 to 1.15) | 6094 ns (0.99x, 0.90 to 1.14) | 6095 ns (0.99x, 0.91 to 1.01) | 5990 ns (0.97x, 0.89 to 1.15) |
| array: create | 24.05 µs | 24.06 µs (1.00x, 0.88 to 1.07) | 23.93 µs (1.00x, 0.87 to 1.08) | 24.05 µs (1.00x, 0.88 to 1.06) | 24.01 µs (1.00x, 0.85 to 1.08) |
| array: read | 1930 ns | 1931 ns (1.00x, 0.92 to 1.15) | 2105 ns (1.09x, 0.98 to 1.24) | 1976 ns (1.02x, 0.92 to 1.19) | 2089 ns (1.08x, 0.97 to 1.18) |
| array: write | 6080 ns | 6090 ns (1.00x, 0.94 to 1.04) | 6020 ns (0.99x, 0.93 to 1.00) | 6095 ns (1.00x, 0.98 to 1.02) | 6030 ns (0.99x, 0.92 to 1.02) |
| function: create | 18.02 µs | 16.89 µs (0.94x, 0.67 to 1.09) | 16.54 µs (0.92x, 0.63 to 1.02) | 16.82 µs (0.93x, 0.66 to 1.12) | 16.17 µs (0.90x, 0.65 to 0.96) |
| function: read | 2242 ns | 2143 ns (0.96x, 0.71 to 1.09) | 2105 ns (0.94x, 0.62 to 1.00) | 2136 ns (0.95x, 0.62 to 1.22) | 2126 ns (0.95x, 0.91 to 1.11) |
| function: write | 6211 ns | 6195 ns (1.00x, 0.97 to 1.03) | 6195 ns (1.00x, 0.98 to 1.03) | 6190 ns (1.00x, 0.98 to 1.01) | 6170 ns (0.99x, 0.96 to 1.06) |
| symbol: create | 18.25 µs | 17.99 µs (0.99x, 0.86 to 1.11) | 16.52 µs (0.91x, 0.85 to 1.01) | 16.78 µs (0.92x, 0.76 to 1.09) | 16.65 µs (0.91x, 0.84 to 1.11) |
| symbol: read | 1714 ns | 1737 ns (1.01x, 0.94 to 1.06) | 1715 ns (1.00x, 0.91 to 1.13) | 1700 ns (0.99x, 0.91 to 1.05) | 1700 ns (0.99x, 0.94 to 1.05) |
| symbol: write | 6035 ns | 6070 ns (1.01x, 0.98 to 1.11) | 5945 ns (0.99x, 0.96 to 1.05) | 6050 ns (1.00x, 0.99 to 1.01) | 5955 ns (0.99x, 0.98 to 0.99) |
| bigint: create | 17.03 µs | 17.39 µs (1.02x, 0.91 to 1.10) | 17.91 µs (1.05x, 0.96 to 1.33) | 17.24 µs (1.01x, 0.90 to 1.13) | 17.61 µs (1.03x, 0.90 to 1.50) |
| bigint: read | 4520 ns | 4461 ns (0.99x, 0.86 to 1.08) | 4466 ns (0.99x, 0.87 to 1.03) | 4470 ns (0.99x, 0.87 to 1.06) | 4627 ns (1.02x, 0.95 to 1.07) |
| bigint: write | 10.24 µs | 10.24 µs (1.00x, 0.98 to 1.01) | 10.10 µs (0.99x, 0.96 to 1.06) | 10.33 µs (1.01x, 1.00 to 1.04) | 10.02 µs (0.98x, 0.96 to 0.99) |
| all kinds mixed: create | 21.23 µs | 20.33 µs (0.96x, 0.76 to 1.17) | 21.16 µs (1.00x, 0.83 to 1.11) | 19.36 µs (0.91x, 0.75 to 1.13) | 20.18 µs (0.95x, 0.83 to 1.01) |
| all kinds mixed: read | 1840 ns | 1860 ns (1.01x, 0.92 to 1.14) | 1840 ns (1.00x, 0.95 to 1.02) | 1840 ns (1.00x, 0.95 to 1.29) | 1866 ns (1.01x, 0.95 to 1.20) |
| all kinds mixed: write | 6035 ns | 5995 ns (0.99x, 0.96 to 1.01) | 6001 ns (0.99x, 0.96 to 1.08) | 6035 ns (1.00x, 0.96 to 1.03) | 6000 ns (0.99x, 0.97 to 1.02) |
| string: read, after the first number | 2070 ns | 2079 ns (1.00x, 0.99 to 1.07) | 2183 ns (1.05x, 1.01 to 1.08) | 2076 ns (1.00x, 0.99 to 1.01) | 2192 ns (1.06x, 1.01 to 1.07) |
| boolean: read, after the first number | 1645 ns | 1650 ns (1.00x, 0.55 to 1.01) | 1701 ns (1.03x, 0.56 to 1.06) | 1640 ns (1.00x, 0.55 to 1.01) | 1704 ns (1.04x, 0.57 to 1.10) |
| undefined and null: read, after the first number | 1680 ns | 1680 ns (1.00x, 1.00 to 1.00) | 1716 ns (1.02x, 0.97 to 1.06) | 1680 ns (1.00x, 1.00 to 1.00) | 1713 ns (1.02x, 0.98 to 1.10) |
| object: read, after the first number | 2069 ns | 2070 ns (1.00x, 0.98 to 1.04) | 2153 ns (1.04x, 1.01 to 1.12) | 2065 ns (1.00x, 1.00 to 1.02) | 2156 ns (1.04x, 1.00 to 1.13) |
| array: read, after the first number | 2061 ns | 2080 ns (1.01x, 0.99 to 1.02) | 2166 ns (1.05x, 1.00 to 1.13) | 2070 ns (1.00x, 0.99 to 1.02) | 2200 ns (1.07x, 1.00 to 1.27) |
| function: read, after the first number | 2111 ns | 2100 ns (1.00x, 0.98 to 1.04) | 2205 ns (1.04x, 1.02 to 1.11) | 2105 ns (1.00x, 0.96 to 1.03) | 2220 ns (1.05x, 1.01 to 1.13) |
| symbol: read, after the first number | 1680 ns | 1685 ns (1.00x, 0.98 to 1.01) | 1707 ns (1.02x, 0.99 to 1.03) | 1680 ns (1.00x, 0.97 to 1.00) | 1724 ns (1.03x, 1.00 to 1.06) |
| bigint: read, after the first number | 4451 ns | 4451 ns (1.00x, 1.00 to 1.00) | 4646 ns (1.04x, 1.02 to 1.09) | 4451 ns (1.00x, 1.00 to 1.00) | 4668 ns (1.05x, 1.00 to 1.10) |

| extra time of 5,000 read loops after the first number | before | control | after | undefined-store | prime |
| --- | ---: | ---: | ---: | ---: | ---: |
| string | 14.71 ms | 15.21 ms | 340.99 µs | 15.14 ms | -101.60 µs |
| boolean | 14.63 ms | 15.74 ms | 39.90 µs | 14.40 ms | 954.78 µs |
| undefined and null | 14.88 ms | 15.01 ms | 214.56 µs | 14.76 ms | -134.06 µs |
| object | 15.86 ms | 14.97 ms | -41.84 µs | 14.44 ms | 38.89 µs |
| array | 14.87 ms | 14.65 ms | -483.53 µs | 14.30 ms | 374.70 µs |
| function | 14.46 ms | 15.49 ms | -1.31 ms | 14.55 ms | 860.10 µs |
| symbol | 14.72 ms | 14.82 ms | 421.72 µs | 14.78 ms | -85.68 µs |
| bigint | 30.54 ms | 28.22 ms | 496.00 µs | 28.82 ms | -941.44 µs |

- Median of 8 rounds. A time is the p50 from mitata for one pass over 1,000 tracked values.
- The ratio compares with "before". The range is the lowest and the highest ratio of one round.
- The extra time is the time of 5,000 read loops after one cell gets a number, minus the time of 5,000 read loops before it.
- node v24.20.0
