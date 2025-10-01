import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PivotClient } from './pivot-client.js';
import { Authenticator } from '@ethings-os/sdk-rest-client';
import { SocketBuilder } from './builders';

vi.mock('./builders', () => ({
  SocketBuilder: vi.fn(),
}));

describe('PivotClient', () => {
  let authMock: Authenticator;

  beforeEach(() => {
    authMock = {} as Authenticator;
    vi.clearAllMocks();
  });

  it('should normalize the URL when initializing SocketBuilder', () => {
    const testUrl = 'https://example.com';
    const normalizedUrl = 'https://example.com/';

    new PivotClient(testUrl, authMock);

    expect(SocketBuilder).toHaveBeenCalledWith(normalizedUrl, authMock, false);
  });
});
