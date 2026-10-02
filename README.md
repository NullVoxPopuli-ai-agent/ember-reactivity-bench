# ember-reactivity-bench

A benchmark of the reactivity of Ember against four signal libraries.

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

| case | alien-signals | TC39 signal-polyfill | solid 1 | svelte 5 | ember: tracked() + createCache |
| --- | ---: | ---: | ---: | ---: | ---: |
| propagate: 1 chains x 1 deep | 46 ns | 84 ns (1.8x) | 275 ns (5.9x) | 166 ns (3.6x) | 98 ns (2.1x) |
| propagate: 10 chains x 10 deep | 2.69 µs | 4.94 µs (1.8x) | 10.97 µs (4.1x) | 10.63 µs (4.0x) | 5.17 µs (1.9x) |
| propagate: 100 chains x 100 deep | 484.18 µs | 734.46 µs (1.5x) | 1.44 ms (3.0x) | 4.99 ms (10x) | 591.25 µs (1.2x) |
| propagate: 1 chains x 1000 deep | 23.75 µs | 42.45 µs (1.8x) | 109.58 µs (4.6x) | 4.58 ms (193x) | 50.58 µs (2.1x) |
| propagate: 1000 chains x 1 deep | 48.23 µs | 101.47 µs (2.1x) | 178.92 µs (3.7x) | 137.16 µs (2.8x) | 86.92 µs (1.8x) |
| weighted geometric mean | 1.0x | 1.8x | 4.2x | 9.6x | 1.8x |

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

| case | alien-signals | TC39 signal-polyfill | solid 1 | svelte 5 | ember: tracked() + createCache |
| --- | ---: | ---: | ---: | ---: | ---: |
| kairo: avoidable propagation | 71 ns | 111 ns (1.6x) | 314 ns (4.4x) | 194 ns (2.7x) | 329 ns (4.6x) |
| kairo: broad propagation | 3.64 µs | 6.45 µs (1.8x) | 13.51 µs (3.7x) | 11.26 µs (3.1x) | 6.39 µs (1.8x) |
| kairo: deep propagation | 1.10 µs | 1.82 µs (1.7x) | 5.55 µs (5.0x) | 11.77 µs (11x) | 2.44 µs (2.2x) |
| kairo: diamond | 161 ns | 346 ns (2.2x) | 826 ns (5.1x) | 622 ns (3.9x) | 362 ns (2.3x) |
| kairo: mux | 5.75 µs | 22.86 µs (4.0x) | 18.11 µs (3.1x) | 218.36 µs (38x) | 17.47 µs (3.0x) |
| kairo: repeated observers | 97 ns | 589 ns (6.1x) | 520 ns (5.4x) | 438 ns (4.5x) | 337 ns (3.5x) |
| kairo: triangle | 286 ns | 554 ns (1.9x) | 1.32 µs (4.6x) | 1.68 µs (5.9x) | 627 ns (2.2x) |
| kairo: unstable | 288 ns | 824 ns (2.9x) | 889 ns (3.1x) | 872 ns (3.0x) | 488 ns (1.7x) |
| weighted geometric mean | 1.0x | 2.5x | 4.2x | 5.7x | 2.5x |

### rows

<details>
<summary>What these cases measure</summary>

A list of 1000 rows, as a template renders it.
Each row has one signal, one computed and one output.

- `write 1` changes one row. It measures a frame where almost nothing changed: the frame visits 1000 outputs, and 999 of them are not stale.
- `write all` changes every row. It measures 1000 independent updates in one frame.

</details>

| case | alien-signals | TC39 signal-polyfill | solid 1 | svelte 5 | ember: tracked() + createCache |
| --- | ---: | ---: | ---: | ---: | ---: |
| rows: 1000 rows, write 1 | 5.68 µs | 139.97 µs (25x) | 9.80 µs (1.7x) | 69.47 µs (12x) | 6.63 µs (1.2x) |
| rows: 1000 rows, write all | 59.60 µs | 114.03 µs (1.9x) | 235.31 µs (3.9x) | 173.12 µs (2.9x) | 101.29 µs (1.7x) |
| weighted geometric mean | 1.0x | 6.9x | 2.6x | 6.0x | 1.4x |

