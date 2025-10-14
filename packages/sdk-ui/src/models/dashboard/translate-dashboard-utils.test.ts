import { Dimension } from '@sisense/sdk-data';
import isEqual from 'lodash-es/isEqual';

import { RestApi } from '@/api/rest-api';
import {
  convertDimensionsToDimIndexes,
  extractPivotTargetsConfigFromWidgetDto,
  findDimensionByInstanceId,
  getJtdNavigateType,
  translateLayout,
  withSharedFormulas,
} from '@/models/dashboard/translate-dashboard-utils';
import { WidgetDto } from '@/widget-by-id/types';

import {
  dashboardWithSharedFormulas,
  sharedFormulasDictionary,
} from '../__mocks__/dashboard-with-shared-formulas';

describe('translate-dashboard-utils', () => {
  describe('translateLayout', () => {
    it('should correctly translate layout', () => {
      const dashboardDtoLayout = {
        instanceid: '78526-6FA5-87',
        type: 'columnar',
        columns: [
          {
            width: 50,
            cells: [
              {
                subcells: [
                  {
                    elements: [
                      {
                        minHeight: 64,
                        maxHeight: 1028,
                        height: '212px',
                        minWidth: 48,
                        maxWidth: 1028,
                        defaultWidth: 512,
                        widgetid: '6662ffcf888f5e002aa6cf18',
                      },
                    ],
                    width: 50,
                    stretchable: false,
                    pxlWidth: 515.5,
                    index: 0,
                  },
                  {
                    elements: [
                      {
                        minHeight: 64,
                        maxHeight: 1028,
                        height: '212px',
                        minWidth: 48,
                        maxWidth: 1028,
                        defaultWidth: 512,
                        widgetid: '66630139888f5e002aa6cf1a',
                      },
                    ],
                    width: 50,
                    stretchable: false,
                    pxlWidth: 515.5,
                    index: 1,
                  },
                ],
              },
              {
                subcells: [
                  {
                    elements: [
                      {
                        minHeight: 64,
                        maxHeight: 1028,
                        height: 192,
                        minWidth: 48,
                        maxWidth: 1028,
                        defaultWidth: 512,
                        widgetid: '66630141888f5e002aa6cf1c',
                      },
                    ],
                    width: 100,
                    stretchable: false,
                    pxlWidth: 1031,
                    index: 0,
                  },
                ],
              },
            ],
            pxlWidth: 1031,
            index: 0,
          },
          {
            width: 50,
          },
        ],
        container: {},
      };

      const result = translateLayout(dashboardDtoLayout);

      expect(result).toEqual({
        columns: [
          {
            widthPercentage: 50,
            rows: [
              {
                cells: [
                  {
                    widthPercentage: 50,
                    height: '212px',
                    widgetId: '6662ffcf888f5e002aa6cf18',
                    minWidth: 48,
                    maxWidth: 1028,
                    minHeight: 64,
                    maxHeight: 1028,
                  },
                  {
                    widthPercentage: 50,
                    height: '212px',
                    widgetId: '66630139888f5e002aa6cf1a',
                    minWidth: 48,
                    maxWidth: 1028,
                    minHeight: 64,
                    maxHeight: 1028,
                  },
                ],
              },
              {
                cells: [
                  {
                    widthPercentage: 100,
                    height: 192,
                    widgetId: '66630141888f5e002aa6cf1c',
                    minWidth: 48,
                    maxWidth: 1028,
                    minHeight: 64,
                    maxHeight: 1028,
                  },
                ],
              },
            ],
          },
          { widthPercentage: 50, rows: [] },
        ],
      });
    });

    it('should correctly translate layout with subcells that doesnt fit to column width in total', () => {
      const dashboardDtoLayout = {
        instanceid: '78526-6FA5-87',
        type: 'columnar',
        columns: [
          {
            width: 50,
            cells: [
              {
                subcells: [
                  {
                    elements: [
                      {
                        minHeight: 64,
                        maxHeight: 1028,
                        height: '212px',
                        minWidth: 48,
                        maxWidth: 1028,
                        defaultWidth: 512,
                        widgetid: '6662ffcf888f5e002aa6cf18',
                      },
                    ],
                    width: 25,
                    stretchable: false,
                    pxlWidth: 515.5,
                    index: 0,
                  },
                  {
                    elements: [
                      {
                        minHeight: 64,
                        maxHeight: 1028,
                        height: '212px',
                        minWidth: 48,
                        maxWidth: 1028,
                        defaultWidth: 512,
                        widgetid: '66630139888f5e002aa6cf1a',
                      },
                    ],
                    width: 25,
                    stretchable: false,
                    pxlWidth: 515.5,
                    index: 1,
                  },
                ],
              },
              {
                subcells: [
                  {
                    elements: [
                      {
                        minHeight: 64,
                        maxHeight: 1028,
                        height: 192,
                        minWidth: 48,
                        maxWidth: 1028,
                        defaultWidth: 512,
                        widgetid: '66630141888f5e002aa6cf1c',
                      },
                    ],
                    width: 10,
                    stretchable: false,
                    pxlWidth: 1031,
                    index: 0,
                  },
                ],
              },
            ],
            pxlWidth: 1031,
            index: 0,
          },
          {
            width: 50,
          },
        ],
        container: {},
      };

      const result = translateLayout(dashboardDtoLayout);

      expect(result).toEqual({
        columns: [
          {
            widthPercentage: 50,
            rows: [
              {
                cells: [
                  {
                    widthPercentage: 50,
                    height: '212px',
                    widgetId: '6662ffcf888f5e002aa6cf18',
                    minWidth: 48,
                    maxWidth: 1028,
                    minHeight: 64,
                    maxHeight: 1028,
                  },
                  {
                    widthPercentage: 50,
                    height: '212px',
                    widgetId: '66630139888f5e002aa6cf1a',
                    minWidth: 48,
                    maxWidth: 1028,
                    minHeight: 64,
                    maxHeight: 1028,
                  },
                ],
              },
              {
                cells: [
                  {
                    widthPercentage: 100,
                    height: 192,
                    widgetId: '66630141888f5e002aa6cf1c',
                    minWidth: 48,
                    maxWidth: 1028,
                    minHeight: 64,
                    maxHeight: 1028,
                  },
                ],
              },
            ],
          },
          { widthPercentage: 50, rows: [] },
        ],
      });
    });

    it('should correctly translate empty layout', () => {
      const dashboardDtoLayout = {};

      const result = translateLayout(dashboardDtoLayout);

      expect(result).toEqual({
        columns: [],
      });
    });

    it('should correctly translate layout with minWidth, maxWidth, minHeight, maxHeight properties', () => {
      const dashboardDtoLayout = {
        columns: [
          {
            width: 100,
            cells: [
              {
                subcells: [
                  {
                    elements: [
                      {
                        height: '300px',
                        widgetid: 'widget-1',
                        minWidth: 200,
                        maxWidth: 800,
                        minHeight: 100,
                        maxHeight: 600,
                      },
                    ],
                    width: 50,
                  },
                  {
                    elements: [
                      {
                        height: '250px',
                        widgetid: 'widget-2',
                        minWidth: 150,
                        maxWidth: 1000,
                        minHeight: 80,
                        maxHeight: 500,
                      },
                    ],
                    width: 50,
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = translateLayout(dashboardDtoLayout);

      expect(result).toEqual({
        columns: [
          {
            widthPercentage: 100,
            rows: [
              {
                cells: [
                  {
                    widthPercentage: 50,
                    height: '300px',
                    widgetId: 'widget-1',
                    minWidth: 200,
                    maxWidth: 800,
                    minHeight: 100,
                    maxHeight: 600,
                  },
                  {
                    widthPercentage: 50,
                    height: '250px',
                    widgetId: 'widget-2',
                    minWidth: 150,
                    maxWidth: 1000,
                    minHeight: 80,
                    maxHeight: 500,
                  },
                ],
              },
            ],
          },
        ],
      });
    });

    it('should correctly translate layout with missing min/max properties (should be undefined)', () => {
      const dashboardDtoLayout = {
        columns: [
          {
            width: 100,
            cells: [
              {
                subcells: [
                  {
                    elements: [
                      {
                        height: '400px',
                        widgetid: 'widget-1',
                        minWidth: 128,
                        maxWidth: 2048,
                        minHeight: 60,
                        maxHeight: 1500,
                      },
                    ],
                    width: 100,
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = translateLayout(dashboardDtoLayout);

      expect(result).toEqual({
        columns: [
          {
            widthPercentage: 100,
            rows: [
              {
                cells: [
                  {
                    widthPercentage: 100,
                    height: '400px',
                    widgetId: 'widget-1',
                    minWidth: 128,
                    maxWidth: 2048,
                    minHeight: 60,
                    maxHeight: 1500,
                  },
                ],
              },
            ],
          },
        ],
      });
    });

    it('should correctly translate layout with mixed present and missing min/max properties', () => {
      const dashboardDtoLayout = {
        columns: [
          {
            width: 60,
            cells: [
              {
                subcells: [
                  {
                    elements: [
                      {
                        height: '350px',
                        widgetid: 'widget-1',
                        minWidth: 300,
                        maxWidth: 2048,
                        minHeight: 60,
                        maxHeight: 800,
                      },
                    ],
                    width: 100,
                  },
                ],
              },
            ],
          },
          {
            width: 40,
            cells: [
              {
                subcells: [
                  {
                    elements: [
                      {
                        height: '200px',
                        widgetid: 'widget-2',
                        minWidth: 128,
                        maxWidth: 1200,
                        minHeight: 120,
                        maxHeight: 1500,
                      },
                    ],
                    width: 100,
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = translateLayout(dashboardDtoLayout);

      expect(result).toEqual({
        columns: [
          {
            widthPercentage: 60,
            rows: [
              {
                cells: [
                  {
                    widthPercentage: 100,
                    height: '350px',
                    widgetId: 'widget-1',
                    minWidth: 300,
                    maxWidth: 2048,
                    minHeight: 60,
                    maxHeight: 800,
                  },
                ],
              },
            ],
          },
          {
            widthPercentage: 40,
            rows: [
              {
                cells: [
                  {
                    widthPercentage: 100,
                    height: '200px',
                    widgetId: 'widget-2',
                    minWidth: 128,
                    maxWidth: 1200,
                    minHeight: 120,
                    maxHeight: 1500,
                  },
                ],
              },
            ],
          },
        ],
      });
    });

    it('should correctly translate layout with edge case values for min/max properties', () => {
      const dashboardDtoLayout = {
        columns: [
          {
            width: 100,
            cells: [
              {
                subcells: [
                  {
                    elements: [
                      {
                        height: '500px',
                        widgetid: 'widget-1',
                        minWidth: 0,
                        maxWidth: 9999,
                        minHeight: 1,
                        maxHeight: 2000,
                      },
                    ],
                    width: 100,
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = translateLayout(dashboardDtoLayout);

      expect(result).toEqual({
        columns: [
          {
            widthPercentage: 100,
            rows: [
              {
                cells: [
                  {
                    widthPercentage: 100,
                    height: '500px',
                    widgetId: 'widget-1',
                    minWidth: 0,
                    maxWidth: 9999,
                    minHeight: 1,
                    maxHeight: 2000,
                  },
                ],
              },
            ],
          },
        ],
      });
    });

    it('should correctly translate complex layout with multiple rows and cells having different min/max properties', () => {
      const dashboardDtoLayout = {
        columns: [
          {
            width: 70,
            cells: [
              {
                subcells: [
                  {
                    elements: [
                      {
                        height: '300px',
                        widgetid: 'widget-1',
                        minWidth: 200,
                        maxWidth: 600,
                        minHeight: 100,
                        maxHeight: 500,
                      },
                    ],
                    width: 60,
                  },
                  {
                    elements: [
                      {
                        height: '300px',
                        widgetid: 'widget-2',
                        minWidth: 150,
                        maxWidth: 400,
                        minHeight: 100,
                        maxHeight: 500,
                      },
                    ],
                    width: 40,
                  },
                ],
              },
              {
                subcells: [
                  {
                    elements: [
                      {
                        height: '200px',
                        widgetid: 'widget-3',
                        minWidth: 300,
                        maxWidth: 800,
                        minHeight: 80,
                        maxHeight: 400,
                      },
                    ],
                    width: 100,
                  },
                ],
              },
            ],
          },
          {
            width: 30,
            cells: [
              {
                subcells: [
                  {
                    elements: [
                      {
                        height: '400px',
                        widgetid: 'widget-4',
                        minWidth: 100,
                        maxWidth: 500,
                        minHeight: 150,
                        maxHeight: 600,
                      },
                    ],
                    width: 100,
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = translateLayout(dashboardDtoLayout);

      expect(result).toEqual({
        columns: [
          {
            widthPercentage: 70,
            rows: [
              {
                cells: [
                  {
                    widthPercentage: 60,
                    height: '300px',
                    widgetId: 'widget-1',
                    minWidth: 200,
                    maxWidth: 600,
                    minHeight: 100,
                    maxHeight: 500,
                  },
                  {
                    widthPercentage: 40,
                    height: '300px',
                    widgetId: 'widget-2',
                    minWidth: 150,
                    maxWidth: 400,
                    minHeight: 100,
                    maxHeight: 500,
                  },
                ],
              },
              {
                cells: [
                  {
                    widthPercentage: 100,
                    height: '200px',
                    widgetId: 'widget-3',
                    minWidth: 300,
                    maxWidth: 800,
                    minHeight: 80,
                    maxHeight: 400,
                  },
                ],
              },
            ],
          },
          {
            widthPercentage: 30,
            rows: [
              {
                cells: [
                  {
                    widthPercentage: 100,
                    height: '400px',
                    widgetId: 'widget-4',
                    minWidth: 100,
                    maxWidth: 500,
                    minHeight: 150,
                    maxHeight: 600,
                  },
                ],
              },
            ],
          },
        ],
      });
    });
  });

  describe('withSharedFormulas', () => {
    const api = {
      getSharedFormulas: vi.fn(),
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should correctly replace shared formulas', async () => {
      api.getSharedFormulas.mockImplementation((sharedFormulasIds: string[]) => {
        if (isEqual(sharedFormulasIds, Object.keys(sharedFormulasDictionary))) {
          return sharedFormulasDictionary;
        } else {
          throw new Error('Invalid shared formulas ids');
        }
      });

      const result = await withSharedFormulas(
        dashboardWithSharedFormulas,
        api as unknown as RestApi,
      );
      expect(result).toMatchSnapshot();
      expect(api.getSharedFormulas).toHaveBeenCalledWith(Object.keys(sharedFormulasDictionary));
    });
  });

  describe('convertDimensionsToDimIndexes', () => {
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    const createMockWidget = (
      panels: Array<{ name: string; items: Array<{ instanceid?: string }> }>,
    ): WidgetDto =>
      ({
        oid: 'test-widget-oid',
        type: 'chart/column',
        subtype: 'column',
        datasource: { title: 'test' } as any,
        metadata: {
          panels,
        },
        style: {},
        title: 'Test Widget',
        desc: 'Test Description',
      } as WidgetDto);

    describe('should find dimensions in different panels', () => {
      it('should convert dimensions found in columns panel', () => {
        const widget = createMockWidget([
          {
            name: 'columns',
            items: [
              { instanceid: 'col-dim-1' },
              { instanceid: 'col-dim-2' },
              { instanceid: 'col-dim-3' },
            ],
          },
        ]);

        const result = convertDimensionsToDimIndexes(widget, ['col-dim-1', 'col-dim-3']);

        expect(result).toEqual(['columns.0', 'columns.2']);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('should convert dimensions found in rows panel', () => {
        const widget = createMockWidget([
          {
            name: 'rows',
            items: [{ instanceid: 'row-dim-1' }, { instanceid: 'row-dim-2' }],
          },
        ]);

        const result = convertDimensionsToDimIndexes(widget, ['row-dim-2', 'row-dim-1']);

        expect(result).toEqual(['rows.1', 'rows.0']);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('should convert dimensions found in values panel', () => {
        const widget = createMockWidget([
          {
            name: 'values',
            items: [
              { instanceid: 'val-dim-1' },
              { instanceid: 'val-dim-2' },
              { instanceid: 'val-dim-3' },
            ],
          },
        ]);

        const result = convertDimensionsToDimIndexes(widget, ['val-dim-2']);

        expect(result).toEqual(['values.1']);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('should convert dimensions found across multiple panels', () => {
        const widget = createMockWidget([
          {
            name: 'columns',
            items: [{ instanceid: 'col-dim-1' }, { instanceid: 'col-dim-2' }],
          },
          {
            name: 'rows',
            items: [{ instanceid: 'row-dim-1' }],
          },
          {
            name: 'values',
            items: [{ instanceid: 'val-dim-1' }, { instanceid: 'val-dim-2' }],
          },
        ]);

        const result = convertDimensionsToDimIndexes(widget, [
          'col-dim-2',
          'row-dim-1',
          'val-dim-1',
          'col-dim-1',
        ]);

        expect(result).toEqual(['columns.1', 'rows.0', 'values.0', 'columns.0']);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });

    describe('should handle edge cases', () => {
      it('should return original dimension ID when not found and log warning', () => {
        const widget = createMockWidget([
          {
            name: 'columns',
            items: [{ instanceid: 'col-dim-1' }, { instanceid: 'col-dim-2' }],
          },
        ]);

        const result = convertDimensionsToDimIndexes(widget, ['col-dim-1', 'non-existent-dim']);

        expect(result).toEqual(['columns.0', 'non-existent-dim']);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Error converting JTD config: Dimension non-existent-dim not found in widget test-widget-oid',
        );
      });

      it('should handle empty dimension IDs array', () => {
        const widget = createMockWidget([
          {
            name: 'columns',
            items: [{ instanceid: 'col-dim-1' }],
          },
        ]);

        const result = convertDimensionsToDimIndexes(widget, []);

        expect(result).toEqual([]);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('should handle widget with no panels', () => {
        const widget = createMockWidget([]);

        const result = convertDimensionsToDimIndexes(widget, ['some-dim']);

        expect(result).toEqual(['some-dim']);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Error converting JTD config: Dimension some-dim not found in widget test-widget-oid',
        );
      });

      it('should handle widget with undefined metadata', () => {
        const widget = {
          oid: 'test-widget-oid',
          metadata: undefined,
        } as any;

        const result = convertDimensionsToDimIndexes(widget, ['some-dim']);

        expect(result).toEqual(['some-dim']);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Error converting JTD config: Dimension some-dim not found in widget test-widget-oid',
        );
      });

      it('should handle panels with no items', () => {
        const widget = createMockWidget([
          {
            name: 'columns',
            items: [],
          },
          {
            name: 'rows',
            items: [],
          },
        ]);

        const result = convertDimensionsToDimIndexes(widget, ['some-dim']);

        expect(result).toEqual(['some-dim']);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Error converting JTD config: Dimension some-dim not found in widget test-widget-oid',
        );
      });

      it('should handle panels with undefined items', () => {
        const widget = {
          oid: 'test-widget-oid',
          metadata: {
            panels: [
              { name: 'columns', items: undefined },
              { name: 'rows', items: undefined },
            ],
          },
        } as any;

        const result = convertDimensionsToDimIndexes(widget, ['some-dim']);

        expect(result).toEqual(['some-dim']);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Error converting JTD config: Dimension some-dim not found in widget test-widget-oid',
        );
      });

      it('should handle items without instanceid', () => {
        const widget = createMockWidget([
          {
            name: 'columns',
            items: [
              { instanceid: 'col-dim-1' },
              {}, // item without instanceid
              { instanceid: 'col-dim-2' },
            ],
          },
        ]);

        const result = convertDimensionsToDimIndexes(widget, ['col-dim-1', 'col-dim-2']);

        expect(result).toEqual(['columns.0', 'columns.2']);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('should handle items with undefined instanceid', () => {
        const widget = createMockWidget([
          {
            name: 'columns',
            items: [
              { instanceid: 'col-dim-1' },
              { instanceid: undefined },
              { instanceid: 'col-dim-2' },
            ],
          },
        ]);

        const result = convertDimensionsToDimIndexes(widget, ['col-dim-1', 'col-dim-2']);

        expect(result).toEqual(['columns.0', 'columns.2']);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });

    describe('should handle mixed scenarios', () => {
      it('should handle mix of found and not found dimensions', () => {
        const widget = createMockWidget([
          {
            name: 'columns',
            items: [{ instanceid: 'col-dim-1' }, { instanceid: 'col-dim-2' }],
          },
          {
            name: 'rows',
            items: [{ instanceid: 'row-dim-1' }],
          },
        ]);

        const result = convertDimensionsToDimIndexes(widget, [
          'col-dim-1',
          'non-existent-1',
          'row-dim-1',
          'non-existent-2',
          'col-dim-2',
        ]);

        expect(result).toEqual([
          'columns.0',
          'non-existent-1',
          'rows.0',
          'non-existent-2',
          'columns.1',
        ]);

        expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Error converting JTD config: Dimension non-existent-1 not found in widget test-widget-oid',
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Error converting JTD config: Dimension non-existent-2 not found in widget test-widget-oid',
        );
      });

      it('should handle duplicate dimension IDs in input', () => {
        const widget = createMockWidget([
          {
            name: 'columns',
            items: [{ instanceid: 'col-dim-1' }, { instanceid: 'col-dim-2' }],
          },
        ]);

        const result = convertDimensionsToDimIndexes(widget, [
          'col-dim-1',
          'col-dim-1',
          'col-dim-2',
        ]);

        expect(result).toEqual(['columns.0', 'columns.0', 'columns.1']);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('should handle priority order (columns > rows > values)', () => {
        // Test that if a dimension exists in multiple panels, it returns the first match (columns, then rows, then values)
        const widget = createMockWidget([
          {
            name: 'columns',
            items: [{ instanceid: 'duplicate-dim' }],
          },
          {
            name: 'rows',
            items: [{ instanceid: 'duplicate-dim' }],
          },
          {
            name: 'values',
            items: [{ instanceid: 'duplicate-dim' }],
          },
        ]);

        const result = convertDimensionsToDimIndexes(widget, ['duplicate-dim']);

        // Should return columns.0 since columns is checked first
        expect(result).toEqual(['columns.0']);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('should handle large number of dimensions', () => {
        const items = Array.from({ length: 100 }, (_, i) => ({ instanceid: `dim-${i}` }));
        const widget = createMockWidget([
          {
            name: 'columns',
            items,
          },
        ]);

        const dimensionIds = ['dim-0', 'dim-50', 'dim-99'];
        const result = convertDimensionsToDimIndexes(widget, dimensionIds);

        expect(result).toEqual(['columns.0', 'columns.50', 'columns.99']);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });

    describe('should handle special characters and edge case IDs', () => {
      it('should handle dimension IDs with special characters', () => {
        const widget = createMockWidget([
          {
            name: 'columns',
            items: [
              { instanceid: 'dim-with-dash' },
              { instanceid: 'dim_with_underscore' },
              { instanceid: 'dim.with.dots' },
              { instanceid: 'dim with spaces' },
              { instanceid: 'dim@with#special$chars%' },
            ],
          },
        ]);

        const result = convertDimensionsToDimIndexes(widget, [
          'dim-with-dash',
          'dim_with_underscore',
          'dim.with.dots',
          'dim with spaces',
          'dim@with#special$chars%',
        ]);

        expect(result).toEqual(['columns.0', 'columns.1', 'columns.2', 'columns.3', 'columns.4']);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it('should handle empty string dimension ID', () => {
        const widget = createMockWidget([
          {
            name: 'columns',
            items: [{ instanceid: '' }, { instanceid: 'normal-dim' }],
          },
        ]);

        const result = convertDimensionsToDimIndexes(widget, ['', 'normal-dim']);

        expect(result).toEqual(['columns.0', 'columns.1']);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });

    const mockPanels = [
      {
        name: 'rows',
        items: [
          {
            jaql: {
              table: 'Commerce',
              column: 'Date',
              dim: '[Commerce.Date (Calendar)]',
              datatype: 'datetime' as const,
              level: 'months' as const,
              title: 'Months in Date',
            },
            instanceid: 'date-months-dim',
            panel: 'rows',
          },
          {
            jaql: {
              table: 'Commerce',
              column: 'Category',
              dim: '[Commerce.Category]',
              datatype: 'text' as const,
              title: 'Category',
            },
            instanceid: 'category-dim',
            panel: 'rows',
          },
        ],
      },
      {
        name: 'columns',
        items: [
          {
            jaql: {
              table: 'Commerce',
              column: 'Gender',
              dim: '[Commerce.Gender]',
              datatype: 'text' as const,
              title: 'Gender',
            },
            instanceid: 'gender-dim',
            panel: 'columns',
          },
        ],
      },
      {
        name: 'values',
        items: [
          {
            jaql: {
              table: 'Commerce',
              column: 'Revenue',
              dim: '[Commerce.Revenue]',
              datatype: 'numeric' as const,
              agg: 'sum',
              title: 'Total Revenue',
            },
            instanceid: 'revenue-measure',
            panel: 'measures',
          },
        ],
      },
    ];

    it('should find dimension in rows panel and return with row location', () => {
      const result = findDimensionByInstanceId(mockPanels as any, 'category-dim');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('dimension');
      expect(result).toHaveProperty('location', 'row');
      expect((result as any).dimension.name).toBe('Category');
    });

    it('should find dimension in columns panel and return with column location', () => {
      const result = findDimensionByInstanceId(mockPanels as any, 'gender-dim');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('dimension');
      expect(result).toHaveProperty('location', 'column');
      expect((result as any).dimension.name).toBe('Gender');
    });

    it('should find datetime dimension with level in rows panel', () => {
      const result = findDimensionByInstanceId(mockPanels as any, 'date-months-dim');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('dimension');
      expect(result).toHaveProperty('location', 'row');
      expect((result as any).dimension.name).toBe('Months in Date');
    });

    it('should find measure in values panel and return without location', () => {
      const result = findDimensionByInstanceId(mockPanels as any, 'revenue-measure');

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('location');
      expect((result as any).name).toBe('Total Revenue');
    });

    it('should return undefined for non-existent instanceId', () => {
      const result = findDimensionByInstanceId(mockPanels as any, 'non-existent-id');

      expect(result).toBeUndefined();
    });

    it('should handle empty panels array', () => {
      const result = findDimensionByInstanceId([], 'any-id');

      expect(result).toBeUndefined();
    });

    it('should handle panels with empty items', () => {
      const emptyPanels = [
        { name: 'rows', items: [] },
        { name: 'columns', items: [] },
      ];

      const result = findDimensionByInstanceId(emptyPanels, 'any-id');

      expect(result).toBeUndefined();
    });
  });

  describe('extractPivotTargetsConfigFromWidgetDto', () => {
    const createMockWidget = (drillConfig?: any, panels?: any[]) => ({
      oid: 'test-widget-oid',
      type: 'pivot2' as const,
      subtype: 'pivot2' as const,
      datasource: { title: 'test' } as any,
      style: {},
      title: 'Test Widget',
      desc: 'Test Description',
      metadata: {
        panels: panels || [
          {
            name: 'rows',
            items: [
              {
                jaql: {
                  table: 'Commerce',
                  column: 'Category',
                  dim: '[Commerce.Category]',
                  datatype: 'text' as const,
                  title: 'Category',
                },
                instanceid: 'category-dim',
                panel: 'rows',
              },
            ],
          },
          {
            name: 'columns',
            items: [
              {
                jaql: {
                  table: 'Commerce',
                  column: 'Gender',
                  dim: '[Commerce.Gender]',
                  datatype: 'text' as const,
                  title: 'Gender',
                },
                instanceid: 'gender-dim',
                panel: 'columns',
              },
            ],
          },
          {
            name: 'values',
            items: [
              {
                jaql: {
                  table: 'Commerce',
                  column: 'Revenue',
                  dim: '[Commerce.Revenue]',
                  datatype: 'numeric' as const,
                  agg: 'sum',
                  title: 'Total Revenue',
                },
                instanceid: 'revenue-measure',
                panel: 'measures',
              },
            ],
          },
        ],
      },
      drillToDashboardConfig: drillConfig,
    });

    it('should return undefined when widget has no drillToDashboardConfig', () => {
      const widget = createMockWidget();
      const result = extractPivotTargetsConfigFromWidgetDto(widget as any);

      expect(result).toBeUndefined();
    });

    it('should return undefined when drillToDashboardConfig has no dashboardIds', () => {
      const widget = createMockWidget({
        enabled: true,
        version: '1',
      });
      const result = extractPivotTargetsConfigFromWidgetDto(widget as any);

      expect(result).toBeUndefined();
    });

    it('should return undefined when dashboardIds is empty', () => {
      const widget = createMockWidget({
        enabled: true,
        version: '1',
        dashboardIds: [],
      });
      const result = extractPivotTargetsConfigFromWidgetDto(widget as any);

      expect(result).toBeUndefined();
    });

    it('should extract single target with single pivot dimension', () => {
      const widget = createMockWidget({
        enabled: true,
        version: '1',
        dashboardIds: [
          {
            id: 'dashboard-1',
            caption: 'Dashboard 1',
            pivotDimensions: ['category-dim'],
          },
        ],
      });

      const result = extractPivotTargetsConfigFromWidgetDto(widget as any);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Map);
      expect(result!.size).toBe(1);

      const entries = Array.from(result!.entries());
      const [dimension, targets] = entries[0];

      expect(dimension).toHaveProperty('dimension');
      expect(dimension).toHaveProperty('location', 'row');
      expect(targets).toHaveLength(1);
      expect(targets[0]).toEqual({
        caption: 'Dashboard 1',
        id: 'dashboard-1',
      });
    });

    it('should extract single target with multiple pivot dimensions', () => {
      const widget = createMockWidget({
        enabled: true,
        version: '1',
        dashboardIds: [
          {
            id: 'dashboard-1',
            caption: 'Dashboard 1',
            pivotDimensions: ['category-dim', 'gender-dim', 'revenue-measure'],
          },
        ],
      });

      const result = extractPivotTargetsConfigFromWidgetDto(widget as any);

      expect(result).toBeDefined();
      expect(result!.size).toBe(3);

      const entries = Array.from(result!.entries());
      const dimensionTypes = entries.map(([dim]) => {
        if ('location' in dim) {
          return `${(dim as any).location}-dimension`;
        }
        return 'measure';
      });

      expect(dimensionTypes).toContain('row-dimension');
      expect(dimensionTypes).toContain('column-dimension');
      expect(dimensionTypes).toContain('measure');
    });

    it('should extract multiple targets for same dimension', () => {
      const widget = createMockWidget({
        enabled: true,
        version: '1',
        dashboardIds: [
          {
            id: 'dashboard-1',
            caption: 'Dashboard 1',
            pivotDimensions: ['category-dim'],
          },
          {
            id: 'dashboard-2',
            caption: 'Dashboard 2',
            pivotDimensions: ['category-dim'],
          },
        ],
      });

      const result = extractPivotTargetsConfigFromWidgetDto(widget as any);

      expect(result).toBeDefined();
      expect(result!.size).toBe(1);

      const entries = Array.from(result!.entries());
      const [, targets] = entries[0];

      expect(targets).toHaveLength(2);
      expect('id' in targets[0] ? targets[0].id : targets[0].caption).toContain('dashboard-1');
      expect('id' in targets[1] ? targets[1].id : targets[1].caption).toContain('dashboard-2');
    });

    it('should handle mixed found and not found pivot dimensions', () => {
      // Suppress console warnings for this test
      const originalWarn = console.warn;
      const warnCalls: any[] = [];
      console.warn = (...args: any[]) => {
        warnCalls.push(args);
      };

      const widget = createMockWidget({
        enabled: true,
        version: '1',
        dashboardIds: [
          {
            id: 'dashboard-1',
            caption: 'Dashboard 1',
            pivotDimensions: ['category-dim', 'non-existent-dim', 'gender-dim'],
          },
        ],
      });

      const result = extractPivotTargetsConfigFromWidgetDto(widget as any);

      expect(result).toBeDefined();
      expect(result!.size).toBe(2); // Only found dimensions
      expect(warnCalls.length).toBeGreaterThan(0);
      expect(warnCalls[0][0]).toContain(
        'Could not find dimension with instanceId: non-existent-dim',
      );

      console.warn = originalWarn;
    });

    it('should handle target without pivotDimensions gracefully', () => {
      // Suppress console warnings for this test
      const originalWarn = console.warn;
      const warnCalls: any[] = [];
      console.warn = (...args: any[]) => {
        warnCalls.push(args);
      };

      const widget = createMockWidget({
        enabled: true,
        version: '1',
        dashboardIds: [
          {
            id: 'dashboard-1',
            caption: 'Dashboard 1',
            // No pivotDimensions property
          },
        ],
      });

      const result = extractPivotTargetsConfigFromWidgetDto(widget as any);

      expect(result).toBeDefined();
      expect(result!.size).toBe(0);
      expect(warnCalls.length).toBeGreaterThan(0);
      expect(warnCalls[0][0]).toContain('Pivot widget has drill target without pivotDimensions');
      expect(warnCalls[0][1]).toBeDefined(); // The target object

      console.warn = originalWarn;
    });

    it('should work with real transformation flow using panels', () => {
      // This test verifies the end-to-end transformation from Map<Dimension, JtdTarget[]> to pivotDimensions: PivotDimId[]
      const widget = createMockWidget({
        enabled: true,
        version: '1',
        dashboardIds: [
          {
            id: 'dashboard-1',
            caption: 'Dashboard 1',
            pivotDimensions: ['category-dim', 'gender-dim'],
          },
        ],
      });

      const result = extractPivotTargetsConfigFromWidgetDto(widget as any);

      // Verify that the Map was created correctly
      expect(result).toBeDefined();
      expect(result!.size).toBe(2);

      // Verify that dimensions were properly extracted and can be used as Map keys
      const dimensionKeys = Array.from(result!.keys());
      expect(dimensionKeys).toHaveLength(2);

      // Check that both dimensions have the correct structure
      const locatedDimensions: {
        dimension: Dimension;
        location: 'row' | 'column' | 'value';
      }[] = dimensionKeys.filter((key) => 'location' in key) as {
        dimension: Dimension;
        location: 'row' | 'column' | 'value';
      }[];
      const directMeasures = dimensionKeys.filter((key) => !('location' in key));

      // Validate located dimensions (rows/columns)
      locatedDimensions.forEach((key) => {
        expect(key).toHaveProperty('dimension');
        expect(key).toHaveProperty('location');
        expect(['row', 'column'].includes(key.location)).toBe(true);
      });

      // Validate direct measures (values)
      directMeasures.forEach((key) => {
        expect(key).toHaveProperty('name');
      });

      // Verify targets are properly associated
      const allTargets = Array.from(result!.values()).flat();
      expect(allTargets).toHaveLength(2); // 2 dimensions × 1 target each = 2 total targets
      expect(allTargets.every((target) => target.caption === 'Dashboard 1')).toBe(true);
      expect(
        allTargets.every(
          (target) => ('id' in target && target.id === 'dashboard-1') || 'dashboard' in target,
        ),
      ).toBe(true);
    });
  });

  describe('getJtdNavigateType', () => {
    const createMockWidget = (
      type: string,
      drillToDashboardConfig?: any,
      panels?: Array<{ name: string; items: Array<{ instanceid?: string }> }>,
    ): WidgetDto =>
      ({
        oid: 'test-widget-oid',
        type,
        subtype: type.split('/')[1],
        datasource: { title: 'test' } as any,
        metadata: {
          panels: panels || [],
        },
        style: {},
        title: 'Test Widget',
        desc: 'Test Description',
        drillToDashboardConfig,
      } as WidgetDto);

    describe('pie chart navigation type logic', () => {
      it('should return CLICK for pie chart without categories (bug fix test)', () => {
        // This test specifically covers the bug fix where the original logic was:
        // const isPieChartWithoutCategories = (chartCategories?.items?.length || 0) > 0;
        // which was incorrect - it should be === 0 for "without categories"

        const pieChartWithoutCategories = createMockWidget(
          'chart/pie',
          {
            enabled: true,
            dashboardIds: [{ id: 'test-dashboard' }],
          },
          [
            {
              name: 'categories',
              items: [], // Empty items array = no categories
            },
          ],
        );

        const result = getJtdNavigateType(pieChartWithoutCategories);

        expect(result).toBe('click');
      });

      it('should return CLICK for pie chart with undefined categories panel', () => {
        const pieChartWithoutCategories = createMockWidget(
          'chart/pie',
          {
            enabled: true,
            dashboardIds: [{ id: 'test-dashboard' }],
          },
          [], // No panels at all
        );

        const result = getJtdNavigateType(pieChartWithoutCategories);

        expect(result).toBe('click');
      });

      it('should return CLICK for pie chart with categories panel but undefined items', () => {
        const pieChartWithoutCategories = createMockWidget(
          'chart/pie',
          {
            enabled: true,
            dashboardIds: [{ id: 'test-dashboard' }],
          },
          [
            {
              name: 'categories',
              items: undefined as any, // Undefined items = no categories
            },
          ],
        );

        const result = getJtdNavigateType(pieChartWithoutCategories);

        expect(result).toBe('click');
      });

      it('should fall through to chart navigation type for pie chart WITH categories', () => {
        // When pie chart has categories, it should NOT trigger the special case
        // and should fall through to the normal chart logic

        const pieChartWithCategories = createMockWidget(
          'chart/pie',
          {
            enabled: true,
            dashboardIds: [{ id: 'test-dashboard' }],
            drillToDashboardNavigateTypeCharts: 1, // RIGHT_CLICK
          },
          [
            {
              name: 'categories',
              items: [{ instanceid: 'category-1' }, { instanceid: 'category-2' }], // Has categories
            },
          ],
        );

        const result = getJtdNavigateType(pieChartWithCategories);

        // Should fall through to chart navigation logic, not return CLICK
        expect(result).toBe('rightclick');
      });

      it('should fall through to chart navigation type for pie chart with single category', () => {
        // Edge case: even one category should prevent the special case

        const pieChartWithOneCategory = createMockWidget(
          'chart/pie',
          {
            enabled: true,
            dashboardIds: [{ id: 'test-dashboard' }],
            drillToDashboardNavigateTypeCharts: 1, // RIGHT_CLICK
          },
          [
            {
              name: 'categories',
              items: [{ instanceid: 'category-1' }], // Has one category
            },
          ],
        );

        const result = getJtdNavigateType(pieChartWithOneCategory);

        expect(result).toBe('rightclick');
      });
    });

    describe('default behavior and other widget types', () => {
      it('should return RIGHT_CLICK when no drillToDashboardConfig is provided', () => {
        const widget = createMockWidget('chart/column');

        const result = getJtdNavigateType(widget);

        expect(result).toBe('rightclick');
      });

      it('should handle pivot table navigation type', () => {
        const pivotWidget = createMockWidget('pivot', {
          enabled: true,
          dashboardIds: [{ id: 'test-dashboard' }],
          drillToDashboardNavigateTypePivot: 3, // Maps to CLICK
        });

        const result = getJtdNavigateType(pivotWidget);

        expect(result).toBe('click');
      });

      it('should handle chart navigation type', () => {
        const chartWidget = createMockWidget('chart/column', {
          enabled: true,
          dashboardIds: [{ id: 'test-dashboard' }],
          drillToDashboardNavigateTypeCharts: 1, // RIGHT_CLICK
        });

        const result = getJtdNavigateType(chartWidget);

        expect(result).toBe('rightclick');
      });

      it('should return CLICK for indicator widgets', () => {
        const indicatorWidget = createMockWidget('indicator', {
          enabled: true,
          dashboardIds: [{ id: 'test-dashboard' }],
        });

        const result = getJtdNavigateType(indicatorWidget);

        expect(result).toBe('click');
      });

      it('should return CLICK for text widgets', () => {
        const textWidget = createMockWidget('richtexteditor', {
          enabled: true,
          dashboardIds: [{ id: 'test-dashboard' }],
        });

        const result = getJtdNavigateType(textWidget);

        expect(result).toBe('click');
      });

      it('should return RIGHT_CLICK as fallback for unknown widget types', () => {
        const unknownWidget = createMockWidget('unknown/widget', {
          enabled: true,
          dashboardIds: [{ id: 'test-dashboard' }],
        });

        const result = getJtdNavigateType(unknownWidget);

        expect(result).toBe('rightclick');
      });
    });

    describe('edge cases', () => {
      it('should handle pie chart with mixed panel types', () => {
        const pieChartMixedPanels = createMockWidget(
          'chart/pie',
          {
            enabled: true,
            dashboardIds: [{ id: 'test-dashboard' }],
          },
          [
            {
              name: 'values',
              items: [{ instanceid: 'value-1' }],
            },
            {
              name: 'categories',
              items: [], // Empty categories
            },
            {
              name: 'filters',
              items: [{ instanceid: 'filter-1' }],
            },
          ],
        );

        const result = getJtdNavigateType(pieChartMixedPanels);

        expect(result).toBe('click');
      });

      it('should handle pie chart with multiple panels but no categories panel', () => {
        const pieChartNoCategoriesPanel = createMockWidget(
          'chart/pie',
          {
            enabled: true,
            dashboardIds: [{ id: 'test-dashboard' }],
          },
          [
            {
              name: 'values',
              items: [{ instanceid: 'value-1' }],
            },
            {
              name: 'filters',
              items: [{ instanceid: 'filter-1' }],
            },
            // No categories panel at all
          ],
        );

        const result = getJtdNavigateType(pieChartNoCategoriesPanel);

        expect(result).toBe('click');
      });
    });
  });
});
