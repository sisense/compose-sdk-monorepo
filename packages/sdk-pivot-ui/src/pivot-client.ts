import {
  DataService,
  PivotQueryClient,
  SisenseDataLoadService,
  SocketBuilder,
} from '@sisense/sdk-pivot-query-client';

import { PivotBuilder } from './builders';

/**
 * A client helper for pivot that abstracts away from all the internal implementations
 * (e.g., web socket, data load service, data service, etc).
 * To some extent, it is similar to the HttpClient, but for pivot.
 * This client makes it easier to mock and test the consumers of the pivot functionalities (e.g., query client).
 *
 * @internal
 */
export class PivotClient {
  /**
   * Builder to create on demand a web socket to the Sisense instance
   * Required by the pivot table service
   */
  public socketBuilder: SocketBuilder;

  constructor(private pivotQueryClient: PivotQueryClient) {
    this.socketBuilder = this.pivotQueryClient.socketBuilder;
  }

  prepareDataService() {
    const dataLoadService = new SisenseDataLoadService(this.socketBuilder.socket);
    return new DataService(dataLoadService);
  }

  preparePivotBuilder(): PivotBuilder {
    const dataService = this.prepareDataService();
    return new PivotBuilder(dataService);
  }
}
