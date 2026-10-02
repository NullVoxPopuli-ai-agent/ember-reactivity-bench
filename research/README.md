# Research

Each folder answers one question with this benchmark.
Each folder has the scripts and the raw numbers, so that you can run the experiment again.

| folder | question | answer |
| --- | --- | --- |
| [validator-speed](./validator-speed/README.md) | How can the validator of Ember get faster? | Three changes to the tracking frame and to `TrackedValue` make it about 2 times faster, and level with alien-signals. |
| [svelte-without-effect](./svelte-without-effect/README.md) | Why is Svelte slow in this benchmark? | A derived that no effect reads uses a slow path. A chain of 1000 deriveds needs 4036 µs without an effect, and 12 µs with one. |
