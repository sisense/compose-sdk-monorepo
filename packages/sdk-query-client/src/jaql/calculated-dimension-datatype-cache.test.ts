import { Mock } from 'vitest';

import { withCalculatedDimensionParseCache } from './calculated-dimension-datatype-cache.js';
import { ParseCalculatedDimensionFn } from './enrich-calculated-dimension-datatypes.js';

const DATA_SOURCE = 'Sample ECommerce';
const FORMULA = 'right([ageRange], 1)';
const CONTEXT = { '[ageRange]': { dim: '[Commerce.Age Range]', datatype: 'text' } };

describe('withCalculatedDimensionParseCache', () => {
  let parse: Mock<ParseCalculatedDimensionFn>;
  let cachedParse: ParseCalculatedDimensionFn;

  beforeEach(() => {
    parse = vi.fn<ParseCalculatedDimensionFn>().mockResolvedValue({ dataType: 'text' });
    cachedParse = withCalculatedDimensionParseCache(parse);
  });

  it('parses once and reuses the result for the same formula', async () => {
    const first = await cachedParse(DATA_SOURCE, FORMULA, CONTEXT);
    const second = await cachedParse(DATA_SOURCE, FORMULA, CONTEXT);

    expect(parse).toHaveBeenCalledTimes(1);
    expect(first).toEqual({ dataType: 'text' });
    expect(second).toEqual({ dataType: 'text' });
  });

  it('deduplicates concurrent identical requests into a single call (dashboard fan-out)', async () => {
    // Ten widgets resolving the same dashboard filter at once.
    await Promise.all(Array.from({ length: 10 }, () => cachedParse(DATA_SOURCE, FORMULA, CONTEXT)));

    expect(parse).toHaveBeenCalledTimes(1);
  });

  it('parses separately for a different formula, data source or context', async () => {
    await cachedParse(DATA_SOURCE, FORMULA, CONTEXT);
    await cachedParse(DATA_SOURCE, 'left([ageRange], 1)', CONTEXT);
    await cachedParse('Other', FORMULA, CONTEXT);
    await cachedParse(DATA_SOURCE, FORMULA, { '[x]': { dim: '[T.C]' } });

    expect(parse).toHaveBeenCalledTimes(4);
  });

  it('caches a resolved formula-error response (a broken dashboard filter parses once)', async () => {
    parse.mockReset().mockResolvedValue({ error: true, message: 'bad' });

    await cachedParse(DATA_SOURCE, FORMULA, CONTEXT);
    await cachedParse(DATA_SOURCE, FORMULA, CONTEXT);

    expect(parse).toHaveBeenCalledTimes(1);
  });

  it('does not cache a rejected request, allowing a retry', async () => {
    parse.mockReset().mockRejectedValueOnce(new Error('network')).mockResolvedValue({
      dataType: 'numeric',
    });

    await expect(cachedParse(DATA_SOURCE, FORMULA, CONTEXT)).rejects.toThrow('network');
    const retry = await cachedParse(DATA_SOURCE, FORMULA, CONTEXT);

    expect(parse).toHaveBeenCalledTimes(2);
    expect(retry).toEqual({ dataType: 'numeric' });
  });

  it('evicts the oldest entry once the max size is reached', async () => {
    const cappedParse = withCalculatedDimensionParseCache(parse, 2);

    await cappedParse(DATA_SOURCE, 'f1', CONTEXT); // fills slot 1
    await cappedParse(DATA_SOURCE, 'f2', CONTEXT); // fills slot 2
    await cappedParse(DATA_SOURCE, 'f3', CONTEXT); // evicts f1
    await cappedParse(DATA_SOURCE, 'f1', CONTEXT); // f1 re-parsed (was evicted)

    expect(parse).toHaveBeenCalledTimes(4);
  });
});
