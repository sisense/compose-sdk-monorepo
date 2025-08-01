/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpClient, PasswordAuthenticator } from './index.js';

describe('Authenticator and HttpClient', () => {
  const auth = new PasswordAuthenticator('https://10.0.0.1', 'username', 'password');
  test('auth should not be null"', () => {
    expect(auth).toBeTruthy();
  });

  const client = new HttpClient('https://10.0.0.1', auth, 'sdk-ui');
  test('client should accept auth and not be null', () => {
    expect(client).toBeTruthy();
  });

  test('httpclient url should be set', () => {
    expect(client.url).toBe('https://10.0.0.1/');
  });

  test('auth is valid before', () => {
    expect(auth.isValid()).toBe(true);
  });
});