### writes

<details>
<summary>What these cases measure</summary>

Two cases about the write itself.

- `batch: 10 writes, 1 output`: one computed adds 10 signals, and one output reads it. A frame writes all 10 signals. It measures many writes that end in one output.
- `avoidable: write the same value`: a frame writes the value that the signal has already. It measures the equality check of the signal. A library that has one starts no work.

</details>

| case | alien-signals | TC39 signal-polyfill | solid 1 | svelte 5 | ember: tracked() + createCache |
| --- | ---: | ---: | ---: | ---: | ---: |
| batch: 10 writes, 1 output | 220 ns | 363 ns (1.6x) | 953 ns (4.3x) | 577 ns (2.6x) | 556 ns (2.5x) |
| avoidable: write the same value | 8 ns | 24 ns (2.8x) | 30 ns (3.5x) | 57 ns (6.7x) | 5 ns (0.6x) |
| weighted geometric mean | 1.0x | 2.2x | 3.9x | 4.2x | 1.2x |

### create

<details>
<summary>What these cases measure</summary>

The time to build a graph. No frame runs.
Each iteration builds a new graph, and the previous graph becomes garbage.

- `1000 signals`
- `1000 computeds, read each`: each computed reads one shared signal, and the case reads each computed one time.
- `1000 outputs`: each output reads one shared signal.

</details>

| case | alien-signals | TC39 signal-polyfill | solid 1 | svelte 5 | ember: tracked() + createCache |
| --- | ---: | ---: | ---: | ---: | ---: |
| create: 1000 signals | 3.34 µs | 92.77 µs (28x) | 6.06 µs (1.8x) | 3.66 µs (1.1x) | 12.45 µs (3.7x) |
| create: 1000 computeds, read each | 23.94 µs | 158.65 µs (6.6x) | 58.27 µs (2.4x) | 59.63 µs (2.5x) | 37.28 µs (1.6x) |
| create: 1000 outputs | 33.91 µs | 193.79 µs (5.7x) | 61.18 µs (1.8x) | 63.45 µs (1.9x) | 46.91 µs (1.4x) |
| weighted geometric mean | 1.0x | 10x | 2.0x | 1.7x | 2.0x |

### All groups

|  | alien-signals | TC39 signal-polyfill | solid 1 | svelte 5 | ember: tracked() + createCache |
| --- | ---: | ---: | ---: | ---: | ---: |
| weighted geometric mean | 1.0x | 3.7x | 3.2x | 4.7x | 1.7x |

- Time for the writes of one frame and the flush of that frame. Median of 6 rounds of the p50 from mitata.
- The ratio in parentheses compares with "alien-signals". A ratio above 1 is slower.
- The weighted geometric mean is the mean of the ratios. Each group of cases has the same total weight.
- Largest difference between rounds for one cell: 40% (batch: 10 writes, 1 output, TC39 signal-polyfill).
- alien-signals 3.2.1, signal-polyfill 0.2.2, solid-js 1.9.15, svelte 5.57.1, ember-source 7.3.0, node v24.20.0, AMD Ryzen 9 7900X 12-Core Processor.

This run is from 2026-10-01, with `pnpm bench --rounds=6`.

## Use

```bash
pnpm install
pnpm verify
pnpm bench
```

`pnpm bench` prints a table that compares the reactivity of Ember with four signal libraries.
It takes about 9 minutes.

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

