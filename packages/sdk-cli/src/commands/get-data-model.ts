/* eslint-disable max-lines-per-function */
/* eslint-disable max-params */
import { Arguments, Argv, CommandModule } from 'yargs';
import {
  getHttpClient,
  createDataModel,
  writeFile,
  handleHttpClientLogin,
  getFilePathInfo,
  isSupportedOutputFile,
} from './helpers.js';
import { promptPasswordInteractive } from './prompts.js';
import { Command, GetDataModelOptions } from '../types.js';
import { trackExecution } from '../tracking.js';

const command: Command = 'get-data-model';
const describe =
  'Write the TypeScript or JavaScript representation of a data model from the given Sisense URL and data source';

const builder = (yargs: Argv<unknown>) =>
  yargs
    .options({
      username: {
        type: 'string',
        describe: 'Specify the username for username/password authentication',
        alias: ['u'],
      },

      password: {
        type: 'string',
        describe:
          'Specify the password for username/password authentication. If not provided, the program will prompt for it interactively.',
        alias: ['p'],
      },

      token: {
        type: 'string',
        describe: 'Specify bearer token for token based authentication',
      },

      wat: {
        type: 'string',
        describe: 'Specify web access token for token based authentication',
      },

      output: {
        type: 'string',
        describe: 'Specify the output TypeScript (.ts) or JavaScript (.js) filename',
        alias: ['o'],
      },

      url: {
        type: 'string',
        describe: 'Specify the Sisense URL to connect to',
        demandOption: true,
      },

      dataSource: {
        type: 'string',
        alias: ['d'],
        describe: 'Specify the data source name',
        demandOption: true,
      },
    })
    .example([
      [
        '$0 get-data-model --url https://domain.sisense.com -u user@domain.com -d "Sample ECommerce" -o MySampleEComm.ts',
      ],
    ]);

export const getDataModel = async (
  options: Arguments<GetDataModelOptions>,
  commandName: Command,
) => {
  const { url, dataSource, username, token, wat, output } = options;
  let { password } = options;

  // validate url
  if (!/^(http|https):\/\//.test(url)) {
    console.log(`Error connecting to ${url}`);
    console.log('ValidationError: URL must start with http:// or https://');
    // exit code 2: Incorrect usage, such as invalid options or missing arguments
    process.exit(2);
  }

  //validate output file path
  const outputInfo = getFilePathInfo({
    filePath: output,
    defaultBaseName: dataSource,
    defaultFileExtension: '.ts',
  });
  if (!isSupportedOutputFile(outputInfo)) {
    console.log(
      `Invalid output file extension: ${outputInfo.extension}. Only TypeScript (.ts) or JavaScript (.js) file is supported.`,
    );
    // exit code 2: Incorrect usage, such as invalid options or missing arguments
    process.exit(2);
  }

  // if username is provided but password is not, prompt for password interactively
  if (username && !password) {
    ({ maskedPassword: password } = await promptPasswordInteractive(username));
  }

  const httpClient = getHttpClient(url, username, password, token, wat);

  try {
    await handleHttpClientLogin(httpClient);
    trackExecution(httpClient, commandName, options);
    await createDataModel(httpClient, dataSource).then((model) => {
      return writeFile(model, outputInfo);
    });
  } catch (err) {
    if (err) console.log(err);
    // exit code 1: One or more generic errors encountered upon exit
    process.exit(1);
  }
};

const handler = (options: Arguments<GetDataModelOptions>) =>
  getDataModel(options, 'get-data-model');

export const getDataModelCommand: CommandModule<unknown, GetDataModelOptions> = {
  command,
  describe,
  builder,
  handler,
};
