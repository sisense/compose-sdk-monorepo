/** @vitest-environment jsdom */

/* eslint-disable vitest/no-commented-out-tests */
import { renderHook, waitFor } from '@testing-library/react';
import { useGeoJson } from './use-geo-json.js';
import { AreamapType } from '../../../types.js';
import { Mock } from 'vitest';
import { useSisenseContext } from '../../../sisense-context/sisense-context';
import { ClientApplication } from '../../../app/client-application.js';

// Mock the sisense-context.js module

vi.mock('../../../sisense-context/sisense-context', async () => {
  const actual: typeof import('../../../sisense-context/sisense-context') = await vi.importActual(
    '../../../sisense-context/sisense-context',
  );

  return {
    ...actual,
    useSisenseContext: vi.fn(() => {
      return {
        app: { settings: { serverVersion: 'mockVersion' } },
        isInitialized: true,
        enableTracking: false,
      };
    }),
  };
});

const useSisenseContextMock = useSisenseContext as Mock<
  Parameters<typeof useSisenseContext>,
  ReturnType<typeof useSisenseContext>
>;

// Mock the api/rest-api.js module
const mockApi = {
  getCountriesGeoJson: vi.fn(),
  getUsaStatesGeoJson: vi.fn(),
};
vi.mock('../../../api/rest-api.js', () => ({
  useGetApi: vi.fn(() => mockApi),
}));

// Mock the LocalStorage
const localStorageMock = (function () {
  return {
    getItem: function (key: string): any {
      return this[key] || null;
    },
    setItem: function (key: string, value: string) {
      this[key] = value.toString();
    },
    removeItem: function (key: string) {
      delete this[key];
    },
    clear: function () {
      Object.keys(this).forEach((key) => {
        if (['getItem', 'setItem', 'removeItem', 'clear'].includes(key)) return;
        delete this[key];
      });
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useGeoJson', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    mockApi.getCountriesGeoJson.mockClear();
    mockApi.getUsaStatesGeoJson.mockClear();
  });

  it('should fetch geoJson from the server and store it in LocalStorage when not cached', async () => {
    const mapType: AreamapType = 'world';

    // Mock the getCountriesGeoJson function from the api module
    mockApi.getCountriesGeoJson.mockResolvedValueOnce({
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
    mockApi.getCountriesGeoJson.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useGeoJson(mapType));

    await waitFor(() => {
      expect(result.current.geoJson).toBeUndefined();
      expect(result.current.error).toEqual(new Error('Server error'));
    });
  });

  it('should fix feature IDs for unrecognized states', async () => {
    const mapType: AreamapType = 'world';

    // Mock the getCountriesGeoJson function from the api module
    mockApi.getCountriesGeoJson.mockResolvedValueOnce({
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
    const unsupportedMapType: AreamapType = 'galactica' as AreamapType;

    const { result } = renderHook(() => useGeoJson(unsupportedMapType));

    expect(result.current.geoJson).toBeUndefined();
    expect(result.current.error).toEqual(new Error(`Unsupported map type: galactica`));
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
      enableTracking: false,
    });

    mockApi.getCountriesGeoJson.mockResolvedValueOnce({
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
