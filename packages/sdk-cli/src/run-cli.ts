/* eslint-disable @typescript-eslint/no-unused-expressions */
import { createPluginCommand } from '@sisense/sdk-plugins-cli';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { getApiTokenCommand } from './commands/get-api-token.js';
import { getDataModelCommand } from './commands/get-data-model.js';
import { PKG_VERSION } from './package-version.js';

export const runCli = () => {
  yargs(hideBin(process.argv))
    .command(getDataModelCommand)
    .command(getApiTokenCommand)
    .command(createPluginCommand)
    .scriptName('sdk-cli')
    // Without an explicit version, yargs reports the version of the package.json it finds
    // above its own node_modules — the host project's, not sdk-cli's, once installed.
    .version(PKG_VERSION)
    .showHelpOnFail(true)
    .demandCommand(1, 'You need to specify a command to continue')
    .help()
    .strict().argv;
};
