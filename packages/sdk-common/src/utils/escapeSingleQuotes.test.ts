import { describe, expect, it } from 'vitest';

import { escapeSingleQuotes } from './escapeSingleQuotes.js';

describe('escapeSingleQuotes', () => {
  it('should escape single quotes', () => {
    const input = "It's a test. Don\\'t replace this.";
    const expected = "It\\'s a test. Don\\'t replace this.";
    expect(escapeSingleQuotes(input)).toBe(expected);
  });
});
