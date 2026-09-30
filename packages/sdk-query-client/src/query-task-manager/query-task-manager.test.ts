/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-return */
import { DateLevels, DimensionalLevelAttribute, measureFactory } from '@sisense/sdk-data';

import { getDataFromQueryResult } from '../query-result/get-data-from-query-result.js';
import { CountRowsResponse } from '../types.js';
import {
  buildResultColumnsMetadata,
  validateCountRowsResponse,
  validateJaqlResponse,
} from './query-task-manager.js';

describe('validateCountRowsResponse', () => {
  it('should throw error for empty response', () => {
    expect(() => validateCountRowsResponse(undefined)).toThrow(
      'Invalid row count response received from the server.',
    );
  });

  it('should throw error for response without numeric countRows', () => {
    expect(() => validateCountRowsResponse({} as CountRowsResponse)).toThrow(
      'Invalid row count response received from the server.',
    );
  });

  it('should not throw error for valid response', () => {
    expect(validateCountRowsResponse({ countRows: 0 })).toBeUndefined();
  });
});

describe('validateJaqlResponse', () => {
  it('should throw error for empty', () => {
    expect(() => validateJaqlResponse(undefined)).toThrow(
      'No jaql response received from the server',
    );
  });

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

  it('should not include extraDetails JSON in the thrown message', () => {
    const jaqlResponse = {
      error: true,
      details: 'The dimension, Sample Retail.[Brand.Brand], was not found',
      extraDetails:
        '{"inFormulaValidation":"true","baseTranslationException":"DimensionNotFoundException","dimension":"Sample Retail.[Brand.Brand]"}',
    };

    let message = '';
    try {
      validateJaqlResponse(jaqlResponse);
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toBe('The dimension, Sample Retail.[Brand.Brand], was not found');
    expect(message).not.toContain('{');
  });

  it('should not throw error', () => {
    const jaqlResponse = {
      metadata: [],
    };
    expect(validateJaqlResponse(jaqlResponse)).toBeUndefined();
  });
});

describe('buildResultColumnsMetadata', () => {
  const dateDays = new DimensionalLevelAttribute(
    'Days',
    '[Commerce.Date (Calendar)]',
    DateLevels.Days,
    'yyyy-MM-dd',
  );
  const years = new DimensionalLevelAttribute(
    'Years',
    '[Commerce.Date (Calendar)]',
    DateLevels.Years,
    'yyyy',
  );

  it('carries the aggregated attribute of a datetime measure through to the result column type', () => {
    const maxDate = measureFactory.max(dateDays, 'Max Date');

    const metadata = buildResultColumnsMetadata({ attributes: [years], measures: [maxDate] }, [
      'Years',
      'Max Date',
    ]);

    expect(metadata).toStrictEqual([years, maxDate]);
    const data = getDataFromQueryResult(
      {
        headers: ['Years', 'Max Date'],
        metadata: [{ jaql: { title: 'Years' } }, { jaql: { title: 'Max Date' } }],
        values: [
          [
            { data: '2010-01-01T00:00:00', text: '2010' },
            { data: '2010-12-31T00:00:00', text: '31/12/2010 00:00:00 AM' },
          ],
        ],
      },
      metadata,
    );
    expect(data.columns.map((column) => column.type)).toStrictEqual(['datetime', 'datetime']);
  });

  it('types the extra columns of advanced analytics as number', () => {
    const maxDate = measureFactory.max(dateDays, 'Max Date');

    const metadata = buildResultColumnsMetadata({ attributes: [], measures: [maxDate] }, [
      'Max Date',
      'Max Date_trend',
    ]);

    expect(metadata).toStrictEqual([
      maxDate,
      { name: 'Max Date_trend', title: 'Max Date_trend', type: 'number' },
    ]);
  });
});
