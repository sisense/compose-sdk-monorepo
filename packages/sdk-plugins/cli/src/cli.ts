#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-floating-promises */

/* eslint-disable @typescript-eslint/no-unused-expressions */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { createPluginCommand } from './create-plugin.js';

yargs(hideBin(process.argv))
  .command(createPluginCommand)
  .scriptName('sdk-plugins-cli')
  .showHelpOnFail(true)
  .demandCommand(1, 'You need to specify a command to continue')
  .help()
  .strict().argv;
