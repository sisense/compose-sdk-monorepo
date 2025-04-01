import { QueryTranslator } from './query-translator.js';
import {
  MOCK_EXPANDED_QUERY_MODEL,
  MOCK_QUERY_MODEL_1,
  MOCK_QUERY_YAML_1,
  MOCK_RE_EXPANDED_QUERY_MODEL,
  MOCK_SIMPLE_QUERY_MODEL,
  MOCK_SIMPLE_QUERY_YAML,
} from '../__mocks__/mock-queries.js';
import { sampleEcommerceFields as MOCK_DATA_SOURCE_FIELDS } from '@/__mocks__/sample-ecommerce-fields.js';
import { capitalizeFirstLetter } from '../common/utils.js';
import { QUERY_TEMPLATE } from './query-templates.js';
import { EMPTY_SIMPLE_QUERY_MODEL } from '../types.js';

describe('QueryTranslator', () => {
  let queryTranslator: QueryTranslator;
  beforeEach(() => {
    queryTranslator = new QueryTranslator('Sample ECommerce', MOCK_DATA_SOURCE_FIELDS);
  });

  describe('translateToSimple', () => {
    it('should translate ExpandedQueryModel to SimpleQueryModel', () => {
      const simpleQueryModel = queryTranslator.translateToSimple(MOCK_EXPANDED_QUERY_MODEL);
      expect(simpleQueryModel).toEqual(MOCK_SIMPLE_QUERY_MODEL);
    });
  });

  describe('stringifySimple', () => {
    it('should stringify SimpleQueryModel', () => {
      expect(queryTranslator.stringifySimple(MOCK_SIMPLE_QUERY_MODEL)).toEqual(
        MOCK_SIMPLE_QUERY_YAML,
      );
    });
  });

  describe('parseSimple', () => {
    it('should parse Simple Query YAML', () => {
      expect(queryTranslator.parseSimple(MOCK_SIMPLE_QUERY_YAML)).toEqual({
        ...MOCK_SIMPLE_QUERY_MODEL,
        queryTitle: capitalizeFirstLetter(MOCK_SIMPLE_QUERY_MODEL.queryTitle),
      });
    });
  });

  describe('translateToExpanded', () => {
    it('should translate SimpleQueryModel back to ExpandedQueryModel', () => {
      const expandedQueryModel = queryTranslator.translateToExpanded(MOCK_SIMPLE_QUERY_MODEL);
      expect(expandedQueryModel).toEqual(MOCK_RE_EXPANDED_QUERY_MODEL);
    });

    it('should translate query YAML to ExpandedQueryModel', () => {
      const expandedQueryModel = queryTranslator.translateToExpanded(
        queryTranslator.parseSimple(MOCK_QUERY_YAML_1),
      );

      expect(expandedQueryModel).toEqual(MOCK_QUERY_MODEL_1);
    });
  });

  describe('getQueryTemplate', () => {
    it('should return query template', () => {
      const queryTemplate = queryTranslator.getQueryTemplate();
      expect(queryTemplate).toEqual(
        QUERY_TEMPLATE.replace(/{{dataSourceTitle}}/g, 'Sample ECommerce'),
      );
      expect(queryTranslator.parseSimple(queryTemplate)).toEqual(EMPTY_SIMPLE_QUERY_MODEL);
    });
  });
});
