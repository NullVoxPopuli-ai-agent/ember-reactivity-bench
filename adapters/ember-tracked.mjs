import { load } from './ember-source.mjs';

const { tracked, cached } = await load('@glimmer/tracking');

export const name = 'ember: tracked() + @cached';

/**
 * `tracked(value)` makes a value with an `Object.is` equality check:
 * a write of an equal value does not dirty the tag.
 */
class Cell {
  constructor(value) {
    this.cell = tracked(value);
  }

  read() {
    return this.cell.value;
  }

  write(value) {
    this.cell.value = value;
  }
}

class Computed {
  constructor(fn) {
    this.fn = fn;
  }

  get value() {
    return this.fn();
  }

  read() {
    return this.value;
  }
}

/**
 * Node cannot parse decorator syntax.
 * These lines are what `@cached get value()` compiles to
 * with the legacy decorator transform.
 */
let getter = Object.getOwnPropertyDescriptor(Computed.prototype, 'value');

cached(Computed.prototype, 'value', getter);
Object.defineProperty(Computed.prototype, 'value', getter);

export function signal(value) {
  return new Cell(value);
}

export function computed(fn) {
  return new Computed(fn);
}

export { output, reset } from './ember-flush.mjs';
