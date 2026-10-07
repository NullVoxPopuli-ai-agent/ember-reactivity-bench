import { frame } from './frame.mjs';

/**
 * Each case gets the functions of one adapter:
 *
 * - `signal(value)`, `read(signal)`, `write(signal, value)`
 * - `computed(fn)`, `get(computed)`
 * - `output(fn)`
 *
 * These work on the objects of the library itself.
 * No wrapper object sits between a case and the library.
 *
 * Each case builds a graph one time and returns:
 *
 * - `writes`: the writes of one frame. The measured part is the writes and the frame.
 * - `result`: the values that the outputs saw last
 *
 * A `create:` case returns `run` in place of `writes`, and no frame runs.
 *
 * If an adapter has a `batch` function, the writes of one frame run in it.
 * Solid needs this: without a batch, each write runs the memos at once.
 *
 * An output only stores the value that it reads.
 * `verify.mjs` compares these values between adapters.
 *
 * `constant` marks a case where the outputs see the same value after each frame.
 *
 * `group` is for the sections and the mean in the result table.
 * By default, it is the text before the colon in the name.
 *
 * `describe` gives the text that the result table shows for a group.
 */
export const cases = [];
export const groups = new Map();

function describe(group, text) {
  groups.set(group, text.trim());
}

function add(name, setup, options = {}) {
  cases.push({
    name,
    group: name.slice(0, name.indexOf(':')),
    ...options,
    setup(fw) {
      let { writes, run, result } = setup(fw);

      if (writes) {
        let { batch } = fw;

        run = batch
          ? () => {
              batch(writes);
              frame();
            }
          : () => {
              writes();
              frame();
            };
      }

      return { run, result };
    },
  });
}

describe(
  'propagate',
  `
One signal feeds \`w\` chains of \`h\` computeds, and each chain has one output.
This graph is \`benchs/propagate.mjs\` from alien-signals.

Each frame writes the signal, so every computed and every output runs again.
These cases measure a full update: through one long chain, through many short chains, and through both.
`
);

for (let [w, h] of [
  [1, 1],
  [10, 10],
  [100, 100],
  [1, 1000],
  [1000, 1],
]) {
  add(`propagate: ${w} chains x ${h} deep`, ({ signal, computed, read, write, get, output }) => {
    let src = signal(1);
    let out = new Array(w).fill(0);

    for (let i = 0; i < w; i++) {
      let last = computed(() => read(src) + 1);

      for (let j = 1; j < h; j++) {
        let prev = last;

        last = computed(() => get(prev) + 1);
      }

      let leaf = last;

      output(() => {
        out[i] = get(leaf);
      });
    }

    let n = 1;

    return { writes: () => write(src, ++n), result: () => out };
  });
}

describe(
  'kairo',
  `
Eight small graphs from the kairo benchmark, as js-reactivity-benchmark has them.
Each frame has one write. Each case measures one shape of graph.

| case | graph |
| --- | --- |
| avoidable propagation | A chain of 5 computeds. The second one always returns \`0\`, so a library with an equality check on computeds can stop there. Ember has that check only on signals. |
| broad propagation | 50 chains of 2 computeds read one signal. Each chain has one output. |
| deep propagation | One chain of 50 computeds, with one output. |
| diamond | 5 computeds read one signal, and one computed adds them. |
| mux | One computed puts 100 signals in an array. For each element, a chain of 2 computeds reads it. A frame changes one signal. |
| repeated observers | One computed reads the same signal 30 times. |
| triangle | A chain of 10 computeds. One more computed adds the signal and the first 9. |
| unstable | One computed reads one of two computeds. The write changes which one, so the dependencies change in each frame. |
`
);

add(
  'kairo: avoidable propagation',
  ({ signal, computed, read, write, get, output }) => {
    let head = signal(0);
    let c1 = computed(() => read(head));
    let c2 = computed(() => (get(c1), 0));
    let c3 = computed(() => get(c2) + 1);
    let c4 = computed(() => get(c3) + 2);
    let c5 = computed(() => get(c4) + 3);
    let out = [0];

    output(() => {
      out[0] = get(c5);
    });

    let n = 0;

    return { writes: () => write(head, ++n), result: () => out };
  },
  { constant: true }
);

