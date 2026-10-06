import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const installed = fileURLToPath(new URL('../node_modules/ember-source', import.meta.url));

/**
 * EMBER_SOURCE points at any ember-source folder that has a `dist/prod`:
 *
 * - an unpacked tarball
 * - an ember.js checkout after `pnpm build`
 */
export const root = resolve(process.env.EMBER_SOURCE ?? installed);

export const version = JSON.parse(readFileSync(`${root}/package.json`, 'utf8')).version;

/**
 * The package that holds the tags and the caches.
 *
 * The alien-signals spike of ember.js has `@glimmer/signals` in its place.
 */
export function loadReactivity() {
  let validator = existsSync(`${root}/dist/prod/packages/@glimmer/validator/index.js`);

  return load(validator ? '@glimmer/validator' : '@glimmer/signals');
}

export function load(specifier) {
  return import(pathToFileURL(`${root}/dist/prod/packages/${specifier}/index.js`).href);
}
