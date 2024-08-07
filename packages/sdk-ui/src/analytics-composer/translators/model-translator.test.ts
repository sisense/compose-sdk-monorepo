import { ModelTranslator } from './model-translator';
import { QueryTranslator } from './query-translator';
import { ExpandedQueryModel } from './types';
import { beforeAll } from 'vitest';
import {
  MOCK_DATA_SOURCE_FIELDS,
  MOCK_QUERY_YAML_1,
  MOCK_CODE_REACT_1,
  MOCK_CODE_ANGULAR_1,
  MOCK_CODE_VUE_1,
  MOCK_QUERY_YAML_2,
  MOCK_CODE_REACT_2,
} from './__mocks__/models.js';

describe('ModelTranslator', () => {
  let modelTranslator: ModelTranslator;
  let queryModel: ExpandedQueryModel;

  const setupAll = (queryYaml: string) => {
    const queryTranslator = new QueryTranslator('Sample ECommerce', MOCK_DATA_SOURCE_FIELDS);
    const simpleQueryModel = queryTranslator.parseSimple(queryYaml);
    queryModel = queryTranslator.translateToExpanded(simpleQueryModel);
  };

  describe('Standard Query YAML', () => {
    beforeAll(() => setupAll(MOCK_QUERY_YAML_1));

    beforeEach(() => {
      modelTranslator = new ModelTranslator(queryModel);
    });

    it('should create a ModelTranslator instance', () => {
      expect(modelTranslator).toBeInstanceOf(ModelTranslator);
    });

    it('should translate to CSDK code', () => {
      const chartWidget = modelTranslator.toChart();
      expect(chartWidget).toBeDefined();
      if (!chartWidget) return;
      expect(modelTranslator.toCode(chartWidget, 'react')).toEqual(MOCK_CODE_REACT_1);
      expect(modelTranslator.toCode(chartWidget, 'angular')).toEqual(MOCK_CODE_ANGULAR_1);
      expect(modelTranslator.toCode(chartWidget, 'vue')).toEqual(MOCK_CODE_VUE_1);
    });
  });

  describe('Query YAML Without Chart', () => {
    beforeAll(() => setupAll(MOCK_QUERY_YAML_2));

    beforeEach(() => {
      modelTranslator = new ModelTranslator(queryModel);
    });

    it('should translate to CSDK code', () => {
      const chartWidget = modelTranslator.toChart();
      expect(chartWidget).toBeDefined();
      if (!chartWidget) return;
      expect(modelTranslator.toCode(chartWidget, 'react')).toEqual(MOCK_CODE_REACT_2);
    });
  });
});