add('kairo: broad propagation', ({ signal, computed, read, write, get, output }) => {
  let head = signal(0);
  let out = new Array(50).fill(0);

  for (let i = 0; i < 50; i++) {
    let current = computed(() => read(head) + i);
    let current2 = computed(() => get(current) + 1);

    output(() => {
      out[i] = get(current2);
    });
  }

  let n = 0;

  return { writes: () => write(head, ++n), result: () => out };
});

add('kairo: deep propagation', ({ signal, computed, read, write, get, output }) => {
  let head = signal(0);
  let current = computed(() => read(head) + 1);

  for (let i = 1; i < 50; i++) {
    let c = current;

    current = computed(() => get(c) + 1);
  }

  let out = [0];

  output(() => {
    out[0] = get(current);
  });

  let n = 0;

  return { writes: () => write(head, ++n), result: () => out };
});

add('kairo: diamond', ({ signal, computed, read, write, get, output }) => {
  let head = signal(0);
  let branches = [];

  for (let i = 0; i < 5; i++) {
    branches.push(computed(() => read(head) + 1));
  }

  let total = computed(() => {
    let result = 0;

    for (let i = 0; i < branches.length; i++) {
      result += get(branches[i]);
    }

    return result;
  });
  let out = [0];

  output(() => {
    out[0] = get(total);
  });

  let n = 0;

  return { writes: () => write(head, ++n), result: () => out };
});

add('kairo: mux', ({ signal, computed, read, write, get, output }) => {
  let heads = [];

  for (let i = 0; i < 100; i++) {
    heads.push(signal(0));
  }

  let mux = computed(() => heads.map((h) => read(h)));
  let out = new Array(100).fill(0);

  for (let i = 0; i < 100; i++) {
    let split = computed(() => get(mux)[i]);
    let plusOne = computed(() => get(split) + 1);

    output(() => {
      out[i] = get(plusOne);
    });
  }

  let n = 0;
  let next = () => {
    n++;
    write(heads[n % 100], n);
  };

  return { writes: next, result: () => out };
});

add('kairo: repeated observers', ({ signal, computed, read, write, get, output }) => {
  let head = signal(0);
  let current = computed(() => {
    let result = 0;

    for (let i = 0; i < 30; i++) {
      result += read(head);
    }

    return result;
  });
  let out = [0];

  output(() => {
    out[0] = get(current);
  });

  let n = 0;

  return { writes: () => write(head, ++n), result: () => out };
});

add('kairo: triangle', ({ signal, computed, read, write, get, output }) => {
  let head = signal(0);
  let current = computed(() => read(head) + 1);
  let list = [];

  for (let i = 1; i < 10; i++) {
    let c = current;

    list.push(c);
    current = computed(() => get(c) + 1);
  }

  let total = computed(() => {
    let result = read(head);

    for (let i = 0; i < list.length; i++) {
      result += get(list[i]);
    }

    return result;
  });
  let out = [0];

  output(() => {
    out[0] = get(total);
  });

  let n = 0;

  return { writes: () => write(head, ++n), result: () => out };
});

add('kairo: unstable', ({ signal, computed, read, write, get, output }) => {
  let head = signal(0);
  let double = computed(() => read(head) * 2);
  let inverse = computed(() => -read(head));
  let current = computed(() => {
    let result = 0;

    for (let i = 0; i < 20; i++) {
      result += read(head) % 2 ? get(double) : get(inverse);
    }

    return result;
  });
  let out = [0];

  output(() => {
    out[0] = get(current);
  });

  let n = 0;

  return { writes: () => write(head, ++n), result: () => out };
});

describe(
  'rows',
  `
A list of 1000 rows, as a template renders it.
Each row has one signal, one computed and one output.

- \`write 1\` changes one row. It measures a frame where almost nothing changed: the frame visits 1000 outputs, and 999 of them are not stale.
- \`write all\` changes every row. It measures 1000 independent updates in one frame.
`
);

