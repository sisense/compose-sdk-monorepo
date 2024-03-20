import { ModelTranslator, QueryTranslator } from '@/ai';
import { ExpandedQueryModel } from '@/ai/translators/types';
import { beforeAll } from 'vitest';
import {
  MOCK_CODE_REACT,
  MOCK_DATA_SOURCE_FIELDS,
  MOCK_QUERY_YAML,
} from '@/ai/translators/__mocks__/models';

describe('ModelTranslator', () => {
  let modelTranslator: ModelTranslator;
  let queryModel: ExpandedQueryModel;

  beforeAll(() => {
    const queryYaml = MOCK_QUERY_YAML;
    const queryTranslator = new QueryTranslator('Sample ECommerce', MOCK_DATA_SOURCE_FIELDS);
    const simpleQueryModel = queryTranslator.parseSimple(queryYaml);
    queryModel = queryTranslator.translateToExpanded(simpleQueryModel);
  });

  beforeEach(() => {
    modelTranslator = new ModelTranslator(queryModel);
  });

  it('should create a ModelTranslator instance', () => {
    expect(modelTranslator).toBeInstanceOf(ModelTranslator);
  });

  it('should translate to React code', () => {
    const chartWidget = modelTranslator.toChart();
    expect(chartWidget).toBeDefined();
    if (!chartWidget) return;
    const csdkCode = modelTranslator.toCode(chartWidget);
    expect(csdkCode).toEqual(MOCK_CODE_REACT);
  });
});
