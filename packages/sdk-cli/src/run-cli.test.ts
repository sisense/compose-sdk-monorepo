import {
  BearerAuthenticator,
  HttpClient,
  PasswordAuthenticator,
  WatAuthenticator,
} from '@sisense/sdk-rest-client';
import * as prompts from './commands/prompts.js';
import * as helpers from './commands/helpers.js';
import { PKG_VERSION } from './package-version.js';
import { runCli } from './run-cli.js';
import * as tracking from './tracking.js';

// Reference: https://kgajera.com/blog/how-to-test-yargs-cli-with-jest/
const COMMAND_GET_DATA_MODEL = 'get-data-model';
const HTTP_CLIENT_ENV = `sdk-cli-${PKG_VERSION as string}`;

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

  let originalArgv: string[];

  const createDataModelSpy = vi.spyOn(helpers, 'createDataModel');
  const handleHttpClientLoginSpy = vi.spyOn(helpers, 'handleHttpClientLogin');
  const trackExecutionSpy = vi.spyOn(tracking, 'trackExecution');

  beforeEach(() => {
    // Each test overwrites process arguments so store the original arguments
    originalArgv = process.argv;

    createDataModelSpy.mockImplementation(
      (httpClient: HttpClient, dataSource: string) =>
        new Promise(() => ({ dataSource, httpClient })),
    );
    handleHttpClientLoginSpy.mockImplementation(() => Promise.resolve());
    trackExecutionSpy.mockImplementation(() => {});
  });

  afterEach(() => {
    // Set process arguments back to the original value
    process.argv = originalArgv;

    vi.resetAllMocks();
  });

  describe('interactive command', () => {
    const mockInteractivePrompts = (command: string, auth: string) => {
      vi.spyOn(prompts, 'promptCommand').mockResolvedValue({ command });
      if (command !== COMMAND_GET_DATA_MODEL) {
        return {};
      }
      // mock other prompt functions
      vi.spyOn(prompts, 'promptUrl').mockResolvedValue({
        hostname: fakeHost,
        port: fakePort,
        protocol: fakeProtocol,
      });
      vi.spyOn(prompts, 'promptDataModel').mockResolvedValue({
        dataSource: fakeDataSource,
        output: fakeOutput,
      });

      vi.spyOn(prompts, 'promptAuth').mockResolvedValue({ auth: auth });

      switch (auth) {
        case 'password':
          vi.spyOn(prompts, 'promptPasswordAuth').mockResolvedValue({
            username: fakeUsername,
            password: fakePassword,
          });
          break;
        case 'token':
          vi.spyOn(prompts, 'promptTokenAuth').mockResolvedValue({ token: fakeToken });
          break;
        case 'web access token':
          vi.spyOn(prompts, 'promptWatAuth').mockResolvedValue({ wat: fakeWat });
          break;
      }

      return {};
    };

    it('should run with password auth', async () => {
      expect.assertions(2);

      mockInteractivePrompts(COMMAND_GET_DATA_MODEL, 'password');

      runCommand('interactive');

      await new Promise(process.nextTick); // eslint-disable-line

      const expectedHttpClient = new HttpClient(
        fakeUrl,
        new PasswordAuthenticator(fakeUrl, fakeUsername, fakePassword),
        HTTP_CLIENT_ENV,
      );

      expect(trackExecutionSpy).toHaveBeenCalled();
      expect(createDataModelSpy).toHaveBeenCalledWith(expectedHttpClient, fakeDataSource);
    });

    it('should run with token auth', async () => {
      expect.assertions(2);

      mockInteractivePrompts(COMMAND_GET_DATA_MODEL, 'token');

      runCommand('interactive');

      await new Promise(process.nextTick); // eslint-disable-line

      const expectedHttpClient = new HttpClient(
        fakeUrl,
        new BearerAuthenticator(fakeUrl, fakeToken),
        HTTP_CLIENT_ENV,
      );

      expect(trackExecutionSpy).toHaveBeenCalled();
      expect(createDataModelSpy).toHaveBeenCalledWith(expectedHttpClient, fakeDataSource);
    });

    it('should run with wat auth', async () => {
      expect.assertions(2);

      mockInteractivePrompts(COMMAND_GET_DATA_MODEL, 'web access token');

      runCommand('interactive');

      await new Promise(process.nextTick); // eslint-disable-line

      const expectedHttpClient = new HttpClient(
        fakeUrl,
        new WatAuthenticator(fakeUrl, fakeWat),
        HTTP_CLIENT_ENV,
      );

      expect(trackExecutionSpy).toHaveBeenCalled();
      expect(createDataModelSpy).toHaveBeenCalledWith(expectedHttpClient, fakeDataSource);
    });

    it('should not run with incorrect command', () => {
      expect.assertions(1);
      const expectedAnswers = mockInteractivePrompts('invalid_command', 'password');
      runCommand('interactive');
      expect(expectedAnswers).toStrictEqual({});
    });
  });

  describe('get-data-model command', () => {
    it('should run with --username and --password', async () => {
      expect.assertions(2);

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
        HTTP_CLIENT_ENV,
      );

      expect(trackExecutionSpy).toHaveBeenCalled();
      expect(createDataModelSpy).toHaveBeenCalledWith(expectedHttpClient, fakeDataSource);
    });

    it('should run with --username and without --password value', async () => {
      expect.assertions(2);

      // mock promptPasswordInteractive function
      vi.spyOn(prompts, 'promptPasswordInteractive').mockResolvedValue({
        maskedPassword: fakePassword,
      });

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

      await new Promise(process.nextTick); // eslint-disable-line

      const expectedHttpClient = new HttpClient(
        fakeUrl,
        new PasswordAuthenticator(fakeUrl, fakeUsername, fakePassword),
        HTTP_CLIENT_ENV,
      );

      expect(trackExecutionSpy).toHaveBeenCalled();
      expect(createDataModelSpy).toHaveBeenCalledWith(expectedHttpClient, fakeDataSource);
    });

    it('should run with --token', async () => {
      expect.assertions(2);

      runCommand(
        COMMAND_GET_DATA_MODEL,
        '--url',
        fakeUrl,
        '--token',
        fakeToken,
        '-d',
        fakeDataSource,
        '-o',
        fakeOutput,
      );

      await new Promise(process.nextTick); // eslint-disable-line

      const expectedHttpClient = new HttpClient(
        fakeUrl,
        new BearerAuthenticator(fakeUrl, fakeToken),
        HTTP_CLIENT_ENV,
      );

      expect(trackExecutionSpy).toHaveBeenCalled();
      expect(createDataModelSpy).toHaveBeenCalledWith(expectedHttpClient, fakeDataSource);
    });

    it('should run with --wat', async () => {
      expect.assertions(2);

      runCommand(
        COMMAND_GET_DATA_MODEL,
        '--url',
        fakeUrl,
        '--wat',
        fakeWat,
        '-d',
        fakeDataSource,
        '-o',
        fakeOutput,
      );

      await new Promise(process.nextTick); // eslint-disable-line

      const expectedHttpClient = new HttpClient(
        fakeUrl,
        new WatAuthenticator(fakeUrl, fakeWat),
        HTTP_CLIENT_ENV,
      );

      expect(trackExecutionSpy).toHaveBeenCalled();
      expect(createDataModelSpy).toHaveBeenCalledWith(expectedHttpClient, fakeDataSource);
    });
  });
});
