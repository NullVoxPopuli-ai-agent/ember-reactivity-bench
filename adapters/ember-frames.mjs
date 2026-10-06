import { setFlushFrames } from './ember-flush.mjs';
import { load, loadReactivity } from './ember-source.mjs';

const { tracked } = await load('@glimmer/tracking');
const { createCache, getValue } = await load('@glimmer/tracking/primitives/cache');
const { createFrame, beginFrame, endFrame, isFrameStale } = await loadReactivity();

if (typeof createFrame !== 'function') {
  throw new Error('The ember-frames adapter needs an ember-source build with `@glimmer/signals`.');
}

export const name = 'ember: tracked() + createCache, outputs are frames';

/**
 * An output is a frame, as a block of a template is in the VM.
 *
 * A frame is a subscriber in the alien-signals graph:
 *
 * - a write marks the frames that depend on it
 * - the animation frame visits every output, and runs the marked ones again
 *
 * With `ember-tracked`, an output is a cache that nobody subscribes to. Such a
 * cache has no links in the graph, and compares revisions as the validator did.
 */
export const signal = tracked;
export const computed = createCache;
export const get = getValue;

export function read(cell) {
  return cell.value;
}

export function write(cell, value) {
  cell.value = value;
}

let outputs = [];

function run(output) {
  beginFrame(output.frame);

  try {
    output.fn();
  } finally {
    endFrame();
  }
}

function flush() {
  for (let i = 0; i < outputs.length; i++) {
    let output = outputs[i];

    if (isFrameStale(output.frame)) run(output);
  }
}

setFlushFrames(flush);

export function output(fn) {
  let entry = { frame: createFrame(), fn };

  run(entry);
  outputs.push(entry);
}

export function reset() {
  outputs = [];
}
