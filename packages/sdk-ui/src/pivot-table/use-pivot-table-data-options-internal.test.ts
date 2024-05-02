import { renderHook, waitFor } from '@testing-library/react';
import { PivotSortCriteria } from './sorting-utils';
import { usePivotTableDataOptionsInternal } from './use-pivot-table-data-options-internal';
import { mockPivotTableProps } from './__mocks__/mocks';

describe('usePivotTableDataOptionsInternal', () => {
  it('should correctly translate dataOptions into internalDataOptions', async () => {
    const { result } = renderHook(() =>
      usePivotTableDataOptionsInternal({ dataOptions: mockPivotTableProps.dataOptions }),
    );

    await waitFor(() => {
      expect(result.current.dataOptionsInternal).toBeDefined();
    });
    expect(result.current.dataOptionsInternal).toMatchSnapshot();
  });

  it('should udpate row (first) with new sorting', async () => {
    const sortCriteria = {
      rows: [
        {
          rowIndex: 0,
          sort: {
            direction: 'sortAsc',
            by: {
              valuesIndex: 0,
              columnsMembersPath: ['Female'],
            },
          },
        },
      ],
    } as PivotSortCriteria;
    const { result } = renderHook(() =>
      usePivotTableDataOptionsInternal({ dataOptions: mockPivotTableProps.dataOptions }),
    );

    result.current.updateSort(sortCriteria);

    await waitFor(() => {
      expect(result.current.dataOptionsInternal.rows![0].sortType).toBe(sortCriteria.rows[0].sort);
    });
  });

  it('should disable existing row (second) sorting', async () => {
    const sortCriteria = {
      rows: [
        {
          rowIndex: 1,
          sort: null,
        },
      ],
    };
    const { result } = renderHook(() =>
      usePivotTableDataOptionsInternal({ dataOptions: mockPivotTableProps.dataOptions }),
    );

    result.current.updateSort(sortCriteria);

    await waitFor(() => {
      expect(result.current.dataOptionsInternal.rows![1].sortType).toBeUndefined();
    });
  });
});
