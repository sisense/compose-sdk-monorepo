import { describe, expect, it } from 'vitest';

import { buildXlsxExportPayload } from './build-xlsx-export-payload.js';

describe('buildXlsxExportPayload', () => {
  it('merges widget chrome, jaql, and mergeRows into the export body', () => {
    const jaql = { by: 'export', count: -1 };
    const payload = buildXlsxExportPayload(
      {
        widgetId: 'w-1',
        widgetType: 'column',
        language: 'en-US',
      },
      jaql,
      true,
    );

    expect(payload).toEqual({
      widgetId: 'w-1',
      widgetType: 'column',
      jaql,
      mergeRows: true,
      language: 'en-US',
    });
  });
});
