import { describe, expect, it } from 'vitest';

import { mergeUrlsWithParams, normalizeUrl } from './url.js';

describe('normalizeUrl', () => {
  it("should add a trailing slash if url doesn't have it", () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com/');
  });

  it('should not add an extra trailing slash if url does have it', () => {
    expect(normalizeUrl('https://example.com/')).toBe('https://example.com/');
  });

  it('should include search string when specified', () => {
    expect(normalizeUrl('https://example.com?param=value', true)).toBe(
      'https://example.com/?param=value',
    );
  });

  it('should throw error for invalid URL', () => {
    expect(() => normalizeUrl('not-a-url')).toThrow();
  });

  it('should throw error for empty string', () => {
    expect(() => normalizeUrl('')).toThrow('URL cannot be empty');
    expect(() => normalizeUrl('   ')).toThrow('URL cannot be empty');
  });

  it('should throw error for non-string input', () => {
    // @ts-expect-error Testing runtime type check
    expect(() => normalizeUrl(null)).toThrow('URL must be a string');
    // @ts-expect-error Testing runtime type check
    expect(() => normalizeUrl(undefined)).toThrow('URL must be a string');
    // @ts-expect-error Testing runtime type check
    expect(() => normalizeUrl(123)).toThrow('URL must be a string');
  });
});

describe('mergeUrlsWithParams', () => {
  describe('input validation', () => {
    it('should throw error when base URL is not provided', () => {
      expect(() => mergeUrlsWithParams('')).toThrow('Base URL is required');
    });

    it('should throw error when base URL is invalid', () => {
      expect(() => mergeUrlsWithParams('not-a-url')).toThrow('Base URL is not valid');
    });
  });

  describe('base URL handling', () => {
    it('should return base URL when login URL is not provided', () => {
      expect(mergeUrlsWithParams('https://example.com')).toBe('https://example.com/');
    });

    it('should return base URL when login URL is just a slash', () => {
      expect(mergeUrlsWithParams('https://example.com', '/')).toBe('https://example.com/');
    });

    it('should preserve base URL port if specified', () => {
      expect(mergeUrlsWithParams('https://example.com:8080', 'login')).toBe(
        'https://example.com:8080/login/',
      );
    });
  });

  describe('absolute URL handling', () => {
    it('should use absolute login URL when provided', () => {
      expect(mergeUrlsWithParams('https://example.com', 'https://login.example.com/')).toBe(
        'https://login.example.com/',
      );
    });

    it('should preserve query params in absolute login URL', () => {
      expect(
        mergeUrlsWithParams('https://example.com', 'https://login.example.com?token=123'),
      ).toBe('https://login.example.com/?token=123');
    });
  });

  describe('relative path handling', () => {
    it('should merge relative login path with base URL', () => {
      expect(mergeUrlsWithParams('https://example.com', 'login')).toBe(
        'https://example.com/login/',
      );
    });

    it('should handle relative login path with leading slash', () => {
      expect(mergeUrlsWithParams('https://example.com', '/login')).toBe(
        'https://example.com/login/',
      );
    });

    it('should handle relative login path with trailing slash', () => {
      expect(mergeUrlsWithParams('https://example.com', 'login/')).toBe(
        'https://example.com/login/',
      );
    });

    it('should handle multiple slashes in path', () => {
      expect(mergeUrlsWithParams('https://example.com', '//login///path//')).toBe(
        'https://example.com/login/path/',
      );
    });
  });

  describe('query parameter handling', () => {
    it('should merge query parameters from both URLs', () => {
      expect(mergeUrlsWithParams('https://example.com?a=1', 'login?b=2')).toBe(
        'https://example.com/login/?a=1&b=2',
      );
    });

    it('should override base query parameters with login query parameters', () => {
      expect(mergeUrlsWithParams('https://example.com?param=1', 'login?param=2')).toBe(
        'https://example.com/login/?param=2',
      );
    });

    it('should handle multiple question marks in login URL', () => {
      expect(mergeUrlsWithParams('https://example.com', 'login?param1=1?param2=2')).toBe(
        'https://example.com/login/?param1=1%3Fparam2%3D2',
      );
    });

    it('should handle complex paths and query parameters', () => {
      expect(
        mergeUrlsWithParams(
          'https://example.com/api?token=123',
          '/auth/login/?user=test&scope=full',
        ),
      ).toBe('https://example.com/api/auth/login/?token=123&user=test&scope=full');
    });

    it('should handle alternative SSO host with relative path', () => {
      const result = mergeUrlsWithParams(
        'http://sso.app.client.com/auth?app=staging',
        '/users/login/?tracking=true&role=view',
      );
      const url = new URL(result);

      expect(url.origin).toBe('http://sso.app.client.com');
      expect(url.pathname).toBe('/auth/users/login/');
      expect(url.searchParams.get('app')).toBe('staging');
      expect(url.searchParams.get('tracking')).toBe('true');
      expect(url.searchParams.get('role')).toBe('view');
    });
  });
});
