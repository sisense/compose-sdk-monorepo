import { normalizeUrl } from '@sisense/sdk-common';
import { PivotQueryResultData } from '@sisense/sdk-data';
import { Authenticator } from '@sisense/sdk-rest-client';

import { PivotDataBuilder, SocketBuilder } from './builders/index.js';
import { JaqlRequest } from './data-load/types.js';

export class PivotQueryClient {
  /**
   * Builder to create on demand a web socket to the Sisense instance
   * Required by the pivot table service
   */
  public socketBuilder: SocketBuilder;

  constructor(url: string, auth: Authenticator, mockSocket = false) {
    this.socketBuilder = new SocketBuilder(normalizeUrl(url), auth, mockSocket);
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
}
