import { simplifyFilterConfig } from './filter-config-utils.js';

describe('simplifyConfig', () => {
  const mockGuid = 'mock-guid';
  it('should simplify BaseFilterConfig if it completely matches the default config', () => {
    const config = { disabled: false, locked: false };
    expect(simplifyFilterConfig(config)).toEqual({});
  });

  it('should simplify BaseFilterConfig if it partially matches the default config', () => {
    const config = { disabled: true, locked: false, guid: mockGuid };
    expect(simplifyFilterConfig(config)).toEqual({ disabled: true, guid: mockGuid });
  });

  it('should simplify MembersFilterConfig if it completely matches the default config', () => {
    const config = { excludeMembers: false, enableMultiSelection: true, deactivatedMembers: [] };
    expect(simplifyFilterConfig(config)).toEqual({});
  });

  it('should simplify MembersFilterConfig if it partially matches the default config', () => {
    const config = {
      guid: mockGuid,
      excludeMembers: true,
      enableMultiSelection: true,
      deactivatedMembers: [],
    };
    expect(simplifyFilterConfig(config)).toEqual({ guid: mockGuid, excludeMembers: true });
  });
});
