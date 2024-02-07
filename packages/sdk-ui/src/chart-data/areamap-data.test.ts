/* eslint-disable vitest/no-commented-out-tests */
import { AreamapChartDataOptionsInternal } from '../chart-data-options/types';
import { DataTable } from '../chart-data-processor/table-processor';
import { getAreamapData } from './areamap-data';

describe('areamap-data', () => {
  describe('getAreamapData', () => {
    it("should process data with 'geo' category and 'color' measure", () => {
      const dataOptions: AreamapChartDataOptionsInternal = {
        geo: {
          name: 'Country',
          type: 'text',
        },

        color: {
          name: 'Cost',
          aggregation: 'sum',
          title: 'Total Cost',
        },
      };
      const dataTable: DataTable = {
        columns: [
          {
            name: 'Country',
            type: 'text',
            index: 0,
            direction: 0,
          },
          {
            name: 'Cost',
            type: 'number',
            index: 1,
            direction: 0,
          },
        ],
        rows: [
          [
            {
              rawValue: 'Afghanistan',
              displayValue: 'Afghanistan',
              compareValue: {
                value: 'Afghanistan',
                valueUndefined: false,
                valueIsNaN: false,
                lowercaseValue: 'afghanistan',
              },
            },
            {
              rawValue: 157.04485702514648,
              displayValue: '157.044857025146',
              compareValue: {
                value: 157.04485702514648,
                valueUndefined: false,
                valueIsNaN: false,
              },
            },
          ],
        ],
      };

      expect(getAreamapData(dataOptions, dataTable)).toEqual({
        type: 'areamap',
        geoData: [
          {
            geoName: 'Afghanistan',
            originalValue: 157.04485702514648,
            formattedOriginalValue: '157.04',
            color: '#5a8c95',
          },
        ],
      });
    });
  });
});
