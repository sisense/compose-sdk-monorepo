import { filterFactory, measureFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import { FunctionContext, ProcessedArg } from '../../types.js';
import { createSchemaIndex } from '../utils/schema-index.js';
import { processMeasuredValue } from './process-measured-value.js';

describe('processMeasuredValue', () => {
  const context: FunctionContext = {
    dataSource: {} as FunctionContext['dataSource'],
    schemaIndex: createSchemaIndex([]),
    pathPrefix: 'measures[0].',
  };

  it('should pass through when filters contain only plain Filter instances', () => {
    const measure = measureFactory.sum({} as never);
    const filter = filterFactory.equals({} as never, 'value');
    const processedArgs: ProcessedArg[] = [measure, [filter]];

    expect(processMeasuredValue(processedArgs, context)).toBe(processedArgs);
  });

  it('should throw when filters contain FilterRelations from logic.or', () => {
    const measure = measureFactory.sum({} as never);
    const filterRelations = filterFactory.logic.or(
      filterFactory.equals({} as never, 'a'),
      filterFactory.equals({} as never, 'b'),
    );
    const processedArgs: ProcessedArg[] = [measure, [filterRelations]];

    expect(() => processMeasuredValue(processedArgs, context)).toThrow(
      'measures[0].args[1][0]: FilterRelations (filterFactory.logic.or / filterFactory.logic.and) is not supported inside measureFactory.measuredValue filters',
    );
  });

  it('should throw when filters contain FilterRelations from logic.and', () => {
    const measure = measureFactory.sum({} as never);
    const filterRelations = filterFactory.logic.and(
      filterFactory.equals({} as never, 'a'),
      filterFactory.equals({} as never, 'b'),
    );
    const processedArgs: ProcessedArg[] = [measure, [filterRelations]];

    expect(() => processMeasuredValue(processedArgs, context)).toThrow(
      'FilterRelations (filterFactory.logic.or / filterFactory.logic.and) is not supported inside measureFactory.measuredValue filters',
    );
  });
});
