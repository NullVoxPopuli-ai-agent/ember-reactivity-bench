import { frame } from './frame.mjs';

/**
 * Each case builds a graph one time and returns:
 *
 * - `run`: the writes of one frame, then the frame (the measured part)
 * - `result`: the values that the outputs saw last
 *
 * An output only stores the value that it reads.
 * `verify.mjs` compares these values between adapters.
 *
 * `constant` marks a case where the outputs see the same value after each frame.
 */
export const cases = [];

function add(name, setup, options = {}) {
  cases.push({ name, setup, ...options });
}

function update(write) {
  return () => {
    write();
    frame();
  };
}

function sum(list) {
  let total = 0;

  for (let i = 0; i < list.length; i++) {
    total += list[i].read();
  }

  return total;
}

/**
 * From `benchs/propagate.mjs` in alien-signals:
 * one source, `w` chains of `h` computeds, one output per chain.
 */
for (let [w, h] of [
  [1, 1],
  [10, 10],
  [100, 100],
  [1, 1000],
  [1000, 1],
]) {
  add(`propagate: ${w} chains x ${h} deep`, (fw) => {
    let src = fw.signal(1);
    let out = new Array(w).fill(0);

    for (let i = 0; i < w; i++) {
      let last = src;

      for (let j = 0; j < h; j++) {
        let prev = last;

        last = fw.computed(() => prev.read() + 1);
      }

      let leaf = last;

      fw.output(() => {
        out[i] = leaf.read();
      });
    }

    let n = 1;
    let write = () => src.write(++n);

    return { run: update(write), result: () => out };
  });
}

/**
 * The kairo graphs from js-reactivity-benchmark.
 * Here, one iteration is one write and one frame.
 */
add('kairo: avoidable propagation', (fw) => {
  let head = fw.signal(0);
  let c1 = fw.computed(() => head.read());
  let c2 = fw.computed(() => (c1.read(), 0));
  let c3 = fw.computed(() => c2.read() + 1);
  let c4 = fw.computed(() => c3.read() + 2);
  let c5 = fw.computed(() => c4.read() + 3);
  let out = [0];

  fw.output(() => {
    out[0] = c5.read();
  });

  let n = 0;
  let write = () => head.write(++n);

  return { run: update(write), result: () => out };
}, { constant: true });

add('kairo: broad propagation', (fw) => {
  let head = fw.signal(0);
  let out = new Array(50).fill(0);

  for (let i = 0; i < 50; i++) {
    let current = fw.computed(() => head.read() + i);
    let current2 = fw.computed(() => current.read() + 1);

    fw.output(() => {
      out[i] = current2.read();
    });
  }

  let n = 0;
  let write = () => head.write(++n);

  return { run: update(write), result: () => out };
});

add('kairo: deep propagation', (fw) => {
  let head = fw.signal(0);
  let current = head;

  for (let i = 0; i < 50; i++) {
    let c = current;

    current = fw.computed(() => c.read() + 1);
  }

  let out = [0];

  fw.output(() => {
    out[0] = current.read();
  });

  let n = 0;
  let write = () => head.write(++n);

  return { run: update(write), result: () => out };
});

add('kairo: diamond', (fw) => {
  let head = fw.signal(0);
  let branches = [];

  for (let i = 0; i < 5; i++) {
    branches.push(fw.computed(() => head.read() + 1));
  }

  let total = fw.computed(() => sum(branches));
  let out = [0];

  fw.output(() => {
    out[0] = total.read();
  });

  let n = 0;
  let write = () => head.write(++n);

  return { run: update(write), result: () => out };
});

add('kairo: mux', (fw) => {
  let heads = [];

  for (let i = 0; i < 100; i++) {
    heads.push(fw.signal(0));
  }

  let mux = fw.computed(() => heads.map((h) => h.read()));
  let out = new Array(100).fill(0);

  for (let i = 0; i < 100; i++) {
    let split = fw.computed(() => mux.read()[i]);
    let plusOne = fw.computed(() => split.read() + 1);

    fw.output(() => {
      out[i] = plusOne.read();
    });
  }

  let n = 0;
  let write = () => {
    n++;
    heads[n % 100].write(n);
  };

  return { run: update(write), result: () => out };
});

