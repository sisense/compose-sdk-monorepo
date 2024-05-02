import { SortingSettingsChangePayload } from '@sisense/sdk-pivot-client';
import { PivotTableDataOptionsInternal } from '..';
import { preparePivotRowsSortCriteriaList } from './sorting-utils';

describe('preparePivotRowsSortCriteriaList', () => {
  let dataOptionsInternal: PivotTableDataOptionsInternal;

  beforeEach(() => {
    dataOptionsInternal = {
      rows: [
        { sortType: 'sortAsc' }, // field index 0
        {
          sortType: {
            direction: 'sortDesc',
            by: {
              valuesIndex: 0,
              columnsMembersPath: ['path'],
            },
          },
        }, // field index 1
      ],
      columns: [
        {}, // field index 2
      ],
      values: [
        {}, // field index 3
        {}, // field index 4
      ],
    } as unknown as PivotTableDataOptionsInternal;
  });

  it('should return correct sort criteria for simple type', () => {
    const payloadSimple = {
      type: 'simple',
      settings: [{ direction: 'asc' }],
      sortDetails: { field: 0 },
      isSingleRowTree: false,
    } as SortingSettingsChangePayload;
    const result = preparePivotRowsSortCriteriaList(payloadSimple, dataOptionsInternal);
    expect(result).toEqual([
      {
        rowIndex: 0,
        sort: { direction: 'sortAsc' },
      },
    ]);
  });

  it('should return correct sort criteria for simple type by measure', () => {
    const payloadSimple = {
      type: 'simple',
      settings: [{ direction: 'asc' }],
      sortDetails: { field: 2, measurePath: { 1: 'path' } },
      isSingleRowTree: false,
    } as unknown as SortingSettingsChangePayload;

    dataOptionsInternal.rows = [dataOptionsInternal.rows![0]]; // Set single row

    const result = preparePivotRowsSortCriteriaList(payloadSimple, dataOptionsInternal);
    expect(result).toEqual([
      {
        rowIndex: 0,
        sort: {
          direction: 'sortAsc',
          by: {
            valuesIndex: 0,
            columnsMembersPath: ['path'],
          },
        },
      },
    ]);
  });

  it('should return correct sort criteria for complex type', () => {
    const payloadComplex = {
      type: 'complex',
      settings: [
        { direction: 'asc', selected: true },
        { direction: 'desc', selected: true },
      ],
      sortDetails: {
        field: 3,
        measurePath: {
          2: 'path',
        },
      },
      isSingleRowTree: false,
    } as unknown as SortingSettingsChangePayload;
    const result = preparePivotRowsSortCriteriaList(payloadComplex, dataOptionsInternal);
    expect(result).toEqual([
      {
        rowIndex: 0,
        sort: {
          direction: 'sortAsc',
          by: {
            valuesIndex: 0,
            columnsMembersPath: ['path'],
          },
        },
      },
      {
        rowIndex: 1,
        sort: {
          direction: 'sortDesc',
          by: {
            valuesIndex: 0,
            columnsMembersPath: ['path'],
          },
        },
      },
    ]);
  });

  it('should disable existing row sort correctly', () => {
    // existing row sorting that should be disabled
    const payloadComplex = {
      type: 'complex',
      settings: [
        { direction: 'asc', selected: true },
        { direction: 'desc', selected: false },
      ],
      sortDetails: {
        field: 3,
        measurePath: {
          2: 'path',
        },
      },
      isSingleRowTree: false,
    } as unknown as SortingSettingsChangePayload;
    const result = preparePivotRowsSortCriteriaList(payloadComplex, dataOptionsInternal);
    expect(result).toEqual([
      {
        rowIndex: 0,
        sort: {
          direction: 'sortAsc',
          by: {
            valuesIndex: 0,
            columnsMembersPath: ['path'],
          },
        },
      },
      {
        rowIndex: 1,
        sort: null, // Existing row sort is disabled
      },
    ]);
  });
});
