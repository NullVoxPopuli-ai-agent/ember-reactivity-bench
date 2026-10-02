/**
 * Measures one write through a chain of Svelte deriveds:
 *
 * - with no effect, where the code reads the last derived
 * - with one effect that reads the last derived
 *
 *   node --stack-size=3000 research/svelte-without-effect/measure.mjs
 */
import { flushSync } from 'svelte';
import * as $ from 'svelte/internal/client';

function chain(length) {
  let source = $.state(1);
  let last = $.derived(() => $.get(source) + 1);

  for (let i = 1; i < length; i++) {
    let previous = last;

    last = $.derived(() => $.get(previous) + 1);
  }

  return [source, last];
}

function time(label, fn) {
  for (let i = 0; i < 50; i++) fn();

  let start = performance.now();

  for (let i = 0; i < 200; i++) fn();

  let micros = ((performance.now() - start) / 200) * 1000;

  console.log(`${label.padEnd(36)} ${micros.toFixed(1)} µs`);
}

for (let length of [100, 1000]) {
  {
    let [source, last] = chain(length);
    let value = 1;

    $.get(last);

    time(`${length} deriveds, no effect`, () => {
      $.set(source, ++value);
      flushSync();
      $.get(last);
    });
  }

  {
    let source;
    let value = 1;

    $.effect_root(() => {
      let last;

      [source, last] = chain(length);

      $.render_effect(() => {
        $.get(last);
      });
    });

    flushSync();

    time(`${length} deriveds, one effect`, () => {
      $.set(source, ++value);
      flushSync();
    });
  }
}
