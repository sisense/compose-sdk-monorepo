import { act } from 'react';

import { createAttribute } from '@sisense/sdk-data';
import { renderHook } from '@testing-library/react';

import { useSisenseContextMock } from '@/infra/contexts/sisense-context/__mocks__/sisense-context';
import { TranslatableError } from '@/infra/translation/translatable-error';

import { getHierarchyModels } from '../hierarchy-model/get-hierarchy-models.js';
import { useHierarchiesLoader } from './use-hierarchies-loader.js';

vi.mock('@/infra/contexts/sisense-context/sisense-context');
vi.mock('../hierarchy-model/get-hierarchy-models.js');

const getHierarchyModelsMock = vi.mocked(getHierarchyModels);

const attribute = createAttribute({
  name: 'Age Range',
  type: 'text-attribute',
  expression: '[Commerce.Age Range]',
});

const extraAttribute = createAttribute({
  name: 'Gender',
  type: 'text-attribute',
  expression: '[Commerce.Gender]',
});

const mockHierarchy = {
  id: 'hierarchy-1',
  title: 'Test Hierarchy',
  levels: [extraAttribute],
};

const mockHttpClient = {};

const baseContext = {
  isInitialized: true,
  app: {
    httpClient: mockHttpClient,
    defaultDataSource: undefined,
  },
  tracking: { enabled: false, packageName: 'sdk-ui' },
  errorBoundary: { showErrorBox: false },
};

describe('useHierarchiesLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSisenseContextMock.mockReturnValue(baseContext as never);
    getHierarchyModelsMock.mockResolvedValue([]);
  });

  it('returns a getHierarchies function', () => {
    const { result } = renderHook(() => useHierarchiesLoader());

    expect(result.current.getHierarchies).toBeInstanceOf(Function);
  });

  it('throws TranslatableError when context is not initialized', async () => {
    useSisenseContextMock.mockReturnValue({
      isInitialized: false,
      app: undefined,
      tracking: { enabled: false, packageName: 'sdk-ui' },
      errorBoundary: { showErrorBox: false },
    } as never);

    const { result } = renderHook(() => useHierarchiesLoader());

    let thrown: unknown;
    await act(async () => {
      try {
        await result.current.getHierarchies({ attribute, ids: [] });
      } catch (error) {
        thrown = error;
      }
    });

    expect(thrown).toBeInstanceOf(TranslatableError);
  });

  it('calls getHierarchyModels with ids and alwaysIncluded true', async () => {
    getHierarchyModelsMock.mockResolvedValue([mockHierarchy]);

    const { result } = renderHook(() => useHierarchiesLoader());

    const hierarchies = await act(async () =>
      result.current.getHierarchies({
        attribute,
        ids: ['id-a', 'id-b'],
      }),
    );

    expect(getHierarchyModelsMock).toHaveBeenCalledWith(
      mockHttpClient,
      {
        dimension: attribute,
        dataSource: undefined,
        ids: ['id-a', 'id-b'],
        alwaysIncluded: true,
      },
      undefined,
    );
    expect(hierarchies).toEqual([mockHierarchy]);
  });

  it('returns empty array when no hierarchies are found', async () => {
    getHierarchyModelsMock.mockResolvedValue([]);

    const { result } = renderHook(() => useHierarchiesLoader());

    const hierarchies = await act(async () =>
      result.current.getHierarchies({ attribute, ids: ['missing-id'] }),
    );

    expect(hierarchies).toEqual([]);
  });

  it('rethrows when getHierarchyModels rejects', async () => {
    getHierarchyModelsMock.mockRejectedValue(new Error('network failure'));

    const { result } = renderHook(() => useHierarchiesLoader());

    let thrown: unknown;
    await act(async () => {
      try {
        await result.current.getHierarchies({ attribute, ids: ['id'] });
      } catch (error) {
        thrown = error;
      }
    });

    expect(thrown).toEqual(new Error('network failure'));
  });

  it('forwards dataSource to getHierarchyModels', async () => {
    const dataSource = 'Sample ECommerce';
    getHierarchyModelsMock.mockResolvedValue([]);

    const { result } = renderHook(() => useHierarchiesLoader());

    await act(async () => result.current.getHierarchies({ attribute, dataSource, ids: [] }));

    expect(getHierarchyModelsMock).toHaveBeenCalledWith(
      mockHttpClient,
      expect.objectContaining({ dataSource }),
      undefined,
    );
  });
});
