// useConvertFilterRelations.spec.tsx
import { useConvertFilterRelations } from './use-convert-filter-relations';
import { filterFactory } from '@ethings-os/sdk-data';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { renderHook } from '@testing-library/react';
import { act } from 'react';

describe('useConvertFilterRelations', () => {
  const filter1 = filterFactory.members(DM.Commerce.AgeRange, ['0-18', '25-34']);
  const filter2 = filterFactory.members(DM.Commerce.Gender, ['Female']);
  const filter3 = filterFactory.members(DM.Commerce.Condition, ['New']);
  const filter4 = filterFactory.members(DM.Country.Country, ['France']);
  describe('regularFilters and filtersOrFilterRelations', () => {
    it('should initialize with an array of filters', () => {
      const initialFilters = [filter1, filter2];

      const { result } = renderHook(() => useConvertFilterRelations(initialFilters));

      expect(result.current.regularFilters).toEqual(initialFilters);
      expect(result.current.filtersOrFilterRelations).toEqual(initialFilters);
    });

    it('should initialize with FilterRelations', () => {
      const initialRelations = filterFactory.logic.or(filter1, filter2);

      const { result } = renderHook(() => useConvertFilterRelations(initialRelations));

      expect(result.current.regularFilters).toEqual([filter1, filter2]);
      expect(result.current.filtersOrFilterRelations).toEqual(initialRelations);
    });

    it('should add a filter and update relations', () => {
      const initialFilters = filterFactory.logic.or(filter1, filter2);
      const newFilter = filter3;

      const { result } = renderHook(() => useConvertFilterRelations(initialFilters));

      act(() => {
        result.current.addFilter(newFilter);
      });

      expect(result.current.regularFilters).toEqual([filter1, filter2, filter3]);
      expect(result.current.filtersOrFilterRelations).toEqual(
        filterFactory.logic.and(filterFactory.logic.or(filter1, filter2), newFilter),
      );
    });
  });

  describe('setFilters', () => {
    it('should set new filters and recalculate relations (added filter)', () => {
      const initialFilters = filterFactory.logic.or(filter1, filter2);
      const newFilters = [filter1, filter2, filter3];

      const { result } = renderHook(() => useConvertFilterRelations(initialFilters));

      act(() => {
        result.current.setFilters(newFilters);
      });

      expect(result.current.regularFilters).toEqual(newFilters);
      expect(result.current.filtersOrFilterRelations).toEqual(
        filterFactory.logic.and(filterFactory.logic.or(filter1, filter2), filter3),
      );
    });

    it('should set new filters and recalculate relations (filter removed, left only one filter)', () => {
      const initialFilters = filterFactory.logic.or(filter1, filter2);
      const newFilters = [filter1];

      const { result } = renderHook(() => useConvertFilterRelations(initialFilters));

      act(() => {
        result.current.setFilters(newFilters);
      });

      expect(result.current.regularFilters).toEqual(newFilters);
      expect(result.current.filtersOrFilterRelations).toEqual(newFilters);
    });

    it('should set new filters and recalculate relations (filter removed, left more than one filter)', () => {
      const initialFilters = filterFactory.logic.and(
        filterFactory.logic.or(filter1, filter2),
        filterFactory.logic.or(filter3, filter4),
      );
      const newFilters = [filter1, filter3, filter4];

      const { result } = renderHook(() => useConvertFilterRelations(initialFilters));

      act(() => {
        result.current.setFilters(newFilters);
      });

      expect(result.current.regularFilters).toEqual(newFilters);
      expect(result.current.filtersOrFilterRelations).toEqual(
        filterFactory.logic.and(filter1, filterFactory.logic.or(filter3, filter4)),
      );
    });
  });

  describe('setFiltersOrFilterRelations', () => {
    it('should completely replace with new filters', () => {
      const initialFilters = filterFactory.logic.or(filter1, filter2);
      const newFilters = [filter2, filter3];

      const { result } = renderHook(() => useConvertFilterRelations(initialFilters));

      act(() => {
        result.current.setFiltersOrFilterRelations(newFilters);
      });

      expect(result.current.regularFilters).toEqual(newFilters);
      expect(result.current.filtersOrFilterRelations).toEqual(newFilters);
    });
    it('should completely reset with new filter relations', () => {
      const initialFilters = [filter1, filter2];
      const newFilterRelations = filterFactory.logic.or(filter3, filter4);

      const { result } = renderHook(() => useConvertFilterRelations(initialFilters));

      act(() => {
        result.current.setFiltersOrFilterRelations(newFilterRelations);
      });

      expect(result.current.regularFilters).toEqual([filter3, filter4]);
      expect(result.current.filtersOrFilterRelations).toEqual(newFilterRelations);
    });
  });

  describe('applyRelationsToOtherFilters', () => {
    it('should apply relations to new filters', () => {
      const initialRelations = filterFactory.logic.or(filter1, filter2);

      const { result } = renderHook(() => useConvertFilterRelations(initialRelations));

      const newFilters = [filter1, filter2, filter3, filter4];

      let newFiltersOrRelations;
      act(() => {
        newFiltersOrRelations = result.current.applyRelationsToOtherFilters(newFilters);
      });
      expect(newFiltersOrRelations).toEqual(
        // (filter1 OR filter2) AND filter3 AND filter4
        filterFactory.logic.and(
          filterFactory.logic.and(filterFactory.logic.or(filter1, filter2), filter3),
          filter4,
        ),
      );
    });
    it('should reassemble cascading filters if they are present in original filters', () => {
      const cascadingFilter = filterFactory.cascading([filter2, filter3], {
        disabled: false,
      });
      const initialRelations = filterFactory.logic.or(filter1, cascadingFilter);

      const { result } = renderHook(() => useConvertFilterRelations(initialRelations));

      const newFilters = [filter1, filter2, filter3, filter4];

      let newFiltersOrRelations;
      act(() => {
        newFiltersOrRelations = result.current.applyRelationsToOtherFilters(newFilters);
      });
      expect(newFiltersOrRelations).toEqual(
        // (filter1 OR cascadinFilter) AND filter4
        filterFactory.logic.and(filterFactory.logic.or(filter1, cascadingFilter), filter4),
      );
    });
    it('shouldn`t apply relations to new filters if there are no previous relations', () => {
      const initialFilters = [filter1, filter2];
      const { result } = renderHook(() => useConvertFilterRelations(initialFilters));

      const newFilters = [filter1, filter2, filter3, filter4];

      let newFiltersOrRelations;
      act(() => {
        newFiltersOrRelations = result.current.applyRelationsToOtherFilters(newFilters);
      });
      expect(newFiltersOrRelations).toEqual([filter1, filter2, filter3, filter4]);
    });
  });
});
