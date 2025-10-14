import { useSisenseContextMock } from '@/sisense-context/__mocks__/sisense-context';

import { useQueryCache } from './use-query-cache';

vi.mock('../sisense-context/sisense-context');

describe('useQueryCache', () => {
  it('should return the instance to manage query cache', () => {
    const app = {
      queryCache: {},
    };
    useSisenseContextMock.mockReturnValue({ app });
    expect(useQueryCache()).toEqual(app.queryCache);
  });
});
