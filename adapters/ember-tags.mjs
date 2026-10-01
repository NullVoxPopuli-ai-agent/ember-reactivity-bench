import { load } from './ember-source.mjs';

const { createTag, dirtyTag, consumeTag, createCache, getValue } = await load('@glimmer/validator');

export const name = 'ember: tags';

class Cell {
  constructor(value) {
    this.value = value;
    this.tag = createTag();
  }

  read() {
    consumeTag(this.tag);

    return this.value;
  }

  write(value) {
    if (Object.is(this.value, value)) return;

    this.value = value;
    dirtyTag(this.tag);
  }
}

class Computed {
  constructor(fn) {
    this.cache = createCache(fn);
  }

  read() {
    return getValue(this.cache);
  }
}

export function signal(value) {
  return new Cell(value);
}

export function computed(fn) {
  return new Computed(fn);
}

export { output, reset } from './ember-flush.mjs';
