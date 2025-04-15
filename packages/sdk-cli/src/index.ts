#!/usr/bin/env node
/**
 * @packageDocumentation
 */

// Native fetch() is not available in Node.js until version 18.
// Polyfill fetch() with cross-fetch for CLI commands if needed.
// Somehow import 'cross-fetch/polyfill' does not work thus the following workaround
// eslint-disable-next-line import/extensions
import 'cross-fetch/dist/node-polyfill.js';
// Direct and indirect dependencies of sdk-cli may use the window object.
// Polyfill the window object with node-window-polyfill to avoid error "window is not defined"
import 'node-window-polyfill/register.js';

import { runCli } from './run-cli.js';
export * from './types.js';
runCli();
