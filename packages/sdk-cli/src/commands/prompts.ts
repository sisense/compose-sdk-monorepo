import inquirer from 'inquirer';
import { ArgumentsCamelCase } from 'yargs';
import { validateNotEmpty } from './interactive.js';

export const promptPasswordInteractive = (username: string) =>
  inquirer.prompt<ArgumentsCamelCase<{ maskedPassword: string }>>([
    {
      type: 'password',
      name: 'maskedPassword',
      mask: '*',
      message: `Enter password for username '${username}':`,
      validate: (answer: string) => {
        if (!answer || answer === '') {
          return 'Password cannot be blank';
        }
        return true;
      },
    },
  ]);

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
      validate: (input: ArgumentsCamelCase, answers: ArgumentsCamelCase) => {
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
