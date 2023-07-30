import { extractDataOptions } from './translate_widget_data_options';
import { Panel, WidgetType } from './types';
import { StyledColumn, TableDataOptions } from '../chart-data-options/types';
import { DimensionalAttribute } from '@sisense/sdk-data';

describe('extractDataOptions', () => {
  it('should extract data options for table chart correctly', () => {
    const panels = [
      {
        name: 'columns',
        items: [
          {
            jaql: {
              table: 'Commerce',
              column: 'Gender',
              dim: '[Commerce.Gender]',
              datatype: 'text',
              title: 'Gender',
            },
          },
        ],
      },
    ] as Panel[];

    const tableDataOptions = extractDataOptions(WidgetType.Table, panels) as TableDataOptions;

    expect(
      (tableDataOptions.columns[0] as StyledColumn).column instanceof DimensionalAttribute,
    ).toBeTruthy();
  });
});
