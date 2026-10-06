| case, 1,000 tracked values | before | control | after | undefined-store | prime |
| --- | ---: | ---: | ---: | ---: | ---: |
| small integer: create | 18.59 µs | 18.55 µs (1.00x, 0.94 to 1.02) | 18.55 µs (1.00x, 0.94 to 1.01) | 18.39 µs (0.99x, 0.94 to 1.01) | 18.53 µs (1.00x, 0.94 to 1.02) |
| small integer: read | 1817 ns | 1726 ns (0.95x, 0.91 to 1.00) | 1813 ns (1.00x, 0.98 to 1.06) | 1798 ns (0.99x, 0.93 to 1.05) | 1725 ns (0.95x, 0.90 to 1.01) |
| small integer: write | 5251 ns | 5191 ns (0.99x, 0.93 to 1.05) | 5275 ns (1.00x, 0.98 to 1.03) | 5175 ns (0.99x, 0.95 to 1.01) | 5175 ns (0.99x, 0.94 to 1.04) |
| double: create | 20.26 µs | 19.79 µs (0.98x, 0.92 to 1.02) | 19.70 µs (0.97x, 0.93 to 1.00) | 20.09 µs (0.99x, 0.97 to 1.02) | 19.68 µs (0.97x, 0.93 to 0.99) |
| double: read | 2154 ns | 2071 ns (0.96x, 0.93 to 1.00) | 2106 ns (0.98x, 0.94 to 1.13) | 2057 ns (0.95x, 0.91 to 1.03) | 2039 ns (0.95x, 0.91 to 1.01) |
| double: write | 10.42 µs | 10.25 µs (0.98x, 0.96 to 1.01) | 10.47 µs (1.00x, 0.99 to 1.02) | 10.98 µs (1.05x, 1.03 to 1.07) | 10.29 µs (0.99x, 0.98 to 1.33) |
| string: create | 20.04 µs | 19.45 µs (0.97x, 0.93 to 1.09) | 19.75 µs (0.99x, 0.94 to 1.05) | 20.19 µs (1.01x, 0.98 to 1.03) | 20.01 µs (1.00x, 0.96 to 1.22) |
| string: read | 2120 ns | 2140 ns (1.01x, 0.92 to 1.07) | 2116 ns (1.00x, 0.91 to 1.05) | 2195 ns (1.04x, 0.94 to 1.05) | 2204 ns (1.04x, 0.92 to 1.29) |
| string: write | 9235 ns | 9205 ns (1.00x, 0.97 to 1.01) | 9411 ns (1.02x, 0.99 to 1.03) | 9240 ns (1.00x, 0.97 to 1.01) | 9419 ns (1.02x, 0.99 to 1.04) |
| boolean: create | 19.12 µs | 18.98 µs (0.99x, 0.89 to 1.08) | 18.89 µs (0.99x, 0.90 to 1.09) | 19.05 µs (1.00x, 0.90 to 1.08) | 18.71 µs (0.98x, 0.89 to 1.07) |
| boolean: read | 1680 ns | 1702 ns (1.01x, 0.97 to 1.09) | 1685 ns (1.00x, 0.98 to 1.04) | 1712 ns (1.02x, 0.98 to 1.69) | 1680 ns (1.00x, 0.96 to 1.04) |
| boolean: write | 6101 ns | 6025 ns (0.99x, 0.97 to 1.00) | 6080 ns (1.00x, 0.99 to 1.01) | 6046 ns (0.99x, 0.98 to 1.00) | 6006 ns (0.98x, 0.98 to 1.01) |
| undefined and null: create | 18.99 µs | 19.32 µs (1.02x, 0.99 to 1.27) | 18.74 µs (0.99x, 0.96 to 1.04) | 19.03 µs (1.00x, 0.94 to 1.07) | 18.99 µs (1.00x, 0.97 to 1.08) |
| undefined and null: read | 1680 ns | 1680 ns (1.00x, 0.96 to 1.01) | 1689 ns (1.01x, 0.95 to 1.02) | 1680 ns (1.00x, 0.96 to 1.01) | 1680 ns (1.00x, 0.96 to 1.02) |
| undefined and null: write | 6065 ns | 6015 ns (0.99x, 0.98 to 1.00) | 6070 ns (1.00x, 0.99 to 1.08) | 6010 ns (0.99x, 0.98 to 1.00) | 5991 ns (0.99x, 0.98 to 1.03) |
| object: create | 42.40 µs | 41.74 µs (0.98x, 0.96 to 1.06) | 41.72 µs (0.98x, 0.93 to 1.03) | 43.51 µs (1.03x, 0.93 to 1.12) | 42.03 µs (0.99x, 0.94 to 1.01) |
| object: read | 2053 ns | 2069 ns (1.01x, 0.94 to 1.11) | 2070 ns (1.01x, 0.96 to 1.08) | 2021 ns (0.98x, 0.92 to 1.09) | 2180 ns (1.06x, 1.02 to 1.10) |
| object: write | 6234 ns | 6200 ns (0.99x, 0.94 to 1.08) | 6161 ns (0.99x, 0.94 to 1.08) | 6235 ns (1.00x, 0.94 to 1.19) | 6175 ns (0.99x, 0.94 to 1.11) |
| array: create | 30.72 µs | 31.34 µs (1.02x, 0.97 to 1.12) | 30.54 µs (0.99x, 0.94 to 1.07) | 30.94 µs (1.01x, 0.94 to 1.04) | 30.28 µs (0.99x, 0.96 to 1.02) |
| array: read | 2106 ns | 1987 ns (0.94x, 0.87 to 1.06) | 2221 ns (1.05x, 1.00 to 1.10) | 1960 ns (0.93x, 0.86 to 0.98) | 2134 ns (1.01x, 0.95 to 1.05) |
| array: write | 6250 ns | 6195 ns (0.99x, 0.67 to 1.06) | 6150 ns (0.98x, 0.65 to 1.00) | 6160 ns (0.99x, 0.67 to 1.02) | 6085 ns (0.97x, 0.65 to 1.00) |
| function: create | 19.48 µs | 20.09 µs (1.03x, 0.74 to 1.23) | 19.80 µs (1.02x, 0.75 to 1.11) | 19.99 µs (1.03x, 0.77 to 1.25) | 19.46 µs (1.00x, 0.77 to 1.04) |
| function: read | 2134 ns | 2107 ns (0.99x, 0.91 to 1.33) | 2071 ns (0.97x, 0.92 to 1.02) | 2157 ns (1.01x, 0.97 to 1.07) | 2105 ns (0.99x, 0.91 to 1.10) |
| function: write | 6211 ns | 6181 ns (1.00x, 0.98 to 1.02) | 6155 ns (0.99x, 0.97 to 1.01) | 6200 ns (1.00x, 0.98 to 1.04) | 6130 ns (0.99x, 0.97 to 1.04) |
| symbol: create | 19.82 µs | 19.64 µs (0.99x, 0.92 to 1.04) | 19.82 µs (1.00x, 0.91 to 1.04) | 20.13 µs (1.02x, 0.95 to 1.95) | 19.80 µs (1.00x, 0.93 to 1.17) |
| symbol: read | 1671 ns | 1636 ns (0.98x, 0.93 to 1.58) | 1640 ns (0.98x, 0.93 to 1.10) | 1659 ns (0.99x, 0.92 to 1.07) | 1620 ns (0.97x, 0.90 to 1.46) |
| symbol: write | 6210 ns | 6076 ns (0.98x, 0.94 to 1.00) | 6155 ns (0.99x, 0.96 to 1.11) | 6085 ns (0.98x, 0.94 to 0.99) | 6035 ns (0.97x, 0.96 to 1.00) |
| bigint: create | 20.13 µs | 20.05 µs (1.00x, 0.89 to 1.05) | 19.81 µs (0.98x, 0.93 to 1.35) | 19.93 µs (0.99x, 0.95 to 1.07) | 19.87 µs (0.99x, 0.94 to 1.06) |
| bigint: read | 4169 ns | 3930 ns (0.94x, 0.82 to 1.28) | 4484 ns (1.08x, 0.96 to 1.17) | 3865 ns (0.93x, 0.82 to 1.14) | 3830 ns (0.92x, 0.82 to 1.04) |
| bigint: write | 10.61 µs | 10.39 µs (0.98x, 0.92 to 1.02) | 10.43 µs (0.98x, 0.94 to 1.00) | 10.38 µs (0.98x, 0.93 to 0.99) | 10.21 µs (0.96x, 0.92 to 0.97) |
| all kinds mixed: create | 23.11 µs | 22.92 µs (0.99x, 0.95 to 1.03) | 22.81 µs (0.99x, 0.97 to 1.02) | 22.83 µs (0.99x, 0.93 to 1.03) | 22.85 µs (0.99x, 0.93 to 1.51) |
| all kinds mixed: read | 1850 ns | 1918 ns (1.04x, 0.96 to 1.12) | 1830 ns (0.99x, 0.96 to 1.02) | 1840 ns (0.99x, 0.88 to 1.55) | 1853 ns (1.00x, 0.92 to 1.13) |
| all kinds mixed: write | 6165 ns | 6110 ns (0.99x, 0.96 to 1.02) | 6125 ns (0.99x, 0.97 to 1.01) | 6126 ns (0.99x, 0.97 to 1.04) | 6115 ns (0.99x, 0.97 to 1.62) |
| string: read, after the first number | 2111 ns | 2151 ns (1.02x, 0.96 to 1.03) | 2181 ns (1.03x, 0.99 to 1.06) | 2151 ns (1.02x, 0.94 to 1.04) | 2233 ns (1.06x, 0.97 to 1.08) |
| boolean: read, after the first number | 1680 ns | 1663 ns (0.99x, 0.93 to 1.03) | 1706 ns (1.02x, 0.90 to 1.03) | 1680 ns (1.00x, 0.99 to 1.09) | 1668 ns (0.99x, 0.89 to 1.01) |
| undefined and null: read, after the first number | 1680 ns | 1678 ns (1.00x, 0.95 to 1.06) | 1686 ns (1.00x, 0.96 to 1.05) | 1680 ns (1.00x, 0.93 to 1.06) | 1672 ns (1.00x, 0.93 to 1.04) |
| object: read, after the first number | 2030 ns | 2086 ns (1.03x, 0.63 to 1.10) | 2099 ns (1.03x, 0.60 to 1.44) | 2067 ns (1.02x, 0.60 to 1.41) | 2137 ns (1.05x, 0.62 to 1.10) |
| array: read, after the first number | 2125 ns | 2061 ns (0.97x, 0.91 to 1.04) | 2206 ns (1.04x, 0.99 to 1.18) | 2108 ns (0.99x, 0.91 to 1.43) | 2175 ns (1.02x, 0.96 to 1.08) |
| function: read, after the first number | 2061 ns | 2050 ns (0.99x, 0.62 to 1.09) | 2184 ns (1.06x, 0.66 to 1.38) | 2060 ns (1.00x, 0.63 to 1.03) | 2172 ns (1.05x, 0.65 to 1.08) |
| symbol: read, after the first number | 1658 ns | 1626 ns (0.98x, 0.86 to 1.06) | 1696 ns (1.02x, 0.78 to 1.08) | 1620 ns (0.98x, 0.77 to 1.05) | 1666 ns (1.00x, 0.85 to 1.02) |
| bigint: read, after the first number | 4078 ns | 3830 ns (0.94x, 0.85 to 1.15) | 4548 ns (1.12x, 1.01 to 1.22) | 3835 ns (0.94x, 0.85 to 1.22) | 4374 ns (1.07x, 0.97 to 1.17) |

