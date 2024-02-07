import { combineLocationNames, getLocationGeoLevel, splitLocationName } from './location';

describe('combineLocationNames', () => {
  it('should combine location names with delimiter', () => {
    const names = ['City1', 'City2', 'City3'];
    const result = combineLocationNames(names);
    expect(result).toBe('City1, City2, City3');
  });

  it('should return empty string for empty array', () => {
    const result = combineLocationNames([]);
    expect(result).toBe('');
  });
});

describe('splitLocationName', () => {
  it('should split combined location into array of names', () => {
    const combinedLocation = 'City1, City2, City3';
    const result = splitLocationName(combinedLocation);
    expect(result).toEqual(['City1', 'City2', 'City3']);
  });
});

describe('getLocationGeoLevel', () => {
  it('should return corresponding geo level for city', () => {
    const result = getLocationGeoLevel('city');
    expect(result).toBe('city');
  });

  it('should return corresponding geo level for state', () => {
    const result = getLocationGeoLevel('state');
    expect(result).toBe('adm');
  });

  it('should return corresponding geo level for country', () => {
    const result = getLocationGeoLevel('country');
    expect(result).toBe('country');
  });
});