function rows({ signal, computed, read, get, output }) {
  let cells = [];
  let out = new Array(1000).fill(0);

  for (let i = 0; i < 1000; i++) {
    let cell = signal(i);
    let doubled = computed(() => read(cell) * 2);

    cells.push(cell);
    output(() => {
      out[i] = get(doubled);
    });
  }

  return { cells, out };
}

add('rows: 1000 rows, write 1', (fw) => {
  let { write } = fw;
  let { cells, out } = rows(fw);
  let n = 0;
  let next = () => {
    n++;
    write(cells[n % 1000], -n);
  };

  return { writes: next, result: () => out };
});

add('rows: 1000 rows, write all', (fw) => {
  let { write } = fw;
  let { cells, out } = rows(fw);
  let n = 0;
  let next = () => {
    n++;

    for (let i = 0; i < 1000; i++) {
      write(cells[i], n + i);
    }
  };

  return { writes: next, result: () => out };
});

describe(
  'writes',
  `
Two cases about the write itself.

- \`batch: 10 writes, 1 output\`: one computed adds 10 signals, and one output reads it. A frame writes all 10 signals. It measures many writes that end in one output.
- \`avoidable: write the same value\`: a frame writes the value that the signal has already. It measures the equality check of the signal. A library that has one starts no work.
`
);

add(
  'batch: 10 writes, 1 output',
  ({ signal, computed, read, write, get, output }) => {
    let cells = [];

    for (let i = 0; i < 10; i++) {
      cells.push(signal(i));
    }

    let total = computed(() => {
      let result = 0;

      for (let i = 0; i < cells.length; i++) {
        result += read(cells[i]);
      }

      return result;
    });
    let out = [0];

    output(() => {
      out[0] = get(total);
    });

    let n = 0;
    let next = () => {
      n++;

      for (let i = 0; i < 10; i++) {
        write(cells[i], n + i);
      }
    };

    return { writes: next, result: () => out };
  },
  { group: 'writes' }
);

add(
  'avoidable: write the same value',
  ({ signal, computed, read, write, get, output }) => {
    let head = signal(1);
    let current = computed(() => read(head) + 1);

    for (let i = 1; i < 5; i++) {
      let c = current;

      current = computed(() => get(c) + 1);
    }

    let out = [0];

    output(() => {
      out[0] = get(current);
    });

    return { writes: () => write(head, 1), result: () => out };
  },
  { constant: true, group: 'writes' }
);

describe(
  'create',
  `
The time to build a graph. No frame runs.
Each iteration builds a new graph, and the previous graph becomes garbage.

- \`1000 signals\`
- \`1000 computeds, read each\`: each computed reads one shared signal, and the case reads each computed one time.
- \`1000 outputs\`: each output reads one shared signal.
`
);

add('create: 1000 signals', ({ signal, read }) => {
  let out = [0];

  function run() {
    let last;

    for (let i = 0; i < 1000; i++) {
      last = signal(i);
    }

    out[0] = read(last);
  }

  return { run, result: () => out };
});

add('create: 1000 computeds, read each', ({ signal, computed, read, get }) => {
  let out = [0];

  function run() {
    let src = signal(1);
    let total = 0;

    for (let i = 0; i < 1000; i++) {
      total += get(computed(() => read(src) + i));
    }

    out[0] = total;
  }

  return { run, result: () => out };
});

add('create: 1000 outputs', ({ signal, read, output, reset }) => {
  let out = [0];

  function run() {
    reset();

    let src = signal(1);
    let total = 0;

    for (let i = 0; i < 1000; i++) {
      output(() => {
        total += read(src) + i;
      });
    }

    out[0] = total;
  }

  return { run, result: () => out };
});

describe(
  'wide',
  `
One computed reads many signals, and one output reads the computed.
In Ember, such a computed is a \`@cached\` getter that reads many tracked values.

- \`same signals\`: the computed adds \`n\` signals. A frame writes one of them, so the computed runs again and reads the same \`n\` signals.
- \`other signals\`: there are two sets of \`n\` signals, and one more signal that selects the set. A frame writes the selector, so the computed runs again and reads the other set.

A library that keeps the list of dependencies of a computed can use it again in the first form.
The second form is the worst case for that: the list is compared, and then made again.
`
);

