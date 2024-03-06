import { Column, createAttribute } from '@sisense/sdk-data';
import { processDrilldownSelections, useCustomDrilldown } from './custom-drilldown.js';
import { act, renderHook } from '@testing-library/react';

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

const category = createAttribute({
  name: 'Category',
  type: 'text-attribute',
  expression: '[Commerce.Category]',
});

describe('Custom Drilldown', () => {
  describe('useCustomDrilldown', () => {
    it('should notify initial dimension is required', () => {
      expect(() =>
        useCustomDrilldown({
          drilldownDimensions: [],
          initialDimension: null as unknown as Column,
        }),
      ).toThrow('Initial dimension has to be specified to use drilldown with custom components');
    });

    it('should return correct initial drilldown props', () => {
      const { result } = renderHook(() =>
        useCustomDrilldown({ drilldownDimensions: [ageRange], initialDimension: gender }),
      );

      const {
        selectDrilldown,
        sliceDrilldownSelections,
        clearDrilldownSelections,
        drilldownSelections,
        availableDrilldowns,
      } = result.current;
      expect(selectDrilldown).toBeInstanceOf(Function);
      expect(sliceDrilldownSelections).toBeInstanceOf(Function);
      expect(clearDrilldownSelections).toBeInstanceOf(Function);
      expect(drilldownSelections).toStrictEqual([]);
      expect(availableDrilldowns).toStrictEqual([ageRange]);
    });

    it('should update drilldown selections correctly', () => {
      const { result } = renderHook(useCustomDrilldown, {
        initialProps: { drilldownDimensions: [ageRange], initialDimension: gender },
      });

      expect(result.current.drilldownSelections).toStrictEqual([]);
      act(() => result.current.selectDrilldown([{ value: 1 }], ageRange));
      expect(result.current.drilldownSelections).toStrictEqual([
        { points: [{ value: 1 }], nextDimension: ageRange },
      ]);
      expect(result.current.availableDrilldowns).toStrictEqual([]);
    });

    it('should slice drilldown selections correctly', () => {
      const { result } = renderHook(useCustomDrilldown, {
        initialProps: { drilldownDimensions: [ageRange, category], initialDimension: gender },
      });

      expect(result.current.drilldownSelections).toStrictEqual([]);
      act(() => result.current.selectDrilldown([{ value: 1 }], ageRange));
      expect(result.current.drilldownSelections).toStrictEqual([
        {
          points: [{ value: 1 }],
          nextDimension: ageRange,
        },
      ]);
      act(() => result.current.selectDrilldown([{ value: 2 }], category));
      expect(result.current.drilldownSelections).toStrictEqual([
        { points: [{ value: 1 }], nextDimension: ageRange },
        { points: [{ value: 2 }], nextDimension: category },
      ]);
      act(() => result.current.sliceDrilldownSelections(1));
      expect(result.current.drilldownSelections).toStrictEqual([
        {
          points: [{ value: 1 }],
          nextDimension: ageRange,
        },
      ]);
    });

    it('should clear drilldown selections correctly', () => {
      const { result } = renderHook(useCustomDrilldown, {
        initialProps: { drilldownDimensions: [ageRange], initialDimension: gender },
      });

      expect(result.current.drilldownSelections).toStrictEqual([]);
      act(() => result.current.selectDrilldown([{ value: 1 }], ageRange));
      expect(result.current.drilldownSelections).toStrictEqual([
        { points: [{ value: 1 }], nextDimension: ageRange },
      ]);
      act(() => result.current.clearDrilldownSelections());
      expect(result.current.drilldownSelections).toStrictEqual([]);
    });
  });

  describe('processDrilldownSelections', () => {
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
});
