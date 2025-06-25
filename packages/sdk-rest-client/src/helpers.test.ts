import { addQueryParamsToUrl, appendHeaders, isAuthTokenPending } from './helpers.js';

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
});
