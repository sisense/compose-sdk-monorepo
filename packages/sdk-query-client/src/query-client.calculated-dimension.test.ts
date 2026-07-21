/* eslint-disable @typescript-eslint/no-floating-promises */

/* eslint-disable @typescript-eslint/unbound-method */
import {
  attributeFactory,
  createAttribute,
  DimensionalAttribute,
  EMPTY_PIVOT_QUERY_RESULT_DATA,
  Filter,
  filterFactory,
} from '@sisense/sdk-data';
import { PivotQueryClient } from '@sisense/sdk-pivot-query-client';
import { HttpClient } from '@sisense/sdk-rest-client';
import type { Mocked } from 'vitest';

import { DimensionalQueryClient } from './query-client.js';
import {
  CalculatedDimensionParseResponse,
  JaqlQueryPayload,
  PivotQueryDescription,
  QueryDescription,
} from './types.js';

const DATA_SOURCE = 'Sample ECommerce';
const PARSE_URL_PART = 'calculated-dimension/parse';

const baseAttribute = () =>
  new DimensionalAttribute('AgeRange', '[Commerce.Age Range]', 'attribute');
const ageRange = () => new DimensionalAttribute('AgeRange', '[Commerce.Age Range]', 'attribute');
const categoryId = () =>
  new DimensionalAttribute('CategoryId', '[Commerce.Category ID]', 'numeric');

/** A pro-code text CD filter: right() returns text. Carries NO datatype (needs resolving). */
const textCdFilter = (): Filter =>
  filterFactory.members(
    attributeFactory.customFormula('right([Age Range], 1)', 'right([ageRange], 1)', {
      ageRange: ageRange(),
    }),
    ['4'],
  );

/** A pro-code numeric CD filter: the CASE formula returns numbers; a numeric condition on it. */
const numericCdFilter = (): Filter =>
  filterFactory.greaterThan(
    attributeFactory.customFormula(
      'Category bucket',
      'CASE WHEN [categoryId] > 10 THEN 11 ELSE 2 END',
      { categoryId: categoryId() },
    ),
    5,
  );

const query = (filters: Filter[], extra: Partial<QueryDescription> = {}): QueryDescription => ({
  dataSource: DATA_SOURCE,
  attributes: [baseAttribute()],
  measures: [],
  filters,
  highlights: [],
  ...extra,
});

const findCalculatedDimensionItems = (payload: JaqlQueryPayload) =>
  payload.metadata.filter((item) => item.jaql?.type === 'calculated_dimension');

