import {
  Dimension,
  isCascadingFilter,
  isFilterRelations,
  isMembersFilter,
} from '@sisense/sdk-data';
import isEqual from 'lodash-es/isEqual';

import { CommonFiltersApplyMode } from '@/domains/dashboarding/common-filters/types';
import {
  convertDimensionsToDimIndexes,
  extractDashboardFilters,
  extractPivotTargetsConfigFromWidgetDto,
  findDimensionByInstanceId,
  getJtdNavigateType,
  jumpToDashboardConfigFromWidgetDto,
  translateLayout,
  withDashboardWidgetContext,
  withSharedFormulas,
  withSpecificWidgetOptions,
  withTabberWidgetConfig,
} from '@/domains/dashboarding/dashboard-model/translate-dashboard-utils';
import { SpecificWidgetOptions } from '@/domains/dashboarding/dashboard-model/types';
import type { JumpToDashboardConfigForPivot } from '@/domains/dashboarding/hooks/jtd/jtd-types';
import { WidgetDto } from '@/domains/widgets/components/widget-by-id/types';
import { RestApi } from '@/infra/api/rest-api';
import { getFiltersArray } from '@/shared/utils/filter-relations';

import {
  dashboardWithSharedFormulas,
  sharedFormulasDictionary,
} from './__mocks__/dashboard-with-shared-formulas';

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

    it('should default widthPercentage to 100 when Fusion omits subcell width (single-widget layout)', () => {
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
                        minHeight: 64,
                        maxHeight: 1028,
                        height: 192,
                        minWidth: 48,
                        maxWidth: 1028,
                        widgetid: '69a19b29777b09581e66da7c',
                      },
                    ],
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
                    height: 192,
                    widgetId: '69a19b29777b09581e66da7c',
                    minWidth: 48,
                    maxWidth: 1028,
                    minHeight: 64,
                    maxHeight: 1028,
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
        datasource: { title: 'test' },
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
      const result = findDimensionByInstanceId(mockPanels, 'category-dim');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('dimension');
      expect(result).toHaveProperty('location', 'row');
      expect((result as any).dimension.name).toBe('Category');
    });

    it('should find dimension in columns panel and return with column location', () => {
      const result = findDimensionByInstanceId(mockPanels, 'gender-dim');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('dimension');
      expect(result).toHaveProperty('location', 'column');
      expect((result as any).dimension.name).toBe('Gender');
    });

    it('should find datetime dimension with level in rows panel', () => {
      const result = findDimensionByInstanceId(mockPanels, 'date-months-dim');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('dimension');
      expect(result).toHaveProperty('location', 'row');
      expect((result as any).dimension.name).toBe('Date');
      expect((result as any).dimension.title).toBe('Months in Date');
    });

    it('should find measure in values panel and return without location', () => {
      const result = findDimensionByInstanceId(mockPanels, 'revenue-measure');

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('location');
      expect((result as any).name).toBe('Total Revenue');
    });

    it('should return undefined for non-existent instanceId', () => {
      const result = findDimensionByInstanceId(mockPanels, 'non-existent-id');

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
      const result = extractPivotTargetsConfigFromWidgetDto(widget);

      expect(result).toBeUndefined();
    });

    it('should return undefined when drillToDashboardConfig has no dashboardIds', () => {
      const widget = createMockWidget({
        enabled: true,
        version: '1',
      });
      const result = extractPivotTargetsConfigFromWidgetDto(widget);

      expect(result).toBeUndefined();
    });

    it('should return undefined when dashboardIds is empty', () => {
      const widget = createMockWidget({
        enabled: true,
        version: '1',
        dashboardIds: [],
      });
      const result = extractPivotTargetsConfigFromWidgetDto(widget);

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

      const result = extractPivotTargetsConfigFromWidgetDto(widget);

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

      const result = extractPivotTargetsConfigFromWidgetDto(widget);

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

      const result = extractPivotTargetsConfigFromWidgetDto(widget);

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

      const result = extractPivotTargetsConfigFromWidgetDto(widget);

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

      const result = extractPivotTargetsConfigFromWidgetDto(widget);

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

      const result = extractPivotTargetsConfigFromWidgetDto(widget);

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

  describe('withSpecificWidgetOptions', () => {
    const baseWidgetDto: WidgetDto = {
      oid: 'widget-1',
      type: 'chart/column',
      subtype: 'column',
      datasource: { title: 'test' },
      metadata: { panels: [] },
      style: {},
      title: 'Test Widget',
      desc: 'Test',
    };

    it('should preserve partialDtoOptions fields when no filtersOptions are provided', () => {
      const widgetOptions: SpecificWidgetOptions = {
        partialDtoOptions: {
          options: {
            dashboardFiltersMode: 'filter',
            selector: false,
            disableExportToCSV: true,
            hideFromWidgetList: true,
          },
        },
      };

      const result = withSpecificWidgetOptions(widgetOptions)(baseWidgetDto);

      expect(result.options?.disableExportToCSV).toBe(true);
      expect(result.options?.hideFromWidgetList).toBe(true);
    });

    it('should preserve partialDtoOptions fields when filtersOptions are also provided', () => {
      const widgetOptions: SpecificWidgetOptions = {
        partialDtoOptions: {
          options: {
            dashboardFiltersMode: 'filter',
            selector: false,
            disableExportToCSV: true,
            drillToAnywhere: true,
          },
        },
        filtersOptions: {
          applyMode: CommonFiltersApplyMode.FILTER,
          shouldAffectFilters: true,
        },
      };

      const result = withSpecificWidgetOptions(widgetOptions)(baseWidgetDto);

      // partialDtoOptions fields must survive alongside computed filtersOptions fields
      expect(result.options?.disableExportToCSV).toBe(true);
      expect(result.options?.drillToAnywhere).toBe(true);
      // filtersOptions-derived fields must still be set correctly
      expect(result.options?.dashboardFiltersMode).toBe('filter');
      expect(result.options?.selector).toBe(true);
    });

    it('should let filtersOptions-derived values override partialDtoOptions values', () => {
      const widgetOptions: SpecificWidgetOptions = {
        partialDtoOptions: {
          options: {
            dashboardFiltersMode: 'select',
            selector: false,
          },
        },
        filtersOptions: {
          applyMode: CommonFiltersApplyMode.FILTER,
          shouldAffectFilters: true,
        },
      };

      const result = withSpecificWidgetOptions(widgetOptions)(baseWidgetDto);

      // filtersOptions-derived value must win over partialDtoOptions
      expect(result.options?.dashboardFiltersMode).toBe('filter');
      expect(result.options?.selector).toBe(true);
    });

    it('should return unchanged widgetDto when widgetOptions is undefined', () => {
      const result = withSpecificWidgetOptions(undefined)(baseWidgetDto);

      expect(result).toBe(baseWidgetDto);
    });

    it('should fill unsupported style fields from partialDtoOptions.style without overriding rebuilt values', () => {
      const sunburstDto: WidgetDto = {
        ...baseWidgetDto,
        type: 'sunburst',
        subtype: 'sunburst',
        // mimic to-widget-dto-style output
        style: {
          'legend/enabled': true,
          'legend/position': 'bottom',
          'tooltip/value': true,
          'tooltip/contribution': false,
        } as unknown as WidgetDto['style'],
      };

      const widgetOptions: SpecificWidgetOptions = {
        partialDtoOptions: {
          style: {
            // gap fields preserved from the original DTO
            'center/value': true,
            'center/contribution': false,
            'center/contributionToParent': true,
            // conflict: rebuild emits true; partial holds the stale opposite
            'legend/enabled': false,
          },
        },
      };

      const result = withSpecificWidgetOptions(widgetOptions)(sunburstDto);

      // gap fields restored
      expect(result.style).toMatchObject({
        'center/value': true,
        'center/contribution': false,
        'center/contributionToParent': true,
      });
      // conflict resolved in favor of rebuild
      expect((result.style as Record<string, unknown>)['legend/enabled']).toBe(true);
    });

    it('should leave style unchanged when partialDtoOptions.style is empty', () => {
      const dto: WidgetDto = {
        ...baseWidgetDto,
        style: { foo: 'bar' } as unknown as WidgetDto['style'],
      };
      const widgetOptions: SpecificWidgetOptions = {
        partialDtoOptions: { style: {} },
      };
      const result = withSpecificWidgetOptions(widgetOptions)(dto);
      expect(result.style).toEqual({ foo: 'bar' });
    });

    it('stamps version "1" on the JTD DTO so it survives the read path on reload', () => {
      const widgetOptions: SpecificWidgetOptions = {
        jtdConfig: {
          enabled: true,
          targets: [{ caption: 'Target', id: 'dash-1' }],
        },
      };
      const result = withSpecificWidgetOptions(widgetOptions)(baseWidgetDto);
      expect(result.drillToDashboardConfig?.version).toBe('1');
      expect(result.drillToDashboardConfig?.dashboardIds).toEqual([
        { caption: 'Target', id: 'dash-1', oid: 'dash-1' },
      ]);
    });
  });

  describe('pivot JTD (Map targets) serialization', () => {
    const ROWS_INSTANCE_ID = 'EFEE2-7247-CE';

    // Mirrors the pivot widget in some-pivot.json: a rows Gender dimension whose
    // instanceid is referenced by the JTD target's pivotDimensions.
    const sourcePivotDto = (): WidgetDto =>
      ({
        oid: 'pivot-1',
        type: 'pivot2',
        subtype: 'pivot2',
        title: 'some-pivot',
        desc: null,
        datasource: {
          title: 'Sample ECommerce',
          fullname: 'LocalHost/Sample ECommerce',
          id: 'aLOCALHOST_aSAMPLEIAAaECOMMERCE',
          address: 'LocalHost',
        },
        metadata: {
          panels: [
            {
              name: 'rows',
              items: [
                {
                  jaql: { dim: '[Commerce.Gender]', datatype: 'text', title: 'Gender' },
                  instanceid: ROWS_INSTANCE_ID,
                  panel: 'rows',
                },
              ],
            },
            {
              name: 'values',
              items: [
                {
                  jaql: {
                    dim: '[Commerce.Cost]',
                    datatype: 'numeric',
                    agg: 'sum',
                    title: 'Total Cost',
                  },
                  instanceid: 'F7610-7545-92',
                  panel: 'measures',
                },
              ],
            },
            { name: 'columns', items: [] },
            { name: 'filters', items: [] },
          ],
        },
        style: {},
        drillToDashboardConfig: {
          drillToDashboardRightMenuCaption: 'Jump to ',
          drillToDashboardNavigateType: 2,
          drillToDashboardNavigateTypePivot: 2,
          displayToolbarRow: true,
          displayFilterPane: true,
          modalWindowMeasurement: '%',
          dashboardIds: [
            {
              oid: '69ab04c7e9e1e766fc4f9d40',
              caption: 'tabber-test__drill',
              pivotDimensions: [ROWS_INSTANCE_ID],
              id: '69ab04c7e9e1e766fc4f9d40',
            },
          ],
          enabled: true,
          version: '1',
        },
      } as unknown as WidgetDto);

    // Mimics the freshly-translated DTO for the duplicated widget: same panels but
    // WITHOUT instanceids (toWidgetDto omits them) and WITHOUT drillToDashboardConfig.
    const copyPivotDto = (): WidgetDto =>
      ({
        oid: 'pivot-1-copy',
        type: 'pivot2',
        subtype: 'pivot2',
        title: 'some-pivot copy',
        desc: '',
        datasource: {
          title: 'Sample ECommerce',
          fullname: 'LocalHost/Sample ECommerce',
          id: 'aLOCALHOST_aSAMPLEIAAaECOMMERCE',
          address: 'LocalHost',
        },
        metadata: {
          panels: [
            {
              name: 'rows',
              items: [{ jaql: { dim: '[Commerce.Gender]', datatype: 'text', title: 'Gender' } }],
            },
            { name: 'columns', items: [] },
            {
              name: 'values',
              items: [
                {
                  jaql: {
                    dim: '[Commerce.Cost]',
                    datatype: 'numeric',
                    agg: 'sum',
                    title: 'Total Cost',
                  },
                  panel: 'measures',
                },
              ],
            },
            { name: 'filters', items: [] },
          ],
        },
        style: {},
      } as unknown as WidgetDto);

    it('round-trips: a duplicated pivot keeps its per-dimension JTD target', () => {
      // READ the source pivot widget's JTD into a Map-based config.
      const jtdConfig = jumpToDashboardConfigFromWidgetDto(sourcePivotDto()) as
        | JumpToDashboardConfigForPivot
        | undefined;
      expect(jtdConfig?.targets instanceof Map).toBe(true);

      // WRITE it back onto the freshly-translated copy DTO (the duplicate scenario).
      const result = withSpecificWidgetOptions({ jtdConfig })(copyPivotDto());

      // The config is restored (previously the copy lost drillToDashboardConfig entirely).
      expect(result.drillToDashboardConfig?.version).toBe('1');
      const dashboardIds = result.drillToDashboardConfig!.dashboardIds;
      expect(dashboardIds).toHaveLength(1);
      expect(dashboardIds[0].caption).toBe('tabber-test__drill');
      expect(dashboardIds[0].id).toBe('69ab04c7e9e1e766fc4f9d40');

      // The target references the rows dimension via a pivotDimensions instanceid...
      const pivotDimensions = (dashboardIds[0] as { pivotDimensions?: string[] }).pivotDimensions;
      expect(pivotDimensions).toHaveLength(1);

      // ...and that instanceid is now stamped on the matching rows panel item.
      const rowsItem = result.metadata.panels.find((p) => p.name === 'rows')!.items[0];
      expect(rowsItem.instanceid).toBe(pivotDimensions![0]);

      // Re-reading the produced DTO reconstructs the same per-dimension target.
      const reread = jumpToDashboardConfigFromWidgetDto(result) as
        | JumpToDashboardConfigForPivot
        | undefined;
      expect(reread?.targets instanceof Map).toBe(true);
      const targetLists = [...reread!.targets.values()];
      expect(targetLists).toHaveLength(1);
      expect(targetLists[0][0].caption).toBe('tabber-test__drill');
    });

    it('does not stamp instanceids or attach JTD when there is no jtd config', () => {
      const result = withSpecificWidgetOptions({})(copyPivotDto());
      expect(result.drillToDashboardConfig).toBeUndefined();
      expect(
        result.metadata.panels.find((p) => p.name === 'rows')!.items[0].instanceid,
      ).toBeUndefined();
    });
  });

  describe('withTabberWidgetConfig', () => {
    const baseTabberDto = (): WidgetDto =>
      ({
        oid: 'tabber-1',
        type: 'WidgetsTabber',
        subtype: 'WidgetsTabber',
        datasource: { title: 'test' } as any,
        metadata: { panels: [] },
        // mimic toTabberWidgetStyle output: tabs with names but empty displayWidgetIds
        style: {
          tabs: [
            { title: 'TAB 1', displayWidgetIds: [], hideWidgetIds: [] },
            { title: 'TAB 2', displayWidgetIds: [], hideWidgetIds: [] },
          ],
          activeTab: '0',
        },
        title: 'Tabber',
        desc: '',
      } as unknown as WidgetDto);

    it('overlays displayWidgetIds onto the tabber style tabs by index', () => {
      const result = withTabberWidgetConfig({
        tabs: [{ displayWidgetIds: ['a', 'b'] }, { displayWidgetIds: ['c'] }],
      })(baseTabberDto());

      const tabs = (result.style as any).tabs;
      expect(tabs[0].displayWidgetIds).toEqual(['a', 'b']);
      expect(tabs[1].displayWidgetIds).toEqual(['c']);
      // tab names produced by the widget-level translator are preserved
      expect(tabs[0].title).toBe('TAB 1');
      expect(tabs[1].title).toBe('TAB 2');
    });

    it('is a no-op when there is no tabber config', () => {
      const dto = baseTabberDto();
      const result = withTabberWidgetConfig(undefined)(dto);
      expect(result).toBe(dto);
    });

    it('is a no-op for non-tabber widgets', () => {
      const chartDto: WidgetDto = {
        oid: 'widget-1',
        type: 'chart/column',
        subtype: 'column',
        datasource: { title: 'test' },
        metadata: { panels: [] },
        style: {},
        title: 'Chart',
        desc: '',
      };
      const result = withTabberWidgetConfig({ tabs: [{ displayWidgetIds: ['a'] }] })(chartDto);
      expect(result).toBe(chartDto);
    });

    it('keeps existing tab displayWidgetIds when the config has fewer tabs', () => {
      const dto = baseTabberDto();
      (dto.style as any).tabs[0].displayWidgetIds = ['keep'];
      const result = withTabberWidgetConfig({ tabs: [] })(dto);
      // index 0 has no config entry → falls back to the existing value
      expect((result.style as any).tabs[0].displayWidgetIds).toEqual(['keep']);
    });
  });

  describe('withDashboardWidgetContext', () => {
    it('applies both the widget options and the tabber projection', () => {
      const tabberDto = {
        oid: 'tabber-1',
        type: 'WidgetsTabber',
        subtype: 'WidgetsTabber',
        datasource: { title: 'test' } as any,
        metadata: { panels: [] },
        style: { tabs: [{ title: 'TAB 1', displayWidgetIds: [], hideWidgetIds: [] }] },
        title: 'Tabber',
        desc: '',
      } as unknown as WidgetDto;

      const result = withDashboardWidgetContext({
        options: {
          filtersOptions: {
            applyMode: CommonFiltersApplyMode.FILTER,
            shouldAffectFilters: true,
          },
        },
        tabber: { tabs: [{ displayWidgetIds: ['a', 'b'] }] },
      })(tabberDto);

      // options projection
      expect(result.options?.dashboardFiltersMode).toBe('filter');
      // tabber projection
      expect((result.style as any).tabs[0].displayWidgetIds).toEqual(['a', 'b']);
    });

    it('is behavior-preserving when only options are provided (no tabber)', () => {
      const chartDto: WidgetDto = {
        oid: 'widget-1',
        type: 'chart/column',
        subtype: 'column',
        datasource: { title: 'test' },
        metadata: { panels: [] },
        style: {},
        title: 'Chart',
        desc: '',
      };
      const options: SpecificWidgetOptions = {
        filtersOptions: { applyMode: CommonFiltersApplyMode.FILTER, shouldAffectFilters: false },
      };
      const viaContext = withDashboardWidgetContext({ options })(chartDto);
      const viaOptions = withSpecificWidgetOptions(options)(chartDto);
      expect(viaContext).toEqual(viaOptions);
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
        datasource: { title: 'test' },
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

  describe('extractDashboardFilters', () => {
    const makeFilterDto = (instanceid: string, dim: string) => ({
      jaql: {
        dim,
        table: 'Table',
        column: dim,
        title: dim,
        datatype: 'text' as const,
        filter: { members: [] },
      },
      instanceid,
    });

    it('maps Fusion all:true to FilterWidget select-all (excludeMembers: true)', () => {
      const result = extractDashboardFilters([
        {
          jaql: {
            dim: '[Commerce.Country]',
            table: 'Commerce',
            column: 'Country',
            title: 'Country',
            datatype: 'text' as const,
            filter: { all: true, multiSelection: true },
          },
          instanceid: 'all-true-guid',
        },
      ]);
      expect(Array.isArray(result)).toBe(true);
      const filters = result as import('@sisense/sdk-data').Filter[];
      expect(isMembersFilter(filters[0])).toBe(true);
      if (!isMembersFilter(filters[0])) return;
      expect(filters[0].members).toEqual([]);
      expect(filters[0].config.excludeMembers).toBe(true);
      expect(filters[0].config.guid).toBe('all-true-guid');
    });

    it('keeps cleared include (members:[], no all) as excludeMembers: false', () => {
      const result = extractDashboardFilters([makeFilterDto('clear-guid', '[Commerce.Country]')]);
      const filters = result as import('@sisense/sdk-data').Filter[];
      expect(isMembersFilter(filters[0])).toBe(true);
      if (!isMembersFilter(filters[0])) return;
      expect(filters[0].members).toEqual([]);
      expect(filters[0].config.excludeMembers).toBe(false);
    });

    it('maps CascadingFilterDto level all:true to select-all (excludeMembers: true)', () => {
      const result = extractDashboardFilters([
        {
          isCascading: true,
          instanceid: 'cascading-all-guid',
          levels: [
            {
              dim: '[Commerce.Country]',
              table: 'Commerce',
              column: 'Country',
              title: 'Country',
              datatype: 'text' as const,
              filter: { all: true, multiSelection: true },
              instanceid: 'level-country',
            },
            {
              dim: '[Commerce.Gender]',
              table: 'Commerce',
              column: 'Gender',
              title: 'Gender',
              datatype: 'text' as const,
              filter: { all: true, multiSelection: true },
              instanceid: 'level-gender',
            },
          ],
        },
      ]);
      expect(Array.isArray(result)).toBe(true);
      const filters = result as import('@sisense/sdk-data').Filter[];
      expect(isCascadingFilter(filters[0])).toBe(true);
      if (!isCascadingFilter(filters[0])) return;
      expect(filters[0].config.guid).toBe('cascading-all-guid');
      expect(filters[0].filters).toHaveLength(2);
      for (const level of filters[0].filters) {
        expect(isMembersFilter(level)).toBe(true);
        if (!isMembersFilter(level)) return;
        expect(level.members).toEqual([]);
        expect(level.config.excludeMembers).toBe(true);
      }
    });

    it('returns flat filter array when no filterRelationsDtoOptions is provided', () => {
      const dtos = [makeFilterDto('id-a1', '[ECommerce.A]'), makeFilterDto('id-b1', '[Health.B]')];
      const result = extractDashboardFilters(dtos);
      expect(Array.isArray(result)).toBe(true);
      expect((result as []).length).toBe(2);
    });

    it('combines multiple filterRelations entries with AND — preserves filters from all datasources', () => {
      // Fusion sends two entries: one covering ECommerce (A1 AND A2), one covering Healthcare (B1).
      // Both must be present in the result, combined with AND.
      const dtos = [
        makeFilterDto('id-a1', '[ECommerce.A1]'),
        makeFilterDto('id-a2', '[ECommerce.A2]'),
        makeFilterDto('id-b1', '[Health.B1]'),
      ];

      const result = extractDashboardFilters(dtos, [
        {
          datasource: 'Sample ECommerce',
          filterRelations: {
            type: 'LogicalExpression',
            operator: 'AND',
            left: { type: 'Identifier', instanceId: 'id-a1' },
            right: { type: 'Identifier', instanceId: 'id-a2' },
          },
        },
        {
          datasource: 'Sample Healthcare',
          filterRelations: { type: 'Identifier', instanceId: 'id-b1' },
        },
      ]);

      expect(isFilterRelations(result)).toBe(true);
      const guids = getFiltersArray(result).map((f) => f.config.guid);
      expect(guids).toContain('id-a1');
      expect(guids).toContain('id-a2');
      expect(guids).toContain('id-b1');
    });

    it('combines two non-trivial entries with AND — preserves OR-group structure', () => {
      // Fusion sends two logical groups: (G1 OR AR) and (G2 OR D).
      // Expected result: (G1 OR AR) AND (G2 OR D).
      const dtos = [
        makeFilterDto('id-g1', '[Health.Gender1]'),
        makeFilterDto('id-ar', '[Health.AgeRange]'),
        makeFilterDto('id-g2', '[Health.Gender2]'),
        makeFilterDto('id-d', '[Health.Death]'),
      ];

      const result = extractDashboardFilters(dtos, [
        {
          datasource: 'Sample Healthcare',
          filterRelations: {
            type: 'LogicalExpression',
            operator: 'OR',
            left: { type: 'Identifier', instanceId: 'id-g1' },
            right: { type: 'Identifier', instanceId: 'id-ar' },
          },
        },
        {
          datasource: 'Sample Healthcare',
          filterRelations: {
            type: 'LogicalExpression',
            operator: 'OR',
            left: { type: 'Identifier', instanceId: 'id-g2' },
            right: { type: 'Identifier', instanceId: 'id-d' },
          },
        },
      ]);

      expect(isFilterRelations(result)).toBe(true);
      const guids = getFiltersArray(result).map((f) => f.config.guid);
      expect(guids).toContain('id-g1');
      expect(guids).toContain('id-ar');
      expect(guids).toContain('id-g2');
      expect(guids).toContain('id-d');
    });

    it('returns flat array when all entries are trivial (no explicit relations)', () => {
      const dtos = [
        makeFilterDto('id-a1', '[ECommerce.A1]'),
        makeFilterDto('id-b1', '[Health.B1]'),
      ];

      const result = extractDashboardFilters(dtos, [
        {
          datasource: 'Sample ECommerce',
          filterRelations: { type: 'Identifier', instanceId: 'id-a1' },
        },
        {
          datasource: 'Sample Healthcare',
          filterRelations: { type: 'Identifier', instanceId: 'id-b1' },
        },
      ]);

      expect(Array.isArray(result)).toBe(true);
      expect((result as []).length).toBe(2);
    });
  });
});
