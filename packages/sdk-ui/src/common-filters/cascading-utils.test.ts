import * as DM from '@/__test-helpers__/sample-ecommerce';
import { filterFactory, CascadingFilter, Filter, isCascadingFilter } from '@sisense/sdk-data';
import omit from 'lodash-es/omit';
import {
  flattenCascadingFilters,
  reassembleCascadingFilters,
  withCascadingFiltersConversion,
} from './cascading-utils';

function withoutGuids(filters: Filter[]) {
  return filters.map((filter) => omit(filter, 'guid'));
}

describe('cascading-utils', () => {
  describe('flattenCascadingFilters()', () => {
    it('should flatten cascading filters', () => {
      const dashboardingFilters = [
        new CascadingFilter([
          filterFactory.members(DM.Commerce.Condition, ['Used', 'Refurbished']),
          filterFactory.members(DM.Commerce.AgeRange, ['18-24']),
          filterFactory.members(DM.Commerce.Gender, ['Male']),
        ]),
      ];

      const { flatFilters } = flattenCascadingFilters(dashboardingFilters);
      expect(flatFilters).toHaveLength(3);
      expect(withoutGuids(flatFilters)).toEqual(withoutGuids(dashboardingFilters[0].filters));
    });
  });
  describe('reassembleCascadingFilters()', () => {
    it('should reassemble cascading filters', () => {
      const initialFilters = [
        new CascadingFilter([
          filterFactory.members(DM.Commerce.Condition, ['Used', 'Refurbished']),
          filterFactory.members(DM.Commerce.AgeRange, ['18-24']),
        ]),
      ];
      const updatedFilters = [
        filterFactory.members(DM.Commerce.Condition, ['Used', 'Refurbished']),
        filterFactory.members(DM.Commerce.AgeRange, ['65+']),
      ];

      const reassembledFilters = reassembleCascadingFilters(updatedFilters, initialFilters);

      expect(reassembledFilters).toHaveLength(1);
      expect(isCascadingFilter(reassembledFilters[0])).toBe(true);
      expect(withoutGuids((reassembledFilters[0] as CascadingFilter).filters)).toEqual(
        withoutGuids(updatedFilters),
      );
    });
  });

  describe('withCascadingFiltersConversion()', () => {
    it('should flatten and reassemble cascading filters', () => {
      const dashboardingFilters = [
        new CascadingFilter([
          filterFactory.members(DM.Commerce.Condition, ['Used', 'Refurbished']),
          filterFactory.members(DM.Commerce.Gender, ['Male']),
          filterFactory.members(DM.Commerce.AgeRange, ['18-24']),
        ]),
      ];

      const setDashboardingFilters = vi.fn();

      const widgetFilters: Filter[] = [filterFactory.members(DM.Commerce.AgeRange, ['65+'])];

      const { pureFilters, updateFilters } = withCascadingFiltersConversion(
        dashboardingFilters,
        setDashboardingFilters,
        { all: false, ids: [] },
      );

      expect(pureFilters).toHaveLength(3);
      expect(withoutGuids(pureFilters)).toEqual(withoutGuids(dashboardingFilters[0].filters));

      // replace the AgeRange filter with the one from the widget
      const newPureFilters = pureFilters.map((filter) =>
        filter.attribute === DM.Commerce.AgeRange ? widgetFilters[0] : filter,
      );
      updateFilters(newPureFilters);

      expect(setDashboardingFilters).toHaveBeenCalledWith([expect.any(CascadingFilter)]);
      const updatedCascadingFilter = setDashboardingFilters.mock.calls[0][0][0] as CascadingFilter;

      expect(withoutGuids(updatedCascadingFilter.filters)).toEqual(
        withoutGuids([
          dashboardingFilters[0].filters[0],
          dashboardingFilters[0].filters[1],
          widgetFilters[0],
        ]),
      );
    });
    it('should reset level filters deeper than modified after reassembling Cascading filter', () => {
      const dashboardingFilters = [
        new CascadingFilter([
          filterFactory.members(DM.Commerce.Condition, ['Used', 'Refurbished']),
          filterFactory.members(DM.Commerce.AgeRange, ['18-24']),
          filterFactory.members(DM.Commerce.Gender, ['Male']),
        ]),
      ];
      const setDashboardingFilters = vi.fn();

      const widgetFilters: Filter[] = [filterFactory.members(DM.Commerce.AgeRange, ['65+'])];

      const { pureFilters, updateFilters } = withCascadingFiltersConversion(
        dashboardingFilters,
        setDashboardingFilters,
        { all: false, ids: [] },
      );

      expect(pureFilters).toHaveLength(3);

      // replace the AgeRange filter with the one from the widget
      const newPureFilters = pureFilters.map((filter) =>
        filter.attribute === DM.Commerce.AgeRange ? widgetFilters[0] : filter,
      );
      updateFilters(newPureFilters);

      expect(setDashboardingFilters).toHaveBeenCalledWith([expect.any(CascadingFilter)]);
      const updatedCascadingFilter = setDashboardingFilters.mock.calls[0][0][0] as CascadingFilter;

      // the last filter in cascade should be reset to "Include all"
      expect(withoutGuids(updatedCascadingFilter.filters)).toEqual(
        withoutGuids([
          dashboardingFilters[0].filters[0],
          widgetFilters[0],
          filterFactory.members(DM.Commerce.Gender, []),
        ]),
      );
    });
  });
});
