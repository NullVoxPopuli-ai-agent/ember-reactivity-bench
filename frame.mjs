/**
 * Node has no `requestAnimationFrame`.
 *
 * This file installs one.
 * The callbacks wait until the benchmark calls `frame()`,
 * so a measurement does not include the idle time between two frames.
 *
 * A callback that is requested during a frame runs in the next frame,
 * the same as in a browser.
 */
let pending = [];
let count = 0;
let spare = [];

globalThis.requestAnimationFrame = function requestAnimationFrame(callback) {
  pending[count++] = callback;

  return count;
};

export function frame() {
  let callbacks = pending;
  let length = count;

  pending = spare;
  spare = callbacks;
  count = 0;

  for (let i = 0; i < length; i++) {
    let callback = callbacks[i];

    callbacks[i] = undefined;
    callback();
  }
}
