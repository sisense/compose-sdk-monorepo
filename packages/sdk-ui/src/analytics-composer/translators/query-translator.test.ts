import { QueryTranslator } from './query-translator';
import {
  MOCK_DATA_SOURCE_FIELDS,
  MOCK_EXPANDED_QUERY_MODEL,
  MOCK_RE_EXPANDED_QUERY_MODEL,
  MOCK_SIMPLE_QUERY_MODEL,
  MOCK_SIMPLE_QUERY_YAML,
} from './__mocks__/models';
import { capitalizeFirstLetter } from './utils';
import { QUERY_TEMPLATE } from './query-templates';
import { EMPTY_SIMPLE_QUERY_MODEL } from './types';

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
