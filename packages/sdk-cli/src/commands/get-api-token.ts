import { Arguments, Argv, CommandModule } from 'yargs';
import { getHttpClient, handleHttpClientLogin } from './helpers.js';
import { promptPasswordInteractive } from './prompts.js';
import { Command, GetApiTokenOptions } from '../types.js';
import { trackExecution } from '../tracking.js';

const command: Command = 'get-api-token';
const describe = 'Get an API token from the given Sisense URL using the provided credentials.';

const builder = (yargs: Argv<unknown>) =>
  yargs
    .options({
      username: {
        type: 'string',
        describe: 'Specify the username for username/password authentication',
        alias: ['u'],
        demandOption: true,
      },

      password: {
        type: 'string',
        describe:
          'Specify the password for username/password authentication. If not provided, the program will prompt for it interactively.',
        alias: ['p'],
      },

      url: {
        type: 'string',
        describe: 'Specify the Sisense URL to connect to',
        demandOption: true,
      },
    })
    .example([['$0 get-api-token --url https://domain.sisense.com -u user@domain.com']]);

const handler = async (options: Arguments<GetApiTokenOptions>) => {
  const { url, username } = options;
  let { password } = options;

  if (username && !password) {
    ({ maskedPassword: password } = await promptPasswordInteractive(username));
  }

  const httpClient = getHttpClient(url, username, password);

  try {
    await handleHttpClientLogin(httpClient);
    trackExecution(httpClient, command, options);
    const response = await httpClient.get<{ token: string }>('/api/v1/authentication/tokens/api');
    console.log(response);
  } catch (err) {
    if (err) console.log(err);
    // exit code 1: One or more generic errors encountered upon exit
    process.exit(1);
  }
};

export const getApiTokenCommand: CommandModule<unknown, GetApiTokenOptions> = {
  command,
  describe,
  builder,
  handler,
};
