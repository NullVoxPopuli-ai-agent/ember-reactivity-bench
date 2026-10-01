# ember-reactivity-bench

```bash
pnpm install
pnpm verify
pnpm bench
```

`pnpm bench` prints a table that compares the reactivity of Ember with [alien-signals][alien].
It takes about 5 minutes.

[alien]: https://github.com/stackblitz/alien-signals

## What one measurement is

One measurement is one frame:

1. Write to one or more signals.
2. Run the animation frame, which brings every output up to date.

The graph is built before the measurement starts.
The `create:` cases are the exception. They measure the time to build a graph.

## Outputs, not effects

No adapter uses an effect.

An output is a cached computation that writes out of the reactive system, for example to the DOM.
The first write of a frame requests one animation frame.
The animation frame visits every output, and an output runs again only if it is stale.

| adapter | signal | computed | output | a write requests the frame through |
| --- | --- | --- | --- | --- |
| `alien-signals` | `signal` | `computed` | `computed` | the write function of the adapter |
| `ember-tags` | `createTag` | `createCache` | `createCache` | `scheduleRevalidate` |
| `ember-tracked` | `tracked(value)` | `@cached` | `createCache` | `scheduleRevalidate` |

All signals have an equality check.
A write of an equal value does not make the outputs stale.

Node has no `requestAnimationFrame`.
The benchmark installs one, and each measurement runs one frame.
The idle time between two frames is not in the measurement.

## Select what runs

```bash
pnpm bench --adapters=alien-signals,ember-tags
pnpm bench --case='kairo|rows'
pnpm bench --ember-source=../../OpenSource/emberjs/ember.js
```

- `--adapters` is a list of adapter names. The first one is the baseline for the ratios.
- `--case` is a regular expression for the case names.
- `--ember-source` is a folder with a `dist/prod`: an ember.js checkout after `pnpm build`, or an unpacked tarball.

## Control the noise

```bash
pnpm bench --rounds=8 --cpu=3 --min-cpu-ms=2000
```

- `--rounds` is the number of rounds. The default is 4.
- `--cpu` pins each process to one core with `taskset`.
- `--min-cpu-ms` is the minimum sample time for each case. The default is 1000.

Each case of each adapter runs in its own process.
The graphs of one case then cannot change how V8 compiles the next case.
The order of the adapters is mirrored between rounds.
The table shows the median of the rounds.
The line below the table shows the largest difference between rounds.
If that number is large, close other programs and run again.

## Make sure that the adapters do the same work

```bash
pnpm verify
```

For each case, all adapters must give the same values to their outputs.

## Add a case or an adapter

- A case is one `add()` call in `cases.mjs`.
- An adapter is one file in `adapters/`, with its name in `adapters/index.mjs`.

Run `pnpm verify` after each change.

## Results

Each run saves a table and the raw numbers in `results/`.

This table is from 2026-10-01, with `pnpm bench --rounds=6`:

| case | alien-signals | ember: tags | ember: tracked() + @cached |
| --- | ---: | ---: | ---: |
| propagate: 1 chains x 1 deep | 54 ns | 105 ns (1.9x) | 122 ns (2.3x) |
| propagate: 10 chains x 10 deep | 2.95 µs | 5.78 µs (2.0x) | 6.92 µs (2.3x) |
| propagate: 100 chains x 100 deep | 515.86 µs | 596.35 µs (1.2x) | 993.89 µs (1.9x) |
| propagate: 1 chains x 1000 deep | 24.42 µs | 56.17 µs (2.3x) | 66.99 µs (2.7x) |
| propagate: 1000 chains x 1 deep | 51.76 µs | 92.47 µs (1.8x) | 112.83 µs (2.2x) |
| kairo: avoidable propagation | 76 ns | 343 ns (4.5x) | 402 ns (5.3x) |
| kairo: broad propagation | 3.92 µs | 6.76 µs (1.7x) | 8.31 µs (2.1x) |
| kairo: deep propagation | 1.21 µs | 2.86 µs (2.4x) | 3.33 µs (2.7x) |
| kairo: diamond | 175 ns | 388 ns (2.2x) | 475 ns (2.7x) |
| kairo: mux | 5.84 µs | 18.80 µs (3.2x) | 22.70 µs (3.9x) |
| kairo: repeated observers | 104 ns | 271 ns (2.6x) | 308 ns (3.0x) |
| kairo: triangle | 324 ns | 669 ns (2.1x) | 900 ns (2.8x) |
| kairo: unstable | 306 ns | 469 ns (1.5x) | 695 ns (2.3x) |
| rows: 1000 rows, write 1 | 6.17 µs | 7.20 µs (1.2x) | 6.98 µs (1.1x) |
| rows: 1000 rows, write all | 64.63 µs | 99.37 µs (1.5x) | 135.73 µs (2.1x) |
| batch: 10 writes, 1 output | 244 ns | 528 ns (2.2x) | 609 ns (2.5x) |
| avoidable: write the same value | 9 ns | 1 ns (0.1x) | 5 ns (0.6x) |
| create: 1000 signals | 3.61 µs | 4.11 µs (1.1x) | 18.13 µs (5.0x) |
| create: 1000 computeds, read each | 28.73 µs | 40.02 µs (1.4x) | 357.06 µs (12x) |
| create: 1000 outputs | 36.06 µs | 44.88 µs (1.2x) | 47.71 µs (1.3x) |

Time for the writes of one frame and the flush of that frame. Median of 6 rounds of the p50 from mitata.
The ratio in parentheses compares with "alien-signals". A ratio above 1 is slower.
Largest difference between rounds for one cell: 40% (create: 1000 computeds, read each, ember: tracked() + @cached).
ember-source 7.3.0, alien-signals 3.2.1, node v24.20.0, AMD Ryzen 9 7900X 12-Core Processor.

In "kairo: avoidable propagation", each write has a new value, and a computed in the middle of the graph always returns `0`.
alien-signals stops at that computed.
Ember runs the computeds after it again, because the equality check of Ember is on the signal and not on `@cached`.