| extra time of 5,000 read loops after the first number | before | control | after | undefined-store | prime |
| --- | ---: | ---: | ---: | ---: | ---: |
| string | 2.35 ms | 2.88 ms | 19.33 µs | 3.09 ms | -63.98 µs |
| boolean | 2.88 ms | 2.77 ms | 122.99 µs | 3.40 ms | -69.53 µs |
| undefined and null | 3.40 ms | 3.59 ms | -225.74 µs | 3.90 ms | 1.20 ms |
| object | 15.95 ms | 16.24 ms | -1.01 ms | 15.54 ms | -1.14 ms |
| array | 3.46 ms | 2.83 ms | 328.60 µs | 4.16 ms | -263.83 µs |
| function | 3.22 ms | 1.10 ms | -827.24 µs | 2.27 ms | -379.35 µs |
| symbol | 3.15 ms | 2.70 ms | -24.14 µs | 2.71 ms | 794.63 µs |
| bigint | 2.95 ms | 3.08 ms | 337.22 µs | 3.32 ms | -872.81 µs |

- Median of 8 rounds. A time is the p50 from mitata for one pass over 1,000 tracked values.
- The ratio compares with "before". The range is the lowest and the highest ratio of one round.
- The extra time is the time of 5,000 read loops after one cell gets a number, minus the time of 5,000 read loops before it.
- node v26.10.0
