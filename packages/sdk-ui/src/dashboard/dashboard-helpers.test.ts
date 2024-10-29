import { describe, it, expect } from 'vitest';
import { Filter } from '@sisense/sdk-data';
import { DashboardProps } from './types';
import * as dashboardHelpers from './dashboard-helpers';

// Mock Filters
const filter1 = { guid: 'filter1' } as Filter;
const filter2 = { guid: 'filter2' } as Filter;
const filter3 = { guid: 'filter3' } as Filter;
const filter4 = { guid: 'filter4' } as Filter;

const initialDashboard: DashboardProps = {
  title: 'test-dashboard',
  widgets: [],
  filters: [filter1, filter2],
  styleOptions: {},
};

describe('DashboardHelpers', () => {
  describe('replaceFilters', () => {
    it('should replace the filters of the dashboard with new filters', () => {
      const newFilters = [filter3, filter4];
      const updatedDashboard = dashboardHelpers.replaceFilters(initialDashboard, newFilters);

      expect(updatedDashboard.filters).toEqual(newFilters);
      expect(updatedDashboard).not.toBe(initialDashboard); // Ensures immutability
      expect(initialDashboard.filters).toEqual([filter1, filter2]); // Original dashboard remains unchanged
    });
  });

  describe('addFilter', () => {
    it('should add a new filter to the dashboard', () => {
      const updatedDashboard = dashboardHelpers.addFilter(initialDashboard, filter3);

      expect(updatedDashboard.filters).toEqual([filter1, filter2, filter3]);
      expect(updatedDashboard).not.toBe(initialDashboard); // Ensures immutability
      expect(initialDashboard.filters).toEqual([filter1, filter2]); // Original dashboard remains unchanged
    });
  });

  describe('addFilters', () => {
    it('should add multiple new filters to the dashboard', () => {
      const newFilters = [filter3, filter4];
      const updatedDashboard = dashboardHelpers.addFilters(initialDashboard, newFilters);

      expect(updatedDashboard.filters).toEqual([filter1, filter2, filter3, filter4]);
      expect(updatedDashboard).not.toBe(initialDashboard); // Ensures immutability
      expect(initialDashboard.filters).toEqual([filter1, filter2]); // Original dashboard remains unchanged
    });
  });

  describe('modifyFilter', () => {
    it('should modify an existing filter in the dashboard', () => {
      const modifiedFilter: Filter = { ...filter1 /* modified properties */ };
      const updatedDashboard = dashboardHelpers.modifyFilter(
        initialDashboard,
        filter1,
        modifiedFilter,
      );

      expect(updatedDashboard.filters).toEqual([modifiedFilter, filter2]);
      expect(updatedDashboard).not.toBe(initialDashboard); // Ensures immutability
      expect(initialDashboard.filters).toEqual([filter1, filter2]); // Original dashboard remains unchanged
    });

    it('should not modify the dashboard if the filter to modify is not found', () => {
      const nonExistentFilter = { guid: 'non-existent' /* properties */ } as Filter;
      const updatedDashboard = dashboardHelpers.modifyFilter(
        initialDashboard,
        nonExistentFilter,
        filter3,
      );

      expect(updatedDashboard.filters).toEqual([filter1, filter2]);
      expect(updatedDashboard).not.toBe(initialDashboard); // Ensures immutability
    });
  });

  describe('removeFilter', () => {
    it('should remove an existing filter from the dashboard', () => {
      const updatedDashboard = dashboardHelpers.removeFilter(initialDashboard, filter1);

      expect(updatedDashboard.filters).toEqual([filter2]);
      expect(updatedDashboard).not.toBe(initialDashboard); // Ensures immutability
      expect(initialDashboard.filters).toEqual([filter1, filter2]); // Original dashboard remains unchanged
    });

    it('should not modify the dashboard if the filter to remove is not found', () => {
      const nonExistentFilter = { guid: 'non-existent' /* properties */ } as Filter;
      const updatedDashboard = dashboardHelpers.removeFilter(initialDashboard, nonExistentFilter);

      expect(updatedDashboard.filters).toEqual([filter1, filter2]);
      expect(updatedDashboard).not.toBe(initialDashboard); // Ensures immutability
    });
  });
});
