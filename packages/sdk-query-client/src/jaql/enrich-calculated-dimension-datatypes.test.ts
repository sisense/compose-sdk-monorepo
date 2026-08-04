import { MetadataItem } from '@sisense/sdk-data';
import { Mock } from 'vitest';

import { JaqlQueryPayload } from '../types.js';
import {
  enrichCalculatedDimensionDatatypes,
  ParseCalculatedDimensionFn,
} from './enrich-calculated-dimension-datatypes.js';

const DATA_SOURCE = 'Sample ECommerce';

/**
 * A calculated-dimension FILTER metadata item without a resolved top-level datatype.
 */
const cdFilterItem = (overrides: Partial<MetadataItem['jaql']> = {}): MetadataItem => ({
  jaql: {
    type: 'calculated_dimension',
    title: 'right([Age Range], 1)',
    formula: 'right([ageRange], 1)',
    context: {
      '[ageRange]': { dim: '[Commerce.Age Range]', datatype: 'text', title: 'Age Range' },
    },
    filter: { jaql: {} },
    ...overrides,
  },
});

// The helper only reads `metadata`, so a metadata-only fixture is sufficient.
const payloadOf = (metadata: MetadataItem[]): Pick<JaqlQueryPayload, 'metadata'> => ({ metadata });

describe('enrichCalculatedDimensionDatatypes', () => {
  let parse: Mock;
  let parseFn: ParseCalculatedDimensionFn;

  beforeEach(() => {
    parse = vi.fn();
    parseFn = parse as unknown as ParseCalculatedDimensionFn;
  });

  it('stamps the server-resolved datatype on a CD filter', async () => {
    parse.mockResolvedValueOnce({ dataType: 'numeric' });
    const item = cdFilterItem();
    const payload = payloadOf([item]);

    await enrichCalculatedDimensionDatatypes(payload, DATA_SOURCE, parseFn);

    expect(parse).toHaveBeenCalledWith(DATA_SOURCE, item.jaql.formula, item.jaql.context);
    expect(item.jaql.datatype).toBe('numeric');
  });

  it("falls back to 'text' when the formula is valid but the server returns no datatype", async () => {
    parse.mockResolvedValueOnce({});
    const item = cdFilterItem();

    await enrichCalculatedDimensionDatatypes(payloadOf([item]), DATA_SOURCE, parseFn);

    expect(item.jaql.datatype).toBe('text');
  });

  it('fails the query with the server message when the formula is invalid', async () => {
    parse.mockResolvedValueOnce({ error: true, message: 'Unknown function xyz' });
    const item = cdFilterItem();

    await expect(
      enrichCalculatedDimensionDatatypes(payloadOf([item]), DATA_SOURCE, parseFn),
    ).rejects.toThrow('Invalid calculated dimension formula. Unknown function xyz');
    expect(item.jaql.datatype).toBeUndefined();
  });

  it('routes an empty formula to the parser (does not skip it on falsy formula)', async () => {
    parse.mockResolvedValueOnce({ error: true, message: 'Empty formula' });
    const item = cdFilterItem({ formula: '' });

    await expect(
      enrichCalculatedDimensionDatatypes(payloadOf([item]), DATA_SOURCE, parseFn),
    ).rejects.toThrow('Invalid calculated dimension formula. Empty formula');
    expect(parse).toHaveBeenCalledWith(DATA_SOURCE, '', item.jaql.context);
  });

  it('leaves a CD filter that already carries a datatype untouched (e.g. created in Fusion)', async () => {
    const item = cdFilterItem({ datatype: 'text' });

    await enrichCalculatedDimensionDatatypes(payloadOf([item]), DATA_SOURCE, parseFn);

    expect(parse).not.toHaveBeenCalled();
    expect(item.jaql.datatype).toBe('text');
  });

  it('stamps datatype on a CD highlight AND its dimension element (jaql.in.selected)', async () => {
    parse.mockResolvedValue({ dataType: 'text' });
    // A highlight is merged into its dimension, so its filter lives under `jaql.in.selected.jaql`;
    // the dimension itself carries no top-level filter, but the engine reads the datatype off the
    // dimension element, so it must be stamped too.
    const item: MetadataItem = {
      jaql: {
        type: 'calculated_dimension',
        formula: 'left([ageRange], 2)',
        context: { '[ageRange]': { dim: '[Commerce.Age Range]', datatype: 'text' } },
        in: {
          selected: {
            jaql: {
              type: 'calculated_dimension',
              formula: 'left([ageRange], 2)',
              context: { '[ageRange]': { dim: '[Commerce.Age Range]', datatype: 'text' } },
              filter: { jaql: {} },
            },
          },
        },
      },
    };

    await enrichCalculatedDimensionDatatypes(payloadOf([item]), DATA_SOURCE, parseFn);

    expect(parse).toHaveBeenCalledWith(
      DATA_SOURCE,
      'left([ageRange], 2)',
      item.jaql.in!.selected.jaql.context,
    );
    // the dimension element and its embedded highlight share one formula/context, so it is parsed
    // once and the result is applied to both nodes
    expect(parse).toHaveBeenCalledTimes(1);
    expect(item.jaql.datatype).toBe('text');
    expect(item.jaql.in!.selected.jaql.datatype).toBe('text');
  });

  it('ignores a calculated dimension used as a dimension (no filter)', async () => {
    const item = cdFilterItem({ filter: undefined });

    await enrichCalculatedDimensionDatatypes(payloadOf([item]), DATA_SOURCE, parseFn);

    expect(parse).not.toHaveBeenCalled();
    expect(item.jaql.datatype).toBeUndefined();
  });

  it('ignores regular (non-calculated-dimension) filters', async () => {
    const item: MetadataItem = {
      jaql: {
        dim: '[Commerce.Age Range]',
        datatype: 'text',
        filter: { jaql: {} },
      },
    };

    await enrichCalculatedDimensionDatatypes(payloadOf([item]), DATA_SOURCE, parseFn);

    expect(parse).not.toHaveBeenCalled();
  });

  it('resolves multiple CD filters', async () => {
    parse
      .mockResolvedValueOnce({ dataType: 'text' })
      .mockResolvedValueOnce({ dataType: 'numeric' });
    const textItem = cdFilterItem();
    const numericItem = cdFilterItem({ formula: 'CASE WHEN [n] > 10 THEN 11 ELSE 2 END' });

    await enrichCalculatedDimensionDatatypes(
      payloadOf([textItem, numericItem]),
      DATA_SOURCE,
      parseFn,
    );

    expect(parse).toHaveBeenCalledTimes(2);
    expect(textItem.jaql.datatype).toBe('text');
    expect(numericItem.jaql.datatype).toBe('numeric');
  });
});
