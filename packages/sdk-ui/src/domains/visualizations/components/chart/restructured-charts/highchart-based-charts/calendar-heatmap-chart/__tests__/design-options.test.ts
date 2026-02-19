import { describe, expect, it } from 'vitest';

import { CalendarHeatmapStyleOptions } from '@/types';

import { CALENDAR_HEATMAP_DEFAULTS } from '../constants.js';
import { translateCalendarHeatmapStyleOptionsToDesignOptions } from '../design-options.js';

describe('Calendar Heatmap Design Options Translation', () => {
  describe('translateCalendarHeatmapStyleOptionsToDesignOptions', () => {
    it('should translate style options with default values when properties are undefined', () => {
      const styleOptions: CalendarHeatmapStyleOptions = {};

      const result = translateCalendarHeatmapStyleOptionsToDesignOptions(styleOptions);

      expect(result.cellLabels).toEqual({
        enabled: CALENDAR_HEATMAP_DEFAULTS.SHOW_CELL_LABEL,
        style: undefined,
      });
      expect(result.dayLabels).toEqual({
        enabled: CALENDAR_HEATMAP_DEFAULTS.SHOW_DAY_LABEL,
        style: undefined,
      });
      expect(result.monthLabels).toEqual({
        enabled: CALENDAR_HEATMAP_DEFAULTS.SHOW_MONTH_LABEL,
        style: undefined,
      });
      expect(result.pagination).toEqual({
        enabled: CALENDAR_HEATMAP_DEFAULTS.SHOW_PAGINATION,
        style: undefined,
        initialDate: undefined,
      });
    });

    it('should translate cellLabels style options correctly', () => {
      const styleOptions: CalendarHeatmapStyleOptions = {
        cellLabels: {
          enabled: false,
          style: {
            color: '#ff0000',
            fontSize: '14px',
            fontWeight: 'bold',
          },
        },
      };

      const result = translateCalendarHeatmapStyleOptionsToDesignOptions(styleOptions);

      expect(result.cellLabels).toEqual({
        enabled: false,
        style: {
          color: '#ff0000',
          fontSize: '14px',
          fontWeight: 'bold',
        },
      });
    });

    it('should translate dayLabels style options correctly', () => {
      const styleOptions: CalendarHeatmapStyleOptions = {
        dayLabels: {
          enabled: true,
          style: {
            color: '#0000ff',
            fontFamily: 'Arial',
            fontSize: '12px',
          },
        },
      };

      const result = translateCalendarHeatmapStyleOptionsToDesignOptions(styleOptions);

      expect(result.dayLabels).toEqual({
        enabled: true,
        style: {
          color: '#0000ff',
          fontFamily: 'Arial',
          fontSize: '12px',
        },
      });
    });

    it('should translate monthLabels style options correctly', () => {
      const styleOptions: CalendarHeatmapStyleOptions = {
        monthLabels: {
          enabled: false,
          style: {
            color: '#00ff00',
            fontWeight: '600',
          },
        },
      };

      const result = translateCalendarHeatmapStyleOptionsToDesignOptions(styleOptions);

      expect(result.monthLabels).toEqual({
        enabled: false,
        style: {
          color: '#00ff00',
          fontWeight: '600',
        },
      });
    });

    it('should handle partial style options correctly', () => {
      const styleOptions: CalendarHeatmapStyleOptions = {
        cellLabels: {
          enabled: true,
          // style is undefined
        },
        dayLabels: {
          // enabled is undefined
          style: { color: '#333' },
        },
      };

      const result = translateCalendarHeatmapStyleOptionsToDesignOptions(styleOptions);

      expect(result.cellLabels).toEqual({
        enabled: true,
        style: undefined,
      });
      expect(result.dayLabels).toEqual({
        enabled: CALENDAR_HEATMAP_DEFAULTS.SHOW_DAY_LABEL,
        style: { color: '#333' },
      });
      expect(result.monthLabels).toEqual({
        enabled: CALENDAR_HEATMAP_DEFAULTS.SHOW_MONTH_LABEL,
        style: undefined,
      });
    });

    it('should translate weekends configuration correctly', () => {
      const styleOptions: CalendarHeatmapStyleOptions = {
        weekends: {
          enabled: true,
          days: ['saturday', 'sunday'],
          cellColor: '#f0f0f0',
          hideValues: false,
        },
      };

      const result = translateCalendarHeatmapStyleOptionsToDesignOptions(styleOptions);

      expect(result.weekends).toEqual({
        enabled: true,
        days: ['saturday', 'sunday'],
        cellColor: '#f0f0f0',
        hideValues: false,
      });
    });

    it('should use default weekend configuration when not provided', () => {
      const styleOptions: CalendarHeatmapStyleOptions = {};

      const result = translateCalendarHeatmapStyleOptionsToDesignOptions(styleOptions);

      expect(result.weekends).toEqual({
        enabled: CALENDAR_HEATMAP_DEFAULTS.WEEKEND_ENABLED,
        days: [...CALENDAR_HEATMAP_DEFAULTS.WEEKEND_DAYS],
        cellColor: CALENDAR_HEATMAP_DEFAULTS.WEEKEND_CELL_COLOR,
        hideValues: CALENDAR_HEATMAP_DEFAULTS.WEEKEND_HIDE_VALUES,
      });
    });

    it('should translate viewType and startOfWeek correctly', () => {
      const styleOptions: CalendarHeatmapStyleOptions = {
        viewType: 'quarter',
        startOfWeek: 'monday',
      };

      const result = translateCalendarHeatmapStyleOptionsToDesignOptions(styleOptions);

      expect(result.viewType).toBe('quarter');
      expect(result.startOfWeek).toBe('monday');
    });

    it('should use default values for viewType and startOfWeek when not provided', () => {
      const styleOptions: CalendarHeatmapStyleOptions = {};

      const result = translateCalendarHeatmapStyleOptionsToDesignOptions(styleOptions);

      expect(result.viewType).toBe(CALENDAR_HEATMAP_DEFAULTS.VIEW_TYPE);
      expect(result.startOfWeek).toBe(CALENDAR_HEATMAP_DEFAULTS.START_OF_WEEK);
    });

    it('should translate pagination style options correctly', () => {
      const startMonth = new Date('2023-06-15');
      const styleOptions: CalendarHeatmapStyleOptions = {
        pagination: {
          enabled: false,
          textStyle: {
            color: '#0066cc',
            fontSize: '12px',
            fontWeight: 'normal',
          },
          startMonth,
        },
      };

      const result = translateCalendarHeatmapStyleOptionsToDesignOptions(styleOptions);

      expect(result.pagination).toEqual({
        enabled: false,
        style: {
          color: '#0066cc',
          fontSize: '12px',
          fontWeight: 'normal',
        },
        startMonth,
      });
    });

    it('should use default values for pagination when not provided', () => {
      const styleOptions: CalendarHeatmapStyleOptions = {};

      const result = translateCalendarHeatmapStyleOptionsToDesignOptions(styleOptions);

      expect(result.pagination).toEqual({
        enabled: CALENDAR_HEATMAP_DEFAULTS.SHOW_PAGINATION,
        style: undefined,
        startMonth: undefined,
      });
    });
  });
});
