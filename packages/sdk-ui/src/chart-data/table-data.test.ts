import { DataTable } from '../chart-data-processor/table-processor';
import {
  syncDataTableWithDataOptionsSort,
  tableData,
  unifySortToDirection,
  updateInnerDataOptionsSort,
} from './table-data';
import { Category, TableDataOptionsInternal } from '../chart-data-options/types';
import { Attribute, DimensionalAttribute, Sort } from '@sisense/sdk-data';
import { Column as DataTableColumn } from '../chart-data-processor/table-processor';
import { translateColumnToCategory } from '../chart-data-options/utils';

describe('Table data processing', () => {
  it('Must prepare correct table data from dataTable', () => {
    const mockData: DataTable = {
      columns: [
        { name: 'col_1', type: 'number', index: 0, direction: 0 },
        { name: 'col_2', type: 'number', index: 1, direction: 0 },
        { name: 'col_3', type: 'string', index: 2, direction: 0 },
        { name: 'col_4', type: 'string', index: 3, direction: 0 },
        { name: 'col_5', type: 'number', index: 4, direction: 0 },
      ],
      rows: [
        [
          {
            displayValue: '7',
          },
          {
            displayValue: '14',
          },
          {
            displayValue: 'S1',
          },
          {
            displayValue: 'S2',
          },
          {
            displayValue: '34',
          },
        ],
      ],
    };
    const expectedResult: DataTable = {
      columns: [
        { name: 'col_1', type: 'number', index: 0, direction: 0 },
        { name: 'col_5', type: 'number', index: 1, direction: 0 },
      ],
      rows: [
        [
          {
            displayValue: '7',
          },
          {
            displayValue: '34',
          },
        ],
      ],
    };

    const result = tableData(
      {
        columns: [
          { name: 'col_1', type: 'number' },
          { name: 'col_5', type: 'number' },
        ],
      } as TableDataOptionsInternal,
      mockData,
    );

    expect(result).toStrictEqual(expectedResult);
  });

  it('Should correct unify sort to direction', function () {
    // Columns unify
    expect(unifySortToDirection({ sortType: 'sortAsc' } as Category)).toBe(1);
    expect(unifySortToDirection({ sortType: 'sortNone' } as Category)).toBe(0);
    expect(unifySortToDirection({ sortType: 'sortDesc' } as Category)).toBe(-1);
    // Elements unify
    expect(unifySortToDirection({ getSort: () => Sort.Ascending } as unknown as Category)).toBe(1);
    expect(unifySortToDirection({ getSort: () => Sort.None } as unknown as Category)).toBe(0);
    expect(unifySortToDirection({ getSort: () => Sort.Descending } as unknown as Category)).toBe(
      -1,
    );
  });

  it('Should sync dataTable sort state with dataOptions (Attribute)', () => {
    const dataTable: DataTable = {
      columns: [{ name: 'Test', type: 'text', direction: 0, index: 0 }],
      rows: [
        [
          {
            displayValue: '7',
          },
        ],
      ],
    };
    const dataOptions: TableDataOptionsInternal = {
      columns: [{ name: 'Test', type: 'text', getSort: () => Sort.Ascending } as Attribute],
    };
    const result = syncDataTableWithDataOptionsSort(dataOptions, dataTable);

    expect(result.columns[0].direction).toBe(1);
  });

  it('Should sync dataTable sort state with dataOptions (simple Column or StyledColumn)', () => {
    const dataTable: DataTable = {
      columns: [{ name: 'Test', type: 'text', direction: 0, index: 0 }],
      rows: [
        [
          {
            displayValue: '7',
          },
        ],
      ],
    };
    const dataOptions: TableDataOptionsInternal = {
      columns: [{ sortType: 'sortDesc', name: 'Test', type: 'text' }],
    };
    const result = syncDataTableWithDataOptionsSort(dataOptions, dataTable);

    expect(result.columns[0].direction).toBe(-1);
  });

  it('Should update data options with new sort state (Attribute)', () => {
    const column: DataTableColumn = { name: 'Test', type: 'text', direction: 0, index: 0 };
    const dataOptions: TableDataOptionsInternal = {
      columns: [
        translateColumnToCategory(
          new DimensionalAttribute('Test', '', undefined, undefined, Sort.Ascending),
        ),
      ],
    };

    const result = updateInnerDataOptionsSort(dataOptions, column);

    expect((result.columns[0] as Attribute).getSort()).toBe(Sort.Descending);
  });

  it('Should update data options with new sort state (simple Column or StyledColumn)', () => {
    const column: DataTableColumn = { name: 'Test', type: 'text', direction: 0, index: 0 };
    const dataOptions: TableDataOptionsInternal = {
      columns: [translateColumnToCategory({ name: 'Test', type: 'text', sortType: 'sortDesc' })],
    };

    const result = updateInnerDataOptionsSort(dataOptions, column);

    expect(result.columns[0].sortType).toBe('sortAsc');
  });
});
