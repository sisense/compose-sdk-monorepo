import { useEffect, useState } from 'react';
import { DataService, PivotBuilder, PivotClient } from '@sisense/sdk-pivot-client';

/**
 * Hook that recreates a new data service when new jaql request is needed to sent
 * and updates the pivot builder with the new data service.
 */
export function usePivotDataService(options: {
  pivotClient: PivotClient;
  pivotBuilder: PivotBuilder;
  shouldBeRecreated: boolean;
}): DataService {
  const { pivotClient, pivotBuilder, shouldBeRecreated } = options;

  const [dataService, setDataService] = useState<DataService>(() =>
    pivotClient.prepareDataService(),
  );

  useEffect(() => {
    if (shouldBeRecreated) {
      const newDataService = pivotClient.prepareDataService();
      setDataService(newDataService);
      pivotBuilder.updateDataService(newDataService);
    }
  }, [pivotClient, pivotBuilder, shouldBeRecreated]);

  return dataService;
}
