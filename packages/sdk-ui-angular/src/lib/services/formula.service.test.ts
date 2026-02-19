/** @vitest-environment jsdom */

/* eslint-disable @typescript-eslint/unbound-method */
import type { CalculatedMeasure } from '@sisense/sdk-data';
import { HookAdapter } from '@sisense/sdk-ui-preact';
import { of } from 'rxjs';

import { FormulaService, GetSharedFormulaParams } from './formula.service';
import { SisenseContextService } from './sisense-context.service';

vi.mock('../decorators/trackable.decorator', () => ({
  TrackableService: (_target: any, _key: string, descriptor: PropertyDescriptor) => descriptor,
}));

vi.mock('@sisense/sdk-ui-preact', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sisense/sdk-ui-preact')>();
  return {
    ...actual,
    useGetSharedFormulaInternal: vi.fn(),
    HookAdapter: vi.fn().mockImplementation(() => ({
      subscribe: vi.fn(),
      run: vi.fn(),
      destroy: vi.fn(),
    })),
  };
});

const MockHookAdapter = vi.mocked(HookAdapter);

describe('FormulaService', () => {
  let formulaService: FormulaService;
  let sisenseContextServiceMock: Partial<SisenseContextService>;

  beforeEach(() => {
    vi.clearAllMocks();

    sisenseContextServiceMock = {
      getApp: vi.fn().mockResolvedValue({}),
      getApp$: vi.fn().mockReturnValue(of({ app: {} })),
      getConfig: vi.fn().mockReturnValue({
        showRuntimeErrors: false,
        appConfig: {
          trackingConfig: {
            enabled: true,
          },
        },
      }),
      isInitialized: true,
    };

    formulaService = new FormulaService(sisenseContextServiceMock as SisenseContextService);
  });

  it('should be created', () => {
    expect(formulaService).toBeTruthy();
  });

  describe('getSharedFormula', () => {
    it('should pass correct parameters to the hook', async () => {
      const mockResult = {
        isSuccess: true,
        isLoading: false,
        isError: false,
        error: undefined,
        formula: {},
        status: 'success' as const,
      };

      let capturedParams: any;
      MockHookAdapter.mockImplementation(
        () =>
          ({
            subscribe: vi.fn((callback) => {
              setTimeout(() => callback(mockResult), 0);
              return { unsubscribe: vi.fn() };
            }),
            run: vi.fn((params) => {
              capturedParams = params;
            }),
            destroy: vi.fn(),
          } as any),
      );

      const params: GetSharedFormulaParams = {
        oid: 'test-oid-123',
      };

      await formulaService.getSharedFormula(params);

      expect(capturedParams).toMatchObject({
        oid: 'test-oid-123',
      });
    });

    it('should retrieve shared formula successfully', async () => {
      const mockFormula: CalculatedMeasure = {
        name: 'Test Formula',
        expression: '[Sales] + [Cost]',
      } as CalculatedMeasure;

      const mockResult = {
        isSuccess: true,
        isLoading: false,
        isError: false,
        error: undefined,
        formula: mockFormula,
        status: 'success' as const,
      };

      // Mock HookAdapter behavior
      MockHookAdapter.mockImplementation(
        () =>
          ({
            subscribe: vi.fn((callback) => {
              // Simulate immediate callback with result
              setTimeout(() => callback(mockResult), 0);
              return { unsubscribe: vi.fn() };
            }),
            run: vi.fn(),
            destroy: vi.fn(),
          } as any),
      );

      const params: GetSharedFormulaParams = {
        oid: 'd61c337b-fabc-4e9e-b4cc-a30116857153',
      };

      const result = await formulaService.getSharedFormula(params);

      expect(result).toEqual(mockFormula);
      expect(result?.name).toBe('Test Formula');
    });

    it('should return null when formula is not found', async () => {
      const mockResult = {
        isSuccess: true,
        isLoading: false,
        isError: false,
        error: undefined,
        formula: null,
        status: 'success' as const,
      };

      MockHookAdapter.mockImplementation(
        () =>
          ({
            subscribe: vi.fn((callback) => {
              setTimeout(() => callback(mockResult), 0);
              return { unsubscribe: vi.fn() };
            }),
            run: vi.fn(),
            destroy: vi.fn(),
          } as any),
      );

      const params: GetSharedFormulaParams = {
        oid: 'non-existent-oid',
      };

      const result = await formulaService.getSharedFormula(params);

      expect(result).toBeNull();
    });

    it('should handle errors correctly', async () => {
      const mockError = new Error('Formula not found');
      const mockResult = {
        isSuccess: false,
        isLoading: false,
        isError: true,
        error: mockError,
        formula: undefined,
        status: 'error' as const,
      };

      // Mock HookAdapter behavior for error case
      MockHookAdapter.mockImplementation(
        () =>
          ({
            subscribe: vi.fn((callback) => {
              // Simulate immediate callback with error
              setTimeout(() => callback(mockResult), 0);
              return { unsubscribe: vi.fn() };
            }),
            run: vi.fn(),
            destroy: vi.fn(),
          } as any),
      );

      const params: GetSharedFormulaParams = {
        oid: 'invalid-oid',
      };

      await expect(formulaService.getSharedFormula(params)).rejects.toThrow('Formula not found');
    });

    it('should call destroy on HookAdapter after completion', async () => {
      const mockFormula: CalculatedMeasure = {
        name: 'Test Formula',
        expression: '[Sales]',
      } as CalculatedMeasure;

      const mockResult = {
        isSuccess: true,
        isLoading: false,
        isError: false,
        error: undefined,
        formula: mockFormula,
        status: 'success' as const,
      };

      const destroySpy = vi.fn();
      MockHookAdapter.mockImplementation(
        () =>
          ({
            subscribe: vi.fn((callback) => {
              setTimeout(() => callback(mockResult), 0);
              return { unsubscribe: vi.fn() };
            }),
            run: vi.fn(),
            destroy: destroySpy,
          } as any),
      );

      const params: GetSharedFormulaParams = {
        oid: 'test-oid',
      };

      await formulaService.getSharedFormula(params);

      expect(destroySpy).toHaveBeenCalledTimes(1);
    });

    it('should call destroy on HookAdapter even when error occurs', async () => {
      const mockError = new Error('Test error');
      const mockResult = {
        isSuccess: false,
        isLoading: false,
        isError: true,
        error: mockError,
        formula: undefined,
        status: 'error' as const,
      };

      const destroySpy = vi.fn();
      MockHookAdapter.mockImplementation(
        () =>
          ({
            subscribe: vi.fn((callback) => {
              setTimeout(() => callback(mockResult), 0);
              return { unsubscribe: vi.fn() };
            }),
            run: vi.fn(),
            destroy: destroySpy,
          } as any),
      );

      const params: GetSharedFormulaParams = {
        oid: 'test-oid',
      };

      await expect(formulaService.getSharedFormula(params)).rejects.toThrow('Test error');
      expect(destroySpy).toHaveBeenCalledTimes(1);
    });
  });
});
