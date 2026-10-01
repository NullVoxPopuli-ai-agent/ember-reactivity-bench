# ember-reactivity-bench

| case | alien-signals | ember: tracked() + createCache |
| --- | ---: | ---: |
| propagate: 1 chains x 1 deep | 47 ns | 101 ns (2.1x) |
| propagate: 10 chains x 10 deep | 2.76 µs | 5.31 µs (1.9x) |
| propagate: 100 chains x 100 deep | 482.35 µs | 615.70 µs (1.3x) |
| propagate: 1 chains x 1000 deep | 24.88 µs | 51.88 µs (2.1x) |
| propagate: 1000 chains x 1 deep | 50.30 µs | 87.31 µs (1.7x) |
| kairo: avoidable propagation | 73 ns | 330 ns (4.5x) |
| kairo: broad propagation | 3.72 µs | 6.50 µs (1.7x) |
| kairo: deep propagation | 1.13 µs | 2.53 µs (2.2x) |
| kairo: diamond | 167 ns | 369 ns (2.2x) |
| kairo: mux | 5.81 µs | 17.95 µs (3.1x) |
| kairo: repeated observers | 98 ns | 343 ns (3.5x) |
| kairo: triangle | 298 ns | 651 ns (2.2x) |
| kairo: unstable | 287 ns | 506 ns (1.8x) |
| rows: 1000 rows, write 1 | 5.89 µs | 6.81 µs (1.2x) |
| rows: 1000 rows, write all | 60.91 µs | 105.49 µs (1.7x) |
| batch: 10 writes, 1 output | 225 ns | 564 ns (2.5x) |
| avoidable: write the same value | 9 ns | 5 ns (0.6x) |
| create: 1000 signals | 3.33 µs | 12.74 µs (3.8x) |
| create: 1000 computeds, read each | 24.30 µs | 38.29 µs (1.6x) |
| create: 1000 outputs | 30.43 µs | 44.42 µs (1.5x) |

- Time for the writes of one frame and the flush of that frame. Median of 6 rounds of the p50 from mitata.
- The ratio in parentheses compares with "alien-signals". A ratio above 1 is slower.
- Largest difference between rounds for one cell: 33% (create: 1000 signals, ember: tracked() + createCache).
- ember-source 7.3.0, alien-signals 3.2.1, node v24.20.0, AMD Ryzen 9 7900X 12-Core Processor.
- This run is from 2026-10-01, with `pnpm bench --rounds=6`.

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
| `ember-tracked` | `tracked(value)` | `createCache` | `createCache` | `scheduleRevalidate` |

Each adapter gives the cases the objects of the library itself.
No wrapper class sits between a case and the library.

`createCache` is the function that `@cached` calls for each instance.
`@cached` itself needs a class with a getter, so it is not in this benchmark.

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

This table is the same run as the table at the top, with the `ember-tags` adapter:

| case | alien-signals | ember: tags | ember: tracked() + createCache |
| --- | ---: | ---: | ---: |
| propagate: 1 chains x 1 deep | 47 ns | 97 ns (2.0x) | 101 ns (2.1x) |
| propagate: 10 chains x 10 deep | 2.76 µs | 5.20 µs (1.9x) | 5.31 µs (1.9x) |
| propagate: 100 chains x 100 deep | 482.35 µs | 598.41 µs (1.2x) | 615.70 µs (1.3x) |
| propagate: 1 chains x 1000 deep | 24.88 µs | 51.47 µs (2.1x) | 51.88 µs (2.1x) |
| propagate: 1000 chains x 1 deep | 50.30 µs | 89.48 µs (1.8x) | 87.31 µs (1.7x) |
| kairo: avoidable propagation | 73 ns | 328 ns (4.5x) | 330 ns (4.5x) |
| kairo: broad propagation | 3.72 µs | 6.48 µs (1.7x) | 6.50 µs (1.7x) |
| kairo: deep propagation | 1.13 µs | 2.49 µs (2.2x) | 2.53 µs (2.2x) |
| kairo: diamond | 167 ns | 368 ns (2.2x) | 369 ns (2.2x) |
| kairo: mux | 5.81 µs | 18.15 µs (3.1x) | 17.95 µs (3.1x) |
| kairo: repeated observers | 98 ns | 256 ns (2.6x) | 343 ns (3.5x) |
| kairo: triangle | 298 ns | 631 ns (2.1x) | 651 ns (2.2x) |
| kairo: unstable | 287 ns | 446 ns (1.6x) | 506 ns (1.8x) |
| rows: 1000 rows, write 1 | 5.89 µs | 6.86 µs (1.2x) | 6.81 µs (1.2x) |
| rows: 1000 rows, write all | 60.91 µs | 93.69 µs (1.5x) | 105.49 µs (1.7x) |
| batch: 10 writes, 1 output | 225 ns | 510 ns (2.3x) | 564 ns (2.5x) |
| avoidable: write the same value | 9 ns | 1 ns (0.1x) | 5 ns (0.6x) |
| create: 1000 signals | 3.33 µs | 3.86 µs (1.2x) | 12.74 µs (3.8x) |
| create: 1000 computeds, read each | 24.30 µs | 35.37 µs (1.5x) | 38.29 µs (1.6x) |
| create: 1000 outputs | 30.43 µs | 42.36 µs (1.4x) | 44.42 µs (1.5x) |

Time for the writes of one frame and the flush of that frame. Median of 6 rounds of the p50 from mitata.
The ratio in parentheses compares with "alien-signals". A ratio above 1 is slower.
Largest difference between rounds for one cell: 33% (create: 1000 signals, ember: tracked() + createCache).
ember-source 7.3.0, alien-signals 3.2.1, node v24.20.0, AMD Ryzen 9 7900X 12-Core Processor.

In "kairo: avoidable propagation", each write has a new value, and a computed in the middle of the graph always returns `0`.
alien-signals stops at that computed.
Ember runs the computeds after it again, because the equality check of Ember is on the signal and not on `createCache`.
