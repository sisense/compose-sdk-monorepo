import { useSisenseContextMock } from '@/infra/contexts/sisense-context/__mocks__/sisense-context';

import { useQueryCache } from '.';

vi.mock('@/infra/contexts/sisense-context/sisense-context');

describe('useQueryCache', () => {
  it('should return the instance to manage query cache', () => {
    const app = {
      queryCache: {},
    };
    useSisenseContextMock.mockReturnValue({ app });
    expect(useQueryCache()).toEqual(app.queryCache);
  });
});
