import { addQueryParamsToUrl, appendHeaders, isAuthTokenPending, validateUrl } from './helpers.js';

describe('appendHeaders', () => {
  it('should append headers to an existing Headers object', () => {
    const existingHeaders = new Headers({
      'Content-Type': 'application/json',
    });

    const additionalHeaders: Record<string, string> = {
      'X-Custom-Header': 'CustomValue',
      'Another-Header': 'AnotherValue',
    };

    appendHeaders(existingHeaders, additionalHeaders);

    // Check if the existing headers have been updated with the additional headers
    expect(existingHeaders.get('Content-Type')).toBe('application/json');
    expect(existingHeaders.get('X-Custom-Header')).toBe('CustomValue');
    expect(existingHeaders.get('Another-Header')).toBe('AnotherValue');
  });

  it('should append headers to an existing object representing headers', () => {
    const existingHeaders = {
      'Content-Type': 'application/json',
    };

    const additionalHeaders = {
      'X-Custom-Header': 'CustomValue',
      'Another-Header': 'AnotherValue',
    };

    appendHeaders(existingHeaders, additionalHeaders);

    // Check if the existing headers have been updated with the additional headers
    expect(existingHeaders['Content-Type']).toBe('application/json');
    expect(existingHeaders['X-Custom-Header']).toBe('CustomValue');
    expect(existingHeaders['Another-Header']).toBe('AnotherValue');
  });

  it('should append headers to an existing array representing headers', () => {
    const existingHeaders = {
      'Content-Type': 'application/json',
    };

    const additionalHeaders = {
      'X-Custom-Header': 'CustomValue',
      'Another-Header': 'AnotherValue',
    };

    appendHeaders(existingHeaders, additionalHeaders);

    // Check if the existing headers have been updated with the additional headers
    expect(existingHeaders['Content-Type']).toBe('application/json');
    expect(existingHeaders['X-Custom-Header']).toBe('CustomValue');
    expect(existingHeaders['Another-Header']).toBe('AnotherValue');
  });

  it('should append headers to an existing array of header entries', () => {
    const existingHeaders: [string, string][] = [['Content-Type', 'application/json']];

    const additionalHeaders = {
      'X-Custom-Header': 'CustomValue',
      'Another-Header': 'AnotherValue',
    };

    appendHeaders(existingHeaders, additionalHeaders);

    // Check if the existing headers have been updated with the additional headers
    expect(existingHeaders).toContainEqual(['Content-Type', 'application/json']);
    expect(existingHeaders).toContainEqual(['X-Custom-Header', 'CustomValue']);
    expect(existingHeaders).toContainEqual(['Another-Header', 'AnotherValue']);
  });

  it('should handle an empty set of additional headers gracefully', () => {
    const existingHeaders = new Headers({
      'Content-Type': 'application/json',
    });

    appendHeaders(existingHeaders, {});

    // Check if the existing headers remain unchanged
    expect(existingHeaders.get('Content-Type')).toBe('application/json');
    expect(existingHeaders.get('X-Custom-Header')).toBeNull();
  });

  describe('addQueryParamsToUrl', () => {
    it('should append query parameters to a URL without existing query parameters', () => {
      const url = 'https://example.com/';
      const queryParams = {
        param1: 'value1',
        param2: 'value2',
      };

      const resultUrl = addQueryParamsToUrl(url, queryParams);

      const expectedResult = 'https://example.com/?param1=value1&param2=value2';
      expect(resultUrl).toBe(expectedResult);
    });

    it('should append query parameters to a URL with existing query parameters', () => {
      const url = 'https://example.com?existingParam=existingValue';
      const queryParams = {
        param1: 'value1',
        param2: 'value2',
      };

      const resultUrl = addQueryParamsToUrl(url, queryParams);

      const expectedResult =
        'https://example.com/?existingParam=existingValue&param1=value1&param2=value2';
      expect(resultUrl).toBe(expectedResult);
    });

    it('should handle URL with hash and append query parameters correctly', () => {
      const url = 'https://example.com/page#section';
      const queryParams = {
        param1: 'value1',
        param2: 'value2',
      };

      const resultUrl = addQueryParamsToUrl(url, queryParams);

      const expectedResult = 'https://example.com/page?param1=value1&param2=value2#section';
      expect(resultUrl).toBe(expectedResult);
    });

    it('should handle empty query parameters gracefully', () => {
      const url = 'https://example.com/';
      const queryParams = {};

      const resultUrl = addQueryParamsToUrl(url, queryParams);

      expect(resultUrl).toBe(url);
    });
  });

  describe('isAuthTokenPending', () => {
    it('should return true when auth token is pending', () => {
      let token = null;
      let wat = undefined;

      expect(isAuthTokenPending(token, wat)).toBe(true);

      token = undefined;
      wat = null;

      expect(isAuthTokenPending(token, wat)).toBe(true);
    });

    it('should return false when auth token is set', () => {
      let token: string | undefined = 'TOKEN_VALUE';
      let wat = undefined;

      expect(isAuthTokenPending(token, wat)).toBe(false);

      token = undefined;
      wat = 'WAT_VALUE';
      expect(isAuthTokenPending(token, wat)).toBe(false);
    });
  });

  describe('validateUrl', () => {
    const allowedOrigin = 'https://example.com';

    describe('valid URLs matching origin', () => {
      it('should allow URLs with the same origin', () => {
        expect(() => {
          validateUrl('https://example.com/api/v1/endpoint', allowedOrigin);
        }).not.toThrow();
      });

      it('should allow URLs with the same origin and different paths', () => {
        expect(() => {
          validateUrl('https://example.com/path/to/resource?param=value', allowedOrigin);
        }).not.toThrow();
      });

      it('should allow URLs with trailing slashes', () => {
        expect(() => {
          validateUrl('https://example.com/', allowedOrigin);
        }).not.toThrow();
      });

      it('should allow localhost URLs if they match the allowed origin', () => {
        const localhostOrigin = 'https://localhost:8080';
        expect(() => {
          validateUrl('https://localhost:8080/api/v1/endpoint', localhostOrigin);
        }).not.toThrow();
      });

      it('should allow 127.0.0.1 URLs if they match the allowed origin', () => {
        const localhostOrigin = 'https://127.0.0.1:8080';
        expect(() => {
          validateUrl('https://127.0.0.1:8080/api/v1/endpoint', localhostOrigin);
        }).not.toThrow();
      });

      it('should allow private IP ranges if they match the allowed origin', () => {
        const privateIpOrigin = 'https://192.168.1.1:8080';
        expect(() => {
          validateUrl('https://192.168.1.1:8080/api/v1/endpoint', privateIpOrigin);
        }).not.toThrow();
      });

      it('should allow public IP addresses with matching origin', () => {
        const publicIpOrigin = 'https://8.8.8.8';
        expect(() => {
          validateUrl('https://8.8.8.8/api/v1/endpoint', publicIpOrigin);
        }).not.toThrow();
      });
    });

    describe('invalid URLs - origin mismatch', () => {
      it('should reject URLs with different protocol', () => {
        expect(() => {
          validateUrl('http://example.com/api/v1/endpoint', allowedOrigin);
        }).toThrow('URL origin http://example.com does not match allowed origin');
      });

      it('should reject URLs with different hostname', () => {
        expect(() => {
          validateUrl('https://malicious.com/api/v1/endpoint', allowedOrigin);
        }).toThrow('URL origin https://malicious.com does not match allowed origin');
      });

      it('should reject URLs with different port', () => {
        expect(() => {
          validateUrl('https://example.com:8080/api/v1/endpoint', allowedOrigin);
        }).toThrow('URL origin https://example.com:8080 does not match allowed origin');
      });

      it('should reject localhost URLs if they do not match the allowed origin', () => {
        expect(() => {
          validateUrl('https://localhost/api/v1/endpoint', allowedOrigin);
        }).toThrow('URL origin https://localhost does not match allowed origin');
      });

      it('should reject 127.0.0.1 URLs if they do not match the allowed origin', () => {
        expect(() => {
          validateUrl('https://127.0.0.1/api/v1/endpoint', allowedOrigin);
        }).toThrow('URL origin https://127.0.0.1 does not match allowed origin');
      });

      it('should reject private IP ranges if they do not match the allowed origin', () => {
        expect(() => {
          validateUrl('https://192.168.1.1/api/v1/endpoint', allowedOrigin);
        }).toThrow('URL origin https://192.168.1.1 does not match allowed origin');
      });
    });

    describe('invalid input', () => {
      it('should reject invalid URL format', () => {
        expect(() => {
          validateUrl('not-a-url', allowedOrigin);
        }).toThrow('Invalid URL format');
      });

      it('should reject empty URL', () => {
        expect(() => {
          validateUrl('', allowedOrigin);
        }).toThrow('URL must be a non-empty string');
      });

      it('should reject whitespace-only URL', () => {
        expect(() => {
          validateUrl('   ', allowedOrigin);
        }).toThrow('Invalid URL format');
      });

      it('should reject invalid allowed origin format', () => {
        expect(() => {
          validateUrl('https://example.com/api', 'not-a-url');
        }).toThrow('Invalid url origin format');
      });

      it('should reject empty allowed origin', () => {
        expect(() => {
          validateUrl('https://example.com/api', '');
        }).toThrow('Invalid url origin format');
      });
    });

    describe('edge cases', () => {
      it('should handle URLs with query parameters and fragments', () => {
        expect(() => {
          validateUrl(
            'https://example.com/api/v1/data?param=value&other=test#section',
            allowedOrigin,
          );
        }).not.toThrow();
      });

      it('should handle URLs with default ports (implicit vs explicit)', () => {
        // Note: URL constructor normalizes default ports, so https://example.com:443
        // and https://example.com have the same origin
        const originWithPort = 'https://example.com:443';
        expect(() => {
          validateUrl('https://example.com/api/v1/endpoint', originWithPort);
        }).not.toThrow();
      });

      it('should reject URLs with non-default ports that do not match', () => {
        const originWithPort = 'https://example.com:8080';
        expect(() => {
          validateUrl('https://example.com/api/v1/endpoint', originWithPort);
        }).toThrow('URL origin https://example.com does not match allowed origin');
      });

      it('should handle subdomain matching correctly', () => {
        const subdomainOrigin = 'https://api.example.com';
        expect(() => {
          validateUrl('https://api.example.com/v1/data', subdomainOrigin);
        }).not.toThrow();

        expect(() => {
          validateUrl('https://example.com/v1/data', subdomainOrigin);
        }).toThrow('URL origin https://example.com does not match allowed origin');
      });
    });
  });
});
