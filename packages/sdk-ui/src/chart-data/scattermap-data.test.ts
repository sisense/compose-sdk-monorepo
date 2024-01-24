import { ScattermapChartDataOptionsInternal } from '../chart-data-options/types';
import { DataTable } from '../chart-data-processor/table-processor';
import { scattermapData } from './scattermap-data';

describe('Scattermap Chart Data', () => {
  it('should process data with single category and size', () => {
    const dataOptions = {
      locations: [
        {
          name: 'Country',
          type: 'text',
        },
      ],
      size: {
        name: 'Cost',
        aggregation: 'sum',
      },
    } as ScattermapChartDataOptionsInternal;
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

    expect(scattermapData(dataOptions, dataTable)).toEqual({
      type: 'scattermap',
      locations: [{ name: 'Afghanistan', value: 157.04485702514648, blur: false }],
    });
  });

  it('should process data with two categories and size', () => {
    const dataOptions = {
      locations: [
        {
          name: 'Country',
          type: 'text',
        },
        {
          name: 'City',
          type: 'text',
        },
      ],
      size: {
        name: 'Cost',
        aggregation: 'sum',
      },
    } as ScattermapChartDataOptionsInternal;
    const dataTable: DataTable = {
      columns: [
        {
          name: 'Country',
          type: 'text',
          index: 0,
          direction: 0,
        },
        {
          name: 'City',
          type: 'text',
          index: 1,
          direction: 0,
        },
        {
          name: 'Cost',
          type: 'number',
          index: 2,
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
            rawValue: 'Kabul',
            displayValue: 'Kabul',
            compareValue: {
              value: 'Kabul',
              valueUndefined: false,
              valueIsNaN: false,
              lowercaseValue: 'kabul',
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

    expect(scattermapData(dataOptions, dataTable)).toEqual({
      type: 'scattermap',
      locations: [{ name: 'Afghanistan, Kabul', value: 157.04485702514648, blur: false }],
    });
  });

  it('should process data with two categories as coordinates and size', () => {
    const dataOptions = {
      locations: [
        {
          name: 'Lat',
          type: 'number',
        },
        {
          name: 'Lng',
          type: 'number',
        },
      ],
      size: {
        name: 'Cost',
        aggregation: 'sum',
      },
    } as ScattermapChartDataOptionsInternal;
    const dataTable: DataTable = {
      columns: [
        {
          name: 'Lat',
          type: 'number',
          index: 0,
          direction: 0,
        },
        {
          name: 'Lng',
          type: 'number',
          index: 1,
          direction: 0,
        },
        {
          name: 'Cost',
          type: 'number',
          index: 2,
          direction: 0,
        },
      ],
      rows: [
        [
          {
            rawValue: 15.04485702514648,
            displayValue: '15.044857025146',
            compareValue: {
              value: 15.04485702514648,
              valueUndefined: false,
              valueIsNaN: false,
            },
          },
          {
            rawValue: 57.04485702514648,
            displayValue: '57.044857025146',
            compareValue: {
              value: 57.04485702514648,
              valueUndefined: false,
              valueIsNaN: false,
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

    expect(scattermapData(dataOptions, dataTable)).toEqual({
      type: 'scattermap',
      locations: [
        {
          name: '15.04485702514648, 57.04485702514648',
          value: 157.04485702514648,
          blur: false,
          coordinates: {
            lat: 15.04485702514648,
            lng: 57.04485702514648,
          },
        },
      ],
    });
  });
});
