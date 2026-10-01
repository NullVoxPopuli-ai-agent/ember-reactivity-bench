import { load } from './ember-source.mjs';

const { createTag, dirtyTag, consumeTag, createCache, getValue } = await load('@glimmer/validator');

export const name = 'ember: tags';

/**
 * The smallest signal that the validator allows: one value and one tag.
 * The difference from `ember-tracked` is the cost of `tracked(value)`.
 */
class Cell {
  constructor(value) {
    this.value = value;
    this.tag = createTag();
  }
}

export function signal(value) {
  return new Cell(value);
}

export function read(cell) {
  consumeTag(cell.tag);

  return cell.value;
}

export function write(cell, value) {
  if (Object.is(cell.value, value)) return;

  cell.value = value;
  dirtyTag(cell.tag);
}

export const computed = createCache;
export const get = getValue;

export { output, reset } from './ember-flush.mjs';
