import { Column, createAttribute } from '@sisense/sdk-data';
import { processDrilldownSelections, useCustomDrilldown } from './custom-drilldown.js';

const ageRange = createAttribute({
  name: 'AgeRange',
  type: 'text-attribute',
  expression: '[Commerce.Age Range]',
});

const gender = createAttribute({
  name: 'Gender',
  type: 'text-attribute',
  expression: '[Commerce.Gender]',
});

describe('useCustomDrilldown', () => {
  it('should notify initial dimension is required', () => {
    expect(() =>
      useCustomDrilldown({ drilldownDimensions: [], initialDimension: null as unknown as Column }),
    ).toThrow('Initial dimension has to be specified to use drilldown with custom components');
  });

  it('should process drilldown dimensions correctly', () => {
    const points = [
      { categoryValue: 'Male', categoryDisplayValue: 'Gentlemen' },
      { categoryValue: 'Female', categoryDisplayValue: 'Ladies' },
    ];
    const nextDimension = ageRange;

    const { drilldownFilters, drilldownFiltersDisplayValues, drilldownDimension } =
      processDrilldownSelections([{ points, nextDimension }], gender);
    expect(drilldownFilters.length).toBe(1);
    expect(drilldownFilters[0].members).toStrictEqual(points.map((point) => point.categoryValue));
    expect(drilldownFiltersDisplayValues.length).toBe(1);
    expect(drilldownFiltersDisplayValues[0]).toStrictEqual(
      points.map((point) => point.categoryDisplayValue),
    );
    expect(drilldownDimension).toBe(nextDimension);
  });
});