add('kairo: repeated observers', (fw) => {
  let head = fw.signal(0);
  let current = fw.computed(() => {
    let result = 0;

    for (let i = 0; i < 30; i++) {
      result += head.read();
    }

    return result;
  });
  let out = [0];

  fw.output(() => {
    out[0] = current.read();
  });

  let n = 0;
  let write = () => head.write(++n);

  return { run: update(write), result: () => out };
});

add('kairo: triangle', (fw) => {
  let head = fw.signal(0);
  let current = head;
  let list = [];

  for (let i = 0; i < 10; i++) {
    let c = current;

    list.push(current);
    current = fw.computed(() => c.read() + 1);
  }

  let total = fw.computed(() => sum(list));
  let out = [0];

  fw.output(() => {
    out[0] = total.read();
  });

  let n = 0;
  let write = () => head.write(++n);

  return { run: update(write), result: () => out };
});

add('kairo: unstable', (fw) => {
  let head = fw.signal(0);
  let double = fw.computed(() => head.read() * 2);
  let inverse = fw.computed(() => -head.read());
  let current = fw.computed(() => {
    let result = 0;

    for (let i = 0; i < 20; i++) {
      result += head.read() % 2 ? double.read() : inverse.read();
    }

    return result;
  });
  let out = [0];

  fw.output(() => {
    out[0] = current.read();
  });

  let n = 0;
  let write = () => head.write(++n);

  return { run: update(write), result: () => out };
});

/**
 * A list of 1000 rows, as a template renders it:
 * each row has one signal, one computed and one output.
 */
function rows(fw) {
  let cells = [];
  let out = new Array(1000).fill(0);

  for (let i = 0; i < 1000; i++) {
    let cell = fw.signal(i);
    let doubled = fw.computed(() => cell.read() * 2);

    cells.push(cell);
    fw.output(() => {
      out[i] = doubled.read();
    });
  }

  return { cells, out };
}

add('rows: 1000 rows, write 1', (fw) => {
  let { cells, out } = rows(fw);
  let n = 0;
  let write = () => {
    n++;
    cells[n % 1000].write(-n);
  };

  return { run: update(write), result: () => out };
});

add('rows: 1000 rows, write all', (fw) => {
  let { cells, out } = rows(fw);
  let n = 0;
  let write = () => {
    n++;

    for (let i = 0; i < 1000; i++) {
      cells[i].write(n + i);
    }
  };

  return { run: update(write), result: () => out };
});

add('batch: 10 writes, 1 output', (fw) => {
  let cells = [];

  for (let i = 0; i < 10; i++) {
    cells.push(fw.signal(i));
  }

  let total = fw.computed(() => sum(cells));
  let out = [0];

  fw.output(() => {
    out[0] = total.read();
  });

  let n = 0;
  let write = () => {
    n++;

    for (let i = 0; i < 10; i++) {
      cells[i].write(n + i);
    }
  };

  return { run: update(write), result: () => out };
});

/**
 * A write of the value that the signal has already.
 * A signal with an equality check does not start any work.
 */
add(
  'avoidable: write the same value',
  (fw) => {
    let head = fw.signal(1);
    let current = head;

    for (let i = 0; i < 5; i++) {
      let c = current;

      current = fw.computed(() => c.read() + 1);
    }

    let out = [0];

    fw.output(() => {
      out[0] = current.read();
    });

    let write = () => head.write(1);

    return { run: update(write), result: () => out };
  },
  { constant: true }
);

/**
 * The cost to build a graph.
 * Each iteration makes a new graph, and the previous graph becomes garbage.
 */
add('create: 1000 signals', (fw) => {
  let out = [0];

  function run() {
    let last;

    for (let i = 0; i < 1000; i++) {
      last = fw.signal(i);
    }

    out[0] = last.read();
  }

  return { run, result: () => out };
});

add('create: 1000 computeds, read each', (fw) => {
  let out = [0];

  function run() {
    let src = fw.signal(1);
    let total = 0;

    for (let i = 0; i < 1000; i++) {
      total += fw.computed(() => src.read() + i).read();
    }

    out[0] = total;
  }

  return { run, result: () => out };
});

add('create: 1000 outputs', (fw) => {
  let out = [0];

  function run() {
    fw.reset();

    let src = fw.signal(1);
    let total = 0;

    for (let i = 0; i < 1000; i++) {
      fw.output(() => {
        total += src.read() + i;
      });
    }

    out[0] = total;
  }

  return { run, result: () => out };
});
