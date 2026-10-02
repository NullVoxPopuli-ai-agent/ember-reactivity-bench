/**
 * `solid-js` resolves to the server build in Node, and that build is not reactive.
 * This path is the browser build for production.
 */
import { batch, createMemo, createSignal } from 'solid-js/dist/solid.js';

export const name = 'solid 1';

/**
 * A memo of Solid 1 is not lazy.
 * It runs again at the end of the batch that changed its dependencies.
 *
 * An output is a memo, so it is up to date before the animation frame.
 * The animation frame reads every output, the same as in the other adapters.
 */
let outputs = [];
let scheduled = false;

function flush() {
  scheduled = false;

  for (let i = 0; i < outputs.length; i++) {
    outputs[i]();
  }
}

export const signal = createSignal;
export const computed = createMemo;

export function read(pair) {
  return pair[0]();
}

export function write(pair, value) {
  pair[1](value);

  if (scheduled) return;

  scheduled = true;
  requestAnimationFrame(flush);
}

export function get(memo) {
  return memo();
}

export function output(fn) {
  outputs.push(createMemo(fn));
}

export function reset() {
  outputs = [];
}

export { batch };
