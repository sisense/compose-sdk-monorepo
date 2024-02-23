/* eslint-disable vitest/no-conditional-expect */
import { renderHook, waitFor } from '@testing-library/react';
import { useGetSharedFormula } from './use-get-shared-formula';
import { translation } from '../translation/resources/en.js';
import { useSisenseContextMock } from '../sisense-context/__mocks__/sisense-context.js';
import { Mock } from 'vitest';
import { ClientApplication } from '../app/client-application.js';
import { fetchFormula, fetchFormulaByOid } from './fetch-formula.js';
import { DimensionalCalculatedMeasure } from '@sisense/sdk-data';
import { trackProductEvent } from '@sisense/sdk-tracking';

vi.mock('../sisense-context/sisense-context');

vi.mock('@sisense/sdk-tracking', async () => {
  const actual: typeof import('@sisense/sdk-tracking') = await vi.importActual(
    '@sisense/sdk-tracking',
  );
  return {
    ...actual,
    trackProductEvent: vi.fn().mockImplementation(() => {
      console.log('trackProductEvent');
      return Promise.resolve();
    }),
  };
});

vi.mock('./fetch-formula', () => ({
  fetchFormula: vi.fn(),
  fetchFormulaByOid: vi.fn(),
}));

const fetchFormulaMock = fetchFormula as Mock<
  Parameters<typeof fetchFormula>,
  ReturnType<typeof fetchFormula>
>;

const fetchFormulaByOidMock = fetchFormulaByOid as Mock<
  Parameters<typeof fetchFormulaByOid>,
  ReturnType<typeof fetchFormulaByOid>
>;

const trackProductEventMock = trackProductEvent as Mock<
  Parameters<typeof trackProductEvent>,
  ReturnType<typeof trackProductEvent>
>;

const formulaParamsMock = {
  name: 'mock formula',
  dataSource: 'MockDatasource',
  oid: 'random-oid',
};

const calculatedMeasureMock = new DimensionalCalculatedMeasure('', '', {});

describe('useGetSharedFormula', () => {
  beforeEach(() => {
    useSisenseContextMock.mockReturnValue({
      app: {} as ClientApplication,
      isInitialized: true,
      enableTracking: false,
    });
    fetchFormulaMock.mockImplementation(() => Promise.resolve(calculatedMeasureMock));
    fetchFormulaByOidMock.mockImplementation(() => Promise.resolve(calculatedMeasureMock));
  });
  it('should trow an error if no identifier provided', () => {
    try {
      renderHook(() => {
        useGetSharedFormula({});
        // should never get here
        expect(false).toBeNull();
      });
    } catch (err) {
      expect((err as Error).message).toBe(translation.errors.sharedFormula.identifierExpected);
    }
  });

  it('should trow an error if name is provided without data source', () => {
    try {
      renderHook(() => {
        useGetSharedFormula({ name: formulaParamsMock.name });
        // should never get here
        expect(false).toBeNull();
      });
    } catch (err) {
      expect((err as Error).message).toBe(translation.errors.sharedFormula.identifierExpected);
    }
  });

  it('should work with name and data source', async () => {
    const { result } = renderHook(() =>
      useGetSharedFormula({
        name: formulaParamsMock.name,
        dataSource: formulaParamsMock.dataSource,
      }),
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.formula).toBe(calculatedMeasureMock);
    });
  });

  it('should work with oid', async () => {
    const { result } = renderHook(() => useGetSharedFormula({ oid: formulaParamsMock.oid }));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.formula).toBe(calculatedMeasureMock);
    });
  });

  it('should handle shared formula fetch by oid error', async () => {
    const mockError = new Error('Dashboard fetch error');
    fetchFormulaByOidMock.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useGetSharedFormula({ oid: formulaParamsMock.oid }));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(mockError);
    });
  });

  it('should handle shared formula fetch by name error', async () => {
    const mockError = new Error('Dashboard fetch error');
    fetchFormulaMock.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() =>
      useGetSharedFormula({
        name: formulaParamsMock.name,
        dataSource: formulaParamsMock.dataSource,
      }),
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(mockError);
    });
  });

  it('should send tracking for the first execution', async () => {
    useSisenseContextMock.mockReturnValue({
      app: { httpClient: {} } as ClientApplication,
      isInitialized: true,
      enableTracking: true,
    });
    vi.stubGlobal('__PACKAGE_VERSION__', 'unit-test-version');

    const { result } = renderHook(() => useGetSharedFormula({ oid: formulaParamsMock.oid }));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.formula).toBe(calculatedMeasureMock);
    });

    expect(trackProductEventMock).toHaveBeenCalledOnce();
    expect(trackProductEventMock).toHaveBeenCalledWith(
      'sdkHookInit',
      expect.objectContaining({
        hookName: 'useGetSharedFormula',
      }),
      expect.anything(),
      expect.any(Boolean),
    );
  });
});
