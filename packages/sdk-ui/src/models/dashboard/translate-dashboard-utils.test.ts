import { RestApi } from '@/api/rest-api';
import { translateLayout, withSharedFormulas } from '@/models/dashboard/translate-dashboard-utils';
import isEqual from 'lodash-es/isEqual';
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
});
