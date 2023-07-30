#!/usr/bin/env node
/**
 * @packageDocumentation
 * @beta
 */

// Native fetch() is not available in Node.js until version 18.
// Polyfill fetch() with cross-fetch for CLI commands if needed.
// Somehow import 'cross-fetch/polyfill' does not work thus the following workaround
// eslint-disable-next-line import/extensions
import 'cross-fetch/dist/node-polyfill.js';
import { runCli } from './run-cli.js';
export * from './types.js';
runCli();
