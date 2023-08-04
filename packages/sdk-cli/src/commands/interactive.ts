/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import inquirer from 'inquirer';
import { getDataModel } from './get-data-model.js';
import { ArgumentsCamelCase } from 'yargs';
import { Command, GetDataModelOptions } from '../types.js';

const command: Command = 'interactive';
const desc = 'Run in interactive mode';

export const promptCommand = () =>
  inquirer.prompt([
    {
      type: 'rawlist',
      name: 'command',
      message: 'Select command to run:',
      choices: ['get-data-model'],
    },
  ]);
export const promptUrl = () =>
  inquirer.prompt([
    {
      type: 'input',
      name: 'hostname',
      message: 'Specify the Sisense server IP address or hostname (example: 10.50.1.5):',
      validate: validateNotEmpty,
    },
    {
      type: 'number',
      name: 'port',
      message: 'Specify the Sisense server port or leave blank for default port:',
      default: 30845,
    },
    {
      type: 'list',
      name: 'protocol',
      message: 'Select http/https:',
      choices: ['http', 'https'],
      default: 'http',
    },
  ]);
export const promptAuth = () =>
  inquirer.prompt([
    {
      type: 'list',
      name: 'auth',
      message: 'Select authentication method:',
      choices: ['password', 'token', 'web access token'],
      default: 'password',
    },
  ]);
export const promptPasswordAuth = () =>
  inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Specify the username for username/password authentication:',
    },
    {
      type: 'password',
      name: 'password',
      mask: '*',
      message: 'Specify the password for username/password authentication:',
      validate: async (input: ArgumentsCamelCase, answers: ArgumentsCamelCase) => {
        if (answers.username && answers.username !== '' && !input) {
          return 'if username is provided password cannot be blank';
        }
        return true;
      },
    },
  ]);

export const promptTokenAuth = () =>
  inquirer.prompt([
    {
      type: 'input',
      name: 'token',
      message: 'Specify the Bearer token for token-based authentication:',
    },
  ]);

export const promptWatAuth = () =>
  inquirer.prompt([
    {
      type: 'input',
      name: 'wat',
      message: 'Specify the web access token for token-based authentication:',
    },
  ]);

export const promptDataModel = () =>
  inquirer.prompt([
    {
      type: 'input',
      name: 'dataSource',
      message: 'Specify the data source name (for example: Sample ECommerce):',
      validate: validateNotEmpty,
    },
    {
      type: 'input',
      name: 'output',
      message: 'Specify the output filename:',
      validate: validateNotEmpty,
    },
  ]);

export const handleHelper = (combinedAnswers: ArgumentsCamelCase<GetDataModelOptions>) =>
  getDataModel(combinedAnswers, 'interactive');

const handler = async () => {
  const cmd = await promptCommand();

  if (cmd.command !== 'get-data-model') return;

  const urlInput = await promptUrl();

  const url = `${urlInput.protocol}://${urlInput.hostname}:${urlInput.port}`;

  console.log(`\nSisense host URL: ${url}\n`);

  const auth = await promptAuth();

  let passwordAuthAnswers, tokenAuthAnswers, watAuthAnswers;

  if (auth.auth === 'password') {
    passwordAuthAnswers = await promptPasswordAuth();
  } else if (auth.auth === 'token') {
    tokenAuthAnswers = await promptTokenAuth();
  } else if (auth.auth === 'web access token') {
    watAuthAnswers = await promptWatAuth();
  }

  const answers = await promptDataModel();
  answers.url = url;

  return handleHelper({
    ...passwordAuthAnswers,
    ...tokenAuthAnswers,
    ...watAuthAnswers,
    ...answers,
  });
};

export const validateNotEmpty = async (input: string) => {
  if (input === undefined || input.trim() === '') return 'this field cannot be blank';
  return true;
};

export const interactiveCommand = {
  command,
  desc,
  handler,
};
