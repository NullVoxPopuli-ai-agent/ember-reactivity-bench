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
 * - `@glimmer/validator` in a release
 * - `@glimmer/signals` in the first builds of the alien-signals spike
 * - no importable package in the later builds of the spike, so only the cache functions
 */
export function loadReactivity() {
  for (let name of ['@glimmer/validator', '@glimmer/signals']) {
    if (existsSync(`${root}/dist/prod/packages/${name}/index.js`)) return load(name);
  }

  return load('@glimmer/tracking/primitives/cache');
}

export function load(specifier) {
  return import(pathToFileURL(`${root}/dist/prod/packages/${specifier}/index.js`).href);
}