function wide(n) {
  add(`wide: ${n} signals, same signals`, ({ signal, computed, read, write, get, output }) => {
    let cells = [];

    for (let i = 0; i < n; i++) {
      cells.push(signal(i));
    }

    let total = computed(() => {
      let result = 0;

      for (let i = 0; i < n; i++) {
        result += read(cells[i]);
      }

      return result;
    });
    let out = [0];

    output(() => {
      out[0] = get(total);
    });

    let frames = 0;
    let next = () => {
      frames++;
      write(cells[frames % n], n + frames);
    };

    return { writes: next, result: () => out };
  });

  add(`wide: ${n} signals, other signals`, ({ signal, computed, read, write, get, output }) => {
    let first = [];
    let second = [];

    for (let i = 0; i < n; i++) {
      first.push(signal(i));
      second.push(signal(i + n));
    }

    let useSecond = signal(false);
    let total = computed(() => {
      let cells = read(useSecond) ? second : first;
      let result = 0;

      for (let i = 0; i < n; i++) {
        result += read(cells[i]);
      }

      return result;
    });
    let out = [0];

    output(() => {
      out[0] = get(total);
    });

    let frames = 0;
    let next = () => {
      frames++;
      write(useSecond, frames % 2 === 1);
    };

    return { writes: next, result: () => out };
  });
}

wide(2);
wide(10);
wide(100);

describe(
  'branch',
  `
One computed reads other signals from frame to frame, because its code takes another branch.
The number of signals that it reads can change too.

- \`a || b || c\`: \`a\` is \`0\` in one frame and \`1\` in the next. With \`0\`, the computed reads all three signals. With \`1\`, it reads only \`a\`.
- \`10 or 20 signals\`: a selector says if the computed adds the first 10 signals or all 20.
- \`100 signals, another last signal\`: the computed adds 99 signals and then one of two more. Only the last dependency changes.
- \`100 signals, a new set each frame\`: there are 10 sets of 100 signals. Each frame, the computed adds the next set. In the \`nothing shared\` form, no signal selects the set, so two runs in a row have no dependency in common.
- The three \`random\` cases take other branches in every frame, from a random number generator with a seed: 10 signals out of 20, a choice of one of two signals at each of 10 steps, and a number of signals from 1 to 20.

These are the bad cases for a library that keeps the list of dependencies of a computed to use it again.
The last case is the worst one: the old list and the new list are equal up to the last entry.
`
);

add('branch: a || b || c', ({ signal, computed, read, write, get, output }) => {
  let a = signal(0);
  let b = signal(0);
  let c = signal(2);
  let any = computed(() => read(a) || read(b) || read(c));
  let out = [0];

  output(() => {
    out[0] = get(any);
  });

  let frames = 0;
  let next = () => {
    frames++;
    write(a, frames % 2);
  };

  return { writes: next, result: () => out };
});

add('branch: 10 or 20 signals', ({ signal, computed, read, write, get, output }) => {
  let cells = [];

  for (let i = 0; i < 20; i++) {
    cells.push(signal(i));
  }

  let all = signal(false);
  let total = computed(() => {
    let count = read(all) ? 20 : 10;
    let result = 0;

    for (let i = 0; i < count; i++) {
      result += read(cells[i]);
    }

    return result;
  });
  let out = [0];

  output(() => {
    out[0] = get(total);
  });

  let frames = 0;
  let next = () => {
    frames++;
    write(all, frames % 2 === 1);
  };

  return { writes: next, result: () => out };
});

add(
  'branch: 100 signals, another last signal',
  ({ signal, computed, read, write, get, output }) => {
    let cells = [];

    for (let i = 0; i < 99; i++) {
      cells.push(signal(i));
    }

    let first = signal(1000);
    let second = signal(2000);
    let useSecond = signal(false);
    let total = computed(() => {
      let last = read(useSecond) ? second : first;
      let result = 0;

      for (let i = 0; i < 99; i++) {
        result += read(cells[i]);
      }

      return result + read(last);
    });
    let out = [0];

    output(() => {
      out[0] = get(total);
    });

    let frames = 0;
    let next = () => {
      frames++;
      write(useSecond, frames % 2 === 1);
    };

    return { writes: next, result: () => out };
  }
);

