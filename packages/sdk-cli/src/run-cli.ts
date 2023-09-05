/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getDataModelCommand } from './commands/get-data-model.js';
import { getApiTokenCommand } from './commands/get-api-token.js';
import { interactiveCommand } from './commands/interactive.js';

export const runCli = () => {
  yargs(hideBin(process.argv))
    .command(getDataModelCommand)
    .command(interactiveCommand)
    .command(getApiTokenCommand)
    .scriptName('sdk-cli')
    .showHelpOnFail(true)
    .demandCommand(1, 'You need to specify a command to continue')
    .help()
    .strict().argv;
};
