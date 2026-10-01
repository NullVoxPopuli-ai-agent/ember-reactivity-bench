import { load } from './ember-source.mjs';

const { tracked } = await load('@glimmer/tracking');
const { createCache, getValue } = await load('@glimmer/tracking/primitives/cache');

export const name = 'ember: tracked() + createCache';

/**
 * `tracked(value)` has an `Object.is` equality check:
 * a write of an equal value does not dirty the tag.
 *
 * `createCache` is the function that `@cached` calls for each instance.
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

export { output, reset } from './ember-flush.mjs';