/**
 * A small random number generator with a seed, so that each adapter
 * takes the same branches and the outputs can be compared.
 */
function random(seed) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;

    let t = Math.imul(state ^ (state >>> 15), state | 1);

    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

add('branch: 10 random signals of 20', ({ signal, computed, read, write, get, output }) => {
  let cells = [];

  for (let i = 0; i < 20; i++) {
    cells.push(signal(i + 1));
  }

  let seed = signal(1);
  let total = computed(() => {
    let next = random(read(seed));
    let result = 0;

    for (let i = 0; i < 10; i++) {
      result += read(cells[Math.floor(next() * 20)]) * (i + 1);
    }

    return result;
  });
  let out = [0];

  output(() => {
    out[0] = get(total);
  });

  let frames = 1;
  let next = () => {
    frames++;
    write(seed, frames);
  };

  return { writes: next, result: () => out };
});

add('branch: 10 random choices of 2 signals', ({ signal, computed, read, write, get, output }) => {
  let left = [];
  let right = [];

  for (let i = 0; i < 10; i++) {
    left.push(signal(i + 1));
    right.push(signal(100 + i));
  }

  let seed = signal(1);
  let total = computed(() => {
    let next = random(read(seed));
    let result = 0;

    for (let i = 0; i < 10; i++) {
      result += read(next() < 0.5 ? left[i] : right[i]);
    }

    return result;
  });
  let out = [0];

  output(() => {
    out[0] = get(total);
  });

  let frames = 1;
  let next = () => {
    frames++;
    write(seed, frames);
  };

  return { writes: next, result: () => out };
});

add('branch: a random number of signals, 1 to 20', ({ signal, computed, read, write, get, output }) => {
  let cells = [];

  for (let i = 0; i < 20; i++) {
    cells.push(signal(i + 1));
  }

  let seed = signal(1);
  let total = computed(() => {
    let count = 1 + Math.floor(random(read(seed))() * 20);
    let result = 0;

    for (let i = 0; i < count; i++) {
      result += read(cells[i]);
    }

    return result;
  });
  let out = [0];

  output(() => {
    out[0] = get(total);
  });

  let frames = 1;
  let next = () => {
    frames++;
    write(seed, frames);
  };

  return { writes: next, result: () => out };
});

/**
 * `shared` says if the computed reads a selector signal first.
 *
 * Without it, two runs in a row have no dependency in common:
 *
 * - the frame writes one signal of the set that the computed read last
 * - a plain variable says which set comes next
 */
function newSet(shared) {
  let name = shared
    ? 'branch: 100 signals, a new set each frame'
    : 'branch: 100 signals, a new set each frame, nothing shared';

  add(name, ({ signal, computed, read, write, get, output }) => {
    let sets = [];

    for (let s = 0; s < 10; s++) {
      let cells = [];

      for (let i = 0; i < 100; i++) {
        cells.push(signal(s * 100 + i));
      }

      sets.push(cells);
    }

    let selector = signal(0);
    let current = 0;
    let total = computed(() => {
      let cells = sets[shared ? read(selector) : current];
      let result = 0;

      for (let i = 0; i < 100; i++) {
        result += read(cells[i]);
      }

      return result;
    });
    let out = [0];

    output(() => {
      out[0] = get(total);
    });

    let frames = 0;
    let next = () => {
      frames++;

      let last = current;

      current = frames % 10;

      if (shared) {
        write(selector, current);
      } else {
        write(sets[last][0], 100000 + frames);
      }
    };

    return { writes: next, result: () => out };
  });
}

newSet(true);
newSet(false);

/**
 * The weights for the mean in the result table.
 * Each group of cases has the same total weight.
 */
const sizes = new Map();

for (let { group } of cases) sizes.set(group, (sizes.get(group) ?? 0) + 1);
for (let c of cases) c.weight = 1 / sizes.get(c.group);
