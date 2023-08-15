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
import { getDataModel } from './get-data-model.js';
import { ArgumentsCamelCase } from 'yargs';
import { Command, GetDataModelOptions } from '../types.js';
import {
  promptCommand,
  promptUrl,
  promptAuth,
  promptPasswordAuth,
  promptTokenAuth,
  promptWatAuth,
  promptDataModel,
} from './prompts.js';

const command: Command = 'interactive';
const desc = 'Run in interactive mode';

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
