import { RestApi } from '@/api/rest-api';
import {
  translateLayout,
  withSharedFormulas,
  convertDimensionsToDimIndexes,
} from '@/models/dashboard/translate-dashboard-utils';
import isEqual from 'lodash-es/isEqual';
import {
  dashboardWithSharedFormulas,
  sharedFormulasDictionary,
} from '../__mocks__/dashboard-with-shared-formulas';
import { WidgetDto } from '@/widget-by-id/types';

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
  });
});
