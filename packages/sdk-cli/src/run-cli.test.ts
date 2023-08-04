/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { runCli } from './run-cli';
import * as interactive from './commands/interactive';
import * as helpers from './commands/helpers';
import * as getDataModel from './commands/get-data-model';
import * as tracking from './tracking';
import { ArgumentsCamelCase } from 'yargs';
import { HttpClient, PasswordAuthenticator } from '@sisense/sdk-rest-client';
import { PKG_VERSION } from './package-version';
import { GetDataModelOptions } from './types';

// Reference: https://kgajera.com/blog/how-to-test-yargs-cli-with-jest/
const COMMAND_GET_DATA_MODEL = 'get-data-model';

/**
 * Programmatically set arguments and execute the CLI script
 *
 * @param args - positional and option arguments for the command to run
 */
function runCommand(...args: string[]) {
  process.argv = [
    'node', // Not used but a value is required at this index in the array
    'index.js', // Not used but a value is required at this index in the array
    ...args,
  ];

  // run the CLI script
  runCli();
}

describe('CLI', () => {
  const fakeUsername = 'username';
  const fakePassword = 'password';
  const fakeHost = '10.0.0.1';
  const fakePort = 30845;
  const fakeProtocol = 'http';
  const fakeUrl = `${fakeProtocol}://${fakeHost}:${fakePort}`;
  const fakeToken = 'token';
  const fakeWat = 'wat';
  const fakeDataSource = 'data source name';
  const fakeOutput = 'output.ts';

  const mockInteractivePrompts = (command: string, auth: string) => {
    jest.spyOn(interactive, 'promptCommand').mockResolvedValue({ command });
    if (command !== COMMAND_GET_DATA_MODEL) {
      return {};
    }
    // mock other prompt functions
    jest
      .spyOn(interactive, 'promptUrl')
      .mockResolvedValue({ hostname: fakeHost, port: fakePort, protocol: fakeProtocol });
    const url = `${fakeProtocol}://${fakeHost}:${fakePort}`;
    jest
      .spyOn(interactive, 'promptDataModel')
      .mockResolvedValue({ dataSource: fakeDataSource, output: fakeOutput });
    jest.spyOn(interactive, 'promptAuth').mockResolvedValue({ auth: auth });
    switch (auth) {
      case 'password':
        jest
          .spyOn(interactive, 'promptPasswordAuth')
          .mockResolvedValue({ username: fakeUsername, password: fakePassword });
        return {
          username: fakeUsername,
          password: fakePassword,
          dataSource: fakeDataSource,
          output: fakeOutput,
          url,
        };
      case 'token':
        jest.spyOn(interactive, 'promptTokenAuth').mockResolvedValue({ token: fakeToken });
        return {
          token: fakeToken,
          dataSource: fakeDataSource,
          output: fakeOutput,
          url,
        };
      case 'web access token':
        jest.spyOn(interactive, 'promptWatAuth').mockResolvedValue({ wat: fakeWat });
        return {
          wat: fakeWat,
          dataSource: fakeDataSource,
          output: fakeOutput,
          url,
        };
    }

    return {};
  };

  let originalArgv: string[];

  beforeEach(() => {
    // Remove all cached modules. The cache needs to be cleared before running
    // each command, otherwise you will see the same results from the command
    // run in your first test in subsequent tests.
    jest.resetModules();

    // Each test overwrites process arguments so store the original arguments
    originalArgv = process.argv;
  });

  afterEach(() => {
    jest.resetAllMocks();

    // Set process arguments back to the original value
    process.argv = originalArgv;
  });

  it('should run interactive command - password auth', () => {
    const expectedAnswers = mockInteractivePrompts(COMMAND_GET_DATA_MODEL, 'password');

    // mock handleHelper function
    const handleHelperSpy = jest.spyOn(interactive, 'handleHelper');
    handleHelperSpy.mockImplementation((answers: ArgumentsCamelCase<GetDataModelOptions>) => {
      // somehow when inquirer.prompt is spied on, toHaveBeenCalledWith does not work
      // as a workaround, we do the assertion in the mock implementation
      expect(answers).toStrictEqual(expectedAnswers);
      return new Promise(() => {
        return answers;
      });
    });

    runCommand('interactive');
  });

  it('should run interactive command - token auth', () => {
    const expectedAnswers = mockInteractivePrompts(COMMAND_GET_DATA_MODEL, 'token');
    // mock handleHelper function
    const handleHelperSpy = jest.spyOn(interactive, 'handleHelper');
    handleHelperSpy.mockImplementation((answers: ArgumentsCamelCase<GetDataModelOptions>) => {
      expect(answers).toStrictEqual(expectedAnswers);
      return new Promise(() => {
        return answers;
      });
    });

    runCommand('interactive');
  });

  it('should run interactive command - wat auth', () => {
    const expectedAnswers = mockInteractivePrompts(COMMAND_GET_DATA_MODEL, 'web access token');
    // mock handleHelper function
    const handleHelperSpy = jest.spyOn(interactive, 'handleHelper');
    handleHelperSpy.mockImplementation((answers: ArgumentsCamelCase<GetDataModelOptions>) => {
      expect(answers).toStrictEqual(expectedAnswers);
      return new Promise(() => {
        return answers;
      });
    });

    runCommand('interactive');
  });

  it('should not run interactive with incorrect command', () => {
    const expectedAnswers = mockInteractivePrompts('invalid_command', 'password');
    runCommand('interactive');
    expect(expectedAnswers).toStrictEqual({});
  });

  describe('should run get-data-model command', () => {
    const createDataModelSpy = jest.spyOn(helpers, 'createDataModel');
    const handleHttpClientLoginSpy = jest.spyOn(helpers, 'handleHttpClientLogin');
    const trackExecutionSpy = jest.spyOn(tracking, 'trackExecution');

    beforeAll(() => {
      createDataModelSpy.mockImplementation(
        (httpClient: HttpClient, dataSource: string) =>
          new Promise(() => ({ dataSource, httpClient })),
      );
      handleHttpClientLoginSpy.mockImplementation(() => Promise.resolve());
      trackExecutionSpy.mockImplementation(() => Promise.resolve());
    });

    afterEach(() => {
      createDataModelSpy.mockClear();
      handleHttpClientLoginSpy.mockClear();
      trackExecutionSpy.mockClear();
    });

    it('with --username and --password', async () => {
      // mock createDataModel function

      runCommand(
        COMMAND_GET_DATA_MODEL,
        '--url',
        fakeUrl,
        '--username',
        fakeUsername,
        '--password',
        fakePassword,
        '-d',
        fakeDataSource,
        '-o',
        fakeOutput,
      );

      await new Promise(process.nextTick); // eslint-disable-line

      const expectedHttpClient = new HttpClient(
        fakeUrl,
        new PasswordAuthenticator(fakeUrl, fakeUsername, fakePassword),
        `sdk-cli-${PKG_VERSION as string}`,
      );

      expect(trackExecutionSpy).toHaveBeenCalled();
      expect(createDataModelSpy).toHaveBeenCalledWith(expectedHttpClient, fakeDataSource);
    });

    it('should run get-data-model command with --username and without --password value', () => {
      // mock promptPasswordInteractive function
      jest
        .spyOn(getDataModel, 'promptPasswordInteractive')
        .mockResolvedValue({ maskedPassword: fakePassword });

      // mock createDataModel function
      createDataModelSpy.mockImplementation((httpClient: HttpClient, dataSource: string) => {
        // somehow when inquirer.prompt is spied on, toHaveBeenCalledWith does not work
        // as a workaround, we do the assertion in the mock implementation

        const expectedHttpClient = new HttpClient(
          fakeUrl,
          new PasswordAuthenticator(fakeUrl, fakeUsername, fakePassword),
          `sdk-cli-${PKG_VERSION as string}`,
        );
        expect(httpClient).toStrictEqual(expectedHttpClient);
        return new Promise(() => ({ dataSource, httpClient }));
      });

      handleHttpClientLoginSpy.mockImplementation(() => Promise.resolve());
      trackExecutionSpy.mockImplementation(() => Promise.resolve());

      runCommand(
        COMMAND_GET_DATA_MODEL,
        '--url',
        fakeUrl,
        '--username',
        fakeUsername,
        '--password',
        '-d',
        fakeDataSource,
        '-o',
        fakeOutput,
      );
    });
  });
});
