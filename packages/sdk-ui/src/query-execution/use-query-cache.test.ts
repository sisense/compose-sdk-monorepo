import { useQueryCache } from './use-query-cache';
import { useSisenseContextMock } from '@/sisense-context/__mocks__/sisense-context';

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
