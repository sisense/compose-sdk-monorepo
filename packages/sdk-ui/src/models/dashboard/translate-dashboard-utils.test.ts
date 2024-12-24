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
                  { widthPercentage: 50, height: '212px', widgetId: '6662ffcf888f5e002aa6cf18' },
                  { widthPercentage: 50, height: '212px', widgetId: '66630139888f5e002aa6cf1a' },
                ],
              },
              {
                cells: [
                  { widthPercentage: 100, height: 192, widgetId: '66630141888f5e002aa6cf1c' },
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
                  { widthPercentage: 50, height: '212px', widgetId: '6662ffcf888f5e002aa6cf18' },
                  { widthPercentage: 50, height: '212px', widgetId: '66630139888f5e002aa6cf1a' },
                ],
              },
              {
                cells: [
                  { widthPercentage: 100, height: 192, widgetId: '66630141888f5e002aa6cf1c' },
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
