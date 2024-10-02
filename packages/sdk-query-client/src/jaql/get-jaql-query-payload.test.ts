/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { DataSource } from '@sisense/sdk-data';
import { prepareQueryOptions } from './get-jaql-query-payload.js';
import { QueryOptions } from '../types.js';

describe('prepareQueryOptions', () => {
  const dataSource: DataSource = 'Sample ECommerce';
  it('should return query options with default values', () => {
    const queryOptions: QueryOptions = prepareQueryOptions(dataSource);

    expect(queryOptions).toEqual({
      by: 'ComposeSDK',
      datasource: { title: dataSource, live: false },
      queryGuid: expect.any(String),
    });
  });

  it('should return query options with specified values', () => {
    const count = 10;
    const offset = 5;
    const includeUngroup = true;

    const queryOptions = prepareQueryOptions(dataSource, count, offset, includeUngroup);

    expect(queryOptions).toEqual({
      by: 'ComposeSDK',
      datasource: { title: dataSource, live: false },
      queryGuid: expect.any(String),
      count,
      offset,
      ungroup: true,
    });
  });
});