describe('DimensionalQueryClient — calculated-dimension filter enrichment', () => {
  let httpClientMock: Mocked<HttpClient>;
  let pivotClientMock: Mocked<PivotQueryClient>;
  let queryClient: DimensionalQueryClient;
  let parseResponse: CalculatedDimensionParseResponse | undefined;

  beforeEach(() => {
    parseResponse = { dataType: 'text' };
    httpClientMock = {
      post: vi.fn().mockImplementation((url: string) => {
        if (url.includes(PARSE_URL_PART)) {
          return Promise.resolve(parseResponse);
        }
        // any query endpoint (/jaql, /jaql/countrows): an empty array normalizes to an empty result
        return Promise.resolve([]);
      }),
      get: vi.fn().mockResolvedValue({}),
    } as unknown as Mocked<HttpClient>;
    pivotClientMock = {
      queryData: vi.fn().mockResolvedValue(EMPTY_PIVOT_QUERY_RESULT_DATA),
    } as unknown as Mocked<PivotQueryClient>;
    queryClient = new DimensionalQueryClient(httpClientMock, pivotClientMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /** POST calls to the calculated-dimension parse endpoint. */
  const parseCalls = () =>
    httpClientMock.post.mock.calls.filter(([url]) => url.includes(PARSE_URL_PART));

  /** POST calls to a query endpoint (excludes the parse endpoint). */
  const jaqlCalls = () =>
    httpClientMock.post.mock.calls.filter(
      ([url]) => url.endsWith('/jaql') && !url.includes(PARSE_URL_PART),
    );

  /** The JAQL payload of the (single) executed query request. */
  const executedJaqlPayload = (): JaqlQueryPayload => jaqlCalls()[0][1] as JaqlQueryPayload;

  const runQuery = (queryDescription: QueryDescription) =>
    queryClient.executeQuery(queryDescription).resultPromise;

  describe('end-to-end datatype injection', () => {
    it('resolves a text members CD filter and stamps datatype on the outgoing JAQL', async () => {
      await runQuery(query([textCdFilter()]));

      // (a) the parse endpoint was hit with the CD's formula + context
      expect(parseCalls()).toHaveLength(1);
      const parseBody = parseCalls()[0][1] as { formula: string; context: object };
      expect(parseBody.formula).toBe('right([ageRange], 1)');
      expect(parseBody.context).toMatchObject({ '[ageRange]': { dim: '[Commerce.Age Range]' } });

      // (b) the executed JAQL carries the resolved top-level datatype, members intact
      const [cdItem] = findCalculatedDimensionItems(executedJaqlPayload());
      expect(cdItem.jaql.datatype).toBe('text');
      expect(cdItem.jaql.filter).toMatchObject({ members: ['4'] });
    });

    it('resolves a numeric condition CD filter to datatype "numeric"', async () => {
      parseResponse = { dataType: 'numeric' };

      await runQuery(query([numericCdFilter()]));

      const [cdItem] = findCalculatedDimensionItems(executedJaqlPayload());
      expect(cdItem.jaql.datatype).toBe('numeric');
    });

    it("falls back to 'text' when the server validates but returns no datatype", async () => {
      parseResponse = {};

      await runQuery(query([textCdFilter()]));

      const [cdItem] = findCalculatedDimensionItems(executedJaqlPayload());
      expect(cdItem.jaql.datatype).toBe('text');
    });

    it('fails the query with the server message and never sends the JAQL for an invalid formula', async () => {
      parseResponse = { error: true, message: 'Unknown function xyz' };

      await expect(queryClient.executeQuery(query([textCdFilter()])).resultPromise).rejects.toThrow(
        'Invalid calculated dimension formula. Unknown function xyz',
      );

      expect(jaqlCalls()).toHaveLength(0);
    });

    it('resolves two distinct CD filters independently in one query', async () => {
      httpClientMock.post.mockImplementation((url: string, body: unknown) => {
        if (url.includes(PARSE_URL_PART)) {
          const { formula } = body as { formula: string };
          return Promise.resolve(
            formula.startsWith('CASE') ? { dataType: 'numeric' } : { dataType: 'text' },
          );
        }
        return Promise.resolve([]);
      });

      await runQuery(query([textCdFilter(), numericCdFilter()]));

      expect(parseCalls()).toHaveLength(2);
      const items = findCalculatedDimensionItems(executedJaqlPayload());
      const byFormula = Object.fromEntries(items.map((i) => [i.jaql.formula, i.jaql.datatype]));
      expect(byFormula['right([ageRange], 1)']).toBe('text');
      expect(byFormula['CASE WHEN [categoryId] > 10 THEN 11 ELSE 2 END']).toBe('numeric');
    });
  });

  describe('no-op / skip guarantees', () => {
    it('makes no parse call for a regular (non-CD) query', async () => {
      await runQuery(query([filterFactory.members(ageRange(), ['0-18'])]));

      expect(parseCalls()).toHaveLength(0);
    });

    it('makes no parse call for a calculated dimension used as a dimension (no filter)', async () => {
      const cdAsDimension = attributeFactory.customFormula(
        'right([Age Range], 1)',
        'right([ageRange], 1)',
        {
          ageRange: ageRange(),
        },
      );

      await runQuery(query([], { attributes: [baseAttribute(), cdAsDimension] }));

      expect(parseCalls()).toHaveLength(0);
    });

    it('leaves a CD filter that already carries a datatype untouched (Fusion-created)', async () => {
      const typedCdAttribute = createAttribute({
        type: 'calculated_dimension',
        title: 'right([Age Range], 1)',
        formula: 'right([ageRange], 1)',
        context: { '[ageRange]': { dim: '[Commerce.Age Range]', datatype: 'text' } },
        datatype: 'text',
      });

      await runQuery(query([filterFactory.members(typedCdAttribute, ['4'])]));

      expect(parseCalls()).toHaveLength(0);
      const [cdItem] = findCalculatedDimensionItems(executedJaqlPayload());
      expect(cdItem.jaql.datatype).toBe('text');
    });
  });

  describe('caching and breadth', () => {
    it('resolves a shared CD filter once across multiple queries (dashboard fan-out)', async () => {
      // same client → same cache; two widgets querying the same dashboard filter
      await Promise.all([runQuery(query([textCdFilter()])), runQuery(query([textCdFilter()]))]);

      expect(parseCalls()).toHaveLength(1);
    });

    it('enriches the pivot query path', async () => {
      const pivotDescription: PivotQueryDescription = {
        dataSource: DATA_SOURCE,
        rowsAttributes: [baseAttribute()],
        columnsAttributes: [],
        measures: [],
        grandTotals: {},
        filters: [textCdFilter()],
        highlights: [],
      };

      await queryClient.executePivotQuery(pivotDescription).resultPromise;

      expect(parseCalls()).toHaveLength(1);
      const pivotPayload = pivotClientMock.queryData.mock
        .calls[0][0] as unknown as JaqlQueryPayload;
      const [cdItem] = findCalculatedDimensionItems(pivotPayload);
      expect(cdItem.jaql.datatype).toBe('text');
    });

    it('enriches the count-rows query path', async () => {
      // the count-rows response must carry a numeric `countRows` to pass validation
      httpClientMock.post.mockImplementation((url: string) => {
        if (url.includes(PARSE_URL_PART)) return Promise.resolve(parseResponse);
        if (url.endsWith('/jaql/countrows')) return Promise.resolve({ countRows: 0 });
        return Promise.resolve([]);
      });

      await queryClient.executeCountRowsQuery(query([textCdFilter()])).resultPromise;

      expect(parseCalls()).toHaveLength(1);
      const countRowsPayload = httpClientMock.post.mock.calls.find(([url]) =>
        url.endsWith('/jaql/countrows'),
      )?.[1] as JaqlQueryPayload;
      const [cdItem] = findCalculatedDimensionItems(countRowsPayload);
      expect(cdItem.jaql.datatype).toBe('text');
    });
  });

  describe('filter relations', () => {
    it('enriches a CD filter inside a filter-relations tree and preserves its instanceid', async () => {
      const cd = textCdFilter();
      const other = filterFactory.members(ageRange(), ['0-18']);
      const filterRelations = {
        operator: 'AND',
        left: { instanceid: cd.config.guid },
        right: { instanceid: other.config.guid },
      } as unknown as QueryDescription['filterRelations'];

      await runQuery(query([cd, other], { filterRelations }));

      expect(parseCalls()).toHaveLength(1);
      const [cdItem] = findCalculatedDimensionItems(executedJaqlPayload());
      expect(cdItem.jaql.datatype).toBe('text');
      expect(cdItem.instanceid).toBe(cd.config.guid);
    });
  });
});
