import { filterFactory, measureFactory } from '@sisense/sdk-data';
import { describe, expect, it, vi } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import {
  buildJaqlForExcelExport,
  createFiltersMetadataForXlsx,
  createPanelsMetadataForXlsx,
  EXCEL_EXPORT_JAQL_BY,
  resolveExcelDimensionMetadataPanel,
} from './build-jaql-excel-export.js';

vi.mock('uuid', () => ({
  v4: () => 'fixed-query-guid',
}));

describe('createPanelsMetadataForXlsx', () => {
  it('includes level in jaql for a date dimension', () => {
    const metadata = createPanelsMetadataForXlsx([DM.Commerce.Date.Years], [], true);

    expect(metadata).toHaveLength(1);
    expect(metadata[0]).toMatchObject({
      panel: 'rows',
      jaql: expect.objectContaining({ level: 'years' }),
    });
  });

  it('includes dateTimeLevel and bucket in jaql for a sub-day date dimension', () => {
    const metadata = createPanelsMetadataForXlsx([DM.Commerce.Date.Hours], [], true);

    expect(metadata).toHaveLength(1);
    expect(metadata[0]).toMatchObject({
      jaql: expect.objectContaining({ dateTimeLevel: 'minutes', bucket: '60' }),
    });
  });

  it('includes format mask for a date dimension so the backend formats values correctly', () => {
    const metadata = createPanelsMetadataForXlsx([DM.Commerce.Date.Years], [], true);

    expect(metadata[0]).toMatchObject({
      format: { mask: { years: 'yyyy' } },
    });
  });

  it('includes format mask for a sub-day date dimension', () => {
    const metadata = createPanelsMetadataForXlsx([DM.Commerce.Date.Hours], [], true);

    expect(metadata[0]).toMatchObject({
      format: { mask: { minutes: expect.any(String) } },
    });
  });

  it('maps dimensions and measures to metadata rows', () => {
    const metadata = createPanelsMetadataForXlsx(
      [DM.Commerce.AgeRange],
      [measureFactory.sum(DM.Commerce.Revenue).format('0,0')],
      true,
    );

    expect(metadata).toHaveLength(2);
    expect(metadata[0]).toMatchObject({ panel: 'rows' });
    expect(metadata[1]).toMatchObject({
      panel: 'measures',
      format: {
        mask: {
          type: 'number',
          abbreviations: { t: false, b: false, m: false, k: false },
          abbreviateAll: false,
          separated: true,
          decimals: 'auto',
          isdefault: true,
        },
      },
    });
  });

  it('maps percent measure formats to a percent Fusion mask', () => {
    const metadata = createPanelsMetadataForXlsx(
      [],
      [measureFactory.sum(DM.Commerce.Revenue).format('0.00%')],
      true,
    );

    expect(metadata[0]?.format).toEqual({
      mask: {
        type: 'percent',
        percent: true,
        abbreviations: { t: false, b: false, m: false, k: false },
        abbreviateAll: false,
        separated: false,
        decimals: 2,
        isdefault: true,
      },
    });
  });

  it('maps numeral patterns with fractional digits to mask decimals', () => {
    const metadata = createPanelsMetadataForXlsx(
      [],
      [measureFactory.sum(DM.Commerce.Revenue).format('0,0.00')],
      true,
    );

    expect(metadata[0]?.format).toEqual({
      mask: {
        type: 'number',
        abbreviations: { t: false, b: false, m: false, k: false },
        abbreviateAll: false,
        separated: true,
        decimals: 2,
        isdefault: true,
      },
    });
  });

  it('maps pivot numberFormatConfig to a Fusion mask with abbreviations', () => {
    const measure = Object.assign(measureFactory.sum(DM.Commerce.Revenue), {
      excelNumberFormatConfig: {
        name: 'Numbers' as const,
        million: true,
        billion: true,
        trillion: true,
        kilo: true,
        decimalScale: 2,
        thousandSeparator: true,
      },
    });
    const metadata = createPanelsMetadataForXlsx([], [measure], true);

    expect(metadata[0]?.format).toEqual({
      mask: {
        type: 'number',
        abbreviations: { t: true, b: true, m: true, k: true },
        abbreviateAll: false,
        decimals: 2,
        isdefault: true,
        number: { separated: true },
        separated: true,
      },
    });
  });

  it('merges an existing numeric mask without dropping abbreviations', () => {
    const measure = measureFactory.sum(DM.Commerce.Revenue);
    const metadataItem = measure.jaql();
    metadataItem.format = {
      mask: {
        type: 'number',
        abbreviations: { t: false, b: false, m: true, k: false },
        separated: true,
        decimals: 2,
      },
    };
    const metadata = createPanelsMetadataForXlsx(
      [],
      [Object.assign(measure, { jaql: () => metadataItem })],
      true,
    );

    expect(metadata[0]?.format).toEqual({
      mask: {
        type: 'number',
        abbreviations: { t: false, b: false, m: true, k: false },
        abbreviateAll: false,
        separated: true,
        decimals: 2,
        isdefault: true,
      },
    });
  });

  it('uses panel columns on dimensions when Attribute.panel is columns', () => {
    const columnDim = Object.assign(DM.Commerce.Gender, { panel: 'columns' as const });
    const metadata = createPanelsMetadataForXlsx([DM.Commerce.AgeRange, columnDim], [], true);

    expect(metadata).toHaveLength(2);
    expect(metadata[0]).toMatchObject({ panel: 'rows' });
    expect(metadata[1]).toMatchObject({ panel: 'columns' });
  });

  it('assigns sequential jaql.field.index across dimensions then measures', () => {
    const metadata = createPanelsMetadataForXlsx(
      [DM.Commerce.AgeRange, DM.Commerce.Gender],
      [measureFactory.sum(DM.Commerce.Revenue)],
      false,
    );

    expect(metadata).toHaveLength(3);
    expect(metadata[0]).toEqual(
      expect.objectContaining({ field: expect.objectContaining({ index: 0 }) }),
    );
    expect(metadata[1]).toEqual(
      expect.objectContaining({ field: expect.objectContaining({ index: 1 }) }),
    );
    expect(metadata[2]).toEqual(
      expect.objectContaining({ field: expect.objectContaining({ index: 2 }) }),
    );
  });
});

