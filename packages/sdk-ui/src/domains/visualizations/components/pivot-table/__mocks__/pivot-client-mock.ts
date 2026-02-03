import { type PivotClient } from '@sisense/sdk-pivot-ui';

import { DataServiceMock } from './data-service-mock';
import { PivotBuilderMock } from './pivot-builder-mock';

// Mock of PivotClient class
class PivotClientMock {
  preparePivotBuilder() {
    return new PivotBuilderMock();
  }

  prepareDataService() {
    return new DataServiceMock();
  }
}

export const createPivotClientMock = (): PivotClient => {
  return new PivotClientMock() as unknown as PivotClient;
};
