# ember-reactivity-bench

A benchmark of the reactivity of Ember against five signal libraries.

## Results

Each number is the time for one frame: the writes, then the flush.
alien-signals is the baseline for the ratios.

### propagate

<details>
<summary>What these cases measure</summary>

One signal feeds `w` chains of `h` computeds, and each chain has one output.
This graph is `benchs/propagate.mjs` from alien-signals.

Each frame writes the signal, so every computed and every output runs again.
These cases measure a full update: through one long chain, through many short chains, and through both.

</details>

| case | alien-signals | TC39 signal-polyfill | solid 1 | svelte 5 | signalium | ember: tracked() + createCache |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| propagate: 1 chains x 1 deep | 47 ns | 85 ns (1.8x) | 264 ns (5.6x) | 172 ns (3.7x) | 228 ns (4.8x) | 100 ns (2.1x) |
| propagate: 10 chains x 10 deep | 2.79 µs | 4.93 µs (1.8x) | 11.13 µs (4.0x) | 10.74 µs (3.8x) | 12.34 µs (4.4x) | 5.21 µs (1.9x) |
| propagate: 100 chains x 100 deep | 501.23 µs | 730.61 µs (1.5x) | 1.34 ms (2.7x) | 4.91 ms (9.8x) | 1.51 ms (3.0x) | 589.39 µs (1.2x) |
| propagate: 1 chains x 1000 deep | 24.05 µs | 43.55 µs (1.8x) | 111.20 µs (4.6x) | 4.65 ms (194x) | 128.63 µs (5.3x) | 50.11 µs (2.1x) |
| propagate: 1000 chains x 1 deep | 50.31 µs | 103.77 µs (2.1x) | 181.58 µs (3.6x) | 141.21 µs (2.8x) | 257.39 µs (5.1x) | 85.62 µs (1.7x) |
| weighted geometric mean | 1.0x | 1.8x | 4.0x | 9.4x | 4.5x | 1.8x |

### kairo

<details>
<summary>What these cases measure</summary>

Eight small graphs from the kairo benchmark, as js-reactivity-benchmark has them.
Each frame has one write. Each case measures one shape of graph.

| case | graph |
| --- | --- |
| avoidable propagation | A chain of 5 computeds. The second one always returns `0`, so a library with an equality check on computeds can stop there. Ember has that check only on signals. |
| broad propagation | 50 chains of 2 computeds read one signal. Each chain has one output. |
| deep propagation | One chain of 50 computeds, with one output. |
| diamond | 5 computeds read one signal, and one computed adds them. |
| mux | One computed puts 100 signals in an array. For each element, a chain of 2 computeds reads it. A frame changes one signal. |
| repeated observers | One computed reads the same signal 30 times. |
| triangle | A chain of 10 computeds. One more computed adds the signal and the first 9. |
| unstable | One computed reads one of two computeds. The write changes which one, so the dependencies change in each frame. |

</details>

| case | alien-signals | TC39 signal-polyfill | solid 1 | svelte 5 | signalium | ember: tracked() + createCache |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| kairo: avoidable propagation | 72 ns | 111 ns (1.5x) | 326 ns (4.5x) | 193 ns (2.7x) | 506 ns (7.0x) | 318 ns (4.4x) |
| kairo: broad propagation | 3.64 µs | 6.63 µs (1.8x) | 14.06 µs (3.9x) | 11.61 µs (3.2x) | 16.58 µs (4.6x) | 6.38 µs (1.8x) |
| kairo: deep propagation | 1.10 µs | 1.85 µs (1.7x) | 5.54 µs (5.0x) | 11.98 µs (11x) | 5.81 µs (5.3x) | 2.50 µs (2.3x) |
| kairo: diamond | 164 ns | 338 ns (2.1x) | 844 ns (5.1x) | 636 ns (3.9x) | 940 ns (5.7x) | 361 ns (2.2x) |
| kairo: mux | 5.64 µs | 23.25 µs (4.1x) | 17.96 µs (3.2x) | 220.94 µs (39x) | 29.90 µs (5.3x) | 17.81 µs (3.2x) |
| kairo: repeated observers | 98 ns | 598 ns (6.1x) | 522 ns (5.3x) | 442 ns (4.5x) | 384 ns (3.9x) | 343 ns (3.5x) |
| kairo: triangle | 293 ns | 571 ns (2.0x) | 1.34 µs (4.6x) | 1.74 µs (5.9x) | 1.67 µs (5.7x) | 634 ns (2.2x) |
| kairo: unstable | 291 ns | 831 ns (2.9x) | 898 ns (3.1x) | 883 ns (3.0x) | 791 ns (2.7x) | 490 ns (1.7x) |
| weighted geometric mean | 1.0x | 2.5x | 4.3x | 5.7x | 4.9x | 2.5x |

