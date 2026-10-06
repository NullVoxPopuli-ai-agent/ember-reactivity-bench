# The parts of Ember PR 21650, one at a time

```bash
pnpm bench --rounds=6 --adapters=ember-tracked --cpu=1 \
  --ember-source=<main>,<pool>,<reuse>,<loop>,<lazy>,<store>,<all>
```

Ember PR [21650](https://github.com/emberjs/ember.js/pull/21650) has five changes to `@glimmer/validator`.
Each change is also a branch of its own from `main` (`f693f240ee`).
This run has one column for each branch, so each change has its own numbers.

| column | branch | change |
| --- | --- | --- |
| tracker pool | `nvp/tracker-pool` | `beginTrackFrame` takes a tracker from a pool, with an array of tags |
| pool + tag reuse | `nvp/reuse-frame-tag` | `endTrackFrame(previous)` returns the last tag if the tags are the same. On top of the pool |
| index loop | `nvp/compute-indexed-loop` | index loop over the subtags of a combined tag |
| lazy functions | `nvp/tracked-value-lazy-functions` | a `TrackedValue` makes its bound functions on first use |
| store of 0 | `nvp/tracked-value-general-field` | the constructor of a `TrackedValue` stores `0` first |
| all five, PR 21650 | `nvp/tracking-frame-allocations` | the merge of the five branches |

The table is in [`results.md`](./results.md).

- The pool gives most of the gain: the weighted mean is 0.6x of `main`.
- The reuse of the tag adds to the pool where one computation reads many tags: `kairo: mux` and `batch`.
- The lazy functions make the create of a tracked value 0.5x.
- The index loop and the store of `0` are 1.0x here.
  The store of `0` has its own measurements in [`../tracked-value-field`](../tracked-value-field).

Each case of each column runs in its own process, pinned to one core, in 6 mirrored rounds.
