import { describe, it, expect } from 'vitest';
import { normalizeUrl } from './normalizeUrl.js';

describe('normalizeUrl', () => {
  it("should add a trailing slash if url doesn't have it", () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com/');
  });

  it('should not add an extra trailing slash if url does have it', () => {
    expect(normalizeUrl('https://example.com/')).toBe('https://example.com/');
  });
});
