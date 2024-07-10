/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type ClientApplication } from '..';
import { executeQuery } from './execute-query';
import { translation } from '@/translation/resources/en';
import * as DM from '@/__test-helpers__/sample-ecommerce';

const app = {
  queryClient: {
    executeQuery: vi.fn(),
  },
};

describe('executeQuery', () => {
  it('should throw "seconds level supported for live datasource only" error', async () => {
    app.queryClient.executeQuery.mockReturnValue({
      resultPromise: Promise.reject({ message: 'SecondsLevelIsNotSupportedException' }),
    });

    await expect(async () => {
      await executeQuery(
        {
          dataSource: DM.DataSource,
          dimensions: [DM.Commerce.Date.Seconds],
          measures: [],
          filters: [],
          highlights: [],
        },
        app as unknown as ClientApplication,
      );
    }).rejects.toThrow(translation.errors.secondsDateTimeLevelSupportedOnlyForLive);
  });
});
