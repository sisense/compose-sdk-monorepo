import { measureFactory } from '@sisense/sdk-data';
import { describe, expect, it, vi } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import {
  buildJaqlForExcelExport,
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
      [measureFactory.sum(DM.Commerce.Revenue)],
      true,
    );

    expect(metadata).toHaveLength(2);
    expect(metadata[0]).toMatchObject({ panel: 'rows' });
    expect(metadata[1]).toMatchObject({ panel: 'measures' });
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
});
