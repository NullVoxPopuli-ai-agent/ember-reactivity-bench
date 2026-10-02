import { flushSync } from 'svelte';
/**
 * Runes need the Svelte compiler.
 * These are the functions that the compiler output calls.
 */
import * as $ from 'svelte/internal/client';

export const name = 'svelte 5';

/**
 * An output is a derived.
 *
 * - the first write of a frame requests one animation frame
 * - the animation frame reads every output
 * - an output runs again only if one of its dependencies changed
 *
 * A write opens a batch that Svelte closes in a microtask.
 * In a browser, that microtask runs before the animation frame.
 * `flushSync()` does the same work here.
 */
let outputs = [];
let scheduled = false;

function flush() {
  scheduled = false;
  flushSync();

  for (let i = 0; i < outputs.length; i++) {
    $.get(outputs[i]);
  }
}

export function signal(value) {
  return $.state(value);
}

export function read(state) {
  return $.get(state);
}

export function write(state, value) {
  $.set(state, value);

  if (scheduled) return;

  scheduled = true;
  requestAnimationFrame(flush);
}

export function computed(fn) {
  return $.derived(fn);
}

export function get(derived) {
  return $.get(derived);
}

export function output(fn) {
  let leaf = $.derived(fn);

  $.get(leaf);
  outputs.push(leaf);
}

export function reset() {
  outputs = [];
}
