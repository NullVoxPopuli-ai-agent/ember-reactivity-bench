import { load } from './ember-source.mjs';

const { createCache, getValue } = await load('@glimmer/validator');
const { default: setGlobalContext } = await load('@glimmer/global-context');

/**
 * Ember has no effects.
 *
 * An output is a cached computation that writes out of the reactive system,
 * for example to the DOM.
 *
 * - the first write of a frame requests one animation frame
 * - the animation frame visits every output
 * - an output runs again only if its tag is not valid
 */
let outputs = [];
let scheduled = false;

function flush() {
  scheduled = false;

  for (let i = 0; i < outputs.length; i++) {
    getValue(outputs[i]);
  }
}

setGlobalContext({
  scheduleRevalidate() {
    if (scheduled) return;

    scheduled = true;
    requestAnimationFrame(flush);
  },
});

export function output(fn) {
  let cache = createCache(fn);

  getValue(cache);
  outputs.push(cache);
}

export function reset() {
  outputs = [];
}
