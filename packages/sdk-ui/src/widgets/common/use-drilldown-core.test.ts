import { Column, createAttribute } from '@sisense/sdk-data';
import { type TFunction } from '@sisense/sdk-common';
import { processDrilldownSelections, useDrilldownCore } from './use-drilldown-core.js';
import { act, renderHook } from '@testing-library/react';
import get from 'lodash-es/get';
import { translation } from '@/translation/resources/en.js';

const ageRange = createAttribute({
  name: 'Age Range',
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

const translateMock = vi.fn((key: string) => get(translation, key)) as unknown as TFunction;

vi.mock('react-i18next', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-i18next')>();
  return {
    ...mod,
    useTranslation: () => ({ t: translateMock }),
  };
});

describe('Drilldown', () => {
  describe('useDrilldownCore', () => {
    it('should notify initial dimension is required', () => {
      expect(() =>
        renderHook(() =>
          useDrilldownCore({
            drilldownPaths: [],
            initialDimension: null as unknown as Column,
          }),
        ),
      ).toThrow('Initial dimension has to be specified to use drilldown with custom components');
    });

    it('should return correct initial drilldown props', () => {
      const { result } = renderHook(() =>
        useDrilldownCore({
          drilldownPaths: [ageRange],
          initialDimension: gender,
        }),
      );

      const {
        selectDrilldown,
        sliceDrilldownSelections,
        clearDrilldownSelections,
        drilldownSelections,
        availableDrilldownPaths,
      } = result.current;
      expect(selectDrilldown).toBeInstanceOf(Function);
      expect(sliceDrilldownSelections).toBeInstanceOf(Function);
      expect(clearDrilldownSelections).toBeInstanceOf(Function);
      expect(drilldownSelections).toStrictEqual([]);
      expect(availableDrilldownPaths).toStrictEqual([ageRange]);
    });

    it('should update drilldown selections by dimension', () => {
      const { result } = renderHook(useDrilldownCore, {
        initialProps: {
          drilldownPaths: [ageRange],
          initialDimension: gender,
        },
      });

      expect(result.current.drilldownSelections).toStrictEqual([]);
      act(() => result.current.selectDrilldown([{ value: 1 }], ageRange));
      expect(result.current.drilldownSelections).toStrictEqual([
        { points: [{ value: 1 }], nextDimension: ageRange },
      ]);
      expect(result.current.availableDrilldownPaths).toStrictEqual([]);
    });

    it('should update drilldown selections by hierarchy', () => {
      const hierarchy = {
        title: 'Some hierarchy',
        levels: [gender, category, ageRange],
      };
      const { result } = renderHook(useDrilldownCore, {
        initialProps: {
          drilldownPaths: [hierarchy],
          initialDimension: gender,
        },
      });

      expect(result.current.drilldownSelections).toStrictEqual([]);
      act(() => result.current.selectDrilldown([{ value: 1 }], ageRange, hierarchy));
      expect(result.current.drilldownSelections).toStrictEqual([
        { points: [{ value: 1 }], nextDimension: category },
        { points: [], nextDimension: ageRange },
      ]);
      expect(result.current.availableDrilldownPaths.length).toBe(1);
    });

    it('should update drilldown selections by already selected level of hierarchy', () => {
      const hierarchy = {
        title: 'Some hierarchy',
        levels: [gender, category, ageRange],
      };
      const { result } = renderHook(useDrilldownCore, {
        initialProps: {
          drilldownPaths: [hierarchy],
          initialDimension: gender,
        },
      });

      act(() => result.current.selectDrilldown([{ value: 1 }], ageRange, hierarchy));
      expect(result.current.drilldownSelections).toStrictEqual([
        { points: [{ value: 1 }], nextDimension: category },
        { points: [], nextDimension: ageRange },
      ]);
      act(() => result.current.selectDrilldown([{ value: 1 }], category, hierarchy));
      expect(result.current.drilldownSelections).toStrictEqual([
        { points: [{ value: 1 }], nextDimension: category },
      ]);
      expect(result.current.availableDrilldownPaths.length).toBe(1);
    });

    it('should slice drilldown selections correctly', () => {
      const { result } = renderHook(useDrilldownCore, {
        initialProps: {
          drilldownPaths: [ageRange, category],
          initialDimension: gender,
        },
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
      const { result } = renderHook(useDrilldownCore, {
        initialProps: {
          drilldownPaths: [ageRange],
          initialDimension: gender,
        },
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
        processDrilldownSelections([{ points, nextDimension }], gender, translateMock);
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
