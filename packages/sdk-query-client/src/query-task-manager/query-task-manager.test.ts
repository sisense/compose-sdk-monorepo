/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { validateJaqlResponse } from './query-task-manager.js';

describe('validateJaqlResponse', () => {
  it('should throw error', () => {
    const jaqlResponse = {
      error: true,
      details: 'Current user is not authorized to view the requested cube or data set',
      type: 'db_unauthorized',
      errorSource: 'query',
      httpStatusCode: 401,
      database: 'Sample ECommerce',
    };
    expect(() => validateJaqlResponse(jaqlResponse)).toThrow(
      `${jaqlResponse.details} ${jaqlResponse.database}`,
    );
  });

  it('should not throw error', () => {
    const jaqlResponse = {
      metadata: [],
    };
    expect(validateJaqlResponse(jaqlResponse)).toBeTruthy();
  });
});
