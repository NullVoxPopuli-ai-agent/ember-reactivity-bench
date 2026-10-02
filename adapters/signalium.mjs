import { reactiveSignal, signal as createSignal } from 'signalium';

export const name = 'signalium';

/**
 * An output is a `reactiveSignal`.
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
    outputs[i].value;
  }
}

export const signal = createSignal;
export const computed = reactiveSignal;

export function read(s) {
  return s.value;
}

export function write(s, value) {
  s.value = value;

  if (scheduled) return;

  scheduled = true;
  requestAnimationFrame(flush);
}

export function get(c) {
  return c.value;
}

export function output(fn) {
  let leaf = reactiveSignal(fn);

  leaf.value;
  outputs.push(leaf);
}

export function reset() {
  outputs = [];
}
