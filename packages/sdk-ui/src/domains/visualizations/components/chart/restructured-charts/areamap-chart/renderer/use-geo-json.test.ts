/** @vitest-environment jsdom */

/* eslint-disable vitest/no-commented-out-tests */
import { renderHook, waitFor } from '@testing-library/react';
import { Mock } from 'vitest';

import { ClientApplication } from '@/infra/app/client-application.js';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context.js';
import { AreamapType } from '@/types.js';

import { useGeoJson } from './use-geo-json.js';

// Mock the sisense-context.js module

vi.mock('@/infra/contexts/sisense-context/sisense-context.js', async () => {
  const actual: typeof import('@/infra/contexts/sisense-context/sisense-context.js') =
    await vi.importActual('@/infra/contexts/sisense-context/sisense-context.js');

  return {
    ...actual,
    useSisenseContext: vi.fn(() => {
      return {
        app: {
          settings: {
            serverVersion: 'mockVersion',
            trackingConfig: {
              enabled: false,
            },
          },
        },
        isInitialized: true,
      };
    }),
  };
});

const useSisenseContextMock = useSisenseContext as Mock<typeof useSisenseContext>;

// Mock the infra/api/rest-api.js module
const mockApi = {
  isReady: true,
  restApi: {
    getCountriesGeoJson: vi.fn(),
    getUsaStatesGeoJson: vi.fn(),
  },
};
vi.mock('@/infra/api/rest-api.js', () => ({
  useRestApi: vi.fn(() => mockApi),
}));

// Mock the LocalStorage
class LocalStorageMock {
  getItem(key: string) {
    return this[key] ?? null;
  }

  setItem(key: string, value: string) {
    this[key] = value;
  }

  removeItem(key: string) {
    delete this[key];
  }

  clear() {
    for (const key of Object.keys(this)) {
      delete this[key];
    }
  }
}
const localStorageMock = new LocalStorageMock();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useGeoJson', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    mockApi.restApi.getCountriesGeoJson.mockClear();
    mockApi.restApi.getUsaStatesGeoJson.mockClear();
  });

  it('should fetch geoJson from the server and store it in LocalStorage when not cached', async () => {
    const mapType: AreamapType = 'world';

    // Mock the getCountriesGeoJson function from the api module
    mockApi.restApi.getCountriesGeoJson.mockResolvedValueOnce({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: {}, geometry: {} }],
    });

    const { result } = renderHook(() => useGeoJson(mapType));
    await waitFor(() => {
      expect(result.current.geoJson).toBeDefined();
      expect(result.current.error).toBeUndefined();

      // Check if the data is stored in LocalStorage
      const cacheKey = `geoJson_${mapType}_mockVersion`;
      expect(localStorage.getItem(cacheKey)).toEqual(
        JSON.stringify({
          type: 'FeatureCollection',
          features: [{ type: 'Feature', properties: {}, geometry: {} }],
        }),
      );
    });
  });

  it('should handle empty result gracefully when fetching geoJson from the server', async () => {
    const mapType: AreamapType = 'world';

    // Mock an error in the getCountriesGeoJson function from the api module
    mockApi.restApi.getCountriesGeoJson.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useGeoJson(mapType));

    await waitFor(() => {
      expect(result.current.geoJson).toBeUndefined();
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toContain('Failed loading map');
    });
  });

  it('should fetch geoJson from LocalStorage when cached', async () => {
    const mapType: AreamapType = 'world';

    // Mock the LocalStorage with cached data
    const cacheKey = `geoJson_${mapType}_mockVersion`;
    const cachedData = JSON.stringify({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: {}, geometry: {} }],
    });
    localStorage.setItem(cacheKey, cachedData);

    const { result } = renderHook(() => useGeoJson(mapType));

    await waitFor(() => {
      expect(result.current.geoJson).toBeDefined();
      expect(result.current.error).toBeUndefined();
      expect(result.current.geoJson).toEqual(JSON.parse(cachedData));
    });
  });

  it('should handle errors gracefully when fetching geoJson from the server', async () => {
    const mapType: AreamapType = 'world';

    // Mock an error in the getCountriesGeoJson function from the api module
    mockApi.restApi.getCountriesGeoJson.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useGeoJson(mapType));

    await waitFor(() => {
      expect(result.current.geoJson).toBeUndefined();
      expect(result.current.error).toEqual(new Error('Server error'));
    });
  });

  it('should fix feature IDs for unrecognized states', async () => {
    const mapType: AreamapType = 'world';

    // Mock the getCountriesGeoJson function from the api module
    mockApi.restApi.getCountriesGeoJson.mockResolvedValueOnce({
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: { name: 'Atlantida' }, geometry: {}, id: '-99' },
        { type: 'Feature', properties: { name: 'Narnia' }, geometry: {}, id: '-99' },
      ],
    });

    const { result } = renderHook(() => useGeoJson(mapType));

    await waitFor(() => {
      // Check if the feature IDs are fixed for unrecognized states
      expect(result.current.geoJson).toBeDefined();
      expect(result.current.error).toBeUndefined();

      const fixedGeoJson = result.current.geoJson;
      expect(fixedGeoJson?.features).toHaveLength(2);
      expect(fixedGeoJson?.features[0].id).not.toBe('-99');
      expect(fixedGeoJson?.features[1].id).toBe('Narnia');
    });
  });

  it('should throw an error for unsupported map types', () => {
    const unsupportedMapType: AreamapType = 'galaxy' as AreamapType;

    const { result } = renderHook(() => useGeoJson(unsupportedMapType));
    expect(result.current.geoJson).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('Unsupported map type: galaxy');
  });

  it('should cleanup outdated geoJson caches from LocalStorage when Sisense version changes', async () => {
    const mapType: AreamapType = 'world';
    // Set the cache for the old Sisense version into fake LocalStorage
    const oldCacheKey = `geoJson_${mapType}_oldMockVersion`;
    const cachedData = JSON.stringify({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: {}, geometry: {}, id: 'SomeOldCountry' }],
    });
    localStorage.setItem(oldCacheKey, cachedData);

    useSisenseContextMock.mockReturnValueOnce({
      app: { settings: { serverVersion: 'newMockVersion' } } as ClientApplication,
      isInitialized: true,
      tracking: {
        enabled: false,
        packageName: 'sdk-ui',
      },
      errorBoundary: {
        showErrorBox: true,
      },
    });

    mockApi.restApi.getCountriesGeoJson.mockResolvedValueOnce({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: {}, geometry: {}, id: 'SomeNewCountry' }],
    });

    const { result } = renderHook(() => useGeoJson(mapType));

    // Check if the outdated cache is removed
    await waitFor(() => {
      expect(result.current.geoJson?.features[0].id).toBe('SomeNewCountry');
      expect(localStorage.getItem(oldCacheKey)).toBeNull();
      expect(localStorage.getItem(`geoJson_${mapType}_newMockVersion`)).toBeDefined();
    });
  });
});
