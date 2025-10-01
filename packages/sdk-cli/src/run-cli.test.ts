import { Authenticator, HttpClient } from '@ethings-os/sdk-rest-client';
import * as auth from '@ethings-os/sdk-rest-client';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ArgumentsCamelCase } from 'yargs';

import * as helpers from './commands/helpers.js';
import * as prompts from './commands/prompts.js';
import { PKG_VERSION } from './package-version.js';
import { runCli } from './run-cli.js';
import * as tracking from './tracking.js';

export const server = setupServer();
beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

const flushPromises = () => new Promise(setImmediate);

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
  const getAuthenticatorSpy = vi.spyOn(auth, 'getAuthenticator');

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
    trackExecutionSpy.mockReset();
    createDataModelSpy.mockReset();
    getAuthenticatorSpy.mockClear();
  });

  async function testHttpClient(type: string) {
    await flushPromises();

    const a: Authenticator = getAuthenticatorSpy.mock.results[0].value;
    expect(a.type).toBe(type);

    const expectedHttpClient = new HttpClient(fakeUrl, a, HTTP_CLIENT_ENV);

    expect(trackExecutionSpy).toHaveBeenCalled();
    expect(createDataModelSpy).toHaveBeenCalledWith(expectedHttpClient, fakeDataSource);
  }

  describe('get-data-model command', () => {
    it('should run with --username and --password', async () => {
      expect.assertions(3);

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

      await testHttpClient('password');
    });

    it('should run with --username and without --password value', async () => {
      expect.assertions(3);

      // mock promptPasswordInteractive function
      vi.spyOn(prompts, 'promptPasswordInteractive').mockResolvedValue({
        maskedPassword: fakePassword,
      } as ArgumentsCamelCase<{ maskedPassword: string }>);

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

      await testHttpClient('password');
    });

    it('should run with --token', async () => {
      expect.assertions(3);

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

      await testHttpClient('bearer');
    });

    it('should run with --wat', async () => {
      expect.assertions(3);

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

      await testHttpClient('wat');
    });
  });

  describe('get-api-token command', () => {
    const consoleLogSpy = vi.spyOn(console, 'log');

    beforeEach(() => {
      consoleLogSpy.mockClear();

      server.use(
        http.get('*/api/v1/authentication/tokens/api', () => {
          return HttpResponse.json({ token: 'fake-token' });
        }),
      );
    });

    it('gets a token with password provided as parameter and sends a tracking event', async () => {
      expect.assertions(4);

      runCommand(
        'get-api-token',
        '--url',
        fakeUrl,
        '--username',
        fakeUsername,
        '--password',
        fakePassword,
      );

      await flushPromises();

      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy).toHaveBeenCalledWith({
        token: 'fake-token',
      });
      expect(trackExecutionSpy).toHaveBeenCalledOnce();
      expect(trackExecutionSpy).toHaveBeenCalledWith(
        expect.any(HttpClient),
        'get-api-token',
        expect.objectContaining({
          url: fakeUrl,
          username: fakeUsername,
          password: fakePassword,
        }),
      );
    });

    it('gets a token with password provided through answered prompt and sends a tracking event', async () => {
      expect.assertions(4);

      vi.spyOn(prompts, 'promptPasswordInteractive').mockResolvedValueOnce({
        maskedPassword: fakePassword,
      } as ArgumentsCamelCase<{ maskedPassword: string }>);

      runCommand('get-api-token', '--url', fakeUrl, '--username', fakeUsername);

      await flushPromises();

      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy).toHaveBeenCalledWith({
        token: 'fake-token',
      });
      expect(trackExecutionSpy).toHaveBeenCalledOnce();
      expect(trackExecutionSpy).toHaveBeenCalledWith(
        expect.any(HttpClient),
        'get-api-token',
        expect.objectContaining({
          url: fakeUrl,
          username: fakeUsername,
        }),
      );
    });

    it('fails if a required parameter is not specified', async () => {
      expect.assertions(2);

      // For some reason, this is the only way I can successfully spy on
      // process.exit for this file. For any other file, this will work without
      // vi.hoisted().
      // This will also fail if we return a value from vi.hoisted() and assign
      // it to a variable.
      vi.hoisted(() => {
        const spy = vi.spyOn(process, 'exit');

        spy.mockImplementation((() => {}) as () => never);
      });

      runCommand('get-api-token');
      await flushPromises();
      expect(process.exit).toHaveBeenCalledWith(1); // eslint-disable-line

      vi.mocked(process.exit).mockClear(); // eslint-disable-line

      runCommand('get-api-token', '--url', fakeUrl);
      await flushPromises();
      expect(process.exit).toHaveBeenCalledWith(1); // eslint-disable-line
    });
  });
});
