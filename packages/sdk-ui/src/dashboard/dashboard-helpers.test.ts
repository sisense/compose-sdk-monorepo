import { describe, it, expect } from 'vitest';
import { Filter, filterFactory } from '@sisense/sdk-data';
import { DashboardProps } from './types';
import * as dashboardHelpers from './dashboard-helpers';
import * as DM from '@/__test-helpers__/sample-ecommerce';

// Mock Filters
const filterByAgeRange = filterFactory.members(DM.Commerce.AgeRange, ['18-24', '25-34']);
const filterByRevenue = filterFactory.greaterThan(DM.Commerce.Revenue, 1000);
const filterByCost = filterFactory.lessThan(DM.Commerce.Cost, 5000);
const filterByGender = filterFactory.equals(DM.Commerce.Gender, 'Male');
const filterByAgeRangeOrFilterByRevenue = filterFactory.logic.or(filterByAgeRange, filterByRevenue);

const initialDashboard: DashboardProps = {
  title: 'test-dashboard',
  widgets: [],
  filters: [filterByAgeRange, filterByRevenue],
  styleOptions: {},
};

describe('DashboardHelpers', () => {
  describe('replaceFilters', () => {
    it('should replace the filters of the dashboard with new filters', () => {
      const newFilters = [filterByCost, filterByGender];
      const updatedDashboard = dashboardHelpers.replaceFilters(initialDashboard, newFilters);

      expect(updatedDashboard.filters).toEqual(newFilters);
      expect(updatedDashboard).not.toBe(initialDashboard); // Ensures immutability
      expect(initialDashboard.filters).toEqual([filterByAgeRange, filterByRevenue]); // Original dashboard remains unchanged
    });
    it('should replace the filters of the dashboard with new filter relations', () => {
      const updatedDashboard = dashboardHelpers.replaceFilters(
        initialDashboard,
        filterByAgeRangeOrFilterByRevenue,
      );
      expect(updatedDashboard.filters).toEqual(filterByAgeRangeOrFilterByRevenue);
      expect(updatedDashboard).not.toBe(initialDashboard); // Ensures immutability
      expect(initialDashboard.filters).toEqual([filterByAgeRange, filterByRevenue]); // Original dashboard remains unchanged
    });
  });

  describe('addFilter', () => {
    it('should add a new filter to the dashboard', () => {
      const updatedDashboard = dashboardHelpers.addFilter(initialDashboard, filterByCost);

      expect(updatedDashboard.filters).toEqual([filterByAgeRange, filterByRevenue, filterByCost]);
      expect(updatedDashboard).not.toBe(initialDashboard); // Ensures immutability
      expect(initialDashboard.filters).toEqual([filterByAgeRange, filterByRevenue]); // Original dashboard remains unchanged
    });
    it('should add a new filter to the dashboard with existing filter relations', () => {
      const dashboardWithRelations: DashboardProps = {
        ...initialDashboard,
        filters: filterByAgeRangeOrFilterByRevenue,
      };

      const updatedDashboard = dashboardHelpers.addFilter(dashboardWithRelations, filterByCost);
      expect(updatedDashboard.filters).toEqual(
        filterFactory.logic.and(filterByAgeRangeOrFilterByRevenue, filterByCost),
      );
      expect(updatedDashboard).not.toBe(dashboardWithRelations); // Ensures immutability
      expect(dashboardWithRelations.filters).toEqual(filterByAgeRangeOrFilterByRevenue); // Original dashboard remains unchanged
    });
    it('should work when dashboard provided without filters', () => {
      const updatedDashboard = dashboardHelpers.addFilter(
        { ...initialDashboard, filters: undefined },
        filterByCost,
      );

      expect(updatedDashboard.filters).toEqual([filterByCost]);
    });
  });

  describe('addFilters', () => {
    it('should add multiple new filters to the dashboard', () => {
      const newFilters = [filterByCost, filterByGender];
      const updatedDashboard = dashboardHelpers.addFilters(initialDashboard, newFilters);

      expect(updatedDashboard.filters).toEqual([
        filterByAgeRange,
        filterByRevenue,
        filterByCost,
        filterByGender,
      ]);
      expect(updatedDashboard).not.toBe(initialDashboard); // Ensures immutability
      expect(initialDashboard.filters).toEqual([filterByAgeRange, filterByRevenue]); // Original dashboard remains unchanged
    });
    it('should add multiple new filters to the dashboard with existing filter relations', () => {
      const dashboardWithRelations: DashboardProps = {
        ...initialDashboard,
        filters: filterByAgeRangeOrFilterByRevenue,
      };

      const updatedDashboard = dashboardHelpers.addFilters(dashboardWithRelations, [
        filterByCost,
        filterByGender,
      ]);
      expect(updatedDashboard.filters).toEqual(
        filterFactory.logic.and(
          filterFactory.logic.and(filterByAgeRangeOrFilterByRevenue, filterByCost),
          filterByGender,
        ),
      );
      expect(updatedDashboard).not.toBe(dashboardWithRelations); // Ensures immutability
      expect(dashboardWithRelations.filters).toEqual(filterByAgeRangeOrFilterByRevenue); // Original dashboard remains unchanged
    });

    it('should work when dashboard provided without filters', () => {
      const newFilters = [filterByCost, filterByGender];
      const updatedDashboard = dashboardHelpers.addFilters(
        { ...initialDashboard, filters: undefined },
        newFilters,
      );

      expect(updatedDashboard.filters).toEqual(newFilters);
    });
  });

  describe('replaceFilter', () => {
    it('should modify an existing filter in the dashboard', () => {
      const modifiedFilter: Filter = { ...filterByAgeRange /* modified properties */ };
      const updatedDashboard = dashboardHelpers.replaceFilter(
        initialDashboard,
        filterByAgeRange,
        modifiedFilter,
      );

      expect(updatedDashboard.filters).toEqual([modifiedFilter, filterByRevenue]);
      expect(updatedDashboard).not.toBe(initialDashboard); // Ensures immutability
      expect(initialDashboard.filters).toEqual([filterByAgeRange, filterByRevenue]); // Original dashboard remains unchanged
    });

    it('should not modify the dashboard if the filter to modify is not found', () => {
      const nonExistentFilter = { config: { guid: 'non-existent' } /* properties */ } as Filter;
      const updatedDashboard = dashboardHelpers.replaceFilter(
        initialDashboard,
        nonExistentFilter,
        filterByCost,
      );

      expect(updatedDashboard.filters).toEqual([filterByAgeRange, filterByRevenue]);
      expect(updatedDashboard).not.toBe(initialDashboard); // Ensures immutability
    });

    it('should modify an existing filter in the dashboard with filter relations', () => {
      const dashboardWithRelations: DashboardProps = {
        ...initialDashboard,
        filters: filterByAgeRangeOrFilterByRevenue,
      };

      const updatedDashboard = dashboardHelpers.replaceFilter(
        dashboardWithRelations,
        filterByAgeRange,
        filterByCost,
      );

      expect(updatedDashboard.filters).toEqual(
        filterFactory.logic.or(filterByCost, filterByRevenue),
      );
      expect(updatedDashboard).not.toBe(dashboardWithRelations); // Ensures immutability
      expect(dashboardWithRelations.filters).toEqual(filterByAgeRangeOrFilterByRevenue); // Original dashboard remains unchanged
    });
    it('should work when dashboard provided without filters', () => {
      const nonExistentFilter = { config: { guid: 'non-existent' } /* properties */ } as Filter;
      const updatedDashboard = dashboardHelpers.replaceFilter(
        { ...initialDashboard, filters: undefined },
        nonExistentFilter,
        filterByCost,
      );

      expect(updatedDashboard.filters).toEqual([]);
    });
  });

  describe('removeFilter', () => {
    it('should remove an existing filter from the dashboard', () => {
      const updatedDashboard = dashboardHelpers.removeFilter(initialDashboard, filterByAgeRange);

      expect(updatedDashboard.filters).toEqual([filterByRevenue]);
      expect(updatedDashboard).not.toBe(initialDashboard); // Ensures immutability
      expect(initialDashboard.filters).toEqual([filterByAgeRange, filterByRevenue]); // Original dashboard remains unchanged
    });

    it('should not modify the dashboard if the filter to remove is not found', () => {
      const nonExistentFilter = { config: { guid: 'non-existent' } /* properties */ } as Filter;
      const updatedDashboard = dashboardHelpers.removeFilter(initialDashboard, nonExistentFilter);

      expect(updatedDashboard.filters).toEqual([filterByAgeRange, filterByRevenue]);
      expect(updatedDashboard).not.toBe(initialDashboard); // Ensures immutability
    });

    it('should remove an existing filter from the dashboard with filter relations', () => {
      const dashboardWithRelations: DashboardProps = {
        ...initialDashboard,
        filters: filterByAgeRangeOrFilterByRevenue,
      };

      const updatedDashboard = dashboardHelpers.removeFilter(
        dashboardWithRelations,
        filterByAgeRange,
      );

      expect(updatedDashboard.filters).toEqual([filterByRevenue]);
      expect(updatedDashboard).not.toBe(dashboardWithRelations); // Ensures immutability
      expect(dashboardWithRelations.filters).toEqual(filterByAgeRangeOrFilterByRevenue); // Original dashboard remains unchanged
    });
    it('should work when dashboard provided without filters', () => {
      const nonExistentFilter = { config: { guid: 'non-existent' } /* properties */ } as Filter;
      const updatedDashboard = dashboardHelpers.removeFilter(
        { ...initialDashboard, filters: undefined },
        nonExistentFilter,
      );

      expect(updatedDashboard.filters).toEqual([]);
    });
  });
});