| case | alien-signals | TC39 signal-polyfill | solid 1 | svelte 5 | ember: tags | ember: tracked() + createCache |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| propagate: 1 chains x 1 deep | 46 ns | 84 ns (1.8x) | 275 ns (5.9x) | 166 ns (3.6x) | 98 ns (2.1x) | 98 ns (2.1x) |
| propagate: 10 chains x 10 deep | 2.69 µs | 4.94 µs (1.8x) | 10.97 µs (4.1x) | 10.63 µs (4.0x) | 5.28 µs (2.0x) | 5.17 µs (1.9x) |
| propagate: 100 chains x 100 deep | 484.18 µs | 734.46 µs (1.5x) | 1.44 ms (3.0x) | 4.99 ms (10x) | 585.59 µs (1.2x) | 591.25 µs (1.2x) |
| propagate: 1 chains x 1000 deep | 23.75 µs | 42.45 µs (1.8x) | 109.58 µs (4.6x) | 4.58 ms (193x) | 50.12 µs (2.1x) | 50.58 µs (2.1x) |
| propagate: 1000 chains x 1 deep | 48.23 µs | 101.47 µs (2.1x) | 178.92 µs (3.7x) | 137.16 µs (2.8x) | 85.28 µs (1.8x) | 86.92 µs (1.8x) |
| kairo: avoidable propagation | 71 ns | 111 ns (1.6x) | 314 ns (4.4x) | 194 ns (2.7x) | 317 ns (4.4x) | 329 ns (4.6x) |
| kairo: broad propagation | 3.64 µs | 6.45 µs (1.8x) | 13.51 µs (3.7x) | 11.26 µs (3.1x) | 6.38 µs (1.8x) | 6.39 µs (1.8x) |
| kairo: deep propagation | 1.10 µs | 1.82 µs (1.7x) | 5.55 µs (5.0x) | 11.77 µs (11x) | 2.46 µs (2.2x) | 2.44 µs (2.2x) |
| kairo: diamond | 161 ns | 346 ns (2.2x) | 826 ns (5.1x) | 622 ns (3.9x) | 354 ns (2.2x) | 362 ns (2.3x) |
| kairo: mux | 5.75 µs | 22.86 µs (4.0x) | 18.11 µs (3.1x) | 218.36 µs (38x) | 17.62 µs (3.1x) | 17.47 µs (3.0x) |
| kairo: repeated observers | 97 ns | 589 ns (6.1x) | 520 ns (5.4x) | 438 ns (4.5x) | 253 ns (2.6x) | 337 ns (3.5x) |
| kairo: triangle | 286 ns | 554 ns (1.9x) | 1.32 µs (4.6x) | 1.68 µs (5.9x) | 620 ns (2.2x) | 627 ns (2.2x) |
| kairo: unstable | 288 ns | 824 ns (2.9x) | 889 ns (3.1x) | 872 ns (3.0x) | 433 ns (1.5x) | 488 ns (1.7x) |
| rows: 1000 rows, write 1 | 5.68 µs | 139.97 µs (25x) | 9.80 µs (1.7x) | 69.47 µs (12x) | 6.79 µs (1.2x) | 6.63 µs (1.2x) |
| rows: 1000 rows, write all | 59.60 µs | 114.03 µs (1.9x) | 235.31 µs (3.9x) | 173.12 µs (2.9x) | 91.57 µs (1.5x) | 101.29 µs (1.7x) |
| batch: 10 writes, 1 output | 220 ns | 363 ns (1.6x) | 953 ns (4.3x) | 577 ns (2.6x) | 503 ns (2.3x) | 556 ns (2.5x) |
| avoidable: write the same value | 8 ns | 24 ns (2.8x) | 30 ns (3.5x) | 57 ns (6.7x) | 1 ns (0.1x) | 5 ns (0.6x) |
| create: 1000 signals | 3.34 µs | 92.77 µs (28x) | 6.06 µs (1.8x) | 3.66 µs (1.1x) | 3.81 µs (1.1x) | 12.45 µs (3.7x) |
| create: 1000 computeds, read each | 23.94 µs | 158.65 µs (6.6x) | 58.27 µs (2.4x) | 59.63 µs (2.5x) | 34.28 µs (1.4x) | 37.28 µs (1.6x) |
| create: 1000 outputs | 33.91 µs | 193.79 µs (5.7x) | 61.18 µs (1.8x) | 63.45 µs (1.9x) | 42.58 µs (1.3x) | 46.91 µs (1.4x) |
| weighted geometric mean | 1.0x | 3.7x | 3.2x | 4.7x | 1.3x | 1.7x |

## Research

`research/` has the experiments that this benchmark made possible.
Start with [how the validator of Ember can get faster](./research/validator-speed/README.md).
