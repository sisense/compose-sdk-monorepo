#!/usr/bin/env node

/**
 * @packageDocumentation
 */
// Direct and indirect dependencies of sdk-cli may use the window object.
// Polyfill the window object with node-window-polyfill to avoid error "window is not defined"
import 'node-window-polyfill/register.js';

import './fetch-polyfill.js';
import { runCli } from './run-cli.js';

export * from './types.js';
runCli();
