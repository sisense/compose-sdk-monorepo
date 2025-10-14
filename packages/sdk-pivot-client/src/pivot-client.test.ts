import { Authenticator } from '@sisense/sdk-rest-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SocketBuilder } from './builders';
import { PivotClient } from './pivot-client.js';

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
