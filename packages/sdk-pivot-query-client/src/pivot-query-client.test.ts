import { Authenticator } from '@sisense/sdk-rest-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SocketBuilder } from './builders/index.js';
import { PivotQueryClient } from './pivot-query-client.js';

vi.mock('./builders/index.js', () => ({
  SocketBuilder: vi.fn(),
}));

describe('PivotQueryClient', () => {
  let authMock: Authenticator;

  beforeEach(() => {
    authMock = {} as Authenticator;
    vi.clearAllMocks();
  });

  it('should normalize the URL when initializing SocketBuilder', () => {
    const testUrl = 'https://example.com';
    const normalizedUrl = 'https://example.com/';

    new PivotQueryClient(testUrl, authMock);

    expect(SocketBuilder).toHaveBeenCalledWith(normalizedUrl, authMock, false);
  });
});
