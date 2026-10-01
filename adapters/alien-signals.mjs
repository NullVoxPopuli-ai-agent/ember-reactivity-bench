import * as alien from 'alien-signals';

export const name = 'alien-signals';

/**
 * No effect exists in this adapter.
 *
 * An output is a computed that writes out of the reactive system.
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
    outputs[i]();
  }
}

export const signal = alien.signal;
export const computed = alien.computed;

export function read(s) {
  return s();
}

export function write(s, value) {
  s(value);

  if (scheduled) return;

  scheduled = true;
  requestAnimationFrame(flush);
}

export function get(c) {
  return c();
}

export function output(fn) {
  let leaf = alien.computed(fn);

  leaf();
  outputs.push(leaf);
}

export function reset() {
  outputs = [];
}
