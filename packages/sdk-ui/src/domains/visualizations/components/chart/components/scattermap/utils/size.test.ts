import { ScattermapChartLocation } from '../../../../../core/chart-data/types';
import { getLocationsMarkerSizes } from './size';

describe('getLocationsMarkerSizes', () => {
  it('should calculate marker sizes correctly', () => {
    const locations = [{ value: 10 }, { value: 20 }, { value: 30 }];

    const result = getLocationsMarkerSizes(locations as ScattermapChartLocation[], 4, 24);
    const expectedSizes = locations.map((location) => ((location.value - 10) / 20) * 20 + 4);

    expect(result).toEqual(expectedSizes);
  });

  it('should handle locations with the same value', () => {
    const locations = [{ value: 15 }, { value: 15 }, { value: 15 }];

    const result = getLocationsMarkerSizes(locations as ScattermapChartLocation[], 4, 24);
    // Since all locations have the same value, the result should be an array of minsize
    const expectedSizes = locations.map(() => 4);

    expect(result).toEqual(expectedSizes);
  });

  it('should handle empty array of locations', () => {
    const result = getLocationsMarkerSizes([], 4, 24);

    // Since there are no locations, the result should be an empty array
    expect(result).toEqual([]);
  });
});
