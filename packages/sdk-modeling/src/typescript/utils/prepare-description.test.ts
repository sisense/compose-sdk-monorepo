import { prepareDescription } from './prepare-description.js';

describe('prepareDescription', () => {
  it('should properly escape backslashes and backticks', () => {
    const description = 'This is a `description` with \\ backslashes \\';
    const expectedResult = '`This is a \\`description\\` with \\\\ backslashes \\\\`';

    expect(prepareDescription(description)).toBe(expectedResult);
  });
});