describe('resolveExcelDimensionMetadataPanel', () => {
  it('defaults to rows when panel is omitted', () => {
    expect(resolveExcelDimensionMetadataPanel(DM.Commerce.AgeRange, true)).toBe('rows');
  });

  it('returns columns when panel is columns and mergeRows is true', () => {
    const dim = Object.assign(DM.Commerce.Gender, { panel: 'columns' as const });
    expect(resolveExcelDimensionMetadataPanel(dim, true)).toBe('columns');
  });

  it('returns rows when mergeRows is false even if attribute panel is columns', () => {
    const dim = Object.assign(DM.Commerce.Gender, { panel: 'columns' as const });
    expect(resolveExcelDimensionMetadataPanel(dim, false)).toBe('rows');
  });
});

describe('buildJaqlForExcelExport', () => {
  it('builds JAQL root with datasource, widget segment, queryGuid, metadata, and export defaults', () => {
    const jaql = buildJaqlForExcelExport(
      { dimensions: [DM.Commerce.AgeRange], measures: [] },
      {
        widgetOid: 'oid-1',
        widgetTitle: 'My chart',
        dataSource: DM.DataSource,
        mergeRows: false,
      },
    );

    expect(jaql.datasource).toBeDefined();
    expect(jaql.widget).toBe('oid-1;My chart');
    expect(jaql.queryGuid).toBe('fixed-query-guid');
    expect(jaql.by).toBe(EXCEL_EXPORT_JAQL_BY);
    expect(jaql.count).toBe(-1);
    expect(jaql.ungroup).toBe(false);
    expect(jaql.mergeRows).toBe(false);
    expect(Array.isArray(jaql.metadata)).toBe(true);
    expect((jaql.metadata as unknown[]).length).toBe(1);
  });

  it('forces all dimension panels to rows in metadata when mergeRows is false', () => {
    const columnDim = Object.assign(DM.Commerce.Gender, { panel: 'columns' as const });
    const jaql = buildJaqlForExcelExport(
      { dimensions: [DM.Commerce.AgeRange, columnDim], measures: [] },
      {
        widgetOid: 'oid-1',
        widgetTitle: 'Pivot',
        dataSource: DM.DataSource,
        mergeRows: false,
      },
    );
    const metadata = jaql.metadata as Array<{ panel: string }>;
    expect(metadata).toHaveLength(2);
    expect(metadata[0]?.panel).toBe('rows');
    expect(metadata[1]?.panel).toBe('rows');
  });

  it('appends scope filter metadata when filters are provided', () => {
    const genderFilter = filterFactory.members(DM.Commerce.Gender, ['Male']);
    const jaql = buildJaqlForExcelExport(
      {
        dimensions: [DM.Commerce.AgeRange],
        measures: [],
        filters: [genderFilter],
      },
      {
        widgetOid: 'oid-1',
        widgetTitle: 'My chart',
        dataSource: DM.DataSource,
        mergeRows: false,
      },
    );

    const metadata = jaql.metadata as Array<{ panel: string; jaql: { dim: string } }>;
    expect(metadata).toHaveLength(2);
    expect(metadata[0]?.panel).toBe('rows');
    expect(metadata[1]).toMatchObject({
      panel: 'scope',
      jaql: expect.objectContaining({ dim: '[Commerce.Gender]' }),
    });
  });
});

describe('createFiltersMetadataForXlsx', () => {
  it('returns scope metadata for filters whose attribute is not on the export panels', () => {
    const genderFilter = filterFactory.members(DM.Commerce.Gender, ['Male']);

    const filtersMetadata = createFiltersMetadataForXlsx([genderFilter]);

    expect(filtersMetadata).toHaveLength(1);
    expect(filtersMetadata[0]).toMatchObject({
      panel: 'scope',
      jaql: expect.objectContaining({
        dim: '[Commerce.Gender]',
        filter: { members: ['Male'] },
      }),
    });
  });
});
