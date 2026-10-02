/**
 * The first adapter is the baseline of the result table.
 */
export const adapters = [
  'alien-signals',
  'signal-polyfill',
  'solid',
  'svelte',
  'signalium',
  'ember-tags',
  'ember-tracked',
];

export function loadAdapter(id) {
  if (!adapters.includes(id)) {
    throw new Error(`Unknown adapter "${id}". Use one of: ${adapters.join(', ')}`);
  }

  return import(`./${id}.mjs`);
}
