import { Signal } from 'signal-polyfill';

export const name = 'TC39 signal-polyfill';

/**
 * An output is a `Signal.Computed`.
 *
 * - the first write of a frame requests one animation frame
 * - the animation frame reads every output
 * - an output runs again only if one of its dependencies changed
 */
let outputs = [];
let scheduled = false;

function flush() {
  scheduled = false;

  for (let i = 0; i < outputs.length; i++) {
    outputs[i].get();
  }
}

export function signal(value) {
  return new Signal.State(value);
}

export function read(state) {
  return state.get();
}

export function write(state, value) {
  state.set(value);

  if (scheduled) return;

  scheduled = true;
  requestAnimationFrame(flush);
}

export function computed(fn) {
  return new Signal.Computed(fn);
}

export function get(c) {
  return c.get();
}

export function output(fn) {
  let leaf = new Signal.Computed(fn);

  leaf.get();
  outputs.push(leaf);
}

export function reset() {
  outputs = [];
}