### rows

<details>
<summary>What these cases measure</summary>

A list of 1000 rows, as a template renders it.
Each row has one signal, one computed and one output.

- `write 1` changes one row. It measures a frame where almost nothing changed: the frame visits 1000 outputs, and 999 of them are not stale.
- `write all` changes every row. It measures 1000 independent updates in one frame.

</details>

| case | alien-signals | TC39 signal-polyfill | solid 1 | svelte 5 | signalium | ember: tracked() + createCache |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| rows: 1000 rows, write 1 | 5.83 µs | 138.68 µs (24x) | 9.84 µs (1.7x) | 70.44 µs (12x) | 3.02 µs (0.5x) | 6.78 µs (1.2x) |
| rows: 1000 rows, write all | 60.03 µs | 117.19 µs (2.0x) | 241.64 µs (4.0x) | 180.53 µs (3.0x) | 305.36 µs (5.1x) | 106.32 µs (1.8x) |
| weighted geometric mean | 1.0x | 6.8x | 2.6x | 6.0x | 1.6x | 1.4x |

### writes

<details>
<summary>What these cases measure</summary>

Two cases about the write itself.

- `batch: 10 writes, 1 output`: one computed adds 10 signals, and one output reads it. A frame writes all 10 signals. It measures many writes that end in one output.
- `avoidable: write the same value`: a frame writes the value that the signal has already. It measures the equality check of the signal. A library that has one starts no work.

</details>

| case | alien-signals | TC39 signal-polyfill | solid 1 | svelte 5 | signalium | ember: tracked() + createCache |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| batch: 10 writes, 1 output | 225 ns | 373 ns (1.7x) | 962 ns (4.3x) | 601 ns (2.7x) | 909 ns (4.0x) | 570 ns (2.5x) |
| avoidable: write the same value | 9 ns | 24 ns (2.8x) | 30 ns (3.5x) | 58 ns (6.6x) | 10 ns (1.1x) | 5 ns (0.6x) |
| weighted geometric mean | 1.0x | 2.1x | 3.8x | 4.2x | 2.1x | 1.2x |

### create

<details>
<summary>What these cases measure</summary>

The time to build a graph. No frame runs.
Each iteration builds a new graph, and the previous graph becomes garbage.

- `1000 signals`
- `1000 computeds, read each`: each computed reads one shared signal, and the case reads each computed one time.
- `1000 outputs`: each output reads one shared signal.

</details>

| case | alien-signals | TC39 signal-polyfill | solid 1 | svelte 5 | signalium | ember: tracked() + createCache |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| create: 1000 signals | 3.35 µs | 94.64 µs (28x) | 6.15 µs (1.8x) | 3.65 µs (1.1x) | 15.35 µs (4.6x) | 12.71 µs (3.8x) |
| create: 1000 computeds, read each | 24.52 µs | 162.20 µs (6.6x) | 59.83 µs (2.4x) | 60.57 µs (2.5x) | 623.73 µs (25x) | 37.79 µs (1.5x) |
| create: 1000 outputs | 31.37 µs | 194.18 µs (6.2x) | 62.03 µs (2.0x) | 64.72 µs (2.1x) | 653.68 µs (21x) | 43.39 µs (1.4x) |
| weighted geometric mean | 1.0x | 10x | 2.1x | 1.8x | 13x | 2.0x |

### All groups

|  | alien-signals | TC39 signal-polyfill | solid 1 | svelte 5 | signalium | ember: tracked() + createCache |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| weighted geometric mean | 1.0x | 3.7x | 3.2x | 4.8x | 4.0x | 1.7x |

