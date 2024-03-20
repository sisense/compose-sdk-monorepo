import { normalizeName } from './base.js';

describe('normalizeName', () => {
  it('should remove invalid characters', () => {
    expect(normalizeName('my!name!is!awesome!')).toBe('mynameisawesome');
  });

  it('should prefix name with underscore if it starts with a non-alphabetical character', () => {
    expect(normalizeName('123name')).toBe('_123name');
  });

  it('should keep the name unchanged if it has no invalid characters and starts with an alphabetical character', () => {
    expect(normalizeName('validName')).toBe('validName');
  });

  it('should keep the name unchanged if it has no invalid characters and starts with an underscore', () => {
    expect(normalizeName('_validName')).toBe('_validName');
  });
});
