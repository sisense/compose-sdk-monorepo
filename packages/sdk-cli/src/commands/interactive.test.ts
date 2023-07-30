/* eslint-disable @typescript-eslint/no-unsafe-call */
import { validateNotEmpty } from './interactive';

describe('validateNotEmpty', () => {
  it('should validate empty', async () => {
    expect(await validateNotEmpty('')).toBe('this field cannot be blank');
  });

  it('should validate non-empty', async () => {
    expect(await validateNotEmpty('some string')).toBeTruthy();
  });
});
