import { readFileSync } from 'node:fs';
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

export function load(specifier) {
  return import(pathToFileURL(`${root}/dist/prod/packages/${specifier}/index.js`).href);
}
