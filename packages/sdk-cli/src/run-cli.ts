/* eslint-disable @typescript-eslint/no-floating-promises */

/* eslint-disable @typescript-eslint/no-unused-expressions */
import { createPluginCommand } from '@sisense/sdk-plugins-cli';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { getApiTokenCommand } from './commands/get-api-token.js';
import { getDataModelCommand } from './commands/get-data-model.js';

export const runCli = () => {
  yargs(hideBin(process.argv))
    .command(getDataModelCommand)
    .command(getApiTokenCommand)
    .command(createPluginCommand)
    .scriptName('sdk-cli')
    .showHelpOnFail(true)
    .demandCommand(1, 'You need to specify a command to continue')
    .help()
    .strict().argv;
};