- Time for the writes of one frame and the flush of that frame. Median of 6 rounds of the p50 from mitata.
- The ratio in parentheses compares with "alien-signals". A ratio above 1 is slower.
- The weighted geometric mean is the mean of the ratios. Each group of cases has the same total weight.
- Largest difference between rounds for one cell: 41% (batch: 10 writes, 1 output, signalium).
- alien-signals 3.2.1, signal-polyfill 0.2.2, solid-js 1.9.15, svelte 5.57.1, signalium 3.0.3, ember-source 7.3.0, node v24.20.0, AMD Ryzen 9 7900X 12-Core Processor.

This run is from 2026-10-02, with `pnpm bench --rounds=6`.

## Use

```bash
pnpm install
pnpm verify
pnpm bench
```

`pnpm bench` prints a table that compares the reactivity of Ember with five signal libraries.
It takes about 10 minutes.

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

| adapter | library | signal | computed and output |
| --- | --- | --- | --- |
| `alien-signals` | [alien-signals](https://github.com/stackblitz/alien-signals) | `signal` | `computed` |
| `signal-polyfill` | [TC39 signals polyfill](https://github.com/proposal-signals/signal-polyfill) | `Signal.State` | `Signal.Computed` |
| `solid` | [Solid 1](https://www.solidjs.com) | `createSignal` | `createMemo` |
| `svelte` | [Svelte 5](https://svelte.dev) | `state` | `derived` |
| `signalium` | [Signalium](https://github.com/Signalium/signalium) | `signal` | `reactiveSignal` |
| `ember-tags` | Ember | `createTag` | `createCache` |
| `ember-tracked` | Ember | `tracked(value)` | `createCache` |

Ember requests the frame in `scheduleRevalidate`.
For the other libraries, the write function of the adapter requests the frame.

Two libraries do not fit this model fully:

- A memo of Solid 1 is not lazy. The writes of one frame run in `batch()`, and the memos run at the end of that batch. The frame then only reads them.
- Svelte has a slower path for a derived that no effect reads. All deriveds in this benchmark use that path. The adapter uses `svelte/internal/client`, because runes need the compiler.

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
- `--ember-source` is a folder with a `dist/prod`: an ember.js checkout after `pnpm build`, or an unpacked tarball. With a list of folders, each Ember adapter gets one column for each folder.

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

- A case is one `add()` call in `cases.mjs`. The text before the colon in its name is its group. `describe()` holds the text that the table shows for a group.
- An adapter is one file in `adapters/`, with its name in `adapters/index.mjs`.

Run `pnpm verify` after each change.

## Saved runs

Each run saves a table and the raw numbers in `results/`.

```bash
pnpm bench --from=results/readme.json
pnpm bench --from=results/readme.json --explain --adapters=alien-signals,ember-tracked
```

- `--from` prints the table of a saved run again, and measures nothing.
- `--explain` prints one table for each group, with the text of the group and the mean of the group. The tables at the top come from this.
- With `--from`, `--adapters` selects the columns.

`results/readme.json` is the run at the top. This is the same run in one table, with the `ember-tags` adapter:

| case | alien-signals | TC39 signal-polyfill | solid 1 | svelte 5 | signalium | ember: tags | ember: tracked() + createCache |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| propagate: 1 chains x 1 deep | 47 ns | 85 ns (1.8x) | 264 ns (5.6x) | 172 ns (3.7x) | 228 ns (4.8x) | 97 ns (2.1x) | 100 ns (2.1x) |
| propagate: 10 chains x 10 deep | 2.79 µs | 4.93 µs (1.8x) | 11.13 µs (4.0x) | 10.74 µs (3.8x) | 12.34 µs (4.4x) | 5.17 µs (1.9x) | 5.21 µs (1.9x) |
| propagate: 100 chains x 100 deep | 501.23 µs | 730.61 µs (1.5x) | 1.34 ms (2.7x) | 4.91 ms (9.8x) | 1.51 ms (3.0x) | 586.85 µs (1.2x) | 589.39 µs (1.2x) |
| propagate: 1 chains x 1000 deep | 24.05 µs | 43.55 µs (1.8x) | 111.20 µs (4.6x) | 4.65 ms (194x) | 128.63 µs (5.3x) | 50.25 µs (2.1x) | 50.11 µs (2.1x) |
| propagate: 1000 chains x 1 deep | 50.31 µs | 103.77 µs (2.1x) | 181.58 µs (3.6x) | 141.21 µs (2.8x) | 257.39 µs (5.1x) | 84.71 µs (1.7x) | 85.62 µs (1.7x) |
| kairo: avoidable propagation | 72 ns | 111 ns (1.5x) | 326 ns (4.5x) | 193 ns (2.7x) | 506 ns (7.0x) | 320 ns (4.4x) | 318 ns (4.4x) |
| kairo: broad propagation | 3.64 µs | 6.63 µs (1.8x) | 14.06 µs (3.9x) | 11.61 µs (3.2x) | 16.58 µs (4.6x) | 6.43 µs (1.8x) | 6.38 µs (1.8x) |
| kairo: deep propagation | 1.10 µs | 1.85 µs (1.7x) | 5.54 µs (5.0x) | 11.98 µs (11x) | 5.81 µs (5.3x) | 2.52 µs (2.3x) | 2.50 µs (2.3x) |
| kairo: diamond | 164 ns | 338 ns (2.1x) | 844 ns (5.1x) | 636 ns (3.9x) | 940 ns (5.7x) | 355 ns (2.2x) | 361 ns (2.2x) |
| kairo: mux | 5.64 µs | 23.25 µs (4.1x) | 17.96 µs (3.2x) | 220.94 µs (39x) | 29.90 µs (5.3x) | 17.53 µs (3.1x) | 17.81 µs (3.2x) |
| kairo: repeated observers | 98 ns | 598 ns (6.1x) | 522 ns (5.3x) | 442 ns (4.5x) | 384 ns (3.9x) | 252 ns (2.6x) | 343 ns (3.5x) |
| kairo: triangle | 293 ns | 571 ns (2.0x) | 1.34 µs (4.6x) | 1.74 µs (5.9x) | 1.67 µs (5.7x) | 625 ns (2.1x) | 634 ns (2.2x) |
| kairo: unstable | 291 ns | 831 ns (2.9x) | 898 ns (3.1x) | 883 ns (3.0x) | 791 ns (2.7x) | 444 ns (1.5x) | 490 ns (1.7x) |
| rows: 1000 rows, write 1 | 5.83 µs | 138.68 µs (24x) | 9.84 µs (1.7x) | 70.44 µs (12x) | 3.02 µs (0.5x) | 6.74 µs (1.2x) | 6.78 µs (1.2x) |
| rows: 1000 rows, write all | 60.03 µs | 117.19 µs (2.0x) | 241.64 µs (4.0x) | 180.53 µs (3.0x) | 305.36 µs (5.1x) | 92.44 µs (1.5x) | 106.32 µs (1.8x) |
| batch: 10 writes, 1 output | 225 ns | 373 ns (1.7x) | 962 ns (4.3x) | 601 ns (2.7x) | 909 ns (4.0x) | 500 ns (2.2x) | 570 ns (2.5x) |
| avoidable: write the same value | 9 ns | 24 ns (2.8x) | 30 ns (3.5x) | 58 ns (6.6x) | 10 ns (1.1x) | 1 ns (0.1x) | 5 ns (0.6x) |
| create: 1000 signals | 3.35 µs | 94.64 µs (28x) | 6.15 µs (1.8x) | 3.65 µs (1.1x) | 15.35 µs (4.6x) | 3.89 µs (1.2x) | 12.71 µs (3.8x) |
| create: 1000 computeds, read each | 24.52 µs | 162.20 µs (6.6x) | 59.83 µs (2.4x) | 60.57 µs (2.5x) | 623.73 µs (25x) | 35.42 µs (1.4x) | 37.79 µs (1.5x) |
| create: 1000 outputs | 31.37 µs | 194.18 µs (6.2x) | 62.03 µs (2.0x) | 64.72 µs (2.1x) | 653.68 µs (21x) | 43.68 µs (1.4x) | 43.39 µs (1.4x) |
| weighted geometric mean | 1.0x | 3.7x | 3.2x | 4.8x | 4.0x | 1.3x | 1.7x |

## Research

`research/` has the experiments that this benchmark made possible.
Start with [how the validator of Ember can get faster](./research/validator-speed/README.md).
