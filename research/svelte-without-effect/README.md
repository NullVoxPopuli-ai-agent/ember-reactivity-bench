# Why is Svelte slow in this benchmark?

```bash
node --stack-size=3000 research/svelte-without-effect/measure.mjs
```

A derived that no effect reads uses a slow path in Svelte 5.
This benchmark has no effects, so all its deriveds use that path.

## Result

One write to a signal, through a chain of deriveds. Svelte 5.57.1, 2026-10-02.

| chain | no effect | one effect reads the last derived |
| --- | ---: | ---: |
| 100 deriveds | 71.7 µs | 3.0 µs |
| 1000 deriveds | 4035.7 µs | 11.6 µs |

Without an effect, a chain that is 10 times longer needs 56 times more time.
With an effect, it needs 4 times more time.

## What this means for the result table

The Svelte column shows Svelte in the model of this benchmark: no effects, and one flush for each animation frame.
It does not show the speed of Svelte in an app, where effects read the deriveds.
