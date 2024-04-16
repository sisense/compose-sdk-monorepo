import { QueryTranslator } from '@/ai';
import {
  MOCK_DATA_SOURCE_FIELDS,
  MOCK_EXPANDED_QUERY_MODEL,
  MOCK_RE_EXPANDED_QUERY_MODEL,
  MOCK_SIMPLE_QUERY_MODEL,
} from '@/ai/translators/__mocks__/models';

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

  describe('translateToExpanded', () => {
    it('should translate SimpleQueryModel back to ExpandedQueryModel', () => {
      const expandedQueryModel = queryTranslator.translateToExpanded(MOCK_SIMPLE_QUERY_MODEL);
      expect(expandedQueryModel).toEqual(MOCK_RE_EXPANDED_QUERY_MODEL);
    });
  });
});
