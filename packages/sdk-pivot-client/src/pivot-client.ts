import { HttpClient } from '@sisense/sdk-rest-client';
import { PivotBuilder, PivotDataBuilder, SocketBuilder } from './builders';
import { JaqlRequest } from './data-load/types.js';
import { PivotQueryResultData } from '@sisense/sdk-data';
import { DataService } from './data-handling';
import { SisenseDataLoadService } from './data-load';

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

  constructor(httpClient: HttpClient, mockSocket = false) {
    this.socketBuilder = new SocketBuilder(httpClient, mockSocket);
  }

  async queryData(
    jaql: JaqlRequest,
    isPaginated: boolean,
    elementsPerPage: number,
    useCache: boolean,
  ): Promise<PivotQueryResultData> {
    const pivotDataBuilder = new PivotDataBuilder(this.socketBuilder.socket);
    return pivotDataBuilder.loadInitData(jaql, isPaginated, elementsPerPage, useCache);
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
