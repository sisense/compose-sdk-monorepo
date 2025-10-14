/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback } from 'react';

import { type PivotTableDataOptionsInternal } from '@/chart-data-options/types';
import { PivotTableDataPointEventHandler } from '@/props';

import { getPivotTableDataPoint } from './get-pivot-table-data-point';
import { PivotTableCellPayload } from './types';

type UseApplyPivotTableCellEventsProps = {
  dataOptions: PivotTableDataOptionsInternal;
  onDataPointClick?: PivotTableDataPointEventHandler;
  onDataPointContextMenu?: PivotTableDataPointEventHandler;
};

type UseApplyPivotTableCellEventsResult = {
  handlePivotTableCellClick: (payload: PivotTableCellPayload) => void;
};

/**
 * A hook that applies pivot table cell events.
 *
 * @internal
 */
export const useApplyPivotTableCellEvents = ({
  dataOptions,
  onDataPointClick,
  onDataPointContextMenu,
}: UseApplyPivotTableCellEventsProps): UseApplyPivotTableCellEventsResult => {
  const handlePivotTableCellClick = useCallback(
    (payload: PivotTableCellPayload) => {
      const dataPoint = getPivotTableDataPoint(payload, dataOptions);

      if (payload.event.type === 'click') {
        onDataPointClick?.(dataPoint, payload.event);
      }

      if (payload.event.type === 'contextmenu') {
        onDataPointContextMenu?.(dataPoint, payload.event);
      }
    },
    [dataOptions, onDataPointClick, onDataPointContextMenu],
  );

  return {
    handlePivotTableCellClick,
  };
};
